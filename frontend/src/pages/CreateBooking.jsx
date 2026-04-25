import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createBooking } from '../services/api';
import { getUser } from '../utils/auth';

export default function CreateBooking() {
    const { resourceId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!resourceId) {
            setError("No resource selected to book.");
            return;
        }

        try {
            setLoading(true);
            const currentUser = getUser();
            const bookingData = {
                userId: currentUser?.id || 1,
                resourceId: parseInt(resourceId),
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                purpose: formData.purpose,
                attendees: formData.attendees ? parseInt(formData.attendees) : 0
            };
            
            await createBooking(bookingData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/my-bookings');
            }, 1500);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Time slot already booked');
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-8 px-6 pb-24 md:pb-12 max-w-5xl mx-auto w-full">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link to="/resources" className="inline-flex items-center gap-1 text-sm font-body text-on-surface-variant hover:text-primary mb-4 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Resources
                    </Link>
                    <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold tracking-tight">Create Booking</h2>
                    <p className="font-body text-on-surface-variant mt-2 max-w-2xl">Reserve resource #{resourceId || '...'} for your upcoming academic event or administrative session.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block font-label text-sm font-medium text-on-surface mb-2">Date</label>
                                    <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
                                </div>
                                <div>
                                    <label className="block font-label text-sm font-medium text-on-surface mb-2">Start Time</label>
                                    <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
                                </div>
                                <div>
                                    <label className="block font-label text-sm font-medium text-on-surface mb-2">End Time</label>
                                    <input required type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
                                </div>
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
                                    <label className="block font-label text-sm font-medium text-on-surface mb-2">Expected Number of Attendees</label>
                                    <input required type="number" name="attendees" value={formData.attendees} onChange={handleChange} placeholder="0" min="1" className="w-full md:w-1/2 bg-surface-container-highest border-none rounded-lg py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-4">
                            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-body font-semibold text-primary hover:bg-surface-container transition-colors">Cancel</button>
                            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-body font-semibold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                {loading ? 'Submitting...' : 'Confirm Booking'}
                                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Contextual Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
                        <h4 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">info</span>
                            Booking Guidelines
                        </h4>
                        <ul className="space-y-4 font-body text-sm text-on-surface-variant">
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">timer</span>
                                <span>Bookings must include setup and teardown time.</span>
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
