import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '../services/api';
import { getUserId } from '../utils/auth';

const typeLabels = {
    BOOKING_APPROVED: 'Booking approved',
    BOOKING_REJECTED: 'Booking rejected',
    BOOKING_CANCELLED: 'Booking cancelled',
    TICKET_STATUS_CHANGED: 'Ticket updated',
    TICKET_COMMENT_ADDED: 'Ticket comment',
    TICKET_ASSIGNED: 'Ticket assigned'
};

const getNotificationIcon = (notification) => {
    if (notification.referenceType === 'TICKET') return 'confirmation_number';
    if (notification.type === 'BOOKING_REJECTED') return 'event_busy';
    if (notification.type === 'BOOKING_CANCELLED') return 'event_busy';
    return 'event_available';
};

const formatDate = (value) => {
    if (!value) return 'Just now';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function Notifications() {
    const navigate = useNavigate();
    const userId = getUserId();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const unreadCount = notifications.filter((notification) => !notification.read).length;

    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            const matchesFilter =
                filter === 'ALL' ||
                (filter === 'UNREAD' && !notification.read) ||
                notification.referenceType === filter;

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                query.length === 0 ||
                notification.title?.toLowerCase().includes(query) ||
                notification.message?.toLowerCase().includes(query) ||
                notification.type?.toLowerCase().includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [notifications, filter, searchQuery]);

    const notifyChanged = () => {
        window.dispatchEvent(new Event('notifications:changed'));
    };

    const loadNotifications = useCallback(async () => {
        if (!userId) {
            setError('Please log in again to load notifications.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getNotifications(userId);
            setNotifications(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load notifications. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications();
    }, [loadNotifications]);

    const handleMarkAsRead = async (notification) => {
        if (notification.read) return;
        try {
            const updated = await markNotificationAsRead(notification.id, userId);
            setNotifications((items) => items.map((item) => item.id === notification.id ? updated : item));
            notifyChanged();
        } catch {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleOpenReference = async (notification) => {
        await handleMarkAsRead(notification);
        if (notification.referenceType === 'BOOKING') {
            navigate('/my-bookings');
        } else if (notification.referenceType === 'TICKET') {
            navigate('/tickets');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await markAllNotificationsAsRead(userId);
            setNotifications((items) => items.map((item) => ({ ...item, read: true })));
            notifyChanged();
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to mark notifications as read');
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await deleteNotification(notificationId, userId);
            setNotifications((items) => items.filter((item) => item.id !== notificationId));
            notifyChanged();
            toast.success('Notification deleted');
        } catch {
            toast.error('Failed to delete notification');
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">
                        Notifications
                    </h1>
                    <p className="font-body text-on-surface-variant text-sm md:text-base">
                        Booking and support ticket updates sent by the Smart Campus system.
                    </p>
                </div>
                <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-body text-sm font-semibold hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                    Mark all read
                </button>
            </header>

            <section className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        ['ALL', 'All', notifications.length],
                        ['UNREAD', 'Unread', unreadCount],
                        ['BOOKING', 'Bookings', notifications.filter((item) => item.referenceType === 'BOOKING').length],
                        ['TICKET', 'Tickets', notifications.filter((item) => item.referenceType === 'TICKET').length]
                    ].map(([value, label, count]) => (
                        <button
                            key={value}
                            onClick={() => setFilter(value)}
                            className={`px-4 py-3 rounded-xl text-left border transition-colors ${
                                filter === value
                                    ? 'bg-primary text-on-primary border-primary'
                                    : 'bg-surface-container-low text-on-surface border-outline-variant/20 hover:bg-surface-container'
                            }`}
                        >
                            <span className="block font-label text-xs font-semibold uppercase">{label}</span>
                            <span className="block font-headline text-2xl font-extrabold mt-1">{count}</span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-3 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Search notifications..."
                    />
                </div>
            </section>

            {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-body text-sm font-medium">{error}</span>
                </div>
            )}

            <section className="bg-surface-container-low rounded-xl p-3 md:p-4">
                {loading ? (
                    <div className="flex justify-center p-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-14 h-14 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined">notifications_off</span>
                        </div>
                        <p className="font-body text-sm text-on-surface-variant">No notifications found.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredNotifications.map((notification) => (
                            <article
                                key={notification.id}
                                className={`bg-surface rounded-xl p-4 md:p-5 border transition-colors ${
                                    notification.read
                                        ? 'border-outline-variant/10'
                                        : 'border-primary/30 shadow-sm'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <button
                                        onClick={() => handleOpenReference(notification)}
                                        className="flex items-start gap-4 text-left flex-1 min-w-0"
                                    >
                                        <span className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            notification.read
                                                ? 'bg-surface-container text-on-surface-variant'
                                                : 'bg-primary-container text-on-primary-container'
                                        }`}>
                                            <span className="material-symbols-outlined text-[22px]">{getNotificationIcon(notification)}</span>
                                        </span>
                                        <span className="min-w-0">
                                            <span className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-body text-base font-bold text-on-surface">{notification.title}</span>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 rounded-full bg-error" title="Unread"></span>
                                                )}
                                            </span>
                                            <span className="block font-body text-sm text-on-surface-variant leading-relaxed">
                                                {notification.message}
                                            </span>
                                            <span className="mt-3 flex flex-wrap items-center gap-2 font-label text-xs text-on-surface-variant">
                                                <span className="px-2.5 py-1 rounded-full bg-surface-container-highest">
                                                    {typeLabels[notification.type] || notification.type}
                                                </span>
                                                <span>{formatDate(notification.createdAt)}</span>
                                            </span>
                                        </span>
                                    </button>

                                    <div className="flex items-center gap-2 md:justify-end">
                                        {!notification.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification)}
                                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold font-body text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">done</span>
                                                Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold font-body text-error hover:bg-error-container/40 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
