import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen flex selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            
            <div className="flex-1 md:ml-64 relative flex flex-col min-h-screen overflow-hidden">
                <TopNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
