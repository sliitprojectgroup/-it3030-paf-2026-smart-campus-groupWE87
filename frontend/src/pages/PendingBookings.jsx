import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPendingBookings, approveBooking, rejectBooking, getResources } from '../services/api';
import toast from 'react-hot-toast';

export default function PendingBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for rejection reason
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('booking_oldest');

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            setLoading(true);
            const [bookingsData, resourcesData] = await Promise.all([
                getPendingBookings(),
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
            setError(err.response?.data?.message || 'Failed to load pending bookings.');
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id) => {
        try {
            await approveBooking(id);
            // Remove from the pending list once approved
            setBookings(bookings.filter(b => b.id !== id));
            toast.success("Booking approved successfully");
        } catch (err) {
            toast.error("Failed to approve booking");
        }
    };

    const openRejectModal = (id) => {
        setSelectedBookingId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (!rejectReason) {
            alert("Please provide a rejection reason.");
            return;
        }
        try {
            await rejectBooking(selectedBookingId, rejectReason);
            // Remove from the pending list once rejected
            setBookings(bookings.filter(b => b.id !== selectedBookingId));
            setShowRejectModal(false);
            toast.success("Booking rejected");
        } catch (err) {
            toast.error("Failed to reject booking");
        }
    };

    const processedPendingBookings = useMemo(() => {
        let pending = [...bookings];
        
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            pending = pending.filter(b => 
                (b.purpose && b.purpose.toLowerCase().includes(query)) ||
                (b.resourceId && String(b.resourceId).includes(query)) ||
                (b.resource && b.resource.id && String(b.resource.id).includes(query)) ||
                (b.status && b.status.toLowerCase().includes(query))
            );
        }

        pending.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.startTime}`);
            const timeB = new Date(`${b.date}T${b.startTime}`);
            const reqA = new Date(a.createdAt || a.date);
            const reqB = new Date(b.createdAt || b.date);

            if (sortOption === "booking_newest") {
                return timeB - timeA;
            }
            if (sortOption === "booking_oldest") {
                return timeA - timeB;
            }
            if (sortOption === "requested_newest") {
                return reqB - reqA;
            }
            if (sortOption === "requested_oldest") {
                return reqA - reqB;
            }
            return 0;
        });

        return pending;
    }, [bookings, searchQuery, sortOption]);

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-body text-on-surface-variant hover:text-primary mb-4 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Admin Ops
                    </Link>
                    <h2 className="font-headline text-3xl font-bold text-primary mb-2">Pending Approvals</h2>
                    <p className="font-body text-on-surface-variant">Review all pending booking requests.</p>
                </div>
            </header>

            {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-body text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                <section className="bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <h3 className="font-headline text-xl font-bold text-primary">All Pending Requests</h3>
                            <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-semibold font-label tracking-wide">
                                {processedPendingBookings.length} AWAITING
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-56">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" 
                                    placeholder="Search..." 
                                />
                            </div>
                            <select 
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-surface-container-highest border-none rounded-xl px-4 py-2 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none w-full sm:w-auto"
                            >
                                <option value="booking_newest">Booking Time (Newest)</option>
                                <option value="booking_oldest">Booking Time (Oldest)</option>
                                <option value="requested_newest">Requested Time (Newest)</option>
                                <option value="requested_oldest">Requested Time (Oldest)</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                         <div className="flex justify-center py-8">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                         </div>
                    ) : (
                        <div className="space-y-6">
                            {processedPendingBookings.length === 0 ? (
                                <p className="text-sm font-body text-on-surface-variant">No pending bookings.</p>
                            ) : (
                                processedPendingBookings.map((booking) => (
                                    <div key={booking.id} className="bg-surface-container-lowest rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-surface-container-highest group border border-outline-variant/10 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                                                <span className="material-symbols-outlined">event</span>
                                            </div>
                                            <div>
                                                <h4 className="font-body font-semibold text-on-surface">{booking.purpose}</h4>
                                                <p className="font-body text-sm text-on-surface-variant mt-1">Resource: {booking.resource?.name || `#${booking.resource?.id || booking.resourceId}`} • Attendees: {booking.attendees}</p>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span> Booking Time → {booking.date} {booking.startTime ? booking.startTime.substring(0, 5) : ''}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant">
                                                        <span className="material-symbols-outlined text-[14px]">schedule</span> Requested At → {booking.createdAt ? new Date(booking.createdAt).toISOString().substring(0, 16).replace('T', ' ') : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => handleApprove(booking.id)} className="flex-1 md:flex-none px-4 py-2 bg-primary text-on-primary rounded-xl font-body text-sm font-medium hover:bg-primary-container transition-colors">Approve</button>
                                            <button onClick={() => openRejectModal(booking.id)} className="flex-1 md:flex-none px-4 py-2 bg-error-container/20 text-error rounded-xl font-body text-sm font-medium hover:bg-error-container/40 transition-colors">Reject</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <h3 className="font-headline text-xl font-bold text-primary mb-2">Provide Rejection Reason</h3>
                        <p className="font-body text-sm text-on-surface-variant mb-4">This will be sent to the requester.</p>
                        
                        <div className="bg-surface-container rounded-lg mb-6">
                            <textarea 
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 resize-none font-body text-sm p-3 h-32 outline-none" 
                                placeholder="Explain why this request cannot be approved..."
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-surface-container text-on-surface rounded-xl font-body text-sm font-medium hover:bg-surface-container-highest transition-colors">Cancel</button>
                            <button onClick={confirmReject} className="px-4 py-2 bg-error text-on-error rounded-xl font-body text-sm font-medium hover:bg-error/90 transition-colors">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
