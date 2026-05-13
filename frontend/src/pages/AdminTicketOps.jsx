import { useState, useEffect } from 'react';
import { getTickets, assignTechnician, rejectTicket, updateTicketStatus } from '../services/api';

export default function AdminTicketOps() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('OPEN');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [actionMode, setActionMode] = useState(null); // 'assign', 'reject', 'notes'
    const [formData, setFormData] = useState({
        technicianId: '',
        rejectionReason: '',
        resolutionNotes: ''
    });
    const [processing, setProcessing] = useState(false);

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

    const filteredTickets = tickets.filter(t => t.status === filterStatus);

    const handleAssignTechnician = async () => {
        if (!formData.technicianId) {
            alert('Please enter a technician ID');
            return;
        }

        setProcessing(true);
        try {
            const updated = await assignTechnician(selectedTicket.id, Number(formData.technicianId));
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            alert('Technician assigned successfully');
            setSelectedTicket(null);
            setActionMode(null);
            setFormData({ technicianId: '', rejectionReason: '', resolutionNotes: '' });
        } catch (err) {
            console.error('Failed to assign technician:', err);
            alert('Failed to assign technician');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectTicket = async () => {
        if (!formData.rejectionReason) {
            alert('Please enter a rejection reason');
            return;
        }

        setProcessing(true);
        try {
            const updated = await rejectTicket(selectedTicket.id, formData.rejectionReason);
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
            alert('Ticket rejected successfully');
            setSelectedTicket(null);
            setActionMode(null);
            setFormData({ technicianId: '', rejectionReason: '', resolutionNotes: '' });
        } catch (err) {
            console.error('Failed to reject ticket:', err);
            alert('Failed to reject ticket');
        } finally {
            setProcessing(false);
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
            const updated = await fetch(`http://localhost:8085/api/tickets/${selectedTicket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...selectedTicket,
                    resolutionNotes: formData.resolutionNotes
                })
            }).then(r => r.json());

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
        <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
            <header className="mb-10">
                <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">Admin Ticket Operations</h1>
                <p className="font-body text-on-surface-variant text-sm md:text-base">Manage tickets, assign technicians, and update statuses.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-2">
                    <div className="mb-6 flex gap-2 flex-wrap">
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
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <p className="text-center text-on-surface-variant py-8">No tickets with status {filterStatus}</p>
                        ) : (
                            <div className="space-y-3">
                                {filteredTickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedTicket?.id === ticket.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-outline-variant/20 bg-surface hover:bg-surface-container-highest'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-on-surface">{ticket.title}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                            {ticket.assignedTechnician && (
                                                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
                                                    Tech: #{ticket.assignedTechnician}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-on-surface-variant line-clamp-1">{ticket.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 sticky top-4">
                        {selectedTicket ? (
                            <>
                                <h2 className="text-lg font-bold text-primary mb-4">Ticket #{selectedTicket.id}</h2>
                                
                                <div className="space-y-3 mb-6 text-sm">
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-bold">Title</p>
                                        <p className="text-on-surface">{selectedTicket.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-bold">Resource ID</p>
                                        <p className="text-on-surface">#{selectedTicket.resourceId}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-bold">Category</p>
                                        <p className="text-on-surface">{selectedTicket.category}</p>
                                    </div>
                                    {selectedTicket.assignedTechnician && (
                                        <div>
                                            <p className="text-xs text-on-surface-variant font-bold">Assigned Technician</p>
                                            <p className="text-on-surface">#{selectedTicket.assignedTechnician}</p>
                                        </div>
                                    )}
                                </div>

                                {actionMode === null ? (
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
                                        {['IN_PROGRESS', 'RESOLVED'].includes(selectedTicket.status) && (
                                            <button
                                                onClick={() => setActionMode('notes')}
                                                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 text-sm"
                                            >
                                                Add Resolution Notes
                                            </button>
                                        )}
                                    </div>
                                ) : actionMode === 'assign' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface-variant mb-2">Technician ID</label>
                                        <input
                                            type="number"
                                            value={formData.technicianId}
                                            onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                                            className="w-full px-3 py-2 rounded bg-surface border-none focus:ring-2 focus:ring-primary text-sm mb-3"
                                            placeholder="Enter technician ID"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAssignTechnician}
                                                disabled={processing}
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
                                ) : actionMode === 'reject' ? (
                                    <div>
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
                                                disabled={processing}
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
                                ) : actionMode === 'notes' ? (
                                    <div>
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
                                                disabled={processing}
                                                className="flex-1 px-3 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 disabled:opacity-50 text-sm"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActionMode(null);
                                                    setFormData({ ...formData, resolutionNotes: '' });
                                                }}
                                                className="flex-1 px-3 py-2 bg-surface-container text-on-surface rounded font-medium hover:bg-surface-container-highest text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <p className="text-on-surface-variant text-center py-8">Select a ticket to manage</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}