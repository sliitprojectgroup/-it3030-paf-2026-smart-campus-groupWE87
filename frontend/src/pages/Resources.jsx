import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getResources } from '../services/api';

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoading(true);
            const data = await getResources();
            setResources(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch resources. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const getIconForType = (type) => {
        switch(type?.toLowerCase()) {
            case 'room': return 'meeting_room';
            case 'lab': return 'computer';
            case 'equipment': return 'videocam';
            default: return 'meeting_room';
        }
    };

    const filteredResources = filter === 'All' 
        ? resources 
        : resources.filter(r => r.type?.toLowerCase() === filter.toLowerCase());

    return (
        <div className="p-6 md:p-10 lg:p-14 max-w-7xl mx-auto w-full">
            <header className="mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-4">Browse Resources</h1>
                <p className="text-on-surface-variant text-lg max-w-2xl font-body">Discover and reserve spaces, labs, and equipment across the campus infrastructure.</p>
            </header>

            {/* Filters */}
            <section className="mb-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative w-full md:w-96 flex-grow-0">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-outline">search</span>
                    </div>
                    <input type="text" className="w-full bg-surface-container-highest border-none text-on-surface placeholder-outline rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all font-body text-base" placeholder="Search resources..." />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                    {['All', 'Room', 'Lab', 'Equipment'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`whitespace-nowrap px-6 py-3 rounded-full font-label text-sm font-medium transition-colors
                                ${filter === f ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'}`}
                        >
                            {f}s
                        </button>
                    ))}
                </div>
            </section>

            {/* Error State */}
            {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-body text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Grid */}
            {!loading && !error && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((item) => (
                        <article key={item.id} className="bg-surface-container-lowest rounded-xl p-6 ghost-border flex flex-col justify-between group hover:shadow-md transition-all duration-300">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[28px]">{getIconForType(item.type)}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full font-label text-xs font-semibold flex items-center gap-1
                                        ${item.status === 'ACTIVE' || item.status === 'AVAILABLE' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' || item.status === 'AVAILABLE' ? 'bg-secondary' : 'bg-tertiary-fixed-dim'}`}></span> 
                                        {item.status === 'ACTIVE' || item.status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                                <h3 className="font-headline text-xl font-bold text-primary mb-1">{item.name}</h3>
                                <p className="text-on-surface-variant text-sm mb-4 font-body">Campus Resource</p>
                                
                                <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant mb-8 font-body">
                                    {item.capacity && (
                                        <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg">
                                            <span className="material-symbols-outlined text-[18px]">group</span>
                                            <span>Cap: {item.capacity}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg">
                                        <span className="material-symbols-outlined text-[18px]">category</span>
                                        <span className="capitalize">{item.type}</span>
                                    </div>
                                </div>
                            </div>
                            <Link 
                                to={`/book/${item.id}`}
                                className={`block text-center w-full py-3 rounded-xl font-semibold text-sm transition-colors font-body
                                    ${item.status === 'ACTIVE' || item.status === 'AVAILABLE' 
                                        ? 'bg-surface-container text-primary hover:bg-primary hover:text-on-primary' 
                                        : 'border border-outline-variant text-primary hover:bg-surface-container pointer-events-none opacity-50'}`}
                            >
                                Book Now
                            </Link>
                        </article>
                    ))}
                    
                    {filteredResources.length === 0 && !loading && !error && (
                        <div className="col-span-full py-12 text-center text-on-surface-variant font-body">
                            No resources found for the selected category.
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
