import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8085/api',
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

export default api;
