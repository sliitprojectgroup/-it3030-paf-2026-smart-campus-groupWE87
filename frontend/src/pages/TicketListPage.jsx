import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, getUserTickets, deleteTicket } from '../services/api';
import { getUser } from '../utils/auth';

export default function TicketListPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const user = getUser();
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                const data = isAdmin ? await getTickets() : await getUserTickets(user?.id);
                setTickets(data || []);
                setError(null);
            } catch (err) {
                console.error('Failed to load tickets:', err);
                setError('Failed to load tickets. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchTickets();
        }
    }, [user?.id, isAdmin]);

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            setTickets(tickets.filter(t => t.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Failed to delete ticket:', err);
            setError('Failed to delete ticket.');
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const statusMatch = statusFilter === 'ALL' || ticket.status === statusFilter;
        const priorityMatch = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
        return statusMatch && priorityMatch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN':
                return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED':
                return 'bg-green-100 text-green-800';
            case 'CLOSED':
                return 'bg-gray-100 text-gray-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'LOW':
                return 'text-green-600';
            case 'MEDIUM':
                return 'text-yellow-600';
            case 'HIGH':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-1 px-6 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                        <p className="text-gray-600 mt-1">
                            {isAdmin ? 'All tickets' : 'Your tickets'} ({filteredTickets.length})
                        </p>
                    </div>
                    {!isAdmin && (
                        <Link
                            to="/create-ticket"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                        >
                            + New Ticket
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No tickets found</p>
                    </div>
                ) : (
                    /* Table */
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-blue-600">#{ticket.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{ticket.category}</td>
                                        <td className="px-6 py-4 text-sm font-semibold">
                                            <span className={getPriorityColor(ticket.priority)}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(ticket.createdAt)}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/ticket/${ticket.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View
                                                </Link>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => setDeleteConfirm(ticket.id)}
                                                            className="text-red-600 hover:text-red-800 font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Ticket</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this ticket? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
