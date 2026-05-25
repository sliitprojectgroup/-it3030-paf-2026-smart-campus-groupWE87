import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, getTicketsByStatus } from '../services/api';

export default function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                let data;
                if (filterStatus === 'ALL') {
                    data = await getTickets();
                } else {
                    data = await getTicketsByStatus(filterStatus);
                }
                
                // Sort tickets
                const sorted = sortTickets(data, sortBy);
                setTickets(sorted);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch tickets:', err);
                setLoading(false);
            }
        };
        fetchTickets();
    }, [filterStatus, sortBy]);

    const sortTickets = (tickets, sortOption) => {
        const sorted = [...tickets];
        switch (sortOption) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'priority-desc':
                const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            default:
                return sorted;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'OPEN': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
            'RESOLVED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-gray-100 text-gray-800',
            'REJECTED': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'CRITICAL': 'text-red-600 font-bold',
            'HIGH': 'text-orange-600 font-semibold',
            'MEDIUM': 'text-blue-600',
            'LOW': 'text-green-600'
        };
        return colors[priority] || 'text-gray-600';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">Support Tickets</h1>
                    <p className="font-body text-on-surface-variant text-sm md:text-base">Manage and track maintenance requests.</p>
                </div>
                <Link to="/report-issue" className="bg-primary text-on-primary px-6 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-center">
                    Report Issue
                </Link>
            </header>

            {/* Filters and Sorting */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Filter by Status</label>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-surface border border-outline-variant focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Sort by</label>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-surface border border-outline-variant focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="date-desc">Latest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="priority-desc">High Priority First</option>
                    </select>
                </div>
            </div>

            {/* Tickets Grid */}
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
                            <Link 
                                key={ticket.id} 
                                to={`/tickets/${ticket.id}`}
                                className="bg-surface p-5 rounded-xl border border-outline-variant/20 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-headline font-bold text-lg text-primary group-hover:text-primary/80 transition-colors">
                                            #{ticket.id}: {ticket.category}
                                        </h3>
                                        <p className="text-xs text-on-surface-variant mt-1">Resource #{ticket.resourceId}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-xs font-label px-2.5 py-1 rounded-lg font-medium ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                </div>

                                <p className="font-body text-sm text-on-surface-variant line-clamp-2 mb-3">{ticket.description}</p>

                                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                                    <span className="flex items-center gap-1">
                                        {ticket.attachments?.length > 0 && (
                                            <>
                                                📎 {ticket.attachments.length} {ticket.attachments.length === 1 ? 'file' : 'files'}
                                            </>
                                        )}
                                    </span>
                                    <span>
                                        {ticket.comments?.length > 0 && (
                                            <>
                                                💬 {ticket.comments.length} {ticket.comments.length === 1 ? 'comment' : 'comments'}
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="mt-3 pt-3 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                                    {formatDate(ticket.createdAt)}
                                </div>

                                {ticket.assignedTechnician && (
                                    <div className="mt-2 text-xs bg-surface-container-highest px-2 py-1 rounded text-on-surface-variant">
                                        👤 Assigned to technician
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
