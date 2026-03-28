import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

interface Destination {
  name: string;
  count: number;
  image: string;
}

function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/search/destinations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDestinations(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch destinations:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?location=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            发现独特的住宿体验
          </h1>
          <p className="hero-subtitle">
            从山间小屋到海滨别墅，探索全球独特的住宿选择
          </p>
          
          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="想去哪里？"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="search-button">
              搜索
            </button>
          </form>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="destinations-section">
        <div className="container">
          <h2 className="section-title">热门目的地</h2>
          
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="destinations-grid">
              {destinations.map((dest) => (
                <Link
                  key={dest.name}
                  to={`/search?location=${encodeURIComponent(dest.name)}`}
                  className="destination-card"
                >
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="destination-image"
                    loading="lazy"
                  />
                  <div className="destination-overlay">
                    <h3 className="destination-name">{dest.name}</h3>
                    <p className="destination-count">{dest.count} 套房源</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">为什么选择 OpenStay</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">真实房源</h3>
              <p className="feature-desc">所有房源经过验证，图片真实，评价可信</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">无中间商</h3>
              <p className="feature-desc">直连房东，价格透明，没有隐藏费用</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3 className="feature-title">安全支付</h3>
              <p className="feature-desc">支持多种支付方式，资金托管保障安全</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">去中心化</h3>
              <p className="feature-desc">基于区块链技术，数据自主可控</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
