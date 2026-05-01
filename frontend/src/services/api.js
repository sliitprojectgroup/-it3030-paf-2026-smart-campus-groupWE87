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

// Tickets
export const createTicket = (data) => api.post('/tickets', data);
export const getTickets = () => api.get('/tickets');

// Notifications
export const getNotifications = (userId) => api.get('/notifications', { params: { userId } });
export const getUnreadNotifications = (userId) => api.get('/notifications/unread', { params: { userId } });
export const getUnreadNotificationCount = (userId) => api.get('/notifications/count', { params: { userId } });
export const markNotificationAsRead = (id, userId) => api.put(`/notifications/${id}/read`, null, { params: { userId } });
export const markAllNotificationsAsRead = (userId) => api.put('/notifications/read-all', null, { params: { userId } });
export const deleteNotification = (id, userId) => api.delete(`/notifications/${id}`, { params: { userId } });

export default api;
