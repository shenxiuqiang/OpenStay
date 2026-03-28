import { Router, Request, Response } from 'express';

const router = Router() as ReturnType<typeof Router>;

// Mock data - 房源列表
const mockProperties = [
  {
    id: 'prop-001',
    name: '山间隐居',
    description: '远离尘嚣的山间小屋，享受宁静时光',
    location: '杭州·临安',
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
];

// 搜索房源
router.get('/properties', (req, res) => {
  const { 
    location, 
    checkIn, 
    checkOut, 
    guests = 1,
    minPrice,
    maxPrice,
    type,
    page = 1,
    limit = 20 
  } = req.query;

  let results = [...mockProperties];

  // 位置筛选
  if (location) {
    const loc = String(location).toLowerCase();
    results = results.filter(p => 
      p.location.toLowerCase().includes(loc) ||
      p.name.toLowerCase().includes(loc)
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

  // 分页
  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  const paginated = results.slice(start, end);

  res.json({
    success: true,
    data: {
      properties: paginated,
      total: results.length,
      page: Number(page),
      totalPages: Math.ceil(results.length / Number(limit)),
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
    coordinates: {
      lat: 30.0 + Math.random(),
      lng: 120.0 + Math.random(),
    },
  };

  res.json({
    success: true,
    data: detail,
  });
});

// 获取热门目的地
router.get('/destinations', (_req, res) => {
  const destinations = [
    { name: '杭州', count: 234, image: 'https://picsum.photos/300/200?random=21' },
    { name: '厦门', count: 189, image: 'https://picsum.photos/300/200?random=22' },
    { name: '丽江', count: 156, image: 'https://picsum.photos/300/200?random=23' },
    { name: '上海', count: 312, image: 'https://picsum.photos/300/200?random=24' },
    { name: '成都', count: 198, image: 'https://picsum.photos/300/200?random=25' },
    { name: '大理', count: 167, image: 'https://picsum.photos/300/200?random=26' },
  ];

  res.json({
    success: true,
    data: destinations,
  });
});

export default router;
