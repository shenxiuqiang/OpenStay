import { describe, it, expect } from 'vitest';
import {
  MAP_PROVIDERS,
  DEFAULT_MAP_CONFIG,
  getMapScriptUrl,
  validateMapKey,
  getMapProvider,
} from './map-config.js';

describe('Map Config', () => {
  describe('MAP_PROVIDERS', () => {
    it('should have required providers', () => {
      const providerIds = MAP_PROVIDERS.map(p => p.id);
      expect(providerIds).toContain('google');
      expect(providerIds).toContain('amap');
      expect(providerIds).toContain('baidu');
    });

    it('should have required fields for each provider', () => {
      MAP_PROVIDERS.forEach(provider => {
        expect(provider.id).toBeDefined();
        expect(provider.name).toBeDefined();
        expect(provider.icon).toBeDefined();
        expect(provider.requiresKey).toBeDefined();
        expect(provider.keyName).toBeDefined();
        expect(provider.keyUrl).toBeDefined();
        expect(provider.docsUrl).toBeDefined();
      });
    });
  });

  describe('DEFAULT_MAP_CONFIG', () => {
    it('should have default values', () => {
      expect(DEFAULT_MAP_CONFIG.provider).toBe('amap');
      expect(DEFAULT_MAP_CONFIG.apiKey).toBe('');
      expect(DEFAULT_MAP_CONFIG.defaultCenter.lat).toBe(30.2741);
      expect(DEFAULT_MAP_CONFIG.defaultCenter.lng).toBe(120.1551);
      expect(DEFAULT_MAP_CONFIG.defaultZoom).toBe(12);
    });
  });

  describe('getMapScriptUrl', () => {
    it('should return Google Maps URL', () => {
      const url = getMapScriptUrl('google', 'test-key');
      expect(url).toContain('googleapis.com');
      expect(url).toContain('test-key');
    });

    it('should return AMap URL', () => {
      const url = getMapScriptUrl('amap', 'test-key');
      expect(url).toContain('amap.com');
      expect(url).toContain('test-key');
    });

    it('should return Baidu Maps URL', () => {
      const url = getMapScriptUrl('baidu', 'test-key');
      expect(url).toContain('baidu.com');
      expect(url).toContain('test-key');
    });

    it('should return empty string for unknown provider', () => {
      const url = getMapScriptUrl('unknown', 'test-key');
      expect(url).toBe('');
    });
  });

  describe('validateMapKey', () => {
    it('should reject empty or short keys', () => {
      expect(validateMapKey('google', '')).toBe(false);
      expect(validateMapKey('google', 'short')).toBe(false);
    });

    it('should validate Google Maps key format', () => {
      // Google Maps keys start with 'AIza'
      expect(validateMapKey('google', 'AIzaSyB12345678901234567890123456789012345')).toBe(true);
      expect(validateMapKey('google', 'invalid-key')).toBe(false);
    });

    it('should validate AMap key format', () => {
      // AMap keys are 32 char hex
      expect(validateMapKey('amap', '0123456789abcdef0123456789abcdef')).toBe(true);
      expect(validateMapKey('amap', 'invalid')).toBe(false);
    });

    it('should be lenient for Baidu keys', () => {
      expect(validateMapKey('baidu', 'a'.repeat(20))).toBe(true);
    });
  });

  describe('getMapProvider', () => {
    it('should return provider by id', () => {
      const google = getMapProvider('google');
      expect(google).toBeDefined();
      expect(google?.name).toBe('Google Maps');
    });

    it('should return undefined for unknown provider', () => {
      const unknown = getMapProvider('unknown');
      expect(unknown).toBeUndefined();
    });
  });
});
