import axios from 'axios';

const API_HOST = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;

const api = axios.create({
    baseURL: `http://${API_HOST}:8085/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Basic Error Handling Interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response || error.message);
        // You could hook this into a global toast/alert context here if available
        return Promise.reject(error);
    }
);

// Resources
export const getResources = () => api.get('/resources');
export const createResource = (data) => api.post('/resources', data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);

// Auth
export const loginUser = (data) => api.post('/auth/login', data);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getUserBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const getPendingBookings = () => api.get('/bookings/pending');
export const getAllBookings = () => api.get('/bookings');
export const getBookingsByDateAndResource = (resourceId, date) => api.get(`/bookings?resourceId=${resourceId}&date=${date}`);
export const approveBooking = (id) => api.put(`/bookings/${id}/approve`);
export const rejectBooking = (id, reason) => api.put(`/bookings/${id}/reject`, null, { params: { reason } });
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

export const verifyBooking = (qrCode) => api.get(`/bookings/verify/${qrCode}`);

export const getBookingStats = () => api.get('/bookings/stats');

// Tickets - Basic CRUD
export const createTicket = (data) => api.post('/tickets', data);
export const getTickets = () => api.get('/tickets');
export const getTicketById = (id) => api.get(`/tickets/${id}`);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

// Tickets - Filtering
export const getTicketsByResource = (resourceId) => api.get(`/tickets/resource/${resourceId}`);
export const getTicketsByUser = (userId) => api.get(`/tickets/user/${userId}`);
export const getTicketsByTechnician = (technicianId) => api.get(`/tickets/technician/${technicianId}`);
export const getTicketsByStatus = (status) => api.get(`/tickets/status/${status}`);

// Tickets - Status & Assignment
export const assignTechnician = (ticketId, technicianId) => 
    api.put(`/tickets/${ticketId}/assign`, null, { params: { technicianId } });

export const updateTicketStatus = (ticketId, status, notes) => 
    api.put(`/tickets/${ticketId}/status`, null, { params: { status, notes } });

export const rejectTicket = (ticketId, reason) => 
    api.put(`/tickets/${ticketId}/reject`, null, { params: { reason } });

// Tickets - Attachments
export const uploadAttachment = (ticketId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getAttachments = (ticketId) => api.get(`/tickets/${ticketId}/attachments`);
export const deleteAttachment = (attachmentId) => api.delete(`/tickets/attachments/${attachmentId}`);
export const downloadAttachment = (attachmentId) => 
    api.get(`/tickets/attachments/${attachmentId}/download`, { responseType: 'blob' });

// Tickets - Comments
export const addComment = (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data);
export const getComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`);
export const updateComment = (commentId, content, userId) => 
    api.put(`/tickets/comments/${commentId}`, null, { params: { content, userId } });

export const deleteComment = (commentId, userId) => 
    api.delete(`/tickets/comments/${commentId}`, { params: { userId } });

export const deleteCommentAsAdmin = (commentId) => 
    api.delete(`/tickets/comments/${commentId}/admin`);

// Notifications
export const getNotifications = (userId) => api.get('/notifications', { params: { userId } });
export const getUnreadNotifications = (userId) => api.get('/notifications/unread', { params: { userId } });
export const getUnreadNotificationCount = (userId) => api.get('/notifications/count', { params: { userId } });
export const markNotificationAsRead = (id, userId) => api.put(`/notifications/${id}/read`, null, { params: { userId } });
export const markAllNotificationsAsRead = (userId) => api.put('/notifications/read-all', null, { params: { userId } });
export const deleteNotification = (id, userId) => api.delete(`/notifications/${id}`, { params: { userId } });

export default api;

