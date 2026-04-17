import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../services/api';

export default function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTickets().then(data => {
            setTickets(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
             <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">Support Tickets</h1>
                    <p className="font-body text-on-surface-variant text-sm md:text-base">View reported issues.</p>
                </div>
                <Link to="/report-issue" className="bg-primary text-on-primary px-6 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors">Report Issue</Link>
            </header>
            <div className="bg-surface-container-low rounded-2xl p-6 min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : tickets.length === 0 ? (
                    <p className="text-center text-on-surface-variant mt-10">No tickets found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-surface p-5 rounded-xl border border-outline-variant/20 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-headline font-bold text-lg text-primary">Resource #{ticket.resourceId}</h3>
                                    <span className="text-xs font-label px-2.5 py-1 bg-surface-container-highest text-on-surface-variant rounded-lg font-medium">{ticket.status}</span>
                                </div>
                                <p className="font-body text-sm text-on-surface-variant line-clamp-2">{ticket.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
