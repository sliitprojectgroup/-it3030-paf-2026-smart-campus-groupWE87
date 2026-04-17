import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getResources = async () => {
  const response = await api.get('/resources');
  return response.data;
};

export const getResourceById = async (id) => {
  const response = await api.get(`/resources/${id}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async (userId) => {
  const response = await api.get(`/bookings/user/${userId}`);
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

export const approveBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/approve`);
  return response.data;
};

export const rejectBooking = async (id, reason) => {
  const response = await api.put(`/bookings/${id}/reject?reason=${encodeURIComponent(reason)}`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

export default api;
