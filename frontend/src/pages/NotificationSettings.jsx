import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
    const [preferences, setPreferences] = useState({
        approved: true,
        rejected: true,
        created: true
    });

    useEffect(() => {
        const stored = localStorage.getItem("notificationPreferences");
        if (stored) {
            setPreferences(JSON.parse(stored));
        }
    }, []);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSave = () => {
        localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
        toast.success("Preferences updated", {
            style: {
                background: '#var(--color-surface-container-highest)',
                color: '#var(--color-on-surface)',
            },
        });
    };

    return (
        <div className="p-6 md:p-12 max-w-3xl mx-auto w-full">
            <header className="mb-8">
                <h2 className="font-headline text-3xl font-bold text-primary mb-2">Notification Preferences</h2>
                <p className="font-body text-on-surface-variant">Control which notifications you want to receive.</p>
            </header>

            <section className="bg-surface-container-low rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/10">
                <div className="flex flex-col gap-6">
                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                name="approved"
                                checked={preferences.approved}
                                onChange={handleChange}
                                className="peer appearance-none w-5 h-5 border-2 border-outline rounded-sm bg-surface-container-lowest checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-primary text-[16px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                        </div>
                        <div>
                            <p className="font-body font-semibold text-on-surface group-hover:text-primary transition-colors">Booking Approved</p>
                            <p className="font-body text-sm text-on-surface-variant">Get notified when an admin approves your request.</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                name="rejected"
                                checked={preferences.rejected}
                                onChange={handleChange}
                                className="peer appearance-none w-5 h-5 border-2 border-outline rounded-sm bg-surface-container-lowest checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-primary text-[16px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                        </div>
                        <div>
                            <p className="font-body font-semibold text-on-surface group-hover:text-primary transition-colors">Booking Rejected</p>
                            <p className="font-body text-sm text-on-surface-variant">Receive an alert if your booking request is declined.</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                name="created"
                                checked={preferences.created}
                                onChange={handleChange}
                                className="peer appearance-none w-5 h-5 border-2 border-outline rounded-sm bg-surface-container-lowest checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-primary text-[16px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                        </div>
                        <div>
                            <p className="font-body font-semibold text-on-surface group-hover:text-primary transition-colors">Booking Created</p>
                            <p className="font-body text-sm text-on-surface-variant">Confirmation when you successfully submit a request.</p>
                        </div>
                    </label>
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant/20">
                    <button 
                        onClick={handleSave}
                        className="bg-primary hover:bg-primary/90 text-on-primary font-label font-bold py-2.5 px-6 rounded-full transition-colors inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Save Preferences
                    </button>
                </div>
            </section>
        </div>
    );
}