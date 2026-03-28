import { Router } from 'express';

const router = Router();

// Default map config
const DEFAULT_MAP_CONFIG = {
  provider: 'amap',
  apiKey: '',
  defaultCenter: {
    lat: 30.2741,
    lng: 120.1551,
  },
  defaultZoom: 12,
};

// In-memory storage for map config (should be in database in production)
let mapConfigStore = { ...DEFAULT_MAP_CONFIG };

// Map providers info
const MAP_PROVIDERS = [
  { id: 'google', name: 'Google Maps', icon: '🌍', requiresKey: true },
  { id: 'amap', name: '高德地图', icon: '🇨🇳', requiresKey: true },
  { id: 'baidu', name: '百度地图', icon: '🇨🇳', requiresKey: true },
];

// Get map configuration
router.get('/', (_req, res) => {
  // Return config without exposing full API key
  const safeConfig = {
    ...mapConfigStore,
    apiKey: mapConfigStore.apiKey 
      ? `${mapConfigStore.apiKey.slice(0, 8)}...${mapConfigStore.apiKey.slice(-4)}`
      : '',
  };
  
  res.json({
    success: true,
    data: safeConfig,
  });
});

// Get raw map config (for server-side use)
router.get('/raw', (_req, res) => {
  res.json({
    success: true,
    data: mapConfigStore,
  });
});

// Update map configuration
router.put('/', (req, res) => {
  const { provider, apiKey, defaultCenter, defaultZoom } = req.body;
  
  // Update config
  mapConfigStore = {
    ...mapConfigStore,
    ...(provider && { provider }),
    ...(apiKey && { apiKey }),
    ...(defaultCenter && { defaultCenter }),
    ...(defaultZoom && { defaultZoom }),
  };
  
  // Return safe config
  const safeConfig = {
    ...mapConfigStore,
    apiKey: mapConfigStore.apiKey 
      ? `${mapConfigStore.apiKey.slice(0, 8)}...${mapConfigStore.apiKey.slice(-4)}`
      : '',
  };
  
  res.json({
    success: true,
    data: safeConfig,
  });
});

// Get available map providers
router.get('/providers', (_req, res) => {
  res.json({
    success: true,
    data: MAP_PROVIDERS,
  });
});

export default router;
