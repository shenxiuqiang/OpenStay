import { Link, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '概览', icon: '🏠' },
    { path: '/rooms', label: '房型', icon: '🛏️' },
    { path: '/bookings', label: '订单', icon: '📋' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">OpenStay</h1>
          <p className="tagline">Property Studio</p>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <p>© 2026 OpenStay</p>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
