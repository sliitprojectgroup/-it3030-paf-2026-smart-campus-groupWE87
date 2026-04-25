import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getRole, isAdmin } from './utils/auth';
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

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const role = getRole();
    if (!role) {
        return <Navigate to="/login" replace />;
    }
    if (adminOnly && !isAdmin()) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="book/:resourceId?" element={<CreateBooking />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="admin" element={<ProtectedRoute adminOnly><AdminOps /></ProtectedRoute>} />
          <Route path="admin-resources" element={<ProtectedRoute adminOnly><AdminResourceOps /></ProtectedRoute>} />
          <Route path="tickets" element={<TicketList />} />
          <Route path="report-issue" element={<CreateTicket />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
