import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
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

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getUserBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const getPendingBookings = () => api.get('/bookings/pending');
export const getAllBookings = () => api.get('/bookings');
export const getBookingsByDateAndResource = (resourceId, date) => api.get(`/bookings?resourceId=${resourceId}&date=${date}`);
export const approveBooking = (id) => api.put(`/bookings/${id}/approve`);
export const rejectBooking = (id, reason) => api.put(`/bookings/${id}/reject`, null, { params: { reason } });
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

// Tickets
export const createTicket = (data) => api.post('/tickets', data);
export const getTickets = () => api.get('/tickets');
export const getTicketById = (id) => api.get(`/tickets/${id}`);
export const getUserTickets = (userId) => api.get(`/tickets/user/${userId}`);
export const updateTicketStatus = (id, status) => api.put(`/tickets/${id}/status`, { status });
export const assignTechnician = (id, technicianId) => api.put(`/tickets/${id}/assign`, { technicianId });
export const addResolutionNotes = (id, resolutionNotes) => api.put(`/tickets/${id}/resolve`, { resolutionNotes });
export const rejectTicket = (id, rejectionReason) => api.put(`/tickets/${id}/reject`, { rejectionReason });
export const closeTicket = (id) => api.put(`/tickets/${id}/close`);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);
export const uploadTicketAttachments = (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return axios.post(`http://localhost:8080/api/tickets/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Comments
export const addComment = (ticketId, comment) => api.post(`/tickets/${ticketId}/comments`, comment);
export const getCommentsByTicket = (ticketId) => api.get(`/tickets/${ticketId}/comments`);
export const editComment = (id, content, userId) => api.put(`/tickets/comments/${id}`, { content, userId });
export const deleteComment = (id, userId) => api.delete(`/tickets/comments/${id}`, { params: { userId } });

export default api;
