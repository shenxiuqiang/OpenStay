import { useEffect, useState } from 'react';
import './Properties.css';

interface Property {
  id: string;
  propertyId: string;
  name: string;
  city: string | null;
  country: string | null;
  minPrice: number;
  maxPrice: number;
  currency: string;
  tier: string;
  isFeatured: boolean;
  viewCount: number;
}

function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      if (data.success) {
        setProperties(data.data?.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...⏳</div>;
  }

  return (
    <div className="properties">
      <header className="page-header">
        <h1>入驻旅店</h1>
        <button className="btn btn-primary">同步全部</button>
      </header>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏨</div>
          <h3>暂无入驻旅店</h3>
          <p>审核入驻申请后，旅店将出现在这里</p>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-image-placeholder">
                {property.isFeatured && <span className="featured-badge">推荐</span>}
              </div>
              <div className="property-info">
                <h3 className="property-name">{property.name}</h3>
                <p className="property-location">
                  {property.city || '未知城市'}
                  {property.country && `, ${property.country}`}
                </p>
                <div className="property-meta">
                  <span className={`tier-badge tier-${property.tier}`}>
                    {property.tier}
                  </span>
                  <span className="view-count">👁️ {property.viewCount}</span>
                </div>
                <div className="property-price">
                  ¥{property.minPrice} - ¥{property.maxPrice}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Properties;
