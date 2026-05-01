import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllBookings, getNotifications, getUserBookings, getBookingStats } from '../services/api';
import { getUser, getUserId } from '../utils/auth';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [metrics, setMetrics] = useState({
        total: 0,
        pending: 0,
        topResource: 'N/A',
        peakTime: 'N/A',
        approvalRate: 0
    });
    const [stats, setStats] = useState({
        totalBookings: 0,
        approvedBookings: 0,
        checkedInCount: 0,
        noShowCount: 0,
        usageRate: 0
    });
    const [recentNotifications, setRecentNotifications] = useState([]);
    const user = getUser();
    const userId = getUserId() || user?.id || 1;
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    useEffect(() => {
        const calculateMetrics = (items) => {
            const total = items.length;
            const pending = items.filter((booking) => booking.status === 'PENDING').length;
            const approved = items.filter((booking) => booking.status === 'APPROVED').length;
            const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

            const resourceCounts = {};
            items.forEach((booking) => {
                const resourceName = booking.resource?.name || `Resource #${booking.resourceId}`;
                resourceCounts[resourceName] = (resourceCounts[resourceName] || 0) + 1;
            });
            const topResource = Object.keys(resourceCounts).length > 0
                ? Object.keys(resourceCounts).reduce((a, b) => resourceCounts[a] > resourceCounts[b] ? a : b)
                : 'N/A';

            const hourCounts = {};
            items.forEach((booking) => {
                if (booking.startTime) {
                    const hour = booking.startTime.split(':')[0];
                    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                }
            });
            const peakHour = Object.keys(hourCounts).length > 0
                ? Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b)
                : null;

            setMetrics({
                total,
                pending,
                topResource,
                peakTime: peakHour ? `${peakHour}:00` : 'N/A',
                approvalRate
            });
        };

        const fetchDashboardData = async () => {
            try {
                const [bookingData, notificationData, statsData] = await Promise.all([
                    getAllBookings().catch(() => getUserBookings(userId)),
                    getNotifications(userId).catch(() => []),
                    getBookingStats().catch(() => null)
                ]);
                const safeBookings = Array.isArray(bookingData) ? bookingData : [];
                setBookings(safeBookings);
                setRecentNotifications(Array.isArray(notificationData) ? notificationData.slice(0, 3) : []);
                calculateMetrics(safeBookings);
                if (statsData) setStats(statsData);
            } catch (error) {
                console.error('Failed to load dashboard stats', error);
            }
        };

        fetchDashboardData();
    }, [userId]);

    const maxHourlyBookings = Math.max(
        ...Array.from({ length: 24 }).map((_, hour) =>
            bookings.filter((booking) => booking.startTime && booking.startTime.startsWith(hour.toString().padStart(2, '0'))).length
        ),
        1
    );

    return (
        <div className="px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-10 pb-12">
            <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-container p-6 md:p-8 text-on-primary shadow-sm mt-4 md:mt-6">
                <div className="relative z-10 max-w-2xl">
                    <p className="font-inter text-primary-fixed-dim text-xs font-medium tracking-wide uppercase mb-1">Student Portal</p>
                    <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-surface-bright">Welcome, {firstName}</h2>
                    <p className="font-body text-inverse-on-surface text-sm md:text-base max-w-xl opacity-90 leading-relaxed">Here is a summary of your campus activities and upcoming reservations for today.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-secondary-fixed opacity-10 rounded-tl-full blur-3xl pointer-events-none"></div>
                <div className="absolute right-32 top-0 w-32 h-32 bg-primary-fixed opacity-10 rounded-b-full blur-2xl pointer-events-none"></div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <section>
                        <h3 className="font-headline text-xl font-bold text-primary mb-6">Booking Analytics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-label text-sm font-medium text-on-surface-variant">Total Bookings</span>
                                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                                    </div>
                                </div>
                                <div className="font-headline text-4xl font-extrabold text-primary">{metrics.total}</div>
                                <p className="font-body text-xs text-on-surface-variant mt-2">Overall reservations</p>
                            </div>

                            <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-label text-sm font-medium text-on-surface-variant">Pending Requests</span>
                                    <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim/20 text-on-tertiary-fixed flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                    </div>
                                </div>
                                <div className="font-headline text-4xl font-extrabold text-primary">{metrics.pending}</div>
                                <p className="font-body text-xs text-on-surface-variant mt-2">Awaiting approval</p>
                            </div>

                            <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-label text-sm font-medium text-on-surface-variant">Top Resource</span>
                                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                    </div>
                                </div>
                                <div className="font-headline text-2xl font-bold text-primary truncate" title={metrics.topResource}>{metrics.topResource}</div>
                                <p className="font-body text-xs text-on-surface-variant mt-2">Most frequently booked</p>
                            </div>

                            <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-label text-sm font-medium text-on-surface-variant">Peak Time</span>
                                    <div className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">trending_up</span>
                                    </div>
                                </div>
                                <div className="font-headline text-2xl font-bold text-primary">{metrics.peakTime}</div>
                                <p className="font-body text-xs text-on-surface-variant mt-2">Approval Rate: {metrics.approvalRate}%</p>
                            </div>

                            <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-label text-sm font-medium text-on-surface-variant">Checked-In Users</span>
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    </div>
                                </div>
                                <div className="font-headline text-4xl font-extrabold text-green-600">{stats.checkedInCount}</div>
                                <p className="font-body text-xs text-on-surface-variant mt-2">Successfully checked in</p>
                            </div>

                            <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-red-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-label text-sm font-medium text-on-surface-variant">No-Shows</span>
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">person_off</span>
                                    </div>
                                </div>
                                <div className="font-headline text-4xl font-extrabold text-red-500">{stats.noShowCount}</div>
                                <p className="font-body text-xs text-on-surface-variant mt-2">Approved but not checked in</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-headline text-xl font-bold text-primary mb-6">Check-in Insights</h3>
                        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl">
                                    <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                                    <span className="font-headline text-3xl font-extrabold text-green-700">{stats.checkedInCount}</span>
                                    <span className="font-label text-xs font-semibold text-green-600 uppercase tracking-wide">Checked-In</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 bg-red-50 rounded-xl">
                                    <span className="material-symbols-outlined text-red-500 text-3xl">person_off</span>
                                    <span className="font-headline text-3xl font-extrabold text-red-600">{stats.noShowCount}</span>
                                    <span className="font-label text-xs font-semibold text-red-500 uppercase tracking-wide">No-Shows</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl">
                                    <span className="material-symbols-outlined text-blue-500 text-3xl">speed</span>
                                    <span className="font-headline text-3xl font-extrabold text-blue-600">{stats.usageRate}%</span>
                                    <span className="font-label text-xs font-semibold text-blue-500 uppercase tracking-wide">Usage Rate</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-body text-xs text-on-surface-variant">Check-in Utilization</span>
                                    <span className="font-label text-xs font-semibold text-primary">{stats.usageRate}%</span>
                                </div>
                                <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(stats.usageRate, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="font-body text-[10px] text-on-surface-variant">0%</span>
                                    <span className="font-body text-[10px] text-on-surface-variant">100%</span>
                                </div>
                            </div>
                        </div>
                    </section>

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

                    <section>
                        <h3 className="font-headline text-xl font-bold text-primary mb-6">Bookings Over Time</h3>
                        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20">
                            <div className="flex items-end h-40 gap-2 w-full mt-4">
                                {Array.from({ length: 24 }).map((_, hour) => {
                                    const count = bookings.filter((booking) => booking.startTime && booking.startTime.startsWith(hour.toString().padStart(2, '0'))).length;
                                    const heightPercentage = (count / maxHourlyBookings) * 100;

                                    return (
                                        <div key={hour} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            <div className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${heightPercentage}%`, minHeight: count > 0 ? '4px' : '0' }}></div>
                                            <span className="text-[10px] text-on-surface-variant">{hour}h</span>

                                            {count > 0 && (
                                                <div className="absolute -top-8 bg-surface-container text-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                    {count} bookings
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <section className="bg-surface-container-low rounded-xl p-6 h-full border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-headline text-xl font-bold text-primary">Recent Activity</h3>
                            <Link to="/notifications" className="text-sm font-label text-primary font-medium hover:underline">View All</Link>
                        </div>

                        <div className="flex flex-col gap-6">
                            {recentNotifications.length === 0 ? (
                                <p className="font-body text-sm text-on-surface-variant">No activity yet.</p>
                            ) : recentNotifications.map((notification) => (
                                <Link key={notification.id} to="/notifications" className="flex gap-4 relative group hover:bg-surface-container-highest/30 p-2 -mx-2 rounded-lg transition-colors">
                                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-surface-container-highest group-last:hidden"></div>
                                    <div className="relative z-10 w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <span className="material-symbols-outlined text-secondary text-sm">
                                            {notification.referenceType === 'TICKET' ? 'confirmation_number' : 'event_available'}
                                        </span>
                                    </div>
                                    <div className="pt-1 min-w-0">
                                        <p className="font-body text-sm text-on-surface font-medium mb-1 line-clamp-1">{notification.title}</p>
                                        <p className="font-body text-xs text-on-surface-variant mb-2 line-clamp-2">{notification.message}</p>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container text-[11px] font-semibold tracking-wide">
                                            <span className={`w-1.5 h-1.5 rounded-full ${notification.read ? 'bg-outline' : 'bg-secondary'}`}></span>
                                            {notification.read ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
