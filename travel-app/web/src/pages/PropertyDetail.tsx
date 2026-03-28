import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PropertyDetail.css';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  beds: string;
  amenities: string[];
}

interface PropertyDetail {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  type: string;
  host: {
    name: string;
    avatar: string;
  };
  rooms: Room[];
  rules: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/search/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProperty(data.data);
          setSelectedRoom(data.data.rooms[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch property:', err);
        setLoading(false);
      });
  }, [id]);

  const handleBooking = async () => {
    if (!selectedRoom || !checkIn || !checkOut) {
      alert('请选择日期和房间');
      return;
    }

    setBookingLoading(true);

    try {
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = selectedRoom.price * nights;

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property?.id,
          propertyName: property?.name,
          propertyImage: property?.images[0],
          roomId: selectedRoom.id,
          roomName: selectedRoom.name,
          checkIn,
          checkOut,
          guests,
          totalPrice,
          contactInfo: {
            name: '测试用户',
            phone: '138****8888',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('预订成功！');
        navigate('/bookings');
      } else {
        alert(data.error?.message || '预订失败');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('预订失败，请重试');
    } finally {
      setBookingLoading(false);
    }
  };

  const getAmenityLabel = (amenity: string) => {
    const labels: Record<string, string> = {
      wifi: 'WiFi', parking: '停车', kitchen: '厨房', ac: '空调',
      pool: '泳池', beach: '海滩', breakfast: '早餐', gym: '健身',
      washer: '洗衣', view: '景观', tea: '茶室', garden: '花园',
      '独立卫浴': '独立卫浴', '电视': '电视',
    };
    return labels[amenity] || amenity;
  };

  if (loading) {
    return (
      <div className="container detail-loading">
        加载中...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container detail-error">
        <h2>房源不存在</h2>
        <button onClick={() => navigate('/search')} className="btn-primary">
          返回搜索
        </button>
      </div>
    );
  }

  const nights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  return (
    <div className="property-detail">
      <div className="container">
        {/* Header */}
        <div className="detail-header">
          <h1>{property.name}</h1>
          <div className="detail-meta">
            <span className="detail-location">📍 {property.location}</span>
            <span className="detail-rating">
              ⭐ {property.rating} · {property.reviews} 条评价
            </span>
          </div>
        </div>

        {/* Images */}
        <div className="detail-images">
          <div className="main-image">
            <img src={property.images[activeImage]} alt={property.name} />
          </div>
          <div className="image-thumbnails">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img} alt={`${property.name} ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-content">
          {/* Left Column */}
          <div className="detail-left">
            <section className="detail-section">
              <h2>房源介绍</h2>
              <p>{property.description}</p>
            </section>

            <section className="detail-section">
              <h2>设施服务</h2>
              <div className="amenities-list">
                {property.amenities.map(amenity => (
                  <span key={amenity} className="amenity-item">
                    {getAmenityLabel(amenity)}
                  </span>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2>选择房间</h2>
              <div className="rooms-list">
                {property.rooms.map(room => (
                  <div
                    key={room.id}
                    className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="room-info">
                      <h3>{room.name}</h3>
                      <p>{room.description}</p>
                      <p className="room-capacity">👥 可住 {room.capacity} 人 · {room.beds}</p>
                      <div className="room-amenities">
                        {room.amenities.map(a => (
                          <span key={a} className="room-amenity">{getAmenityLabel(a)}</span>
                        ))}
                      </div>
                    </div>
                    <div className="room-price">
                      <span className="price">¥{room.price}</span>
                      <span className="unit">/晚</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2>入住须知</h2>
              <ul className="rules-list">
                {property.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </section>

            <section className="detail-section">
              <h2>房东</h2>
              <div className="host-card">
                <img src={property.host.avatar} alt={property.host.name} className="host-avatar-lg" />
                <div className="host-info">
                  <h3>{property.host.name}</h3>
                  <p>实名认证 · 超赞房东</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="detail-right">
            <div className="booking-card">
              <div className="booking-price">
                <span className="price">¥{selectedRoom?.price || property.price}</span>
                <span className="unit">/晚</span>
              </div>

              <div className="booking-form">
                <div className="date-inputs">
                  <div className="date-field">
                    <label>入住日期</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="date-field">
                    <label>退房日期</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="guests-field">
                  <label>入住人数</label>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} 人</option>
                    ))}
                  </select>
                </div>

                {nights > 0 && selectedRoom && (
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>¥{selectedRoom.price} × {nights} 晚</span>
                      <span>¥{totalPrice}</span>
                    </div>
                    <div className="price-row total">
                      <span>总计</span>
                      <span>¥{totalPrice}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn-book"
                  onClick={handleBooking}
                  disabled={bookingLoading || !checkIn || !checkOut || !selectedRoom}
                >
                  {bookingLoading ? '预订中...' : '立即预订'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPage;
