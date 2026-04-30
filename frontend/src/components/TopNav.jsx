import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole, getUser, clearRole } from '../utils/auth';

export default function TopNav({ onOpenMenu }) {
    const navigate = useNavigate();
    const role = getRole() || 'GUEST';
    const user = getUser();
    const firstName = user?.name ? user.name.split(' ')[0] : (role === 'ADMIN' ? 'Admin' : 'User');

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
                        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors relative"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>

                <div onClick={handleLogout} title="Logout" className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container cursor-pointer bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors">
                     <span className="font-headline font-bold">{firstName.substring(0, 2).toUpperCase()}</span>
                </div>
            </div>
        </header>
    );
}
