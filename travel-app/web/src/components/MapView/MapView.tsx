import React, { useEffect, useRef, useCallback } from 'react';
import { calculateDistance, formatDistance, gcj02ToWgs84 } from '../../utils/geo.js';
import './MapView.css';

interface Property {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  basePrice?: number;
  coverImageUrl?: string | null;
}

interface MapViewProps {
  properties: Property[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  onPropertyClick?: (property: Property) => void;
  onMapMove?: (center: [number, number], bounds: MapBounds) => void;
  showUserLocation?: boolean;
  selectedPropertyId?: string | null;
  height?: string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

declare global {
  interface Window {
    AMap: typeof AMap;
    initAMap?: () => void;
  }
}

// 高德地图 Loader
const loadAMap = (): Promise<typeof AMap> => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap);
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY';
    script.onerror = () => reject(new Error('Failed to load AMap'));
    
    window.initAMap = () => {
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        reject(new Error('AMap not available'));
      }
    };
    
    document.head.appendChild(script);
  });
};

export const MapView: React.FC<MapViewProps> = ({
  properties,
  center = [30.2741, 120.1551], // 默认杭州
  zoom = 12,
  onPropertyClick,
  onMapMove,
  showUserLocation = true,
  selectedPropertyId,
  height = '500px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<AMap.Map | null>(null);
  const markersRef = useRef<AMap.Marker[]>([]);
  const userMarkerRef = useRef<AMap.Marker | null>(null);

  // 初始化地图
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const AMap = await loadAMap();
        if (!isMounted || !mapRef.current) return;

        const map = new AMap.Map(mapRef.current, {
          zoom,
          center,
          viewMode: '2D',
        });

        mapInstanceRef.current = map;

        // 监听地图移动
        if (onMapMove) {
          map.on('moveend', () => {
            const newCenter = map.getCenter();
            const bounds = map.getBounds();
            onMapMove(
              [newCenter.getLat(), newCenter.getLng()],
              {
                north: bounds.getNorthEast().getLat(),
                south: bounds.getSouthWest().getLat(),
                east: bounds.getNorthEast().getLng(),
                west: bounds.getSouthWest().getLng(),
              }
            );
          });
        }

        // 获取用户位置
        if (showUserLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              // WGS-84 转 GCJ-02
              const [gcjLat, gcjLng] = gcj02ToWgs84(latitude, longitude);
              
              const userMarker = new AMap.Marker({
                position: [gcjLng, gcjLat],
                title: '您的位置',
                icon: new AMap.Icon({
                  size: new AMap.Size(24, 24),
                  image: '/icons/user-location.svg',
                  imageSize: new AMap.Size(24, 24),
                }),
              });
              
              map.add(userMarker);
              userMarkerRef.current = userMarker;
              map.setCenter([gcjLng, gcjLat]);
            },
            (error) => {
              console.warn('无法获取用户位置:', error);
            }
          );
        }
      } catch (error) {
        console.error('地图加载失败:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      mapInstanceRef.current?.destroy();
    };
  }, []);

  // 更新房源标记
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 清除旧标记
    markersRef.current.forEach((marker) => map.remove(marker));
    markersRef.current = [];

    // 添加新标记
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      // WGS-84 转 GCJ-02（高德使用 GCJ-02）
      const [gcjLat, gcjLng] = gcj02ToWgs84(property.latitude, property.longitude);

      const marker = new AMap.Marker({
        position: [gcjLng, gcjLat],
        title: property.name,
        label: {
          content: `¥${property.basePrice || '-'}`,
          offset: new AMap.Pixel(0, -30),
        },
      });

      marker.on('click', () => {
        onPropertyClick?.(property);
      });

      // 高亮选中的房源
      if (selectedPropertyId === property.id) {
        marker.setAnimation('AMAP_ANIMATION_BOUNCE');
      }

      map.add(marker);
      markersRef.current.push(marker);
    });
  }, [properties, selectedPropertyId, onPropertyClick]);

  // 更新中心点
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center]);

  // 更新缩放级别
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [zoom]);

  return (
    <div className="map-view" style={{ height }}>
      <div ref={mapRef} className="map-container" />
      <div className="map-controls">
        <button
          className="map-control-btn"
          onClick={() => {
            if (navigator.geolocation && mapInstanceRef.current) {
              navigator.geolocation.getCurrentPosition((position) => {
                const [gcjLat, gcjLng] = gcj02ToWgs84(
                  position.coords.latitude,
                  position.coords.longitude
                );
                mapInstanceRef.current?.setCenter([gcjLng, gcjLat]);
                mapInstanceRef.current?.setZoom(15);
              });
            }
          }}
          title="定位到我的位置"
        >
          📍
        </button>
        <button
          className="map-control-btn"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="放大"
        >
          ➕
        </button>
        <button
          className="map-control-btn"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="缩小"
        >
          ➖
        </button>
      </div>
    </div>
  );
};

export default MapView;
