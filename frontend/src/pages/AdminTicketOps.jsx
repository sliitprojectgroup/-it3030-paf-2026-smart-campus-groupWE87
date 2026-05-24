import { useState, useEffect } from 'react';
import {
    getTickets,
    assignTechnician,
    rejectTicket,
    updateTicketStatus,
    updateTicket,
    getTicketById,
    addTicketComment,
    deleteTicketAttachment
} from '../services/api';

export default function AdminTicketOps() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('OPEN');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [actionMode, setActionMode] = useState(null); // 'assign', 'reject', 'notes', 'status'
    const [formData, setFormData] = useState({
        technicianId: '',
        rejectionReason: '',
        resolutionNotes: '',
        statusChange: ''
    });
    const [comment, setComment] = useState('');
    const [technicians, setTechnicians] = useState([
        { id: 1, name: 'John Smith' },
        { id: 2, name: 'Jane Doe' },
        { id: 3, name: 'Mike Johnson' },
        { id: 4, name: 'Sarah Williams' },
        { id: 5, name: 'Tom Brown' }
    ]);

    const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

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

    const getAvailableTransitions = (status) => {
        const transitions = {
            'OPEN': ['IN_PROGRESS', 'REJECTED'],
            'IN_PROGRESS': ['RESOLVED', 'REJECTED'],
            'RESOLVED': ['CLOSED'],
            'CLOSED': [],
            'REJECTED': []
        };
        return transitions[status] || [];
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const data = await getTickets();
            setTickets(data);
        } catch (err) {
            console.error('Failed to load tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets
        .filter(t => t.status === filterStatus)
        .filter(t =>
            t.id.toString().includes(searchQuery.toLowerCase()) ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleOpenDetail = async (ticket) => {
        setSelectedTicket(ticket);
        setFormData({
            technicianId: ticket.assignedTechnician || '',
            rejectionReason: '',
            resolutionNotes: ticket.resolutionNotes || '',
            statusChange: ''
        });
        setComment('');
        setActionMode(null);
        setShowDetailModal(true);
    };

    const handleAssignTechnician = async () => {
        if (!formData.technicianId) {
            alert('Please select a technician');
            return;
        }

        setModalLoading(true);
        try {
            const updated = await assignTechnician(selectedTicket.id, Number(formData.technicianId));
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            setSelectedTicket(updated);
            alert('Technician assigned successfully');
            setActionMode(null);
        } catch (err) {
            console.error('Failed to assign technician:', err);
            alert('Failed to assign technician');
        } finally {
            setModalLoading(false);
        }
    };

    const handleRejectTicket = async () => {
        if (!formData.rejectionReason.trim()) {
            alert('Please enter a rejection reason');
            return;
        }

        setModalLoading(true);
        try {
            const updated = await rejectTicket(selectedTicket.id, formData.rejectionReason);
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            setSelectedTicket(updated);
            alert('Ticket rejected successfully');
            setActionMode(null);
            setFormData(prev => ({ ...prev, rejectionReason: '' }));
        } catch (err) {
            console.error('Failed to reject ticket:', err);
            alert('Failed to reject ticket');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!formData.statusChange) {
            alert('Please select a new status');
            return;
        }

        setModalLoading(true);
        try {
            const updated = await updateTicketStatus(selectedTicket.id, formData.statusChange);
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            setSelectedTicket(updated);
            alert(`Status updated to ${formData.statusChange}`);
            setActionMode(null);
            setFormData(prev => ({ ...prev, statusChange: '' }));
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateNotes = async () => {
        if (!formData.resolutionNotes.trim()) {
            alert('Please enter resolution notes');
            return;
        }

        setModalLoading(true);
        try {
            const updated = await updateTicket(selectedTicket.id, {
                ...selectedTicket,
                resolutionNotes: formData.resolutionNotes
            });

            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            setSelectedTicket(updated);
            alert('Resolution notes updated successfully');
            setActionMode(null);
        } catch (err) {
            console.error('Failed to update notes:', err);
            alert('Failed to update resolution notes');
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim()) {
            alert('Please enter a comment');
            return;
        }

        setModalLoading(true);
        try {
            await addTicketComment(selectedTicket.id, 1, { content: comment }); // Using admin ID 1
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

    const handleUpdateNotes = async () => {
        if (!formData.resolutionNotes) {
            alert('Please enter resolution notes');
            return;
        }

        setProcessing(true);
        try {
            // Update ticket with resolution notes
            const updated = await updateTicket(selectedTicket.id, {
                ...selectedTicket,
                resolutionNotes: formData.resolutionNotes
            });

            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            alert('Resolution notes updated successfully');
            setSelectedTicket(null);
            setActionMode(null);
            setFormData({ technicianId: '', rejectionReason: '', resolutionNotes: '' });
        } catch (err) {
            console.error('Failed to update notes:', err);
            alert('Failed to update resolution notes');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto mt-4 md:mt-0">
            <header className="mb-10">
                <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">
                    Admin Ticket Operations
                </h1>
                <p className="font-body text-on-surface-variant text-sm md:text-base">
                    Manage tickets, assign technicians, and update statuses.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-3">
                    {/* Filters and Search */}
                    <div className="mb-6">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search by ticket ID, title, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
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
                    </div>

                    {/* Tickets List */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <p className="text-center text-on-surface-variant py-8">
                                No tickets with status {filterStatus}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {filteredTickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => handleOpenDetail(ticket)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedTicket?.id === ticket.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-outline-variant/20 bg-surface hover:bg-surface-container-highest'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-on-surface">
                                                    Ticket #{ticket.id}: {ticket.title}
                                                </h3>
                                                <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                                                    {ticket.description}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2 ${getStatusColor(ticket.status)}`}
                                            >
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <span
                                                className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(ticket.priority)}`}
                                            >
                                                {ticket.priority}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-medium">
                                                {ticket.category}
                                            </span>
                                            {ticket.assignedTechnician && (
                                                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
                                                    Tech: {technicians.find(t => t.id === ticket.assignedTechnician)?.name || `#${ticket.assignedTechnician}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-1">
                    {selectedTicket ? (
                        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 sticky top-4">
                            <h2 className="text-lg font-bold text-primary mb-4">
                                Ticket #{selectedTicket.id}
                            </h2>

                            <div className="space-y-3 mb-6 text-sm">
                                <div>
                                    <p className="text-xs text-on-surface-variant font-bold mb-1">Status</p>
                                    <p className={`text-xs font-bold px-2 py-1 rounded w-fit ${getStatusColor(selectedTicket.status)}`}>
                                        {selectedTicket.status}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-on-surface-variant font-bold mb-1">Priority</p>
                                    <p className={`text-xs font-bold px-2 py-1 rounded w-fit ${getPriorityColor(selectedTicket.priority)}`}>
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
                                {selectedTicket.assignedTechnician && (
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-bold mb-1">Assigned Technician</p>
                                        <p className="text-on-surface">
                                            {technicians.find(t => t.id === selectedTicket.assignedTechnician)?.name || `ID: ${selectedTicket.assignedTechnician}`}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowDetailModal(true)}
                                className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 text-sm mb-3"
                            >
                                View Full Details
                            </button>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setActionMode('assign')}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 text-sm"
                                >
                                    Assign Technician
                                </button>
                                {selectedTicket.status === 'OPEN' && (
                                    <button
                                        onClick={() => setActionMode('reject')}
                                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 text-sm"
                                    >
                                        Reject Ticket
                                    </button>
                                )}
                                {getAvailableTransitions(selectedTicket.status).length > 0 && (
                                    <button
                                        onClick={() => setActionMode('status')}
                                        className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 text-sm"
                                    >
                                        Change Status
                                    </button>
                                )}
                                {selectedTicket.status !== 'OPEN' && (
                                    <button
                                        onClick={() => setActionMode('notes')}
                                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 text-sm"
                                    >
                                        Add/Edit Notes
                                    </button>
                                )}
                            </div>

                            {/* Action Forms */}
                            {actionMode === 'assign' && (
                                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                                    <label className="block text-xs font-bold text-on-surface-variant mb-2">Select Technician</label>
                                    <select
                                        value={formData.technicianId}
                                        onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                                        className="w-full px-3 py-2 rounded bg-surface border-none focus:ring-2 focus:ring-primary text-sm mb-3"
                                    >
                                        <option value="">Choose a technician...</option>
                                        {technicians.map(tech => (
                                            <option key={tech.id} value={tech.id}>
                                                {tech.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAssignTechnician}
                                            disabled={modalLoading || !formData.technicianId}
                                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:opacity-50 text-sm"
                                        >
                                            Assign
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActionMode(null);
                                                setFormData({ ...formData, technicianId: '' });
                                            }}
                                            className="flex-1 px-3 py-2 bg-surface-container text-on-surface rounded font-medium hover:bg-surface-container-highest text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {actionMode === 'reject' && (
                                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                                    <label className="block text-xs font-bold text-on-surface-variant mb-2">Rejection Reason</label>
                                    <textarea
                                        value={formData.rejectionReason}
                                        onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                                        className="w-full px-3 py-2 rounded bg-surface border-none focus:ring-2 focus:ring-primary text-sm resize-none mb-3"
                                        rows="3"
                                        placeholder="Enter rejection reason"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleRejectTicket}
                                            disabled={modalLoading}
                                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 disabled:opacity-50 text-sm"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActionMode(null);
                                                setFormData({ ...formData, rejectionReason: '' });
                                            }}
                                            className="flex-1 px-3 py-2 bg-surface-container text-on-surface rounded font-medium hover:bg-surface-container-highest text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {actionMode === 'status' && (
                                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                                    <label className="block text-xs font-bold text-on-surface-variant mb-2">New Status</label>
                                    <select
                                        value={formData.statusChange}
                                        onChange={(e) => setFormData({ ...formData, statusChange: e.target.value })}
                                        className="w-full px-3 py-2 rounded bg-surface border-none focus:ring-2 focus:ring-primary text-sm mb-3"
                                    >
                                        <option value="">Select status...</option>
                                        {getAvailableTransitions(selectedTicket.status).map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={modalLoading || !formData.statusChange}
                                            className="flex-1 px-3 py-2 bg-purple-500 text-white rounded font-medium hover:bg-purple-600 disabled:opacity-50 text-sm"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActionMode(null);
                                                setFormData({ ...formData, statusChange: '' });
                                            }}
                                            className="flex-1 px-3 py-2 bg-surface-container text-on-surface rounded font-medium hover:bg-surface-container-highest text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {actionMode === 'notes' && (
                                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                                    <label className="block text-xs font-bold text-on-surface-variant mb-2">Resolution Notes</label>
                                    <textarea
                                        value={formData.resolutionNotes}
                                        onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                                        className="w-full px-3 py-2 rounded bg-surface border-none focus:ring-2 focus:ring-primary text-sm resize-none mb-3"
                                        rows="3"
                                        placeholder="Enter resolution notes"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateNotes}
                                            disabled={modalLoading}
                                            className="flex-1 px-3 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 disabled:opacity-50 text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActionMode(null);
                                                setFormData({ ...formData, resolutionNotes: selectedTicket.resolutionNotes || '' });
                                            }}
                                            className="flex-1 px-3 py-2 bg-surface-container text-on-surface rounded font-medium hover:bg-surface-container-highest text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 text-center">
                            <p className="text-on-surface-variant">Select a ticket to manage</p>
                        </div>
                    )}
                </div>
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
                        <div className="bg-surface p-4 rounded-lg mb-6">
                            <div className="grid grid-cols-2 gap-4">
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
                                    <p className="text-xs text-on-surface-variant font-bold mb-1">Resource</p>
                                    <p className="text-on-surface">#{selectedTicket.resourceId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-on-surface-variant font-bold mb-1">Created</p>
                                    <p className="text-on-surface text-sm">
                                        {new Date(selectedTicket.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {selectedTicket.assignedTechnician && (
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-bold mb-1">Assigned To</p>
                                        <p className="text-on-surface">
                                            {technicians.find(t => t.id === selectedTicket.assignedTechnician)?.name || `Tech #${selectedTicket.assignedTechnician}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <p className="text-xs text-on-surface-variant font-bold mb-2">Description</p>
                            <p className="text-on-surface bg-surface p-3 rounded text-sm">{selectedTicket.description}</p>
                        </div>

                        {/* Resolution Notes */}
                        {selectedTicket.resolutionNotes && (
                            <div className="mb-6">
                                <p className="text-xs text-on-surface-variant font-bold mb-2">Resolution Notes</p>
                                <p className="text-on-surface bg-surface p-3 rounded text-sm">{selectedTicket.resolutionNotes}</p>
                            </div>
                        )}

                        {/* Rejection Reason */}
                        {selectedTicket.rejectionReason && (
                            <div className="mb-6">
                                <p className="text-xs text-on-surface-variant font-bold mb-2">Rejection Reason</p>
                                <p className="text-red-600 bg-surface p-3 rounded text-sm">{selectedTicket.rejectionReason}</p>
                            </div>
                        )}

                        {/* Comments */}
                        {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-on-surface-variant font-bold mb-3">Comments</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                                    {selectedTicket.comments.map(c => (
                                        <div key={c.id} className="bg-surface p-3 rounded text-sm">
                                            <p className="text-xs text-on-surface-variant font-bold mb-1">
                                                User ID: {c.userId}
                                            </p>
                                            <p className="text-on-surface">{c.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Comment */}
                        <div className="mb-6">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full px-4 py-3 rounded-lg bg-surface border-none focus:ring-2 focus:ring-primary text-sm resize-none mb-2"
                                rows="2"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={modalLoading || !comment.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 text-sm"
                            >
                                Add Comment
                            </button>
                        </div>

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