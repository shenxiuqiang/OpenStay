import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  preferences: {
    currency: string;
    language: string;
  };
}

interface Favorite {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  savedAt: string;
}

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites'>('profile');

  useEffect(() => {
    Promise.all([
      fetch('/api/user/me').then(r => r.json()),
      fetch('/api/user/favorites').then(r => r.json()),
    ])
      .then(([userData, favData]) => {
        if (userData.success) setUser(userData.data);
        if (favData.success) setFavorites(favData.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, []);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/user/favorites/${propertyId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        setFavorites(prev => prev.filter(f => f.id !== propertyId));
      }
    } catch (err) {
      console.error('Remove favorite error:', err);
    }
  };

  if (loading) {
    return (
      <div className="container profile-loading">
        加载中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container profile-error">
        <h2>无法加载用户信息</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <img src={user.avatar} alt={user.name} className="profile-avatar" />
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-meta">
              会员自 {new Date(user.memberSince).getFullYear()} 年 · {user.email}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            个人资料
          </button>
          <button
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            我的收藏
            {favorites.length > 0 && (
              <span className="tab-badge">{favorites.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'profile' ? (
          <div className="profile-content">
            <section className="profile-section">
              <h2>基本信息</h2>
              
              <div className="info-list">
                <div className="info-item">
                  <label>昵称</label>
                  <div className="info-value">{user.name}</div>
                </div>
                
                <div className="info-item">
                  <label>邮箱</label>
                  <div className="info-value">{user.email}</div>
                </div>
                
                <div className="info-item">
                  <label>手机号</label>
                  <div className="info-value">{user.phone}</div>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>偏好设置</h2>
              
              <div className="info-list">
                <div className="info-item">
                  <label>货币</label>
                  <div className="info-value">{user.preferences.currency}</div>
                </div>
                
                <div className="info-item">
                  <label>语言</label>
                  <div className="info-value">{user.preferences.language}</div>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>账户安全</h2>
              
              <div className="security-list">
                <div className="security-item">
                  <div className="security-info">
                    <h3>登录密码</h3>
                    <p>建议定期更换密码以保护账户安全</p>
                  </div>
                  <button className="btn-secondary">修改</button>
                </div>
                
                <div className="security-item">
                  <div className="security-info">
                    <h3>手机验证</h3>
                    <p className="verified">✓ 已验证</p>
                  </div>
                  <button className="btn-secondary">更换</button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="favorites-content">
            {favorites.length === 0 ? (
              <div className="favorites-empty">
                <div className="empty-icon">💝</div>
                <h3>还没有收藏的房源</h3>
                <p>看到喜欢的房源，点击爱心图标收藏</p>
                <Link to="/search" className="btn-explore">
                  去探索
                </Link>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map((fav) => (
                  <div key={fav.id} className="favorite-card">
                    <Link to={`/property/${fav.id}`} className="favorite-image">
                      <img src={fav.image} alt={fav.name} />
                    </Link>
                    
                    <div className="favorite-info">
                      <Link to={`/property/${fav.id}`} className="favorite-name">
                        {fav.name}
                      </Link>
                      
                      <p className="favorite-location">{fav.location}</p>
                      
                      <div className="favorite-footer">
                        <span className="favorite-price">
                          ¥{fav.price}/晚
                        </span>
                        
                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveFavorite(fav.id)}
                          title="取消收藏"
                        >
                          💔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
