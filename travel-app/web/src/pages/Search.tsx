import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Search.css';

interface Property {
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
}

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const location = searchParams.get('location') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const type = searchParams.get('type') || '';

  useEffect(() => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (type) params.set('type', type);
    
    fetch(`/api/search/properties?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProperties(data.data.properties);
          setTotal(data.data.total);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to search:', err);
        setLoading(false);
      });
  }, [location, minPrice, maxPrice, type]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const getAmenityLabel = (amenity: string) => {
    const labels: Record<string, string> = {
      wifi: 'WiFi',
      parking: '停车',
      kitchen: '厨房',
      ac: '空调',
      pool: '泳池',
      beach: '海滩',
      breakfast: '早餐',
      gym: '健身',
      washer: '洗衣',
      view: '景观',
      tea: '茶室',
      garden: '花园',
    };
    return labels[amenity] || amenity;
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="container">
          <div className="search-filters">
            <div className="filter-group">
              <input
                type="text"
                className="filter-input"
                placeholder="目的地"
                value={location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>
            
            <div className="filter-group price-filter">
              <input
                type="number"
                className="filter-input"
                placeholder="最低价格"
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                className="filter-input"
                placeholder="最高价格"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>
            
            <select
              className="filter-select"
              value={type}
              onChange={(e) => updateFilter('type', e.target.value)}
            >
              <option value="">全部类型</option>
              <option value="cabin">小屋</option>
              <option value="villa">别墅</option>
              <option value="apartment">公寓</option>
              <option value="inn">客栈</option>
            </select>
          </div>
          
          <p className="search-results-count">
            找到 {total} 套房源
          </p>
        </div>
      </div>

      <div className="container search-content">
        {loading ? (
          <div className="search-loading">搜索中...</div>
        ) : properties.length === 0 ? (
          <div className="search-empty">
            <div className="empty-icon">🔍</div>
            <h3>没有找到符合条件的房源</h3>
            <p>试试调整搜索条件</p>
          </div>
        ) : (
          <div className="properties-grid">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="property-card"
              >
                <div className="property-image-wrapper">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="property-image"
                    loading="lazy"
                  />
                  <button 
                    className="favorite-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: toggle favorite
                    }}
                  >
                    🤍
                  </button>
                </div>
                
                <div className="property-info">
                  <div className="property-header">
                    <p className="property-location">{property.location}</p>
                    <div className="property-rating">
                      <span>⭐ {property.rating}</span>
                      <span className="review-count">({property.reviews})</span>
                    </div>
                  </div>
                  
                  <h3 className="property-name">{property.name}</h3>
                  
                  <p className="property-desc">{property.description}</p>
                  
                  <div className="property-amenities">
                    {property.amenities.slice(0, 4).map((amenity) => (
                      <span key={amenity} className="amenity-tag">
                        {getAmenityLabel(amenity)}
                      </span>
                    ))}
                  </div>
                  
                  <div className="property-footer">
                    <div className="property-host">
                      <img 
                        src={property.host.avatar} 
                        alt={property.host.name}
                        className="host-avatar"
                      />
                      <span>{property.host.name}</span>
                    </div>
                    
                    <div className="property-price">
                      <span className="price-value">¥{property.price}</span>
                      <span className="price-unit">/晚</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
