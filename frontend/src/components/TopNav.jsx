import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole, getUser, getUserId, clearRole } from '../utils/auth';
import { getUnreadNotificationCount, getUnreadNotifications, markNotificationAsRead } from '../services/api';
import toast from 'react-hot-toast';

export default function TopNav({ onOpenMenu }) {
    const navigate = useNavigate();
    const role = getRole() || 'GUEST';
    const user = getUser();
    const userId = getUserId();
    const firstName = user?.name ? user.name.split(' ')[0] : (role === 'ADMIN' ? 'Admin' : 'User');
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        clearRole();
        navigate('/login');
    };

    const loadUnread = useCallback(async () => {
        if (!userId) return;
        try {
            const [countData, unreadData] = await Promise.all([
                getUnreadNotificationCount(userId),
                getUnreadNotifications(userId)
            ]);
            setUnreadCount(countData?.count || 0);
            setRecentNotifications(Array.isArray(unreadData) ? unreadData.slice(0, 4) : []);
        } catch (error) {
            console.error('Failed to load notification badge', error);
        }
    }, [userId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUnread();
        const timer = window.setInterval(loadUnread, 30000);
        const handleChanged = () => loadUnread();
        window.addEventListener('notifications:changed', handleChanged);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('notifications:changed', handleChanged);
        };
    }, [loadUnread]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openNotification = async (notification) => {
        try {
            if (!notification.read) {
                await markNotificationAsRead(notification.id, userId);
                window.dispatchEvent(new Event('notifications:changed'));
            }
            setIsNotificationsOpen(false);
            if (notification.referenceType === 'BOOKING') {
                navigate('/my-bookings');
            } else if (notification.referenceType === 'TICKET') {
                navigate('/tickets');
            } else {
                navigate('/notifications');
            }
        } catch {
            toast.error('Failed to update notification');
        }
    };

    return (
        <header className="sticky top-0 w-full z-30 md:z-20 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-16 md:h-20 border-b border-surface-container-highest md:border-none transition-all">
            <div className="flex items-center gap-4 md:hidden">
                <button onClick={onOpenMenu} className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h2 className="font-headline font-extrabold text-xl text-primary md:hidden">Architect Hub</h2>
            </div>
            
            <div className="hidden md:block">
                {/* Empty space for layout balance on desktop */}
            </div>

            <div className="flex items-center gap-4">
                <span className="font-label text-sm font-semibold !text-white bg-primary-container px-3 py-1 rounded-full hidden md:inline-block">
                    Logged in as {firstName} ({role})
                </span>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsNotificationsOpen((open) => !open)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors relative"
                        title="Notifications"
                    >
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-error text-on-error rounded-full text-[10px] font-bold flex items-center justify-center outline outline-2 outline-surface">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                        <span className="material-symbols-outlined">notifications</span>
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-surface-container-highest flex items-center justify-between">
                                <h3 className="font-headline font-bold text-primary text-base">Notifications</h3>
                                <button onClick={() => { setIsNotificationsOpen(false); navigate('/notifications'); }} className="font-label text-xs font-semibold text-primary hover:underline">
                                    View all
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {recentNotifications.length === 0 ? (
                                    <div className="px-4 py-6 text-center font-body text-sm text-on-surface-variant">
                                        No unread notifications.
                                    </div>
                                ) : (
                                    recentNotifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => openNotification(notification)}
                                            className="w-full px-4 py-3 flex gap-3 text-left hover:bg-surface-container transition-colors border-b border-surface-container-highest last:border-b-0"
                                        >
                                            <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-[18px]">{notification.referenceType === 'TICKET' ? 'confirmation_number' : 'event_available'}</span>
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block font-body text-sm font-semibold text-on-surface line-clamp-1">{notification.title}</span>
                                                <span className="block font-body text-xs text-on-surface-variant line-clamp-2 mt-0.5">{notification.message}</span>
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div onClick={handleLogout} title="Change Role" className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container cursor-pointer bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors">
                     <span className="font-headline font-bold">{firstName.substring(0, 2).toUpperCase()}</span>
                </div>
            </div>
        </header>
    );
}
