import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">OpenStay</span>
          </Link>
          
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              首页
            </Link>
            <Link 
              to="/search" 
              className={`nav-link ${isActive('/search') ? 'active' : ''}`}
            >
              探索
            </Link>
            <Link 
              to="/bookings" 
              className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}
            >
              我的行程
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              个人中心
            </Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2024 OpenStay - 去中心化住宿预订网络</p>
          <p className="footer-links">
            <Link to="/">关于我们</Link>
            <span>·</span>
            <Link to="/">使用条款</Link>
            <span>·</span>
            <Link to="/">隐私政策</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
