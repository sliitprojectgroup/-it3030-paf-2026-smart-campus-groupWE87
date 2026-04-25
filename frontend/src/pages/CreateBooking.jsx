import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createBooking, getResources, getBookingsByDateAndResource } from '../services/api';

const ALL_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
    "17:00", "17:30", "18:00"
];

export default function CreateBooking() {
    const { resourceId } = useParams();
    const navigate = useNavigate();
    
    const [resource, setResource] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        purpose: '',
        attendees: ''
    });
    
    const [bookedSlots, setBookedSlots] = useState([]);
    const [startSlot, setStartSlot] = useState(null);
    const [endSlot, setEndSlot] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchResource() {
            try {
                const resources = await getResources();
                const currentResource = resources.find(r => r.id === parseInt(resourceId));
                if (currentResource) {
                    setResource(currentResource);
                } else {
                    setError("Resource not found.");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load resource details.");
            }
        }
        if (resourceId) {
            fetchResource();
        }
    }, [resourceId]);

    useEffect(() => {
        async function fetchBookings() {
            if (!formData.date || !resourceId) return;
            try {
                const bookings = await getBookingsByDateAndResource(resourceId, formData.date);
                
                const booked = new Set();
                bookings.forEach(booking => {
                    if (booking.status !== 'REJECTED' && booking.status !== 'CANCELLED') {
                        const startIdx = ALL_SLOTS.indexOf(booking.startTime.substring(0, 5));
                        const endIdx = ALL_SLOTS.indexOf(booking.endTime.substring(0, 5));
                        
                        if (startIdx !== -1 && endIdx !== -1) {
                            for (let i = startIdx; i < endIdx; i++) {
                                booked.add(ALL_SLOTS[i]);
                            }
                        }
                    }
                });
                setBookedSlots(Array.from(booked));
                setStartSlot(null);
                setEndSlot(null);
            } catch (err) {
                console.error(err);
                setError("Failed to load availability for selected date.");
            }
        }
        
        fetchBookings();
    }, [formData.date, resourceId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSlotClick = (slot) => {
        if (bookedSlots.includes(slot)) return;

        const slotIdx = ALL_SLOTS.indexOf(slot);

        if (!startSlot || (startSlot && endSlot)) {
            setStartSlot(slot);
            setEndSlot(null);
            return;
        }

        const startIdx = ALL_SLOTS.indexOf(startSlot);
        
        if (slotIdx === startIdx) {
            setStartSlot(null);
            return;
        }

        if (slotIdx < startIdx) {
            setStartSlot(slot);
            return;
        }

        let hasBookedInBetween = false;
        for (let i = startIdx; i <= slotIdx; i++) {
            if (bookedSlots.includes(ALL_SLOTS[i])) {
                hasBookedInBetween = true;
                break;
            }
        }

        if (hasBookedInBetween) {
            setError("Cannot select continuous range containing booked slots.");
            return;
        }

        setEndSlot(slot);
        setError(null);
    };

    const isSlotSelected = (slot) => {
        if (!startSlot) return false;
        if (startSlot === slot && !endSlot) return true;
        
        if (startSlot && endSlot) {
            const slotIdx = ALL_SLOTS.indexOf(slot);
            const startIdx = ALL_SLOTS.indexOf(startSlot);
            const endIdx = ALL_SLOTS.indexOf(endSlot);
            return slotIdx >= startIdx && slotIdx <= endIdx;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!resourceId) {
            setError("No resource selected to book.");
            return;
        }

        if (!startSlot) {
            setError("Please select a time slot.");
            return;
        }

        const attendeesNum = formData.attendees ? parseInt(formData.attendees) : 0;
        if (attendeesNum <= 0) {
            setError("Attendees must be greater than 0.");
            return;
        }

        if (resource && attendeesNum > resource.capacity) {
            setError(`Exceeds resource capacity. Maximum allowed is ${resource.capacity}`);
            return;
        }

        let actualStartTime = startSlot;
        let actualEndTime;
        if (endSlot) {
            const endIdx = ALL_SLOTS.indexOf(endSlot);
            actualEndTime = ALL_SLOTS[endIdx + 1] || "18:30"; 
        } else {
            const startIdx = ALL_SLOTS.indexOf(startSlot);
            actualEndTime = ALL_SLOTS[startIdx + 1] || "18:30";
        }

        try {
            setLoading(true);
            const bookingData = {
                userId: parseInt(localStorage.getItem('userId')) || 1,
                resourceId: parseInt(resourceId),
                date: formData.date,
                startTime: actualStartTime + ":00",
                endTime: actualEndTime + ":00",
                purpose: formData.purpose,
                attendees: attendeesNum
            };
            
            await createBooking(bookingData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/my-bookings');
            }, 1500);
        } catch (err) {
            if (err.response?.status === 409 || err.response?.data?.message?.includes("Exceeds")) {
                setError(err.response?.data?.message || 'Time slot already booked or Exceeds capacity');
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    const isOverCapacity = resource && parseInt(formData.attendees || 0) > resource.capacity;

    return (
        <div className="pt-8 px-6 pb-24 md:pb-12 max-w-5xl mx-auto w-full">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link to="/resources" className="inline-flex items-center gap-1 text-sm font-body text-on-surface-variant hover:text-primary mb-4 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Resources
                    </Link>
                    <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold tracking-tight">Create Booking</h2>
                    {resource ? (
                        <p className="font-body text-on-surface-variant mt-2 max-w-2xl font-semibold">
                            Booking: {resource.name} • {resource.type} (Capacity: {resource.capacity})
                        </p>
                    ) : (
                        <p className="font-body text-on-surface-variant mt-2 max-w-2xl">Reserve resource #{resourceId || '...'} for your upcoming academic event or administrative session.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {error && (
                        <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3">
                            <span className="material-symbols-outlined">error</span>
                            <span className="font-body text-sm font-medium">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-secondary-container text-on-secondary-container p-4 rounded-xl flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="font-body text-sm font-medium">Booking submitted successfully! Redirecting...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <section className="bg-surface-container p-6 md:p-8 rounded-xl relative overflow-hidden">
                            <h3 className="font-headline text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-container">calendar_clock</span>
                                Schedule Details
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block font-label text-sm font-medium text-on-surface mb-2">Date</label>
                                    <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
                                </div>
                                
                                {formData.date && (
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block font-label text-sm font-medium text-on-surface">Time Slots</label>
                                            <div className="flex gap-4 text-xs font-body">
                                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-surface-container-highest border border-outline"></span> Available</span>
                                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary"></span> Selected</span>
                                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-outline-variant/30"></span> Booked</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {ALL_SLOTS.map((slot, index) => {
                                                const isBooked = bookedSlots.includes(slot);
                                                const isSelected = isSlotSelected(slot);
                                                const nextSlot = ALL_SLOTS[index + 1] || "18:30";
                                                
                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        disabled={isBooked}
                                                        onClick={() => handleSlotClick(slot)}
                                                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                                                            isBooked ? 'bg-outline-variant/20 text-outline-variant/60 cursor-not-allowed border border-transparent' : 
                                                            isSelected ? 'bg-primary text-on-primary border border-primary shadow-sm transform scale-[1.02]' : 
                                                            'bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80 border border-outline/20'
                                                        }`}
                                                    >
                                                        {slot} - {nextSlot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        {startSlot && (() => {
                                            const startIdx = ALL_SLOTS.indexOf(startSlot);
                                            const endIdx = endSlot ? ALL_SLOTS.indexOf(endSlot) : startIdx;
                                            const selectedSlotsList = ALL_SLOTS.slice(startIdx, endIdx + 1);
                                            const actualEndTime = ALL_SLOTS[endIdx + 1] || "18:30";

                                            return (
                                                <div className="mt-4 p-4 bg-primary-container/30 rounded-lg flex flex-col gap-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-primary">Booking Time Range:</span>
                                                        <span className="text-sm font-bold text-primary">
                                                            {startSlot} → {actualEndTime} ({selectedSlotsList.length} {selectedSlotsList.length === 1 ? 'slot' : 'slots'})
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 border-t border-primary/20 pt-2">
                                                        <span className="text-xs font-semibold text-primary/80">Selected Slots:</span>
                                                        <span className="text-xs font-medium text-primary">{selectedSlotsList.join(', ')}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-surface-container p-6 md:p-8 rounded-xl">
                            <h3 className="font-headline text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-container">article</span>
                                Booking Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-label text-sm font-medium text-on-surface mb-2">Purpose of Booking</label>
                                    <input required type="text" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="e.g., Study session" className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block font-label text-sm font-medium text-on-surface">Expected Number of Attendees</label>
                                        {resource && (
                                            <span className={`text-xs font-semibold ${isOverCapacity ? 'text-error' : 'text-on-surface-variant'}`}>
                                                Max: {resource.capacity}
                                            </span>
                                        )}
                                    </div>
                                    <input required type="number" name="attendees" value={formData.attendees} onChange={handleChange} placeholder="0" min="1" className={`w-full md:w-1/2 bg-surface-container-highest border-none rounded-lg py-3 px-4 font-body text-on-surface focus:ring-2 transition-all ${isOverCapacity ? 'ring-2 ring-error focus:ring-error text-error' : 'focus:ring-primary'}`} />
                                    {isOverCapacity && (
                                        <p className="text-error text-xs mt-2 font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">error</span>
                                            Exceeds resource capacity
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-4">
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-body font-semibold text-primary hover:bg-surface-container transition-colors">Cancel</button>
                            <button type="submit" disabled={loading || isOverCapacity || !startSlot} className={`px-8 py-3 rounded-xl font-body font-semibold text-on-primary transition-all flex items-center justify-center gap-2 ${loading || isOverCapacity || !startSlot ? 'bg-outline opacity-50 cursor-not-allowed' : 'bg-primary hover:opacity-90'}`}>
                                {loading ? 'Submitting...' : 'Confirm Booking'}
                                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
                        <h4 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">info</span>
                            Booking Guidelines
                        </h4>
                        <ul className="space-y-4 font-body text-sm text-on-surface-variant">
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">timer</span>
                                <span>Select a continuous range of time slots. Bookings must include setup and teardown time.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">group</span>
                                <span>Number of attendees must not exceed the capacity.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">restaurant</span>
                                <span>Food and drink policies vary by location.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">cancel</span>
                                <span>Cancellations must be made 24 hours in advance.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
