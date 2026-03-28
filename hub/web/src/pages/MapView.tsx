import { useState, useEffect, useCallback } from 'react';
import { UniversalMap, MapMarker, MapConfig, DEFAULT_MAP_CONFIG } from '@openstay/theme';
import './MapView.css';

interface Property {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  price: number;
  city: string;
  type: string;
  status: 'active' | 'pending' | 'inactive';
  image?: string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

function MapView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapConfig, setMapConfig] = useState<MapConfig>(DEFAULT_MAP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'pending'>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    cities: 0,
  });

  useEffect(() => {
    fetchMapConfig();
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, viewMode]);

  const fetchMapConfig = async () => {
    try {
      const res = await fetch('/api/hub/map-config');
      const data = await res.json();
      if (data.success && data.data) {
        setMapConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch map config:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties/all/coords');
      const data = await res.json();
      if (data.success) {
        setProperties(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (props: Property[]) => {
    const cities = new Set(props.map(p => p.city)).size;
    setStats({
      total: props.length,
      active: props.filter(p => p.status === 'active').length,
      pending: props.filter(p => p.status === 'pending').length,
      cities,
    });
  };

  const filterProperties = () => {
    let filtered = properties;
    if (viewMode !== 'all') {
      filtered = properties.filter(p => p.status === viewMode);
    }
    setFilteredProperties(filtered);
  };

  const handleMapMove = useCallback((center: { lat: number; lng: number }, bounds: MapBounds) => {
    // 可以在这里实现视口内的房源筛选
    const visible = properties.filter(p => 
      p.latitude >= bounds.south &&
      p.latitude <= bounds.north &&
      p.longitude >= bounds.west &&
      p.longitude <= bounds.east
    );
    // 可以更新 UI 显示当前视口内的房源数量
  }, [properties]);

  const mapMarkers: MapMarker[] = filteredProperties.map(p => ({
    id: p.id,
    lat: p.latitude,
    lng: p.longitude,
    title: p.name,
    price: p.price,
    image: p.image,
    onClick: () => setSelectedProperty(p),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="hub-map-view">
      <header className="map-view-header">
        <div className="header-title">
          <h1>🗺️ 房源地图</h1>
          <p>可视化查看平台所有房源分布</p>
        </div>
        
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">总房源</span>
          </div>
          <div className="stat-item active">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">已上线</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">审核中</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.cities}</span>
            <span className="stat-label">覆盖城市</span>
          </div>
        </div>
      </header>

      <div className="map-controls">
        <div className="filter-tabs">
          <button 
            className={viewMode === 'all' ? 'active' : ''}
            onClick={() => setViewMode('all')}
          >
            全部房源
          </button>
          <button 
            className={viewMode === 'active' ? 'active' : ''}
            onClick={() => setViewMode('active')}
          >
            已上线
          </button>
          <button 
            className={viewMode === 'pending' ? 'active' : ''}
            onClick={() => setViewMode('pending')}
          >
            审核中
          </button>
        </div>

        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#10b981' }}></span>
            已上线
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
            审核中
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#6b7280' }}></span>
            未上线
          </span>
        </div>
      </div>

      <div className="map-container-wrapper">
        <UniversalMap
          config={mapConfig}
          markers={mapMarkers}
          height="600px"
          onMarkerClick={(marker) => {
            const property = properties.find(p => p.id === marker.id);
            if (property) setSelectedProperty(property);
          }}
          onMapMove={handleMapMove}
          showCurrentLocation
          clustering
        />

        {selectedProperty && (
          <div className="property-popup-overlay" onClick={() => setSelectedProperty(null)}>
            <div className="property-popup" onClick={e => e.stopPropagation()}>
              <button className="popup-close" onClick={() => setSelectedProperty(null)}>×</button>
              
              <div className="popup-header">
                <h3>{selectedProperty.name}</h3>
                <span 
                  className="status-badge"
                  style={{ background: getStatusColor(selectedProperty.status) }}
                >
                  {selectedProperty.status === 'active' ? '已上线' : 
                   selectedProperty.status === 'pending' ? '审核中' : '未上线'}
                </span>
              </div>

              <div className="popup-body">
                <p className="popup-location">📍 {selectedProperty.city}</p>
                <p className="popup-type">🏠 {selectedProperty.type}</p>
                <p className="popup-price">
                  <span className="price-value">¥{selectedProperty.price}</span>
                  <span className="price-unit">/晚</span>
                </p>
                <p className="popup-coords">
                  坐标: {selectedProperty.latitude.toFixed(4)}, {selectedProperty.longitude.toFixed(4)}
                </p>
              </div>

              <div className="popup-actions">
                <a 
                  href={`/properties/${selectedProperty.id}`}
                  className="btn btn-primary"
                >
                  查看详情
                </a>
                <a 
                  href={`https://maps.google.com/?q=${selectedProperty.latitude},${selectedProperty.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  在地图中打开
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="property-list-section">
        <h3>📋 当前显示房源列表 ({filteredProperties.length})</h3>
        <div className="property-table">
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>城市</th>
                <th>类型</th>
                <th>价格</th>
                <th>状态</th>
                <th>坐标</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.slice(0, 10).map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.city}</td>
                  <td>{p.type}</td>
                  <td>¥{p.price}</td>
                  <td>
                    <span 
                      className="table-status"
                      style={{ 
                        background: `${getStatusColor(p.status)}20`,
                        color: getStatusColor(p.status)
                      }}
                    >
                      {p.status === 'active' ? '已上线' : 
                       p.status === 'pending' ? '审核中' : '未上线'}
                    </span>
                  </td>
                  <td className="coords-cell">
                    {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                  </td>
                  <td>
                    <button 
                      className="btn-link"
                      onClick={() => setSelectedProperty(p)}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProperties.length > 10 && (
            <p className="more-hint">还有 {filteredProperties.length - 10} 个房源...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapView;
