import { describe, it, expect } from 'vitest';
import { 
  calculateDistance, 
  wgs84ToGcj02, 
  gcj02ToWgs84,
  getBoundingBox,
  isValidCoordinate,
  formatDistance
} from '../utils/geo.js';

describe('Geo Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // 杭州西湖到上海静安
      const distance = calculateDistance(30.2436, 120.1551, 31.2304, 121.4737);
      expect(distance).toBeGreaterThan(150000); // > 150km
      expect(distance).toBeLessThan(200000);    // < 200km
    });

    it('should return 0 for same point', () => {
      const distance = calculateDistance(30.2436, 120.1551, 30.2436, 120.1551);
      expect(distance).toBe(0);
    });
  });

  describe('wgs84ToGcj02', () => {
    it('should convert WGS-84 to GCJ-02 for China coordinates', () => {
      const [lat, lng] = wgs84ToGcj02(30.2741, 120.1551);
      expect(lat).not.toBe(30.2741);
      expect(lng).not.toBe(120.1551);
      // GCJ-02 偏移通常在几十到几百米
      expect(Math.abs(lat - 30.2741)).toBeLessThan(0.01);
      expect(Math.abs(lng - 120.1551)).toBeLessThan(0.01);
    });

    it('should return same coordinates for outside China', () => {
      const [lat, lng] = wgs84ToGcj02(51.5074, -0.1278); // London
      expect(lat).toBe(51.5074);
      expect(lng).toBe(-0.1278);
    });
  });

  describe('gcj02ToWgs84', () => {
    it('should convert GCJ-02 back to WGS-84', () => {
      const originalLat = 30.2741;
      const originalLng = 120.1551;
      
      const [gcjLat, gcjLng] = wgs84ToGcj02(originalLat, originalLng);
      const [backLat, backLng] = gcj02ToWgs84(gcjLat, gcjLng);
      
      // 反向转换应该有较小误差
      expect(Math.abs(backLat - originalLat)).toBeLessThan(0.0001);
      expect(Math.abs(backLng - originalLng)).toBeLessThan(0.0001);
    });
  });

  describe('getBoundingBox', () => {
    it('should calculate correct bounding box', () => {
      const bounds = getBoundingBox(30.2741, 120.1551, 1000); // 1km radius
      
      expect(bounds.north).toBeGreaterThan(30.2741);
      expect(bounds.south).toBeLessThan(30.2741);
      expect(bounds.east).toBeGreaterThan(120.1551);
      expect(bounds.west).toBeLessThan(120.1551);
    });
  });

  describe('isValidCoordinate', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinate(30.2741, 120.1551)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinate(91, 120)).toBe(false);   // lat > 90
      expect(isValidCoordinate(-91, 120)).toBe(false);  // lat < -90
      expect(isValidCoordinate(30, 181)).toBe(false);   // lng > 180
      expect(isValidCoordinate(30, -181)).toBe(false);  // lng < -180
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(2500)).toBe('2.5km');
      expect(formatDistance(10000)).toBe('10km');
    });
  });
});
