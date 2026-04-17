import { NavLink } from 'react-router-dom';
import { Home, Compass, BookOpen, Calendar, Shield } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-logo">
        <Compass size={28} color="#3b82f6" />
        <span>SmartHub</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <Home size={20} />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/resources" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          Resources
        </NavLink>
        
        <NavLink 
          to="/my-bookings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Calendar size={20} />
          My Bookings
        </NavLink>

        <div style={{ margin: '1rem 0', borderBottom: '1px solid var(--border-color)' }}></div>
        
        <div style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '600' }}>
          Management
        </div>

        <NavLink 
          to="/admin" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Shield size={20} />
          Admin Panel
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
