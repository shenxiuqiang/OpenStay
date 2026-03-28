import { Link, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const location = useLocation();

  const mainNavItems = [
    { path: '/', label: '概览', icon: '🏠' },
    { path: '/rooms', label: '房型', icon: '🛏️' },
    { path: '/bookings', label: '订单', icon: '📋' },
    { path: '/nft', label: 'NFT', icon: '🎫' },
  ];

  const isSettingsActive = location.pathname.startsWith('/settings');

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">OpenStay</h1>
          <p className="tagline">Property Studio</p>
        </div>
        
        <nav className="sidebar-nav">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          
          <div className="nav-group">
            <Link
              to="/settings"
              className={`nav-item ${isSettingsActive ? 'active' : ''}`}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">设置</span>
            </Link>
            
            {isSettingsActive && (
              <div className="nav-sub-items">
                <Link
                  to="/settings"
                  className={`nav-sub-item ${location.pathname === '/settings' ? 'active' : ''}`}
                >
                  基本信息
                </Link>
                <Link
                  to="/settings/map"
                  className={`nav-sub-item ${location.pathname === '/settings/map' ? 'active' : ''}`}
                >
                  🗺️ 地图设置
                </Link>
              </div>
            )}
          </div>
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
