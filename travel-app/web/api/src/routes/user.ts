import { Router } from 'express';

const router = Router() as ReturnType<typeof Router>;

// Mock user data
const mockUser = {
  id: 'user-001',
  name: '旅行者',
  email: 'traveler@example.com',
  phone: '138****8888',
  avatar: 'https://picsum.photos/100/100?random=99',
  memberSince: '2024-01-15',
  preferences: {
    currency: 'CNY',
    language: 'zh-CN',
  },
};

// 获取当前用户信息
router.get('/me', (_req, res) => {
  res.json({
    success: true,
    data: mockUser,
  });
});

// 获取收藏的房源
router.get('/favorites', (_req, res) => {
  // Mock favorites
  const favorites = [
    {
      id: 'prop-001',
      name: '山间隐居',
      location: '杭州·临安',
      price: 588,
      image: 'https://picsum.photos/400/300?random=1',
      savedAt: '2024-03-20T10:30:00Z',
    },
    {
      id: 'prop-003',
      name: '古城客栈',
      location: '丽江·古城',
      price: 388,
      image: 'https://picsum.photos/400/300?random=3',
      savedAt: '2024-03-18T15:20:00Z',
    },
  ];

  res.json({
    success: true,
    data: favorites,
  });
});

// 添加收藏
router.post('/favorites/:propertyId', (req, res) => {
  const { propertyId } = req.params;
  
  res.json({
    success: true,
    data: {
      propertyId,
      savedAt: new Date().toISOString(),
    },
  });
});

// 取消收藏
router.delete('/favorites/:propertyId', (req, res) => {
  const { propertyId } = req.params;
  
  res.json({
    success: true,
    data: {
      propertyId,
      removedAt: new Date().toISOString(),
    },
  });
});

export default router;
