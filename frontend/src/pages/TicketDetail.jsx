import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, updateTicketStatus, assignTicket, getTicketAttachments, deleteAttachment, rejectTicket, addComment, getTicketComments, updateComment, deleteComment } from '../services/api';
import toast from 'react-hot-toast';

export default function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [assignStaffId, setAssignStaffId] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId') || '1');
    const [currentUserName, setCurrentUserName] = useState(localStorage.getItem('userName') || 'User');

    useEffect(() => {
        loadTicketDetails();
    }, [id]);

    const loadTicketDetails = async () => {
        try {
            const ticketData = await getTicketById(id);
            setTicket(ticketData);
            setSelectedStatus(ticketData.status);
            
            const attachmentsData = await getTicketAttachments(id);
            setAttachments(attachmentsData || []);

            const commentsData = await getTicketComments(id);
            setComments(commentsData || []);
        } catch (err) {
            console.error('Error loading ticket:', err);
            toast.error('Failed to load ticket details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === ticket.status) return;
        
        setUpdating(true);
        try {
            const updated = await updateTicketStatus(id, newStatus);
            setTicket(updated);
            setSelectedStatus(newStatus);
            toast.success(`Ticket status updated to ${newStatus}`);
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update ticket status');
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignTicket = async () => {
        if (!assignStaffId) {
            toast.error('Please enter staff ID');
            return;
        }

        setUpdating(true);
        try {
            const updated = await assignTicket(id, Number(assignStaffId));
            setTicket(updated);
            setShowAssignModal(false);
            setAssignStaffId('');
            toast.success('Ticket assigned successfully');
        } catch (err) {
            console.error('Error assigning ticket:', err);
            toast.error('Failed to assign ticket');
        } finally {
            setUpdating(false);
        }
    };

    const handleRejectTicket = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setUpdating(true);
        try {
            const updated = await rejectTicket(id, rejectReason);
            setTicket(updated);
            setSelectedStatus('REJECTED');
            setShowRejectModal(false);
            setRejectReason('');
            toast.success('Ticket rejected successfully');
        } catch (err) {
            console.error('Error rejecting ticket:', err);
            toast.error('Failed to reject ticket');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        try {
            const comment = await addComment(id, {
                userId: Number(currentUserId),
                userName: currentUserName,
                content: newComment,
                isStaffComment: false
            });
            setComments([comment, ...comments]);
            setNewComment('');
            toast.success('Comment added successfully');
        } catch (err) {
            console.error('Error adding comment:', err);
            toast.error('Failed to add comment');
        }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editCommentText.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        try {
            const updated = await updateComment(commentId, {
                content: editCommentText,
                userId: Number(currentUserId)
            });
            setComments(comments.map(c => c.id === commentId ? updated : c));
            setEditingCommentId(null);
            setEditCommentText('');
            toast.success('Comment updated successfully');
        } catch (err) {
            console.error('Error updating comment:', err);
            toast.error(err.response?.data?.message || 'Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await deleteComment(commentId, Number(currentUserId));
            setComments(comments.filter(c => c.id !== commentId));
            toast.success('Comment deleted successfully');
        } catch (err) {
            console.error('Error deleting comment:', err);
            toast.error(err.response?.data?.message || 'Failed to delete comment');
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm('Are you sure you want to delete this attachment?')) return;

        try {
            await deleteAttachment(attachmentId);
            setAttachments(prev => prev.filter(att => att.id !== attachmentId));
            toast.success('Attachment deleted');
        } catch (err) {
            console.error('Error deleting attachment:', err);
            toast.error('Failed to delete attachment');
        }
    };

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-6 md:p-12 max-w-4xl mx-auto text-center">
                <p className="text-on-surface-variant">Ticket not found</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto mt-4 md:mt-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary mb-2">
                        Ticket #{ticket.id}
                    </h1>
                    <p className="font-body text-on-surface-variant">Resource: {ticket.resourceId}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors"
                >
                    Back
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Ticket Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status & Priority */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        <div className="flex flex-wrap gap-4 mb-6">
                            <div>
                                <p className="text-xs font-medium text-on-surface-variant mb-1">Status</p>
                                <div className="flex gap-2">
                                    {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            disabled={updating || ticket.status === 'REJECTED'}
                                            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                                                selectedStatus === status
                                                    ? getStatusColor(status)
                                                    : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                                            } disabled:opacity-50`}
                                        >
                                            {status.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-on-surface-variant mb-1">Priority</p>
                                <span className={`inline-block px-3 py-1.5 rounded-lg font-medium text-xs ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                            </div>
                        </div>

                        {ticket.status === 'REJECTED' && ticket.rejectionReason && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason</p>
                                <p className="text-sm text-red-900">{ticket.rejectionReason}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs font-medium text-on-surface-variant mb-1">Category</p>
                                <p className="text-on-surface">{ticket.category}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-on-surface-variant mb-1">Reporter</p>
                                <p className="text-on-surface">User #{ticket.userId}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-on-surface-variant mb-1">Created</p>
                                <p className="text-on-surface text-xs">{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-on-surface-variant mb-1">Updated</p>
                                <p className="text-on-surface text-xs">{new Date(ticket.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-3">Description</h3>
                        <p className="text-on-surface-variant whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Contact Information</h3>
                        <div className="space-y-3">
                            {ticket.contactName && (
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                                    <span className="text-sm text-on-surface-variant">Name</span>
                                    <span className="text-sm text-on-surface font-medium">{ticket.contactName}</span>
                                </div>
                            )}
                            {ticket.contactPhone && (
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                                    <span className="text-sm text-on-surface-variant">Phone</span>
                                    <span className="text-sm text-on-surface font-medium">
                                        <a href={`tel:${ticket.contactPhone}`} className="text-primary hover:underline">
                                            {ticket.contactPhone}
                                        </a>
                                    </span>
                                </div>
                            )}
                            {ticket.contactEmail && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-on-surface-variant">Email</span>
                                    <span className="text-sm text-on-surface font-medium">
                                        <a href={`mailto:${ticket.contactEmail}`} className="text-primary hover:underline">
                                            {ticket.contactEmail}
                                        </a>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attachments */}
                    {attachments.length > 0 && (
                        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                            <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Evidence (Attachments)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {attachments.map(att => (
                                    <div key={att.id} className="relative group">
                                        <img
                                            src={`data:${att.fileType};base64,${btoa(String.fromCharCode(...att.fileData))}`}
                                            alt={att.fileName}
                                            className="w-full h-32 object-cover rounded-lg border border-outline-variant/20 cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                        <button
                                            onClick={() => handleDeleteAttachment(att.id)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <p className="text-xs text-on-surface-variant mt-1 truncate">{att.fileName}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Comments ({comments.length})</h3>

                        {/* Add Comment */}
                        <div className="mb-6 p-4 bg-surface rounded-lg border border-outline-variant/20">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none text-sm resize-none"
                                rows="3"
                            ></textarea>
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                Post Comment
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-center text-on-surface-variant text-sm py-6">No comments yet</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="p-4 bg-surface rounded-lg border border-outline-variant/20">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-on-surface">
                                                    {comment.userName}
                                                    {comment.isStaffComment && (
                                                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Staff</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-on-surface-variant">
                                                    {new Date(comment.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {comment.userId === Number(currentUserId) && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCommentId(comment.id);
                                                            setEditCommentText(comment.content);
                                                        }}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="mt-3">
                                                <textarea
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 focus:ring-2 focus:ring-primary text-sm resize-none"
                                                    rows="2"
                                                ></textarea>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleUpdateComment(comment.id)}
                                                        className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-medium hover:bg-primary/90"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingCommentId(null);
                                                            setEditCommentText('');
                                                        }}
                                                        className="px-3 py-1 bg-surface-container text-on-surface rounded text-xs font-medium hover:bg-surface-container-highest"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-on-surface-variant text-sm whitespace-pre-wrap mt-2">{comment.content}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Assignment Section */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Assignment</h3>
                        {ticket.assignedTo ? (
                            <div className="mb-4">
                                <p className="text-xs text-on-surface-variant mb-1">Assigned to</p>
                                <p className="text-on-surface font-medium">Staff #{ticket.assignedTo}</p>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="mt-3 w-full py-2 px-3 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                                >
                                    Reassign
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAssignModal(true)}
                                disabled={ticket.status === 'REJECTED'}
                                className="w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                Assign Technician
                            </button>
                        )}
                    </div>

                    {/* Rejection Section */}
                    {ticket.status !== 'REJECTED' && (
                        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                            <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Reject Ticket</h3>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors"
                            >
                                Reject Ticket
                            </button>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-on-surface-variant mb-1">Ticket ID</p>
                                <p className="font-mono font-medium text-primary">{ticket.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant mb-1">Resource ID</p>
                                <p className="font-mono font-medium">{ticket.resourceId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant mb-1">Attachments</p>
                                <p className="font-medium">{attachments.length}/3</p>
                            </div>
                            <div>
                                <p className="text-xs text-on-surface-variant mb-1">Comments</p>
                                <p className="font-medium">{comments.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
                        <h2 className="font-headline text-xl font-bold text-on-surface mb-4">Assign Technician</h2>
                        <input
                            type="number"
                            value={assignStaffId}
                            onChange={(e) => setAssignStaffId(e.target.value)}
                            placeholder="Enter staff/technician ID"
                            className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 focus:ring-2 focus:ring-primary transition-all text-sm mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setAssignStaffId('');
                                }}
                                className="flex-1 py-2 px-4 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors text-on-surface font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignTicket}
                                disabled={updating || !assignStaffId}
                                className="flex-1 py-2 px-4 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-medium text-sm disabled:opacity-50 disabled:pointer-events-none transition-colors"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
                        <h2 className="font-headline text-xl font-bold text-on-surface mb-4">Reject Ticket</h2>
                        <p className="text-sm text-on-surface-variant mb-4">Provide a reason for rejection</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Rejection reason..."
                            className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/30 focus:ring-2 focus:ring-primary transition-all text-sm mb-4 resize-none"
                            rows="4"
                        ></textarea>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="flex-1 py-2 px-4 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors text-on-surface font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectTicket}
                                disabled={updating || !rejectReason.trim()}
                                className="flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm disabled:opacity-50 disabled:pointer-events-none transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
