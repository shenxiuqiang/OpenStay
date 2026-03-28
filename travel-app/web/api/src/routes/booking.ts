import { Router } from 'express';

const router = Router() as ReturnType<typeof Router>;

// Mock bookings data
let mockBookings: Array<{
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}> = [];

// 创建预订
router.post('/', (req, res) => {
  const {
    propertyId,
    propertyName,
    propertyImage,
    roomId,
    roomName,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    currency = 'CNY',
    contactInfo,
  } = req.body;

  // 简单验证
  if (!propertyId || !roomId || !checkIn || !checkOut || !contactInfo) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REQUIRED_FIELDS',
        message: '缺少必填字段',
      },
    });
    return;
  }

  const booking = {
    id: `book-${Date.now()}`,
    propertyId,
    propertyName: propertyName || '未知房源',
    propertyImage: propertyImage || '',
    roomId,
    roomName: roomName || '未知房间',
    checkIn,
    checkOut,
    guests: guests || 1,
    totalPrice: totalPrice || 0,
    currency,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  mockBookings.push(booking);

  res.status(201).json({
    success: true,
    data: booking,
  });
});

// 获取我的预订列表
router.get('/my', (_req, res) => {
  // 按创建时间倒序
  const sorted = [...mockBookings].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({
    success: true,
    data: sorted,
  });
});

// 获取预订详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const booking = mockBookings.find(b => b.id === id);

  if (!booking) {
    res.status(404).json({
      success: false,
      error: {
        code: 'BOOKING_NOT_FOUND',
        message: '预订不存在',
      },
    });
    return;
  }

  res.json({
    success: true,
    data: booking,
  });
});

// 取消预订
router.patch('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const booking = mockBookings.find(b => b.id === id);

  if (!booking) {
    res.status(404).json({
      success: false,
      error: {
        code: 'BOOKING_NOT_FOUND',
        message: '预订不存在',
      },
    });
    return;
  }

  if (booking.status === 'cancelled') {
    res.status(400).json({
      success: false,
      error: {
        code: 'ALREADY_CANCELLED',
        message: '预订已取消',
      },
    });
    return;
  }

  if (booking.status === 'completed') {
    res.status(400).json({
      success: false,
      error: {
        code: 'CANNOT_CANCEL_COMPLETED',
        message: '已完成的预订无法取消',
      },
    });
    return;
  }

  booking.status = 'cancelled';

  res.json({
    success: true,
    data: booking,
  });
});

export default router;
