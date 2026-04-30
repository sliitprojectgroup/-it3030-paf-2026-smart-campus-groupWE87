import { useState, useEffect, useMemo } from 'react';
import { getUserBookings, cancelBooking, getAllBookings, getResources, loginUser } from '../services/api';
import toast from 'react-hot-toast';
import { getDemoCredentialsForUser, isAdmin, getUserId, setUser } from '../utils/auth';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('booking_newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const getCurrentBackendUserId = async () => {
        const credentials = getDemoCredentialsForUser();
        if (!credentials) return getUserId();
        try {
            const backendUser = await loginUser(credentials);
            setUser(backendUser);
            return backendUser.id;
        } catch {
            return getUserId();
        }
    };

    // Derived states
    const processedBookings = useMemo(() => {
        let result = [...bookings];
        
        // Search Filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(b => 
                (b.purpose && b.purpose.toLowerCase().includes(query)) ||
                (b.resourceId && String(b.resourceId).includes(query)) ||
                (b.resource && b.resource.id && String(b.resource.id).includes(query)) ||
                (b.status && b.status.toLowerCase().includes(query))
            );
        }
        
        if (filterStatus !== 'ALL') {
            result = result.filter(b => b.status === filterStatus);
        }
        
        result.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.startTime}`);
            const timeB = new Date(`${b.date}T${b.startTime}`);
            const reqA = new Date(a.createdAt || a.date);
            const reqB = new Date(b.createdAt || b.date);

            if (sortBy === 'booking_newest') {
                return timeB - timeA;
            } else if (sortBy === 'booking_oldest') {
                return timeA - timeB;
            } else if (sortBy === 'requested_newest') {
                return reqB - reqA;
            } else if (sortBy === 'requested_oldest') {
                return reqA - reqB;
            } else if (sortBy === 'status') {
                const order = { PENDING: 1, APPROVED: 2, REJECTED: 3, CANCELLED: 4 };
                return (order[a.status] || 99) - (order[b.status] || 99);
            }
            return 0;
        });
        
        return result;
    }, [bookings, filterStatus, sortBy, searchQuery]);

    const totalPages = Math.ceil(processedBookings.length / itemsPerPage);
    const paginatedBookings = processedBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [filterStatus, sortBy, searchQuery]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userId = await getCurrentBackendUserId();
                if (!isAdmin() && !userId) {
                    setError('Please log in again to load your bookings.');
                    setBookings([]);
                    return;
                }

                let bookingsPromise = isAdmin() ? getAllBookings() : getUserBookings(userId);
                
                const [bookingsData, resourcesData] = await Promise.all([
                    bookingsPromise,
                    getResources()
                ]);

                const resourceMap = {};
                if (Array.isArray(resourcesData)) {
                    resourcesData.forEach(r => {
                        resourceMap[r.id] = r;
                    });
                }

                const mergedBookings = bookingsData.map(b => ({
                    ...b,
                    resource: resourceMap[b.resourceId] || null
                }));

                setBookings(mergedBookings);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your bookings. Ensure backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(id);
            setBookings(bookings.map(b => (b.id === id || b.bookingId === id) ? { ...b, status: 'CANCELLED' } : b));
            toast.success("Booking cancelled");
        } catch {
            toast.error('Failed to cancel booking');
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
                <div className="flex flex-col lg:flex-row items-center gap-3">
                    <div className="relative w-full lg:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/60 outline-none" 
                            placeholder="Search bookings..." 
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto bg-surface-container-highest border-none rounded-xl pl-4 pr-10 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-auto bg-surface-container-highest border-none rounded-xl pl-4 pr-10 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="booking_newest">Booking Time (Newest)</option>
                            <option value="booking_oldest">Booking Time (Oldest)</option>
                            <option value="requested_newest">Requested Time (Newest)</option>
                            <option value="requested_oldest">Requested Time (Oldest)</option>
                            <option value="status">Status (Pending First)</option>
                        </select>
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
                        {paginatedBookings.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-variant font-body text-sm">No bookings found for the selected criteria.</div>
                        ) : (
                            paginatedBookings.map((booking) => (
                                <div key={booking.id || booking.bookingId} className={`bg-surface rounded-xl p-5 hover:bg-surface-container-highest transition-colors grid grid-cols-1 lg:grid-cols-12 gap-4 items-center group relative overflow-hidden ${booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'opacity-75' : ''}`}>
                                    <div className="col-span-2 flex flex-col gap-1">
                                        <div className={`flex flex-col ${booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`}>
                                            <span className="font-label text-[10px] uppercase text-on-surface-variant">Booking Time</span>
                                            <span className="font-headline font-bold text-sm">{booking.date} {booking.startTime ? booking.startTime.substring(0, 5) : ''}</span>
                                        </div>
                                        <div className="flex flex-col mt-1">
                                            <span className="font-label text-[10px] uppercase text-on-surface-variant">Requested At</span>
                                            <span className="font-body text-xs text-on-surface-variant">{booking.createdAt ? new Date(booking.createdAt).toISOString().substring(0, 16).replace('T', ' ') : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'bg-surface-container text-on-surface-variant/60' : 'bg-surface-container text-primary'}`}>
                                            <span className="material-symbols-outlined text-[20px]">event_seat</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-body font-semibold text-on-surface text-sm">{booking.resource?.name || `Resource #${booking.resource?.id || booking.resourceId}`}</span>
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
                
                {/* Pagination Controls */}
                {!loading && processedBookings.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-6 py-4 mt-2 border-t border-surface-container-highest">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-body text-on-surface-variant">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedBookings.length)} of {processedBookings.length}
                            </span>
                            {processedBookings.length > 5 && (
                                <button 
                                    onClick={() => {
                                        if (itemsPerPage === 5) {
                                            setItemsPerPage(9999);
                                            setCurrentPage(1);
                                        } else {
                                            setItemsPerPage(5);
                                            setCurrentPage(1);
                                        }
                                    }}
                                    className="text-xs font-body font-bold text-primary hover:bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20 transition-all active:scale-95"
                                >
                                    {itemsPerPage === 5 ? 'View All' : 'Show Less'}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium font-body bg-surface-container hover:bg-surface-container-highest disabled:opacity-50 transition-colors"
                            >
                                Prev
                            </button>
                            <span className="text-sm font-body font-semibold px-3 py-1.5 bg-primary/10 text-primary rounded-lg">
                                {currentPage}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium font-body bg-surface-container hover:bg-surface-container-highest disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
