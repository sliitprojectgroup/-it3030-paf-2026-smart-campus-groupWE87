import { useState, useEffect } from 'react';
import { getUserBookings, cancelBooking, getAllBookings } from '../services/api';
import { getRole, isAdmin, getUser } from '../utils/auth';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const currentUser = getUser();
                const userId = currentUser?.id || 1;
                let data;
                if (isAdmin()) {
                    data = await getAllBookings();
                } else {
                    data = await getUserBookings(userId);
                }
                setBookings(data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your bookings. Ensure backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(id);
            setBookings(bookings.map(b => (b.id === id || b.bookingId === id) ? { ...b, status: 'CANCELLED' } : b));
            alert('Booking cancelled successfully.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-secondary/10 text-secondary border-transparent';
            case 'PENDING': return 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed border-transparent';
            case 'REJECTED': return 'bg-error-container/50 text-on-error-container border-transparent';
            case 'CANCELLED': return 'bg-surface-container-highest text-on-surface-variant border-transparent';
            default: return 'bg-surface-container text-on-surface-variant';
        }
    };

    const getStatusIconColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-secondary';
            case 'PENDING': return 'bg-tertiary-fixed-dim';
            case 'REJECTED': return 'bg-error';
            case 'CANCELLED': return 'bg-outline';
            default: return 'bg-outline';
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">
                        {isAdmin() ? 'All Bookings' : 'My Bookings'}
                    </h1>
                    <p className="font-body text-on-surface-variant text-sm md:text-base">
                        {isAdmin() ? 'Review and manage all campus reservations.' : 'Review and manage your upcoming resource reservations.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                        <input type="text" className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/60" placeholder="Search bookings..." />
                    </div>
                </div>
            </header>

            {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-body text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="bg-surface-container-low rounded-2xl p-2">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 font-body text-xs font-semibold text-on-surface-variant tracking-wider uppercase mb-2">
                    <div className="col-span-2">Date & Time</div>
                    <div className="col-span-3">Resource ID</div>
                    <div className="col-span-3">Purpose</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {bookings.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-variant font-body text-sm">You have no bookings yet.</div>
                        ) : (
                            bookings.map((booking) => (
                                <div key={booking.id || booking.bookingId} className={`bg-surface rounded-xl p-5 hover:bg-surface-container-highest transition-colors grid grid-cols-1 lg:grid-cols-12 gap-4 items-center group relative overflow-hidden ${booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'opacity-75' : ''}`}>
                                    <div className="col-span-2 flex flex-col">
                                        <span className={`font-headline font-bold text-base ${booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`}>{booking.date}</span>
                                        <span className="font-body text-on-surface-variant text-sm">{booking.startTime} - {booking.endTime}</span>
                                    </div>
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'bg-surface-container text-on-surface-variant/60' : 'bg-surface-container text-primary'}`}>
                                            <span className="material-symbols-outlined text-[20px]">event_seat</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-body font-semibold text-on-surface text-sm">Resource #{booking.resource?.id || booking.resourceId}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="font-body text-on-surface text-sm line-clamp-1">{booking.purpose}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-xs font-semibold tracking-wide ${getStatusStyle(booking.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusIconColor(booking.status)}`}></span>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        {booking.status === 'PENDING' && !isAdmin() && (
                                            <button 
                                                onClick={() => handleCancel(booking.id || booking.bookingId)}
                                                className="text-xs font-body font-semibold text-error hover:bg-error-container/50 px-3 py-1.5 rounded-lg transition-colors">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
