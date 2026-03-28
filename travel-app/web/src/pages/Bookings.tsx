import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Bookings.css';

interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetch('/api/bookings/my')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookings(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch bookings:', err);
        setLoading(false);
      });
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('确定要取消这个预订吗？')) return;

    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PATCH',
      });
      const data = await res.json();
      
      if (data.success) {
        setBookings(prev => prev.map(b => 
          b.id === id ? { ...b, status: 'cancelled' } : b
        ));
      } else {
        alert(data.error?.message || '取消失败');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('取消失败，请重试');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成',
    };
    return texts[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed',
    };
    return classes[status] || '';
  };

  const now = new Date().toISOString();
  
  const upcomingBookings = bookings.filter(b => 
    b.checkOut >= now && b.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(b => 
    b.checkOut < now || b.status === 'cancelled'
  );

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="bookings-page">
      <div className="container">
        <h1 className="page-title">我的行程</h1>

        {/* Tabs */}
        <div className="bookings-tabs">
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            即将出行
            {upcomingBookings.length > 0 && (
              <span className="tab-badge">{upcomingBookings.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            历史订单
          </button>
        </div>

        {loading ? (
          <div className="bookings-loading">加载中...</div>
        ) : displayBookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="empty-icon">🎒</div>
            <h3>{activeTab === 'upcoming' ? '还没有即将到来的行程' : '暂无历史订单'}</h3>
            <p>开始探索独特的住宿体验吧</p>
            <Link to="/search" className="btn-explore">
              去探索
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {displayBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-image">
                  <img 
                    src={booking.propertyImage || 'https://picsum.photos/400/300'} 
                    alt={booking.propertyName}
                  />
                  <span className={`booking-status ${getStatusClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <div className="booking-content">
                  <div className="booking-header">
                    <Link 
                      to={`/property/${booking.propertyId}`}
                      className="booking-title"
                    >
                      {booking.propertyName}
                    </Link>
                    <span className="booking-price">
                      ¥{booking.totalPrice}
                    </span>
                  </div>

                  <p className="booking-room">{booking.roomName}</p>

                  <div className="booking-dates">
                    <div className="date-range">
                      <span className="date">{formatDate(booking.checkIn)}</span>
                      <span className="date-separator">→</span>
                      <span className="date">{formatDate(booking.checkOut)}</span>
                    </div>
                    <span className="guests">👥 {booking.guests} 人</span>
                  </div>

                  <div className="booking-actions">
                    <Link 
                      to={`/property/${booking.propertyId}`}
                      className="btn-view"
                    >
                      查看房源
                    </Link>
                    
                    {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancel(booking.id)}
                      >
                        取消预订
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
