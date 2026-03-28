import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapConfig, getMapScriptUrl, MAP_PROVIDERS } from '../../utils/map-config.js';
import './UniversalMap.css';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  price?: number;
  image?: string;
  onClick?: () => void;
}

interface UniversalMapProps {
  config: MapConfig;
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onMapMove?: (center: { lat: number; lng: number }, bounds: MapBounds) => void;
  selectedMarkerId?: string | null;
  showCurrentLocation?: boolean;
  clustering?: boolean;
  children?: React.ReactNode;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

declare global {
  interface Window {
    google?: typeof google;
    AMap?: typeof AMap;
    BMap?: typeof BMap;
    initMap?: () => void;
  }
}

export const UniversalMap: React.FC<UniversalMapProps> = ({
  config,
  markers = [],
  center,
  zoom = 12,
  height = '400px',
  onMarkerClick,
  onMapClick,
  onMapMove,
  selectedMarkerId,
  showCurrentLocation = false,
  clustering = false,
  children,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapCenter = center || config.defaultCenter;
  const mapZoom = zoom || config.defaultZoom;

  // 加载地图脚本
  useEffect(() => {
    if (!config.apiKey) {
      setError('请配置地图 API Key');
      return;
    }

    const scriptUrl = getMapScriptUrl(config.provider, config.apiKey);
    if (!scriptUrl) {
      setError('不支持的地图提供商');
      return;
    }

    // 检查脚本是否已加载
    const existingScript = document.querySelector(`script[src*="${config.provider}"]`);
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;

    if (config.provider === 'google') {
      script.onload = () => setIsLoaded(true);
    } else {
      window.initMap = () => setIsLoaded(true);
    }

    script.onerror = () => setError('地图加载失败，请检查 API Key');
    document.head.appendChild(script);

    return () => {
      // 清理工作
    };
  }, [config.provider, config.apiKey]);

  // 初始化地图
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      switch (config.provider) {
        case 'google':
          initGoogleMap();
          break;
        case 'amap':
          initAMap();
          break;
        case 'baidu':
          initBaiduMap();
          break;
      }
    } catch (err) {
      setError('地图初始化失败');
      console.error(err);
    }
  }, [isLoaded, config.provider]);

  // Google Maps 初始化
  const initGoogleMap = () => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // 监听地图移动
    if (onMapMove) {
      map.addListener('idle', () => {
        const center = map.getCenter();
        const bounds = map.getBounds();
        if (center && bounds) {
          onMapMove(
            { lat: center.lat(), lng: center.lng() },
            {
              north: bounds.getNorthEast().lat(),
              south: bounds.getSouthWest().lat(),
              east: bounds.getNorthEast().lng(),
              west: bounds.getSouthWest().lng(),
            }
          );
        }
      });
    }

    // 监听地图点击
    if (onMapClick) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      });
    }
  };

  // 高德地图初始化
  const initAMap = () => {
    if (!window.AMap || !mapRef.current) return;

    const map = new window.AMap.Map(mapRef.current, {
      center: [mapCenter.lng, mapCenter.lat],
      zoom: mapZoom,
      viewMode: '2D',
    });

    mapInstanceRef.current = map;

    if (onMapMove) {
      map.on('moveend', () => {
        const center = map.getCenter();
        const bounds = map.getBounds();
        onMapMove(
          { lat: center.getLat(), lng: center.getLng() },
          {
            north: bounds.getNorthEast().getLat(),
            south: bounds.getSouthWest().getLat(),
            east: bounds.getNorthEast().getLng(),
            west: bounds.getSouthWest().getLng(),
          }
        );
      });
    }

    if (onMapClick) {
      map.on('click', (e: any) => {
        onMapClick(e.lnglat.getLat(), e.lnglat.getLng());
      });
    }
  };

  // 百度地图初始化
  const initBaiduMap = () => {
    if (!window.BMap || !mapRef.current) return;

    const map = new window.BMap.Map(mapRef.current);
    const point = new window.BMap.Point(mapCenter.lng, mapCenter.lat);
    map.centerAndZoom(point, mapZoom);
    map.enableScrollWheelZoom();

    mapInstanceRef.current = map;

    if (onMapMove) {
      map.addEventListener('moveend', () => {
        const center = map.getCenter();
        const bounds = map.getBounds();
        onMapMove(
          { lat: center.lat, lng: center.lng },
          {
            north: bounds.getNorthEast().lat,
            south: bounds.getSouthWest().lat,
            east: bounds.getNorthEast().lng,
            west: bounds.getSouthWest().lng,
          }
        );
      });
    }

    if (onMapClick) {
      map.addEventListener('click', (e: any) => {
        onMapClick(e.point.lat, e.point.lng);
      });
    }
  };

  // 更新标记
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // 清除旧标记
    clearMarkers();

    // 添加新标记
    markers.forEach((marker) => {
      addMarker(marker);
    });
  }, [markers, isLoaded, selectedMarkerId]);

  // 更新中心点
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    switch (config.provider) {
      case 'google':
        mapInstanceRef.current.setCenter(mapCenter);
        break;
      case 'amap':
        mapInstanceRef.current.setCenter([mapCenter.lng, mapCenter.lat]);
        break;
      case 'baidu':
        const point = new window.BMap.Point(mapCenter.lng, mapCenter.lat);
        mapInstanceRef.current.setCenter(point);
        break;
    }
  }, [mapCenter, config.provider]);

  // 清除标记
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      if (config.provider === 'google') {
        marker.setMap(null);
      } else if (config.provider === 'amap') {
        marker.setMap(null);
      } else if (config.provider === 'baidu') {
        mapInstanceRef.current.removeOverlay(marker);
      }
    });
    markersRef.current = [];
  };

  // 添加标记
  const addMarker = (marker: MapMarker) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let mapMarker: any;

    switch (config.provider) {
      case 'google':
        mapMarker = new window.google!.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map,
          title: marker.title,
          animation: marker.id === selectedMarkerId 
            ? window.google!.maps.Animation.BOUNCE 
            : undefined,
        });

        if (marker.price) {
          // 添加价格标签
          const label = new window.google!.maps.OverlayView();
          label.setMap(map);
        }

        mapMarker.addListener('click', () => {
          onMarkerClick?.(marker);
          marker.onClick?.();
        });
        break;

      case 'amap':
        mapMarker = new window.AMap!.Marker({
          position: [marker.lng, marker.lat],
          title: marker.title,
          label: marker.price ? {
            content: `¥${marker.price}`,
            offset: new window.AMap!.Pixel(0, -30),
          } : undefined,
        });

        mapMarker.on('click', () => {
          onMarkerClick?.(marker);
          marker.onClick?.();
        });

        map.add(mapMarker);
        break;

      case 'baidu':
        const point = new window.BMap!.Point(marker.lng, marker.lat);
        mapMarker = new window.BMap!.Marker(point);
        map.addOverlay(mapMarker);

        mapMarker.addEventListener('click', () => {
          onMarkerClick?.(marker);
          marker.onClick?.();
        });
        break;
    }

    markersRef.current.push(mapMarker);
  };

  if (error) {
    return (
      <div className="map-error" style={{ height }}>
        <div className="map-error-content">
          <span className="map-error-icon">⚠️</span>
          <p>{error}</p>
          <a 
            href={MAP_PROVIDERS.find(p => p.id === config.provider)?.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="map-error-link"
          >
            获取 API Key →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="universal-map" style={{ height }}>
      {!isLoaded && (
        <div className="map-loading">
          <div className="map-loading-spinner"></div>
          <p>正在加载地图...</p>
        </div>
      )}
      <div ref={mapRef} className="map-container" />
      {children}
      
      {showCurrentLocation && isLoaded && (
        <button
          className="map-locate-btn"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                switch (config.provider) {
                  case 'google':
                    mapInstanceRef.current?.setCenter({ lat: latitude, lng: longitude });
                    break;
                  case 'amap':
                    mapInstanceRef.current?.setCenter([longitude, latitude]);
                    break;
                  case 'baidu':
                    const point = new window.BMap.Point(longitude, latitude);
                    mapInstanceRef.current?.setCenter(point);
                    break;
                }
              });
            }
          }}
        >
          📍
        </button>
      )}
    </div>
  );
};

export default UniversalMap;
