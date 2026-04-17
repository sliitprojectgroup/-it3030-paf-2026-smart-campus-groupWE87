import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import CreateBooking from './pages/CreateBooking';
import MyBookings from './pages/MyBookings';
import AdminOps from './pages/AdminOps';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="book/:resourceId?" element={<CreateBooking />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="admin" element={<AdminOps />} />
          <Route path="tickets" element={<TicketList />} />
          <Route path="report-issue" element={<CreateTicket />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
