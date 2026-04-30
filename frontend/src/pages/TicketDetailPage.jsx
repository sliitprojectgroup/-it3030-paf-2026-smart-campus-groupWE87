import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getTicketById,
    updateTicketStatus,
    assignTechnician,
    addResolutionNotes,
    rejectTicket,
    closeTicket,
    addComment,
    getCommentsByTicket,
    editComment,
    deleteComment,
} from '../services/api';
import { getUser } from '../utils/auth';

export default function TicketDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = getUser();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    const [newComment, setNewComment] = useState('');
    const [showAdminActions, setShowAdminActions] = useState(false);
    const [adminAction, setAdminAction] = useState('');
    const [actionData, setActionData] = useState('');

    const isAdmin = user?.role === 'ADMIN';
    const isTicketOwner = ticket?.userId === user?.id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const ticketData = await getTicketById(id);
                setTicket(ticketData);
                
                const commentsData = await getCommentsByTicket(id);
                setComments(commentsData || []);
                setError(null);
            } catch (err) {
                console.error('Failed to load ticket:', err);
                setError('Failed to load ticket. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const commentData = {
                ticketId: parseInt(id),
                userId: user?.id,
                content: newComment
            };
            const addedComment = await addComment(id, commentData);
            setComments([...comments, addedComment]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to add comment:', err);
            setError('Failed to add comment.');
        }
    };

    const handleEditComment = async (commentId, oldContent) => {
        if (editingCommentId === commentId) {
            if (editingContent.trim() && editingContent !== oldContent) {
                try {
                    await editComment(commentId, editingContent, user?.id);
                    setComments(comments.map(c =>
                        c.id === commentId ? { ...c, content: editingContent } : c
                    ));
                    setEditingCommentId(null);
                    setEditingContent('');
                } catch (err) {
                    console.error('Failed to edit comment:', err);
                }
            } else {
                setEditingCommentId(null);
                setEditingContent('');
            }
        } else {
            setEditingCommentId(commentId);
            setEditingContent(oldContent);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId, user?.id);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const handleAdminAction = async () => {
        try {
            let updatedTicket;
            
            switch (adminAction) {
                case 'status':
                    updatedTicket = await updateTicketStatus(id, actionData);
                    break;
                case 'assign':
                    updatedTicket = await assignTechnician(id, parseInt(actionData));
                    break;
                case 'resolve':
                    updatedTicket = await addResolutionNotes(id, actionData);
                    break;
                case 'reject':
                    updatedTicket = await rejectTicket(id, actionData);
                    break;
                case 'close':
                    updatedTicket = await closeTicket(id);
                    break;
                default:
                    break;
            }
            
            setTicket(updatedTicket);
            setAdminAction('');
            setActionData('');
            setShowAdminActions(false);
        } catch (err) {
            console.error('Failed to perform action:', err);
            setError('Failed to perform action.');
        }
    };

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

    if (loading) {
        return (
            <div className="flex-1 px-6 py-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex-1 px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error || 'Ticket not found'}
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 px-6 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
                        <p className="text-gray-600 mt-1">{ticket.category}</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-900 text-lg"
                    >
                        ←
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Ticket Details Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Priority</p>
                                    <p className={`mt-1 font-semibold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Resource ID</p>
                                    <p className="mt-1 font-semibold text-gray-900">#{ticket.resourceId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="mt-1 text-gray-900">{formatDate(ticket.createdAt)}</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            {ticket.preferredContact && (
                                <div className="border-t mt-6 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferred Contact</h3>
                                    <p className="text-gray-700">{ticket.preferredContact}</p>
                                </div>
                            )}

                            {ticket.assignedTo && (
                                <div className="border-t mt-6 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned To</h3>
                                    <p className="text-gray-700">Technician ID: {ticket.assignedTo}</p>
                                </div>
                            )}

                            {ticket.resolutionNotes && (
                                <div className="border-t mt-6 pt-6 bg-green-50 p-4 rounded">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolution Notes</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.resolutionNotes}</p>
                                </div>
                            )}

                            {ticket.rejectionReason && (
                                <div className="border-t mt-6 pt-6 bg-red-50 p-4 rounded">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Rejection Reason</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.rejectionReason}</p>
                                </div>
                            )}
                        </div>

                        {/* Attachments */}
                        {ticket.attachments && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {ticket.attachments.split(',').map((url, index) => (
                                        <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={url.trim()}
                                                alt={`Attachment ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Admin Actions */}
                    {isAdmin && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                                
                                <button
                                    onClick={() => setShowAdminActions(!showAdminActions)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition mb-4"
                                >
                                    {showAdminActions ? 'Hide' : 'Show'} Actions
                                </button>

                                {showAdminActions && (
                                    <div className="space-y-4">
                                        {/* Change Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                                            <select
                                                value={adminAction === 'status' ? actionData : ''}
                                                onChange={(e) => {
                                                    setAdminAction('status');
                                                    setActionData(e.target.value);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                <option value="">Select status</option>
                                                <option value="OPEN">Open</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="RESOLVED">Resolved</option>
                                                <option value="CLOSED">Closed</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </div>

                                        {/* Assign Technician */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Technician</label>
                                            <input
                                                type="number"
                                                placeholder="Technician ID"
                                                value={adminAction === 'assign' ? actionData : ''}
                                                onChange={(e) => {
                                                    setAdminAction('assign');
                                                    setActionData(e.target.value);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>

                                        {/* Add Resolution Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                                            <textarea
                                                placeholder="Add resolution details..."
                                                value={adminAction === 'resolve' ? actionData : ''}
                                                onChange={(e) => {
                                                    setAdminAction('resolve');
                                                    setActionData(e.target.value);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                                rows="3"
                                            />
                                        </div>

                                        {/* Reject Ticket */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                                            <textarea
                                                placeholder="Reason for rejection..."
                                                value={adminAction === 'reject' ? actionData : ''}
                                                onChange={(e) => {
                                                    setAdminAction('reject');
                                                    setActionData(e.target.value);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                                rows="3"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <button
                                            onClick={handleAdminAction}
                                            disabled={!adminAction || !actionData}
                                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                                        >
                                            Apply
                                        </button>

                                        <button
                                            onClick={() => {
                                                setAdminAction('close');
                                                handleAdminAction();
                                            }}
                                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                                        >
                                            Close Ticket
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="mb-6 pb-6 border-b">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
                        >
                            Post Comment
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No comments yet</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">User ID: {comment.userId}</p>
                                            <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                                        </div>
                                        {comment.userId === user?.id && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditComment(comment.id, comment.content)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    {editingCommentId === comment.id ? 'Save' : 'Edit'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment.id ? (
                                        <textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg resize-none"
                                            rows="3"
                                        />
                                    ) : (
                                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">{comment.content}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
