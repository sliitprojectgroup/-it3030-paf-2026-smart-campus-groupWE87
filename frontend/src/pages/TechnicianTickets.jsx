import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getTicketsAssignedToTechnician,
    updateTicketStatus,
    updateTicket,
    addTicketComment,
    getTicketById
} from '../services/api';
import { getUser } from '../utils/auth';

export default function TechnicianTickets() {
    const navigate = useNavigate();
    const currentUser = getUser();

    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('IN_PROGRESS');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [statusToChange, setStatusToChange] = useState(null);
    const [comment, setComment] = useState('');

    const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

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

    const getAvailableTransitions = (currentStatus) => {
        const transitions = {
            'OPEN': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED'],
            'RESOLVED': ['CLOSED'],
            'CLOSED': [],
            'REJECTED': []
        };
        return transitions[currentStatus] || [];
    };

    useEffect(() => {
        fetchAssignedTickets();
    }, []);

    useEffect(() => {
        filterTicketsByStatus();
    }, [filterStatus, tickets]);

    const fetchAssignedTickets = async () => {
        try {
            const data = await getTicketsAssignedToTechnician(currentUser.id);
            setTickets(data);
        } catch (err) {
            console.error('Failed to load assigned tickets:', err);
            alert('Failed to load assigned tickets');
        } finally {
            setLoading(false);
        }
    };

    const filterTicketsByStatus = () => {
        if (filterStatus === 'ALL') {
            setFilteredTickets(tickets);
        } else {
            setFilteredTickets(tickets.filter(t => t.status === filterStatus));
        }
    };

    const handleOpenDetail = async (ticket) => {
        setSelectedTicket(ticket);
        setResolutionNotes(ticket.resolutionNotes || '');
        setComment('');
        setStatusToChange(null);
        setShowDetailModal(true);
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedTicket) return;

        setModalLoading(true);
        try {
            const updated = await updateTicketStatus(selectedTicket.id, newStatus);
            
            // Update local state
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            setSelectedTicket(updated);
            
            alert(`Status updated to ${newStatus}`);
            setStatusToChange(null);
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddResolutionNotes = async () => {
        if (!selectedTicket || !resolutionNotes.trim()) {
            alert('Please enter resolution notes');
            return;
        }

        setModalLoading(true);
        try {
            const updated = await updateTicket(selectedTicket.id, {
                ...selectedTicket,
                resolutionNotes
            });

            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            setSelectedTicket(updated);
            
            alert('Resolution notes updated successfully');
        } catch (err) {
            console.error('Failed to update notes:', err);
            alert('Failed to update resolution notes');
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!selectedTicket || !comment.trim()) {
            alert('Please enter a comment');
            return;
        }

        setModalLoading(true);
        try {
            await addTicketComment(selectedTicket.id, currentUser.id, { content: comment });
            
            // Refresh ticket to get new comments
            const updated = await getTicketById(selectedTicket.id);
            setSelectedTicket(updated);
            setComment('');
            
            alert('Comment added successfully');
        } catch (err) {
            console.error('Failed to add comment:', err);
            alert('Failed to add comment');
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
            <header className="mb-10">
                <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">
                    My Assigned Tickets
                </h1>
                <p className="font-body text-on-surface-variant text-sm md:text-base">
                    View and manage tickets assigned to you
                </p>
            </header>

            {/* Filter Buttons */}
            <div className="mb-8 flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${
                        filterStatus === 'ALL'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    ALL ({tickets.length})
                </button>
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
                        {status} ({tickets.filter(t => t.status === status).length})
                    </button>
                ))}
            </div>

            {/* Tickets Grid */}
            <div className="bg-surface-container-low rounded-2xl p-6 min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <p className="text-center text-on-surface-variant mt-10">
                        No {filterStatus !== 'ALL' ? filterStatus : ''} tickets assigned to you.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => handleOpenDetail(ticket)}
                                className="block bg-surface p-5 rounded-xl border border-outline-variant/20 hover:shadow-md transition-all hover:bg-surface-container-lowest cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div>
                                                <h3 className="font-headline font-bold text-lg text-primary">
                                                    Ticket #{ticket.id}
                                                </h3>
                                                <p className="font-body text-sm text-on-surface font-medium">
                                                    {ticket.title}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-body text-sm text-on-surface-variant line-clamp-2 mb-3">
                                            {ticket.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 items-center mb-3">
                                            <span
                                                className={`text-xs font-label px-2.5 py-1 rounded-lg font-medium ${getStatusColor(
                                                    ticket.status
                                                )}`}
                                            >
                                                {ticket.status}
                                            </span>
                                            <span
                                                className={`text-xs font-label px-2.5 py-1 rounded-lg font-medium ${getPriorityColor(
                                                    ticket.priority
                                                )}`}
                                            >
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
                                                <span className="font-bold">Created:</span>{' '}
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </div>
                                            {ticket.resolutionNotes && (
                                                <div>
                                                    <span className="font-bold">Status:</span> Has Notes
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-surface-container-low rounded-2xl p-6 md:p-8 max-w-2xl w-full my-8 border border-outline-variant/10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-primary mb-2">
                                    Ticket #{selectedTicket.id}
                                </h2>
                                <p className="text-on-surface font-medium">{selectedTicket.title}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-2xl text-on-surface-variant hover:text-on-surface"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Ticket Info */}
                        <div className="bg-surface p-4 rounded-lg mb-6 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-on-surface-variant font-bold mb-1">Status</p>
                                <p className={`text-sm font-bold px-2 py-1 rounded w-fit ${getStatusColor(selectedTicket.status)}`}>
                                    {selectedTicket.status}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant font-bold mb-1">Priority</p>
                                <p className={`text-sm font-bold px-2 py-1 rounded w-fit ${getPriorityColor(selectedTicket.priority)}`}>
                                    {selectedTicket.priority}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant font-bold mb-1">Category</p>
                                <p className="text-on-surface">{selectedTicket.category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant font-bold mb-1">Resource ID</p>
                                <p className="text-on-surface">#{selectedTicket.resourceId}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <p className="text-xs text-on-surface-variant font-bold mb-2">Description</p>
                            <p className="text-on-surface bg-surface p-3 rounded text-sm">{selectedTicket.description}</p>
                        </div>

                        {/* Status Change Actions */}
                        {getAvailableTransitions(selectedTicket.status).length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-on-surface-variant font-bold mb-3">Change Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {getAvailableTransitions(selectedTicket.status).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusToChange(status)}
                                            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 text-sm"
                                        >
                                            Move to {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resolution Notes */}
                        {selectedTicket.status !== 'OPEN' && (
                            <div className="mb-6">
                                <label className="block text-xs text-on-surface-variant font-bold mb-2">
                                    Resolution Notes
                                </label>
                                <textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-surface border-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                    rows="4"
                                    placeholder="Add technical details, steps taken, etc..."
                                />
                                <button
                                    onClick={handleAddResolutionNotes}
                                    disabled={modalLoading}
                                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 text-sm"
                                >
                                    {modalLoading ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>
                        )}

                        {/* Current Resolution Notes */}
                        {selectedTicket.resolutionNotes && (
                            <div className="mb-6">
                                <p className="text-xs text-on-surface-variant font-bold mb-2">Current Notes</p>
                                <div className="bg-surface p-3 rounded text-sm text-on-surface">
                                    {selectedTicket.resolutionNotes}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        <div className="mb-6">
                            <p className="text-xs text-on-surface-variant font-bold mb-3">Comments</p>
                            {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                    {selectedTicket.comments.map(c => (
                                        <div key={c.id} className="bg-surface p-3 rounded text-sm">
                                            <p className="text-xs text-on-surface-variant font-bold mb-1">
                                                User ID: {c.userId} •{' '}
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-on-surface">{c.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-on-surface-variant mb-4">No comments yet</p>
                            )}

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-surface border-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                rows="2"
                                placeholder="Add a comment..."
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={modalLoading}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 text-sm"
                            >
                                {modalLoading ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>

                        {/* Confirmation for Status Change */}
                        {statusToChange && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                                <p className="text-sm text-yellow-800 mb-3">
                                    Confirm change status to <strong>{statusToChange}</strong>?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusChange(statusToChange)}
                                        disabled={modalLoading}
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 text-sm"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => setStatusToChange(null)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="w-full px-4 py-2 bg-surface-container text-on-surface rounded-lg font-medium hover:bg-surface-container-highest text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
