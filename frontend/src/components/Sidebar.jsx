import { NavLink } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

export default function Sidebar({ isOpen, onClose }) {
    const baseNavItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/' },
        { name: 'Resources', icon: 'inventory_2', path: '/resources' },
        { name: 'Notifications', icon: 'notifications', path: '/notifications' }
    ];
    
    const userItems = [
        { name: 'My Bookings', icon: 'event_available', path: '/my-bookings' }
    ];

    const adminItems = [
        { name: 'Pending Approvals', icon: 'admin_panel_settings', path: '/admin' },
        { name: 'All Requests', icon: 'event_available', path: '/my-bookings' },
        { name: 'Admin Resources', icon: 'settings_applications', path: '/admin-resources' }
    ];

    const navItems = isAdmin() ? [...baseNavItems, ...adminItems] : [...baseNavItems, ...userItems];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <nav className={`
                h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-4 gap-y-2 z-50 
                border-r border-surface-container-highest transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="mb-4 px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-headline font-extrabold text-primary text-xl">ResCore</h1>
                        <p className="font-body text-xs text-on-surface-variant mt-1">Resource Booking</p>
                    </div>
                    <button className="md:hidden text-primary" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-grow flex flex-col gap-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => onClose()} // close menu on mobile
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all
                                ${isActive ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold translate-x-1' 
                                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary font-medium'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {!isAdmin() && (
                <div className="mt-auto px-2 pb-4">
                    <NavLink to="/resources" onClick={() => onClose()} className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-xl font-body font-medium text-sm hover:bg-primary-container transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New Booking
                    </NavLink>
                </div>
                )}
            </nav>
        </>
    );
}
