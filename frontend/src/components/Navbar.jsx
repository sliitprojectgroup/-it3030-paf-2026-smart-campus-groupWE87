import { Bell, User } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  return (
    <div className="topbar glass-header">
      <h1>{title}</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', 
            background: 'var(--danger)', borderRadius: '50%' 
          }}></span>
        </div>
        
        <div className="user-profile">
          <div className="avatar">
            <User size={18} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>User #1</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
