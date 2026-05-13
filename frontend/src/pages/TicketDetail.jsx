import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    getTicketById, 
    updateTicketStatus, 
    addTicketComment, 
    getTicketComments,
    updateTicketComment,
    deleteTicketComment,
    getTicketAttachments 
} from '../services/api';
import { getUser } from '../utils/auth';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = getUser();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);

    const statusOptions = {
        'OPEN': ['IN_PROGRESS', 'REJECTED'],
        'IN_PROGRESS': ['RESOLVED', 'REJECTED'],
        'RESOLVED': ['CLOSED'],
        'CLOSED': [],
        'REJECTED': []
    };

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
        fetchTicketDetails();
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            const ticketData = await getTicketById(id);
            setTicket(ticketData);
            setComments(ticketData.comments || []);
            setAttachments(ticketData.attachments || []);
        } catch (err) {
            console.error('Failed to load ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (window.confirm(`Change status to ${newStatus}?`)) {
            setStatusLoading(true);
            try {
                const updated = await updateTicketStatus(id, newStatus);
                setTicket(updated);
                alert('Status updated successfully');
            } catch (err) {
                console.error('Failed to update status:', err);
                alert('Failed to update status');
            } finally {
                setStatusLoading(false);
            }
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setCommentLoading(true);
        try {
            const newComment = await addTicketComment(id, currentUser.id, { content: commentText });
            setComments([...comments, newComment]);
            setCommentText('');
            alert('Comment added successfully');
        } catch (err) {
            console.error('Failed to add comment:', err);
            alert('Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editingCommentText.trim()) return;

        try {
            const updated = await updateTicketComment(commentId, currentUser.id, { content: editingCommentText });
            setComments(comments.map(c => c.id === commentId ? updated : c));
            setEditingCommentId(null);
            setEditingCommentText('');
            alert('Comment updated successfully');
        } catch (err) {
            console.error('Failed to update comment:', err);
            alert('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Delete this comment?')) {
            try {
                await deleteTicketComment(commentId, currentUser.id);
                setComments(comments.filter(c => c.id !== commentId));
                alert('Comment deleted successfully');
            } catch (err) {
                console.error('Failed to delete comment:', err);
                alert('Failed to delete comment');
            }
        }
    };

    if (loading) {
        return (
            <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
                <p className="text-center text-on-surface-variant">Ticket not found</p>
                <button 
                    onClick={() => navigate('/tickets')}
                    className="mt-4 mx-auto block px-6 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90"
                >
                    Back to Tickets
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto mt-4 md:mt-0">
            <button 
                onClick={() => navigate('/tickets')}
                className="mb-6 text-primary hover:underline text-sm font-medium"
            >
                ← Back to Tickets
            </button>

            {/* Ticket Header */}
            <div className="bg-surface-container-low rounded-2xl p-6 md:p-8 mb-6 border border-outline-variant/10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">{ticket.title}</h1>
                        <p className="text-on-surface-variant">{ticket.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </span>
                    </div>
                </div>

                {/* Ticket Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-on-surface-variant font-bold mb-1">Category</p>
                        <p className="text-on-surface">{ticket.category}</p>
                    </div>
                    <div>
                        <p className="text-xs text-on-surface-variant font-bold mb-1">Resource ID</p>
                        <p className="text-on-surface">#{ticket.resourceId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-on-surface-variant font-bold mb-1">Preferred Contact</p>
                        <p className="text-on-surface">{ticket.preferredContact}</p>
                    </div>
                    <div>
                        <p className="text-xs text-on-surface-variant font-bold mb-1">Created Date</p>
                        <p className="text-on-surface">
                            {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                    {ticket.assignedTechnician && (
                        <div>
                            <p className="text-xs text-on-surface-variant font-bold mb-1">Assigned Technician</p>
                            <p className="text-on-surface">Technician ID: {ticket.assignedTechnician}</p>
                        </div>
                    )}
                    {ticket.rejectionReason && (
                        <div>
                            <p className="text-xs text-on-surface-variant font-bold mb-1">Rejection Reason</p>
                            <p className="text-on-surface text-red-600">{ticket.rejectionReason}</p>
                        </div>
                    )}
                </div>

                {/* Resolution Notes */}
                {ticket.resolutionNotes && (
                    <div className="mt-6 pt-6 border-t border-outline-variant/10">
                        <p className="text-xs text-on-surface-variant font-bold mb-2">Resolution Notes</p>
                        <p className="text-on-surface bg-surface p-3 rounded-lg">{ticket.resolutionNotes}</p>
                    </div>
                )}

                {/* Status Actions */}
                {statusOptions[ticket.status] && statusOptions[ticket.status].length > 0 && (
                    <div className="mt-6 pt-6 border-t border-outline-variant/10">
                        <p className="text-xs text-on-surface-variant font-bold mb-3">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions[ticket.status].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={statusLoading}
                                    className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 text-sm"
                                >
                                    Move to {status}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
                <div className="bg-surface-container-low rounded-2xl p-6 mb-6 border border-outline-variant/10">
                    <h2 className="text-lg font-bold text-primary mb-4">Attachments ({attachments.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attachments.map(att => (
                            <div key={att.id} className="bg-surface p-4 rounded-lg">
                                <p className="font-medium text-sm text-on-surface mb-2">{att.fileName}</p>
                                <p className="text-xs text-on-surface-variant">{(att.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                <a href={att.filePath} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-primary hover:underline text-sm font-medium">
                                    View File
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments Section */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                <h2 className="text-lg font-bold text-primary mb-6">Comments</h2>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-3 rounded-lg bg-surface border-none focus:ring-2 focus:ring-primary text-sm resize-none"
                        rows="3"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={commentLoading || !commentText.trim()}
                        className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 text-sm"
                    >
                        {commentLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>

                {/* Comments List */}
                {comments.length === 0 ? (
                    <p className="text-on-surface-variant text-center py-6">No comments yet</p>
                ) : (
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="bg-surface p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-bold">User ID: {comment.userId}</p>
                                        <p className="text-xs text-on-surface-variant">
                                            {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    {comment.userId === currentUser.id && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCommentId(comment.id);
                                                    setEditingCommentText(comment.content);
                                                }}
                                                className="text-primary hover:underline text-xs font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-red-600 hover:underline text-xs font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingCommentId === comment.id ? (
                                    <div className="mt-2">
                                        <textarea
                                            value={editingCommentText}
                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                            className="w-full px-3 py-2 rounded bg-surface-container border-none focus:ring-2 focus:ring-primary text-sm resize-none"
                                            rows="2"
                                        ></textarea>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleEditComment(comment.id)}
                                                className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-medium hover:bg-primary/90"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingCommentId(null)}
                                                className="px-3 py-1 bg-surface-container text-on-surface rounded text-xs font-medium hover:bg-surface-container-highest"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-on-surface mt-2">{comment.content}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}