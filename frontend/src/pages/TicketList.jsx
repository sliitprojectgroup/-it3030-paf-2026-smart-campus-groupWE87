import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, getTicketsByStatus, getTicketsByPriority, getTicketsByUser } from '../services/api';

export default function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterBy, setFilterBy] = useState('all'); // all, user, assigned
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTickets();
    }, [filterStatus, filterPriority, filterBy]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            let data = [];
            
            if (filterStatus) {
                data = await getTicketsByStatus(filterStatus);
            } else if (filterPriority) {
                data = await getTicketsByPriority(filterPriority);
            } else if (filterBy === 'user') {
                const userId = localStorage.getItem('userId') || '1';
                data = await getTicketsByUser(userId);
            } else {
                data = await getTickets();
            }

            setTickets(data || []);
        } catch (err) {
            console.error('Error loading tickets:', err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            ticket.id.toString().includes(search) ||
            ticket.description.toLowerCase().includes(search) ||
            ticket.category.toLowerCase().includes(search) ||
            ticket.resourceId.toString().includes(search)
        );
    });

    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': 'bg-green-100 text-green-800',
            'MEDIUM': 'bg-yellow-100 text-yellow-800',
            'HIGH': 'bg-orange-100 text-orange-800',
            'CRITICAL': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status) => {
        const colors = {
            'OPEN': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-purple-100 text-purple-800',
            'RESOLVED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'ELECTRICAL': '⚡',
            'PLUMBING': '🔧',
            'HVAC': '❄️',
            'IT': '💻',
            'FURNITURE': '🪑',
            'OTHER': '⚙️'
        };
        return icons[category] || '📋';
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto mt-4 md:mt-0">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">Support Tickets</h1>
                    <p className="font-body text-on-surface-variant text-sm md:text-base">View and manage maintenance tickets.</p>
                </div>
                <Link to="/report-issue" className="bg-primary text-on-primary px-6 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                    + Report Issue
                </Link>
            </header>

            {/* Filters */}
            <div className="bg-surface-container-low rounded-2xl p-6 mb-6 border border-outline-variant/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-2">Search</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search tickets..."
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    {/* Filter By */}
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-2">View</label>
                        <select
                            value={filterBy}
                            onChange={(e) => {
                                setFilterBy(e.target.value);
                                setFilterStatus('');
                                setFilterPriority('');
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="all">All Tickets</option>
                            <option value="user">My Tickets</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-2">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setFilterPriority('');
                                setFilterBy('all');
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-2">Priority</label>
                        <select
                            value={filterPriority}
                            onChange={(e) => {
                                setFilterPriority(e.target.value);
                                setFilterStatus('');
                                setFilterBy('all');
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="">All Priorities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>

                    {/* Reset */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilterStatus('');
                                setFilterPriority('');
                                setFilterBy('all');
                                setSearchTerm('');
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors text-sm font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-on-surface-variant font-medium">No tickets found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-container border-b border-outline-variant/10">
                                <tr className="text-xs font-bold text-on-surface-variant uppercase">
                                    <th className="px-6 py-4 text-left">Ticket ID</th>
                                    <th className="px-6 py-4 text-left">Resource</th>
                                    <th className="px-6 py-4 text-left">Category</th>
                                    <th className="px-6 py-4 text-left">Description</th>
                                    <th className="px-6 py-4 text-center">Priority</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {filteredTickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-surface-container/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono font-semibold text-primary">#{ticket.id}</td>
                                        <td className="px-6 py-4 text-sm text-on-surface">#{ticket.resourceId}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                                                <span className="text-on-surface-variant">{ticket.category}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-on-surface-variant max-w-xs truncate">{ticket.description}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg font-medium text-xs ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg font-medium text-xs ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                to={`/tickets/${ticket.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors text-xs font-medium"
                                            >
                                                View
                                                <span>→</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            {!loading && filteredTickets.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium mb-1">Total</p>
                        <p className="text-2xl font-bold text-blue-900">{filteredTickets.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs text-green-600 font-medium mb-1">Resolved</p>
                        <p className="text-2xl font-bold text-green-900">
                            {filteredTickets.filter(t => t.status === 'RESOLVED').length}
                        </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-xs text-purple-600 font-medium mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {filteredTickets.filter(t => t.status === 'IN_PROGRESS').length}
                        </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <p className="text-xs text-red-600 font-medium mb-1">Critical</p>
                        <p className="text-2xl font-bold text-red-900">
                            {filteredTickets.filter(t => t.priority === 'CRITICAL').length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
