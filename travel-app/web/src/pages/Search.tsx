import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapView } from '../components/MapView';
import './Search.css';

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  type: string;
  distance?: number;
  distanceFormatted?: string | null;
  host: {
    name: string;
    avatar: string;
  };
}

type ViewMode = 'list' | 'map';
type SortBy = 'recommended' | 'price_asc' | 'price_desc' | 'distance' | 'rating';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('recommended');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  const location = searchParams.get('location') || '';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const type = searchParams.get('type') || '';

  // 搜索房源
  useEffect(() => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (lat) params.set('lat', lat);
    if (lng) params.set('lng', lng);
    params.set('radius', radius);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (type) params.set('type', type);
    params.set('sortBy', sortBy);
    
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
  }, [location, lat, lng, radius, minPrice, maxPrice, type, sortBy]);

  // 获取用户位置
  const getUserLocation = useCallback(() => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理定位');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // 更新 URL 参数
        const newParams = new URLSearchParams(searchParams);
        newParams.set('lat', latitude.toString());
        newParams.set('lng', longitude.toString());
        newParams.delete('location'); // 清除位置文本，使用坐标
        setSearchParams(newParams);
      },
      (error) => {
        let errorMsg = '无法获取您的位置';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '请允许访问您的位置信息';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMsg = '获取位置超时';
            break;
        }
        setLocationError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [searchParams, setSearchParams]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // 清除坐标，使用文本搜索
    if (key === 'location' && value) {
      newParams.delete('lat');
      newParams.delete('lng');
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

  const getSortLabel = (sort: SortBy) => {
    const labels: Record<SortBy, string> = {
      recommended: '推荐排序',
      price_asc: '价格从低到高',
      price_desc: '价格从高到低',
      distance: '距离最近',
      rating: '评分最高',
    };
    return labels[sort];
  };

  // 地图中心点
  const mapCenter: [number, number] = lat && lng 
    ? [parseFloat(lat), parseFloat(lng)]
    : userLocation 
      ? [userLocation.lat, userLocation.lng]
      : [30.2741, 120.1551]; // 默认杭州

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="container">
          <div className="search-filters">
            <div className="filter-group">
              <input
                type="text"
                className="filter-input"
                placeholder="搜索目的地"
                value={location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>
            
            <button
              className="location-btn"
              onClick={getUserLocation}
              title="使用我的位置"
            >
              📍 附近
            </button>
            
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

            {(lat && lng) && (
              <select
                className="filter-select"
                value={radius}
                onChange={(e) => updateFilter('radius', e.target.value)}
              >
                <option value="1000">1公里内</option>
                <option value="3000">3公里内</option>
                <option value="5000">5公里内</option>
                <option value="10000">10公里内</option>
                <option value="20000">20公里内</option>
              </select>
            )}
          </div>
          
          {locationError && (
            <div className="location-error">{locationError}</div>
          )}
          
          <div className="search-toolbar">
            <p className="search-results-count">
              找到 <strong>{total}</strong> 套房源
              {lat && lng && (
                <span className="search-mode"> · 附近搜索</span>
              )}
            </p>
            
            <div className="search-controls">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="recommended">{getSortLabel('recommended')}</option>
                <option value="price_asc">{getSortLabel('price_asc')}</option>
                <option value="price_desc">{getSortLabel('price_desc')}</option>
                {(lat && lng) && (
                  <option value="distance">{getSortLabel('distance')}</option>
                )}
                <option value="rating">{getSortLabel('rating')}</option>
              </select>
              
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  📋 列表
                </button>
                <button
                  className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                >
                  🗺️ 地图
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container search-content">
        {loading ? (
          <div className="search-loading">搜索中...</div>
        ) : properties.length === 0 ? (
          <div className="search-empty">
            <div className="empty-icon">🔍</div>
            <h3>没有找到符合条件的房源</h3>
            <p>试试调整搜索条件或扩大搜索范围</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="properties-grid">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className={`property-card ${selectedPropertyId === property.id ? 'highlighted' : ''}`}
                onMouseEnter={() => setSelectedPropertyId(property.id)}
                onMouseLeave={() => setSelectedPropertyId(null)}
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
                    <p className="property-location">
                      {property.location}
                      {property.distanceFormatted && (
                        <span className="distance-badge">
                          · {property.distanceFormatted}
                        </span>
                      )}
                    </p>
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
        ) : (
          <div className="map-view-container">
            <MapView
              properties={properties.map(p => ({
                id: p.id,
                name: p.name,
                address: p.address || p.location,
                latitude: p.latitude,
                longitude: p.longitude,
                basePrice: p.price,
                coverImageUrl: p.images[0],
              }))}
              center={mapCenter}
              zoom={lat && lng ? 14 : 12}
              selectedPropertyId={selectedPropertyId}
              onPropertyClick={(property) => {
                window.location.href = `/property/${property.id}`;
              }}
              onMapMove={(center) => {
                // 可以在这里实现边界搜索
                console.log('Map moved to:', center);
              }}
              height="600px"
            />
            <div className="map-property-list">
              {properties.slice(0, 5).map((property) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                  className="map-property-item"
                  onMouseEnter={() => setSelectedPropertyId(property.id)}
                  onMouseLeave={() => setSelectedPropertyId(null)}
                >
                  <img src={property.images[0]} alt={property.name} />
                  <div className="map-property-info">
                    <h4>{property.name}</h4>
                    <p>
                      {property.location}
                      {property.distanceFormatted && (
                        <span className="distance"> · {property.distanceFormatted}</span>
                      )}
                    </p>
                    <span className="price">¥{property.price}/晚</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
