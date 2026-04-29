import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole, getUser, clearRole } from '../utils/auth';
import { getNotifications, markAllAsRead } from '../utils/notifications';

export default function TopNav({ onOpenMenu }) {
    const navigate = useNavigate();
    const role = getRole() || 'GUEST';
    const user = getUser();
    const firstName = user?.name ? user.name.split(' ')[0] : (role === 'ADMIN' ? 'Admin' : 'User');

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const loadNotifications = () => {
            setNotifications(getNotifications());
        };
        loadNotifications();
        window.addEventListener('notificationsUpdated', loadNotifications);
        return () => window.removeEventListener('notificationsUpdated', loadNotifications);
    }, []);

    const hasUnread = notifications.some(n => !n.read);

    const handleBellClick = () => {
        setOpen(!open);
        if (!open && hasUnread) {
            markAllAsRead();
        }
    };

    const handleLogout = () => {
        clearRole();
        navigate('/login');
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

            <div className="flex items-center gap-4 relative">
                <span className="font-label text-sm font-semibold !text-white bg-primary-container px-3 py-1 rounded-full hidden md:inline-block">
                    Logged in as {firstName} ({role})
                </span>
                
                {/* Notification Bell */}
                <div className="relative">
                    <button 
                        onClick={handleBellClick}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors relative"
                    >
                        {hasUnread && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full outline outline-2 outline-surface"></span>
                        )}
                        <span className="material-symbols-outlined">notifications</span>
                    </button>

                    {/* Dropdown Panel */}
                    {open && (
                        <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
                                <h3 className="font-headline font-bold text-primary">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={markAllAsRead} 
                                        className="text-xs text-primary hover:underline font-body font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-on-surface-variant font-body text-sm">
                                        No notifications
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {notifications.map(n => {
                                            // Format timestamp "XX min ago" or similar roughly
                                            const diffMs = new Date() - new Date(n.timestamp);
                                            const diffMins = Math.floor(diffMs / 60000);
                                            const timeLabel = diffMins < 1 ? "Just now" : (diffMins < 60 ? `${diffMins} min ago` : `${Math.floor(diffMins / 60)}h ago`);
                                            
                                            // Icon based on type
                                            let icon = "info";
                                            let iconColor = "text-primary";
                                            let bgColor = "bg-primary-container/20";
                                            
                                            if (n.type === "approved") { icon = "check_circle"; iconColor = "text-secondary"; bgColor = "bg-secondary-container/30"; }
                                            if (n.type === "rejected") { icon = "cancel"; iconColor = "text-error"; bgColor = "bg-error-container/30"; }
                                            if (n.type === "created") { icon = "event"; iconColor = "text-primary"; bgColor = "bg-primary-container/30"; }

                                            return (
                                                <div key={n.id} className={`p-4 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors flex gap-3 ${!n.read ? 'bg-surface-container-highest/20' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgColor} ${iconColor}`}>
                                                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <p className="font-body text-sm text-on-surface leading-tight font-medium">{n.message}</p>
                                                        <span className="font-body text-[11px] text-on-surface-variant mt-1">{timeLabel}</span>
                                                    </div>
                                                    {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
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
