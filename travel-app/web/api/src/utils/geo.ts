/**
 * 地理位置工具函数
 * 包含坐标转换、距离计算、地理围栏等功能
 */

// 地球半径（米）
const EARTH_RADIUS = 6371000;

/**
 * 计算两点之间的 Haversine 距离（米）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS * c;
}

/**
 * 格式化距离显示
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 根据中心点和半径计算边界框
 * 用于优化数据库查询
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusInMeters: number
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = (radiusInMeters / EARTH_RADIUS) * (180 / Math.PI);
  const lonDelta =
    (radiusInMeters / (EARTH_RADIUS * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);
  
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

/**
 * WGS-84 转 GCJ-02（火星坐标）
 * 国内地图需要使用 GCJ-02
 */
export function wgs84ToGcj02(lat: number, lon: number): [number, number] {
  if (outOfChina(lat, lon)) {
    return [lat, lon];
  }
  
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - 0.00669342162296594323 * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((EARTH_RADIUS * (1 - 0.00669342162296594323)) / (magic * sqrtMagic)) * Math.PI);
  dLon = (dLon * 180.0) / ((EARTH_RADIUS / sqrtMagic) * Math.cos(radLat) * Math.PI);
  
  return [lat + dLat, lon + dLon];
}

/**
 * GCJ-02 转 WGS-84
 */
export function gcj02ToWgs84(lat: number, lon: number): [number, number] {
  if (outOfChina(lat, lon)) {
    return [lat, lon];
  }
  
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - 0.00669342162296594323 * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const dLatFinal = (dLat * 180.0) / (((EARTH_RADIUS * (1 - 0.00669342162296594323)) / (magic * sqrtMagic)) * Math.PI);
  const dLonFinal = (dLon * 180.0) / ((EARTH_RADIUS / sqrtMagic) * Math.cos(radLat) * Math.PI);
  
  return [lat - dLatFinal, lon - dLonFinal];
}

function outOfChina(lat: number, lon: number): boolean {
  return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number): number {
  let ret =
    -100.0 +
    2.0 * x +
    3.0 * y +
    0.2 * y * y +
    0.1 * x * y +
    0.2 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
  ret +=
    ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret +=
    ((160.0 * Math.sin((y / 12.0) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30.0)) * 2.0) /
    3.0;
  return ret;
}

function transformLon(x: number, y: number): number {
  let ret =
    300.0 +
    x +
    2.0 * y +
    0.1 * x * x +
    0.1 * x * y +
    0.1 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
  ret +=
    ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret +=
    ((150.0 * Math.sin((x / 12.0) * Math.PI) + 300.0 * Math.sin((x / 30.0) * Math.PI)) * 2.0) /
    3.0;
  return ret;
}

/**
 * 验证坐标是否有效
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * 根据地图边界获取合适的缩放级别
 */
export function getZoomLevel(bounds: { north: number; south: number; east: number; west: number }): number {
  const latDiff = Math.abs(bounds.north - bounds.south);
  const lonDiff = Math.abs(bounds.east - bounds.west);
  const maxDiff = Math.max(latDiff, lonDiff);
  
  if (maxDiff < 0.001) return 18;
  if (maxDiff < 0.005) return 17;
  if (maxDiff < 0.01) return 16;
  if (maxDiff < 0.02) return 15;
  if (maxDiff < 0.05) return 14;
  if (maxDiff < 0.1) return 13;
  if (maxDiff < 0.2) return 12;
  if (maxDiff < 0.5) return 11;
  if (maxDiff < 1) return 10;
  if (maxDiff < 2) return 9;
  if (maxDiff < 5) return 8;
  if (maxDiff < 10) return 7;
  if (maxDiff < 20) return 6;
  if (maxDiff < 50) return 5;
  return 4;
}
