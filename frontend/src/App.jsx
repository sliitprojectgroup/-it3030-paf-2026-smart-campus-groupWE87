import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { getRole, getUserId, isAdmin, setDemoUser } from './utils/auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import CreateBooking from './pages/CreateBooking';
import MyBookings from './pages/MyBookings';
import AdminOps from './pages/AdminOps';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import AdminResourceOps from './pages/AdminResourceOps';
import Login from './pages/Login';
import PendingBookings from './pages/PendingBookings';
import Notifications from './pages/Notifications';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    let role = getRole();
    let userId = getUserId();
    if (!role || !userId) {
        const user = setDemoUser('USER');
        role = user.role;
        userId = user.id;
    }
    if (adminOnly && !isAdmin()) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="book/:resourceId?" element={<CreateBooking />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="admin" element={<ProtectedRoute adminOnly><AdminOps /></ProtectedRoute>} />
          <Route path="admin/pending-bookings" element={<ProtectedRoute adminOnly><PendingBookings /></ProtectedRoute>} />
          <Route path="admin-resources" element={<ProtectedRoute adminOnly><AdminResourceOps /></ProtectedRoute>} />
          <Route path="tickets" element={<TicketList />} />
          <Route path="report-issue" element={<CreateTicket />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
