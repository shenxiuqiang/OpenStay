import { useEffect, useState } from 'react';
import './Home.css';

interface Stats {
  propertyCount: number;
  pendingRequests: number;
  totalViews: number;
  totalBookings: number;
}

function Home() {
  const [stats, setStats] = useState<Stats>({
    propertyCount: 0,
    pendingRequests: 0,
    totalViews: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch hub stats
      const hubRes = await fetch('/api/hub/stats');
      const hubData = await hubRes.json();
      
      // Fetch join requests
      const requestsRes = await fetch('/api/join-requests?status=pending');
      const requestsData = await requestsRes.json();

      setStats({
        propertyCount: hubData.data?.propertyCount || 0,
        pendingRequests: requestsData.data?.length || 0,
        totalViews: 0,
        totalBookings: hubData.data?.totalBookings || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...⏳</div>;
  }

  return (
    <div className="home">
      <header className="page-header">
        <h1>Hub 概览</h1>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.propertyCount}</div>
          <div className="stat-label">入驻旅店</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingRequests}</div>
          <div className="stat-label">待审核申请</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalViews}</div>
          <div className="stat-label">总浏览量</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">总订单</div>
        </div>
      </section>

      <section className="quick-actions">
        <h2>快速操作</h2>
        <div className="action-buttons">
          <a href="/properties" className="action-card">
            <span className="action-icon">🏨</span>
            <span className="action-title">管理房源</span>
            <span className="action-desc">查看所有入驻旅店</span>
          </a>
          <a href="/join-requests" className="action-card">
            <span className="action-icon">📋</span>
            <span className="action-title">审核申请</span>
            <span className="action-desc">处理入驻申请</span>
          </a>
          <a href="/settings" className="action-card">
            <span className="action-icon">⚙️</span>
            <span className="action-title">Hub 设置</span>
            <span className="action-desc">配置定价与规则</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default Home;
