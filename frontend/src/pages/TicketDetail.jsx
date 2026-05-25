import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    getTicketById, 
    updateTicketStatus, 
    assignTechnician, 
    rejectTicket, 
    addComment, 
    getComments,
    updateComment,
    deleteComment,
    getAttachments,
    deleteAttachment,
    uploadAttachment 
} from '../services/api';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [technicianId, setTechnicianId] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [newAttachmentFile, setNewAttachmentFile] = useState(null);

    const currentUserId = localStorage.getItem('userId') || 1;
    const userRole = localStorage.getItem('userRole') || 'USER';

    useEffect(() => {
        const fetchTicketData = async () => {
            try {
                const ticketData = await getTicketById(id);
                setTicket(ticketData);
                setNewStatus(ticketData.status);
                setLoading(false);
            } catch (err) {
                setError('Failed to load ticket');
                setLoading(false);
            }
        };
        fetchTicketData();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const commentData = {
                userId: Number(currentUserId),
                userName: localStorage.getItem('userName') || 'User',
                content: newComment
            };
            await addComment(id, commentData);
            setNewComment('');
            
            // Refresh ticket to get updated comments
            const updatedTicket = await getTicketById(id);
            setTicket(updatedTicket);
        } catch (err) {
            setError('Failed to add comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteComment(commentId, Number(currentUserId));
                const updatedTicket = await getTicketById(id);
                setTicket(updatedTicket);
            } catch (err) {
                setError('Failed to delete comment');
            }
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await updateTicketStatus(id, newStatus, resolutionNotes);
            const updatedTicket = await getTicketById(id);
            setTicket(updatedTicket);
            setShowStatusModal(false);
            setResolutionNotes('');
        } catch (err) {
            setError('Failed to update status');
        }
    };

    const handleReject = async () => {
        try {
            await rejectTicket(id, rejectionReason);
            const updatedTicket = await getTicketById(id);
            setTicket(updatedTicket);
            setShowRejectModal(false);
            setRejectionReason('');
        } catch (err) {
            setError('Failed to reject ticket');
        }
    };

    const handleAssignTechnician = async () => {
        try {
            await assignTechnician(id, Number(technicianId));
            const updatedTicket = await getTicketById(id);
            setTicket(updatedTicket);
            setShowAssignModal(false);
            setTechnicianId('');
        } catch (err) {
            setError('Failed to assign technician');
        }
    };

    const handleUploadAttachment = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await uploadAttachment(id, file);
            const updatedTicket = await getTicketById(id);
            setTicket(updatedTicket);
            setNewAttachmentFile(null);
        } catch (err) {
            setError('Failed to upload attachment');
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (window.confirm('Delete this attachment?')) {
            try {
                await deleteAttachment(attachmentId);
                const updatedTicket = await getTicketById(id);
                setTicket(updatedTicket);
            } catch (err) {
                setError('Failed to delete attachment');
            }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">Ticket not found</p>
                <button onClick={() => navigate('/tickets')} className="mt-4 text-primary hover:underline">
                    Back to tickets
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 mt-4 md:mt-0">
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Ticket Header */}
            <div className="bg-surface-container-low rounded-2xl p-8 mb-6 border border-outline-variant/10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">#{ticket.id}: {ticket.category}</h1>
                        <p className="text-on-surface-variant">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                    <div>
                        <p className="text-xs text-on-surface-variant">Priority</p>
                        <p className="font-bold text-lg">{ticket.priority}</p>
                    </div>
                    <div>
                        <p className="text-xs text-on-surface-variant">Resource ID</p>
                        <p className="font-bold text-lg">#{ticket.resourceId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-on-surface-variant">Contact</p>
                        <p className="font-bold text-sm">{ticket.preferredContact}</p>
                    </div>
                    <div>
                        <p className="text-xs text-on-surface-variant">Technician</p>
                        <p className="font-bold text-sm">{ticket.assignedTechnician ? `ID: ${ticket.assignedTechnician}` : 'Unassigned'}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold mb-2">Description</h3>
                    <p className="text-on-surface-variant whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {ticket.resolutionNotes && (
                    <div className="mt-6 pt-6 border-t border-outline-variant/20">
                        <h3 className="font-bold mb-2">Resolution Notes</h3>
                        <p className="text-on-surface-variant whitespace-pre-wrap">{ticket.resolutionNotes}</p>
                    </div>
                )}

                {ticket.rejectionReason && (
                    <div className="mt-6 pt-6 border-t border-outline-variant/20 bg-red-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-2 text-red-800">Rejection Reason</h3>
                        <p className="text-red-700">{ticket.rejectionReason}</p>
                    </div>
                )}
            </div>

            {/* Admin Actions */}
            {userRole === 'ADMIN' && (
                <div className="bg-surface-container-low rounded-2xl p-6 mb-6 border border-outline-variant/10">
                    <h3 className="font-bold mb-4">Admin Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setShowStatusModal(true)}
                            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary/90 transition"
                        >
                            Change Status
                        </button>
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                        >
                            Assign Technician
                        </button>
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                        >
                            Reject Ticket
                        </button>
                    </div>
                </div>
            )}

            {/* Attachments */}
            <div className="bg-surface-container-low rounded-2xl p-6 mb-6 border border-outline-variant/10">
                <h3 className="font-bold mb-4">Attachments ({ticket.attachments?.length || 0}/3)</h3>
                {ticket.attachments && ticket.attachments.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {ticket.attachments.map(attachment => (
                            <div key={attachment.id} className="relative">
                                <div className="aspect-square rounded-lg bg-surface overflow-hidden">
                                    <img 
                                        src={`file://${attachment.filePath}`}
                                        alt={attachment.fileName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = ''}
                                    />
                                </div>
                                <p className="text-xs mt-1 truncate">{attachment.fileName}</p>
                                {userRole === 'ADMIN' && (
                                    <button
                                        onClick={() => handleDeleteAttachment(attachment.id)}
                                        className="mt-1 text-xs text-red-600 hover:text-red-800 font-semibold"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-on-surface-variant">No attachments yet.</p>
                )}

                {ticket.attachments?.length < 3 && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Add Attachment</label>
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={handleUploadAttachment}
                            className="block w-full text-sm text-on-surface-variant"
                        />
                    </div>
                )}
            </div>

            {/* Comments */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                <h3 className="font-bold mb-4">Comments ({ticket.comments?.length || 0})</h3>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6 pb-6 border-b border-outline-variant/20">
                    <textarea 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-3 rounded-lg bg-surface border border-outline-variant focus:ring-2 focus:ring-primary text-sm resize-none"
                        rows="3"
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="mt-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                        Post Comment
                    </button>
                </form>

                {/* Comments List */}
                {ticket.comments && ticket.comments.length > 0 ? (
                    <div className="space-y-4">
                        {ticket.comments.map(comment => (
                            <div key={comment.id} className="bg-surface p-4 rounded-lg border border-outline-variant/20">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold text-sm">{comment.userName}</p>
                                        <p className="text-xs text-on-surface-variant">
                                            {new Date(comment.createdAt).toLocaleString()}
                                            {comment.isEdited && ' (edited)'}
                                        </p>
                                    </div>
                                    {(comment.userId === Number(currentUserId) || userRole === 'ADMIN') && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-on-surface whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-on-surface-variant">No comments yet.</p>
                )}
            </div>

            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
                        <h3 className="font-bold text-lg mb-4">Change Ticket Status</h3>
                        <select 
                            value={newStatus}
                            onChange={e => setNewStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-surface-container border border-outline-variant mb-4"
                        >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>

                        {newStatus === 'RESOLVED' && (
                            <textarea 
                                value={resolutionNotes}
                                onChange={e => setResolutionNotes(e.target.value)}
                                placeholder="Add resolution notes..."
                                className="w-full px-4 py-2 rounded-lg bg-surface-container border border-outline-variant mb-4 resize-none"
                                rows="3"
                            />
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                className="flex-1 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary/90 transition"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
                        <h3 className="font-bold text-lg mb-4">Reject Ticket</h3>
                        <textarea 
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full px-4 py-2 rounded-lg bg-surface-container border border-outline-variant mb-4 resize-none"
                            rows="4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Technician Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
                        <h3 className="font-bold text-lg mb-4">Assign Technician</h3>
                        <input 
                            type="number"
                            value={technicianId}
                            onChange={e => setTechnicianId(e.target.value)}
                            placeholder="Enter technician user ID..."
                            className="w-full px-4 py-2 rounded-lg bg-surface-container border border-outline-variant mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignTechnician}
                                disabled={!technicianId}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 transition"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={() => navigate('/tickets')}
                className="mt-6 px-6 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition font-semibold"
            >
                ← Back to Tickets
            </button>
        </div>
    );
}
