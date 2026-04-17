import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserBookings } from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({ approved: 0, pending: 0, total: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Hardcoded user 1
                const bookings = await getUserBookings(1);
                const approved = bookings.filter(b => b.status === 'APPROVED').length;
                const pending = bookings.filter(b => b.status === 'PENDING').length;
                setStats({ approved, pending, total: bookings.length });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
        };
        fetchStats();
    }, []);
    return (
        <div className="px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-10 pb-12">
            {/* Hero / Welcome Section */}
            <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-on-primary shadow-[0px_20px_40px_rgba(0,27,68,0.06)] mt-8 md:mt-10">
                <div className="relative z-10 max-w-2xl">
                    <p className="font-inter text-primary-fixed-dim text-sm font-medium tracking-wide uppercase mb-2">Student Portal</p>
                    <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-surface-bright">Welcome, User</h2>
                    <p className="font-body text-inverse-on-surface text-base md:text-lg max-w-xl opacity-90 leading-relaxed">Here is a summary of your campus activities and upcoming reservations for today.</p>
                </div>
                {/* Abstract decorative element */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-secondary-fixed opacity-10 rounded-tl-full blur-3xl pointer-events-none"></div>
                <div className="absolute right-32 top-0 w-48 h-48 bg-primary-fixed opacity-10 rounded-b-full blur-2xl pointer-events-none"></div>
            </section>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Stats & Quick Actions) */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Booking Summary (Bento Style) */}
                    <section>
                        <h3 className="font-headline text-xl font-bold text-primary mb-6">Upcoming Bookings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Approved Card */}
                            <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start justify-between shadow-sm group transition-all hover:shadow-md border border-outline-variant/20">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        </div>
                                        <span className="font-label text-sm font-medium text-on-surface-variant">Approved</span>
                                    </div>
                                    <div className="font-headline text-4xl font-extrabold text-primary mb-1">{stats.approved}</div>
                                    <p className="font-body text-sm text-on-surface-variant">Reservations confirmed</p>
                                </div>
                                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
                            </div>

                            {/* Pending Card */}
                            <div className="bg-surface-container-lowest rounded-xl p-6 flex items-start justify-between shadow-sm group transition-all hover:shadow-md border border-outline-variant/20">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim/20 text-on-tertiary-fixed flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        </div>
                                        <span className="font-label text-sm font-medium text-on-surface-variant">Pending</span>
                                    </div>
                                    <div className="font-headline text-4xl font-extrabold text-primary mb-1">{stats.pending}</div>
                                    <p className="font-body text-sm text-on-surface-variant">Awaiting approval</p>
                                </div>
                                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
                            </div>
                        </div>
                    </section>

                    {/* Quick Access Cards */}
                    <section>
                        <h3 className="font-headline text-xl font-bold text-primary mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/resources" className="relative overflow-hidden rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group text-left border border-transparent hover:border-outline-variant/20 p-6 flex flex-col gap-4">
                                <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">meeting_room</span>
                                </div>
                                <div>
                                    <h4 className="font-headline text-lg font-bold text-primary mb-1">Book a Resource</h4>
                                    <p className="font-body text-sm text-on-surface-variant">Reserve study spaces, labs, or equipment.</p>
                                </div>
                                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl text-surface-container-highest/50 pointer-events-none group-hover:text-surface-container-highest transition-colors">meeting_room</span>
                            </Link>

                            <Link to="/report-issue" className="relative overflow-hidden rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group text-left border border-transparent hover:border-outline-variant/20 p-6 flex flex-col gap-4">
                                <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">report_problem</span>
                                </div>
                                <div>
                                    <h4 className="font-headline text-lg font-bold text-primary mb-1">Report an Issue</h4>
                                    <p className="font-body text-sm text-on-surface-variant">Log maintenance or IT requests.</p>
                                </div>
                                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl text-surface-container-highest/50 pointer-events-none group-hover:text-surface-container-highest transition-colors">report_problem</span>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Right Column (Recent Activity) */}
                <div className="lg:col-span-1">
                    <section className="bg-surface-container-low rounded-xl p-6 h-full border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-headline text-xl font-bold text-primary">Recent Activity</h3>
                            <button className="text-sm font-label text-primary font-medium hover:underline">View All</button>
                        </div>
                        
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-4 relative group cursor-pointer hover:bg-surface-container-highest/30 p-2 -mx-2 rounded-lg transition-colors">
                                <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-surface-container-highest group-last:hidden"></div>
                                <div className="relative z-10 w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="material-symbols-outlined text-secondary text-sm">check</span>
                                </div>
                                <div className="pt-1">
                                    <p className="font-body text-sm text-on-surface font-medium mb-1">Lecture Hall 1 Booking Approved</p>
                                    <p className="font-body text-xs text-on-surface-variant mb-2">Your request was confirmed by Admin.</p>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container text-[11px] font-semibold tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Approved
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
