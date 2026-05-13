import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, getTicketsByStatus } from '../services/api';

export default function TicketList() {
    const [allTickets, setAllTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    const statuses = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'HIGH': return 'bg-red-100 text-red-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            case 'LOW': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'OPEN': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'CLOSED': return 'bg-gray-100 text-gray-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        filterTickets();
    }, [filterStatus, allTickets]);

    const fetchTickets = async () => {
        try {
            const data = await getTickets();
            setAllTickets(data);
        } catch (err) {
            console.error('Failed to load tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterTickets = () => {
        if (filterStatus === 'ALL') {
            setFilteredTickets(allTickets);
        } else {
            setFilteredTickets(allTickets.filter(ticket => ticket.status === filterStatus));
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">Support Tickets</h1>
                    <p className="font-body text-on-surface-variant text-sm md:text-base">View and manage reported issues.</p>
                </div>
                <Link to="/report-issue" className="bg-primary text-on-primary px-6 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors">Report Issue</Link>
            </header>

            {/* Filter Buttons */}
            <div className="mb-8 flex flex-wrap gap-2">
                {statuses.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
                            filterStatus === status 
                                ? 'bg-primary text-on-primary' 
                                : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'
                        }`}
                    >
                        {status} ({allTickets.filter(t => status === 'ALL' || t.status === status).length})
                    </button>
                ))}
            </div>

            {/* Tickets Grid */}
            <div className="bg-surface-container-low rounded-2xl p-6 min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <p className="text-center text-on-surface-variant mt-10">No tickets found.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTickets.map(ticket => (
                            <Link
                                key={ticket.id}
                                to={`/tickets/${ticket.id}`}
                                className="block bg-surface p-5 rounded-xl border border-outline-variant/20 hover:shadow-md transition-shadow hover:bg-surface-container-lowest"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-2">
                                            <h3 className="font-headline font-bold text-lg text-primary">{ticket.title}</h3>
                                        </div>
                                        <p className="font-body text-sm text-on-surface-variant line-clamp-2 mb-3">{ticket.description}</p>
                                        
                                        <div className="flex flex-wrap gap-2 items-center mb-3">
                                            <span className={`text-xs font-label px-2.5 py-1 rounded-lg font-medium ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span className={`text-xs font-label px-2.5 py-1 rounded-lg font-medium ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className="text-xs font-label px-2.5 py-1 bg-surface-container-highest text-on-surface-variant rounded-lg font-medium">
                                                {ticket.category}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-on-surface-variant">
                                            <div>
                                                <span className="font-bold">Resource:</span> #{ticket.resourceId}
                                            </div>
                                            <div>
                                                <span className="font-bold">Created:</span> {new Date(ticket.createdAt).toLocaleDateString()}
                                            </div>
                                            {ticket.assignedTechnician && (
                                                <div>
                                                    <span className="font-bold">Assigned:</span> Tech #{ticket.assignedTechnician}
                                                </div>
                                            )}
                                            {ticket.attachments && ticket.attachments.length > 0 && (
                                                <div>
                                                    <span className="font-bold">Attachments:</span> {ticket.attachments.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
