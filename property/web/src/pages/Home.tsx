import { useEffect, useState } from 'react';
import './Home.css';

interface Property {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  status: string;
}

interface Stats {
  totalRooms: number;
  activeRooms: number;
  pendingBookings: number;
  totalBookings: number;
}

function Home() {
  const [property, setProperty] = useState<Property | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    activeRooms: 0,
    pendingBookings: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
    fetchStats();
  }, []);

  const fetchProperty = async () => {
    try {
      const res = await fetch('/api/property');
      const data = await res.json();
      if (data.success) {
        setProperty(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch rooms
      const roomsRes = await fetch('/api/rooms?propertyId=temp');
      const roomsData = await roomsRes.json();
      
      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings?propertyId=temp');
      const bookingsData = await bookingsRes.json();
      
      if (roomsData.success && bookingsData.success) {
        const rooms = roomsData.data || [];
        const bookings = bookingsData.data?.bookings || [];
        
        setStats({
          totalRooms: rooms.length,
          activeRooms: rooms.filter((r: any) => r.status === 'active').length,
          pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
          totalBookings: bookings.length,
        });
      }
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
        <h1>{property?.name || '我的旅店'}</h1>
        <p className="property-location">{property?.city || '待设置地址'}</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalRooms}</div>
          <div className="stat-label">总房型</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeRooms}</div>
          <div className="stat-label">可售房型</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingBookings}</div>
          <div className="stat-label">待确认订单</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">总订单</div>
        </div>
      </section>

      <section className="quick-actions">
        <h2>快速操作</h2>
        <div className="action-buttons">
          <a href="/rooms" className="action-card">
            <span className="action-icon">🛏️</span>
            <span className="action-title">管理房型</span>
            <span className="action-desc">添加、编辑房型信息</span>
          </a>
          <a href="/bookings" className="action-card">
            <span className="action-icon">📋</span>
            <span className="action-title">处理订单</span>
            <span className="action-desc">确认、管理预订</span>
          </a>
          <a href="/settings" className="action-card">
            <span className="action-icon">⚙️</span>
            <span className="action-title">店铺设置</span>
            <span className="action-desc">完善店铺信息</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default Home;
