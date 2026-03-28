import { Link, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const location = useLocation();

  const mainNavItems = [
    { path: '/', label: '概览', icon: '📊' },
    { path: '/join-requests', label: '入驻申请', icon: '📋' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  const isPropertiesActive = location.pathname.startsWith('/properties');

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">OpenStay</h1>
          <p className="tagline">Hospitality Hub</p>
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
              to="/properties"
              className={`nav-item ${isPropertiesActive ? 'active' : ''}`}
            >
              <span className="nav-icon">🏨</span>
              <span className="nav-label">房源</span>
            </Link>
            
            {isPropertiesActive && (
              <div className="nav-sub-items">
                <Link
                  to="/properties"
                  className={`nav-sub-item ${location.pathname === '/properties' ? 'active' : ''}`}
                >
                  📋 列表视图
                </Link>
                <Link
                  to="/properties/map"
                  className={`nav-sub-item ${location.pathname === '/properties/map' ? 'active' : ''}`}
                >
                  🗺️ 地图视图
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
