import { Router, Request, Response } from 'express';
import { calculateDistance, formatDistance, getBoundingBox } from '../utils/geo.js';

const router = Router() as ReturnType<typeof Router>;

// Mock data - 房源列表（带坐标）
const mockProperties = [
  {
    id: 'prop-001',
    name: '山间隐居',
    description: '远离尘嚣的山间小屋，享受宁静时光',
    location: '杭州·临安',
    address: '杭州市临安区天目山镇',
    latitude: 30.2741,
    longitude: 119.4258,
    price: 588,
    currency: 'CNY',
    rating: 4.8,
    reviews: 128,
    images: ['https://picsum.photos/400/300?random=1'],
    amenities: ['wifi', 'parking', 'kitchen', 'ac'],
    type: 'cabin',
    host: {
      name: '山民老张',
      avatar: 'https://picsum.photos/100/100?random=11',
    },
  },
  {
    id: 'prop-002',
    name: '海景别墅',
    description: '面朝大海，春暖花开，私人海滩体验',
    location: '厦门·鼓浪屿',
    address: '厦门市思明区鼓浪屿内厝澳路',
    latitude: 24.4464,
    longitude: 118.0823,
    price: 1288,
    currency: 'CNY',
    rating: 4.9,
    reviews: 256,
    images: ['https://picsum.photos/400/300?random=2'],
    amenities: ['wifi', 'parking', 'pool', 'beach', 'kitchen', 'ac'],
    type: 'villa',
    host: {
      name: '海岛房东',
      avatar: 'https://picsum.photos/100/100?random=12',
    },
  },
  {
    id: 'prop-003',
    name: '古城客栈',
    description: '百年老宅改造，体验传统建筑之美',
    location: '丽江·古城',
    address: '丽江市古城区五一街',
    latitude: 26.8721,
    longitude: 100.2296,
    price: 388,
    currency: 'CNY',
    rating: 4.6,
    reviews: 89,
    images: ['https://picsum.photos/400/300?random=3'],
    amenities: ['wifi', 'breakfast', 'garden'],
    type: 'inn',
    host: {
      name: '纳西阿妈',
      avatar: 'https://picsum.photos/100/100?random=13',
    },
  },
  {
    id: 'prop-004',
    name: '都市公寓',
    description: '市中心黄金地段，交通便利设施齐全',
    location: '上海·静安',
    address: '上海市静安区南京西路',
    latitude: 31.2304,
    longitude: 121.4737,
    price: 688,
    currency: 'CNY',
    rating: 4.7,
    reviews: 312,
    images: ['https://picsum.photos/400/300?random=4'],
    amenities: ['wifi', 'gym', 'kitchen', 'ac', 'washer'],
    type: 'apartment',
    host: {
      name: '城市管家',
      avatar: 'https://picsum.photos/100/100?random=14',
    },
  },
  {
    id: 'prop-005',
    name: '竹林茶舍',
    description: '竹林深处的茶主题民宿，品茶听风',
    location: '成都·青城山',
    address: '成都市都江堰市青城山镇',
    latitude: 30.9076,
    longitude: 103.5634,
    price: 458,
    currency: 'CNY',
    rating: 4.9,
    reviews: 67,
    images: ['https://picsum.photos/400/300?random=5'],
    amenities: ['wifi', 'tea', 'garden', 'parking'],
    type: 'cabin',
    host: {
      name: '茶艺师小李',
      avatar: 'https://picsum.photos/100/100?random=15',
    },
  },
  {
    id: 'prop-006',
    name: '湖边木屋',
    description: '临湖而建，日出日落尽收眼底',
    location: '大理·洱海',
    address: '大理市大理镇洱海西路',
    latitude: 25.6943,
    longitude: 100.1656,
    price: 798,
    currency: 'CNY',
    rating: 4.8,
    reviews: 156,
    images: ['https://picsum.photos/400/300?random=6'],
    amenities: ['wifi', 'parking', 'kitchen', 'view'],
    type: 'cabin',
    host: {
      name: '白族姑娘',
      avatar: 'https://picsum.photos/100/100?random=16',
    },
  },
  // 杭州周边更多房源（用于测试附近搜索）
  {
    id: 'prop-007',
    name: '西湖边民宿',
    description: '步行到西湖只需5分钟',
    location: '杭州·西湖',
    address: '杭州市西湖区南山路',
    latitude: 30.2436,
    longitude: 120.1551,
    price: 888,
    currency: 'CNY',
    rating: 4.9,
    reviews: 423,
    images: ['https://picsum.photos/400/300?random=7'],
    amenities: ['wifi', 'kitchen', 'ac', 'view'],
    type: 'apartment',
    host: {
      name: '西湖姑娘',
      avatar: 'https://picsum.photos/100/100?random=17',
    },
  },
  {
    id: 'prop-008',
    name: '灵隐寺禅房',
    description: '听禅音，闻香火，心灵净土',
    location: '杭州·灵隐',
    address: '杭州市西湖区灵隐路',
    latitude: 30.2408,
    longitude: 120.0984,
    price: 668,
    currency: 'CNY',
    rating: 4.7,
    reviews: 234,
    images: ['https://picsum.photos/400/300?random=8'],
    amenities: ['wifi', 'tea', 'garden'],
    type: 'inn',
    host: {
      name: '禅意生活',
      avatar: 'https://picsum.photos/100/100?random=18',
    },
  },
];

// 搜索房源（支持附近搜索）
router.get('/properties', (req, res) => {
  const { 
    location, 
    lat,
    lng,
    radius = 5000, // 默认5公里
    checkIn, 
    checkOut, 
    guests = 1,
    minPrice,
    maxPrice,
    type,
    sortBy = 'recommended', // recommended, price_asc, price_desc, distance, rating
    page = 1,
    limit = 20 
  } = req.query;

  let results = [...mockProperties];

  // 附近搜索（基于坐标）
  if (lat && lng) {
    const userLat = Number(lat);
    const userLng = Number(lng);
    const searchRadius = Number(radius);

    results = results
      .filter(p => p.latitude && p.longitude)
      .map(p => ({
        ...p,
        distance: calculateDistance(userLat, userLng, p.latitude!, p.longitude!),
      }))
      .filter(p => (p as typeof p & { distance: number }).distance <= searchRadius);
  }

  // 位置筛选（基于关键词）
  else if (location) {
    const loc = String(location).toLowerCase();
    results = results.filter(p => 
      p.location.toLowerCase().includes(loc) ||
      p.name.toLowerCase().includes(loc) ||
      (p.address && p.address.toLowerCase().includes(loc))
    );
  }

  // 价格筛选
  if (minPrice) {
    results = results.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= Number(maxPrice));
  }

  // 类型筛选
  if (type) {
    results = results.filter(p => p.type === type);
  }

  // 排序
  switch (sortBy) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'distance':
      if (lat && lng) {
        results.sort((a, b) => {
          const distA = (a as typeof a & { distance?: number }).distance ?? Infinity;
          const distB = (b as typeof b & { distance?: number }).distance ?? Infinity;
          return distA - distB;
        });
      }
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    // recommended: 默认排序
  }

  // 格式化距离显示
  const formattedResults = results.map(p => {
    const distance = (p as typeof p & { distance?: number }).distance;
    return {
      ...p,
      distanceFormatted: distance ? formatDistance(distance) : null,
    };
  });

  // 分页
  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  const paginated = formattedResults.slice(start, end);

  res.json({
    success: true,
    data: {
      properties: paginated,
      total: results.length,
      page: Number(page),
      totalPages: Math.ceil(results.length / Number(limit)),
      searchMeta: {
        center: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
        radius: lat && lng ? Number(radius) : null,
      },
    },
  });
});

// 附近搜索接口（简化版）
router.get('/nearby', (req, res) => {
  const { lat, lng, radius = 5000, limit = 20 } = req.query;

  if (!lat || !lng) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_COORDINATES',
        message: '请提供 lat 和 lng 参数',
      },
    });
    return;
  }

  const userLat = Number(lat);
  const userLng = Number(lng);
  const searchRadius = Number(radius);

  const results = mockProperties
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      ...p,
      distance: calculateDistance(userLat, userLng, p.latitude!, p.longitude!),
    }))
    .filter(p => p.distance <= searchRadius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Number(limit))
    .map(p => ({
      ...p,
      distanceFormatted: formatDistance(p.distance),
    }));

  res.json({
    success: true,
    data: {
      properties: results,
      total: results.length,
      center: { lat: userLat, lng: userLng },
      radius: searchRadius,
    },
  });
});

// 获取地图边界内的房源
router.get('/bounds', (req, res) => {
  const { north, south, east, west } = req.query;

  if (!north || !south || !east || !west) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_BOUNDS',
        message: '请提供 north, south, east, west 参数',
      },
    });
    return;
  }

  const bounds = {
    north: Number(north),
    south: Number(south),
    east: Number(east),
    west: Number(west),
  };

  const results = mockProperties.filter(
    p =>
      p.latitude &&
      p.longitude &&
      p.latitude <= bounds.north &&
      p.latitude >= bounds.south &&
      p.longitude <= bounds.east &&
      p.longitude >= bounds.west
  );

  res.json({
    success: true,
    data: {
      properties: results,
      total: results.length,
      bounds,
    },
  });
});

// 获取房源详情
router.get('/properties/:id', (req, res) => {
  const { id } = req.params;
  const property = mockProperties.find(p => p.id === id);

  if (!property) {
    res.status(404).json({
      success: false,
      error: {
        code: 'PROPERTY_NOT_FOUND',
        message: '房源不存在',
      },
    });
    return;
  }

  // 模拟更多详情
  const detail = {
    ...property,
    images: [
      property.images[0],
      `https://picsum.photos/400/300?random=${id}-2`,
      `https://picsum.photos/400/300?random=${id}-3`,
      `https://picsum.photos/400/300?random=${id}-4`,
    ],
    rooms: [
      {
        id: `${id}-room-1`,
        name: '主卧',
        description: '舒适大床房，独立卫浴',
        price: property.price,
        capacity: 2,
        beds: '1张双人床',
        amenities: ['独立卫浴', '空调', '电视', 'wifi'],
      },
      {
        id: `${id}-room-2`,
        name: '次卧',
        description: '温馨双床房，适合朋友出行',
        price: Math.floor(property.price * 0.7),
        capacity: 2,
        beds: '2张单人床',
        amenities: ['空调', 'wifi'],
      },
    ],
    rules: [
      '入住时间: 14:00后',
      '退房时间: 12:00前',
      '不允许携带宠物',
      '禁止吸烟',
    ],
  };

  res.json({
    success: true,
    data: detail,
  });
});

// 获取热门目的地
router.get('/destinations', (_req, res) => {
  const destinations = [
    { name: '杭州', count: 234, lat: 30.2741, lng: 120.1551, image: 'https://picsum.photos/300/200?random=21' },
    { name: '厦门', count: 189, lat: 24.4798, lng: 118.0894, image: 'https://picsum.photos/300/200?random=22' },
    { name: '丽江', count: 156, lat: 26.8721, lng: 100.2296, image: 'https://picsum.photos/300/200?random=23' },
    { name: '上海', count: 312, lat: 31.2304, lng: 121.4737, image: 'https://picsum.photos/300/200?random=24' },
    { name: '成都', count: 198, lat: 30.5728, lng: 104.0668, image: 'https://picsum.photos/300/200?random=25' },
    { name: '大理', count: 167, lat: 25.6065, lng: 100.2676, image: 'https://picsum.photos/300/200?random=26' },
  ];

  res.json({
    success: true,
    data: destinations,
  });
});

// 地理编码（地址转坐标）- Mock
router.get('/geocode', (req, res) => {
  const { address } = req.query;
  
  if (!address) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_ADDRESS',
        message: '请提供 address 参数',
      },
    });
    return;
  }

  // Mock 地理编码结果
  const mockResults: Record<string, { lat: number; lng: number; formatted: string }> = {
    '杭州': { lat: 30.2741, lng: 120.1551, formatted: '浙江省杭州市' },
    '上海': { lat: 31.2304, lng: 121.4737, formatted: '上海市' },
    '北京': { lat: 39.9042, lng: 116.4074, formatted: '北京市' },
    '成都': { lat: 30.5728, lng: 104.0668, formatted: '四川省成都市' },
    '厦门': { lat: 24.4798, lng: 118.0894, formatted: '福建省厦门市' },
    '丽江': { lat: 26.8721, lng: 100.2296, formatted: '云南省丽江市' },
    '大理': { lat: 25.6065, lng: 100.2676, formatted: '云南省大理白族自治州' },
  };

  const result = mockResults[String(address)] || {
    lat: 30.2741 + (Math.random() - 0.5) * 0.1,
    lng: 120.1551 + (Math.random() - 0.5) * 0.1,
    formatted: String(address),
  };

  res.json({
    success: true,
    data: result,
  });
});

export default router;
