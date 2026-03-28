// OpenStay 地图配置管理
// 支持 Google Maps、高德地图等多种地图服务商

export interface MapProvider {
  id: string;
  name: string;
  icon: string;
  requiresKey: boolean;
  keyName: string;
  keyUrl: string;
  docsUrl: string;
}

export const MAP_PROVIDERS: MapProvider[] = [
  {
    id: 'google',
    name: 'Google Maps',
    icon: '🌍',
    requiresKey: true,
    keyName: 'GOOGLE_MAPS_API_KEY',
    keyUrl: 'https://console.cloud.google.com/google/maps-apis/credentials',
    docsUrl: 'https://developers.google.com/maps/documentation/javascript/get-api-key',
  },
  {
    id: 'amap',
    name: '高德地图',
    icon: '🇨🇳',
    requiresKey: true,
    keyName: 'AMAP_KEY',
    keyUrl: 'https://console.amap.com/dev/key/app',
    docsUrl: 'https://lbs.amap.com/api/javascript-api/guide/abc/prepare',
  },
  {
    id: 'baidu',
    name: '百度地图',
    icon: '🇨🇳',
    requiresKey: true,
    keyName: 'BAIDU_MAP_KEY',
    keyUrl: 'https://lbsyun.baidu.com/apiconsole/key',
    docsUrl: 'https://lbsyun.baidu.com/index.php?title=jspopularGL/guide/getkey',
  },
];

export interface MapConfig {
  provider: string;
  apiKey: string;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  markerIcon?: string;
  clusterMarkers?: boolean;
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  provider: 'amap',
  apiKey: '',
  defaultCenter: {
    lat: 30.2741,
    lng: 120.1551,
  },
  defaultZoom: 12,
};

// 获取地图脚本 URL
export function getMapScriptUrl(provider: string, apiKey: string): string {
  switch (provider) {
    case 'google':
      return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    case 'amap':
      return `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
    case 'baidu':
      return `https://api.map.baidu.com/api?v=3.0&ak=${apiKey}`;
    default:
      return '';
  }
}

// 验证地图 Key 格式
export function validateMapKey(provider: string, key: string): boolean {
  if (!key || key.length < 10) return false;
  
  switch (provider) {
    case 'google':
      // Google Maps API Key 通常是 39 个字符
      return /^AIza[0-9A-Za-z_-]{35}$/.test(key);
    case 'amap':
      // 高德 Key 通常是 32 个字符
      return /^[0-9a-f]{32}$/.test(key);
    case 'baidu':
      // 百度 Key 长度不固定，但通常大于 20
      return key.length >= 20;
    default:
      return true;
  }
}

// 获取提供商信息
export function getMapProvider(providerId: string): MapProvider | undefined {
  return MAP_PROVIDERS.find(p => p.id === providerId);
}
