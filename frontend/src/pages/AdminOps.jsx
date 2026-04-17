import { useState, useEffect } from 'react';
import { getAllBookings, approveBooking, rejectBooking } from '../services/api';

export default function AdminOps() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for rejection reason
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await getAllBookings();
            setBookings(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load bookings for administration.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveBooking(id);
            setBookings(bookings.map(b => (b.id === id ? { ...b, status: 'APPROVED' } : b)));
        } catch (err) {
            alert('Failed to approve booking. ' + (err.response?.data?.message || err.message));
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
            setBookings(bookings.map(b => (b.id === selectedBookingId ? { ...b, status: 'REJECTED' } : b)));
            setShowRejectModal(false);
        } catch (err) {
            alert('Failed to reject booking. ' + (err.response?.data?.message || err.message));
        }
    };

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="font-headline text-3xl font-bold text-primary mb-2">Morning, Admin.</h2>
                    <p className="font-body text-on-surface-variant">Here is the current state of campus operations.</p>
                </div>
            </header>

            {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-body text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Approvals */}
                <section className="lg:col-span-2 bg-surface-container-low rounded-xl p-6 md:p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-headline text-xl font-bold text-primary">Pending Approvals</h3>
                        <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-semibold font-label tracking-wide">
                            {pendingBookings.length} AWAITING
                        </span>
                    </div>

                    {loading ? (
                         <div className="flex justify-center py-8">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                         </div>
                    ) : (
                        <div className="space-y-6">
                            {pendingBookings.length === 0 ? (
                                <p className="text-sm font-body text-on-surface-variant">No pending bookings.</p>
                            ) : (
                                pendingBookings.map((booking) => (
                                    <div key={booking.id} className="bg-surface-container-lowest rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-surface-container-highest group border border-outline-variant/10 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                                                <span className="material-symbols-outlined">event</span>
                                            </div>
                                            <div>
                                                <h4 className="font-body font-semibold text-on-surface">{booking.purpose}</h4>
                                                <p className="font-body text-sm text-on-surface-variant mt-1">Resource: #{booking.resource?.id || booking.resourceId} • Attendees: {booking.attendees}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant bg-surface px-2 py-1 rounded-md">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span> {booking.date}, {booking.startTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => handleApprove(booking.id)} className="flex-1 md:flex-none px-4 py-2 bg-primary text-on-primary rounded-xl font-body text-sm font-medium hover:bg-primary-container transition-colors">Approve</button>
                                            <button onClick={() => openRejectModal(booking.id)} className="flex-1 md:flex-none px-4 py-2 bg-surface-container text-on-surface rounded-xl font-body text-sm font-medium hover:bg-surface-container-highest transition-colors">Reject</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>

                {/* Resource Status Panel */}
                <section className="bg-surface-container rounded-xl p-6 md:p-8 flex flex-col">
                    <h3 className="font-headline text-xl font-bold text-primary mb-6">Resource Status</h3>
                    <div className="hero-gradient rounded-xl p-6 text-on-primary mb-6 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-fixed-dim rounded-full blur-3xl opacity-30"></div>
                        <p className="font-body text-sm opacity-80 mb-1">Overall Campus Health</p>
                        <div className="font-headline text-4xl font-extrabold">92%</div>
                        <div className="mt-4 flex gap-2">
                            <span className="bg-secondary/20 text-secondary-fixed-dim px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-sm border border-secondary/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span> Optimal
                            </span>
                        </div>
                    </div>
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
