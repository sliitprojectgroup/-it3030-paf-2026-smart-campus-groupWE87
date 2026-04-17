export default function TopNav({ onOpenMenu }) {
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

            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors relative">
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full outline outline-2 outline-surface"></span>
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container cursor-pointer bg-primary-container text-on-primary flex items-center justify-center">
                     <span className="font-headline font-bold">ST</span>
                </div>
            </div>
        </header>
    );
}
