# OpenStay 数据模型文档

> **版本**: 0.1.0  
> **日期**: 2026-03-28

---

## 1. 概述

本文档定义 OpenStay 系统的数据库模型，包括 Property Studio 和 Hospitality Hub 两个核心模块的实体关系。

**数据库选型**:
- 开发环境: SQLite
- 生产环境: PostgreSQL

**ORM**: Sequelize (TypeScript)

---

## 2. Property Studio 模型

### 2.1 Property (旅店)

存储旅店的基本信息和配置。

```typescript
interface PropertyAttributes {
  id: string;                    // UUID, Primary Key
  did: string;                   // 店主 DID
  name: string;                  // 旅店名称
  slug: string;                  // URL 友好标识
  description: string;           // 描述
  address: string;               // 地址
  city: string;                  // 城市
  country: string;               // 国家
  latitude: number;              // 纬度
  longitude: number;             // 经度
  phone: string;                 // 联系电话
  email: string;                 // 联系邮箱
  website: string;               // 官网链接
  checkInTime: string;           // 入住时间 (14:00)
  checkOutTime: string;          // 退房时间 (12:00)
  facilities: string[];          // 设施标签
  languages: string[];           // 支持语言
  
  // 信任信息
  licenseNumber: string;         // 营业执照号
  licenseImage: string;          // 执照图片 URL
  nodeNftAddress: string;        // Node NFT 地址
  nodeNftTokenId: string;        // Node NFT Token ID
  
  // 主题配置
  theme: string;                 // 主题标识
  customCss: string;             // 自定义 CSS
  logoUrl: string;               // Logo 图片
  coverImageUrl: string;         // 封面图
  
  // 状态
  status: 'active' | 'inactive' | 'suspended';
  isPublic: boolean;             // 是否公开
  
  createdAt: Date;
  updatedAt: Date;
}
```

**索引**:
- `did` (unique)
- `slug` (unique)
- `city`, `country`
- `status`

### 2.2 Room (房型)

```typescript
interface RoomAttributes {
  id: string;                    // UUID
  propertyId: string;            // Foreign Key → Property
  
  name: string;                  // 房型名称
  description: string;           // 描述
  area: number;                  // 面积 (平方米)
  bedType: string;               // 床型 (大床/双床/多床)
  maxGuests: number;             // 最大入住人数
  
  // 设施
  amenities: string[];           // 设施标签
  hasPrivateBathroom: boolean;   // 独立卫浴
  hasAirConditioning: boolean;   // 空调
  hasHeating: boolean;           // 暖气
  hasWifi: boolean;              // WiFi
  hasTV: boolean;                // 电视
  
  // 价格
  basePrice: number;             // 基础价格
  currency: string;              // 货币代码
  
  // 媒体
  coverImageUrl: string;         // 封面图
  imageUrls: string[];           // 图片列表
  
  // 规则
  minNights: number;             // 最少入住天数
  maxNights: number;             // 最多入住天数
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  
  sortOrder: number;             // 排序
  status: 'active' | 'inactive';
  
  createdAt: Date;
  updatedAt: Date;
}
```

**索引**:
- `propertyId`
- `status`
- `maxGuests`

### 2.3 Calendar (日历)

记录每个房型每日的房态和价格。

```typescript
interface CalendarAttributes {
  id: string;                    // UUID
  roomId: string;                // Foreign Key → Room
  date: Date;                    // 日期
  
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  price: number;                 // 当日价格 (覆盖房型基础价格)
  currency: string;
  
  availableCount: number;        // 剩余可售数量
  
  // 特殊规则
  minNights: number | null;      // 当日特殊最少连住
  maxNights: number | null;      // 当日特殊最多连住
  
  // 备注
  note: string;                  // 维护/关房备注
  
  createdAt: Date;
  updatedAt: Date;
}
```

**索引**:
- `roomId`, `date` (unique)
- `status`
- `date` (范围查询)

### 2.4 Booking (订单)

```typescript
interface BookingAttributes {
  id: string;                    // UUID
  bookingNumber: string;         // 订单号 (B-20260328-XXXX)
  
  // 关联
  roomId: string;                // Foreign Key → Room
  propertyId: string;            // Foreign Key → Property
  
  // 客人信息
  guestDid: string;              // 客人 DID
  guestName: string;             // 客人姓名
  guestEmail: string;            // 邮箱
  guestPhone: string;            // 电话
  guestCount: number;            // 入住人数
  
  // 预订信息
  checkInDate: Date;             // 入住日期
  checkOutDate: Date;            // 离店日期
  nights: number;                // 入住晚数
  
  // 价格
  roomPrice: number;             // 房费
  taxes: number;                 // 税费
  totalAmount: number;           // 总金额
  currency: string;
  
  // 状态
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'refunded';
  
  // 支付
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentTransactionId: string;
  
  // 特殊需求
  specialRequests: string;
  
  // 来源
  source: 'direct' | 'hub';      // 直连或 Hub
  hubId: string | null;          // 来源 Hub ID
  
  // 时间戳
  confirmedAt: Date | null;
  checkedInAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**索引**:
- `bookingNumber` (unique)
- `propertyId`
- `roomId`
- `guestDid`
- `status`
- `checkInDate`

### 2.5 Media (媒体资源)

```typescript
interface MediaAttributes {
  id: string;                    // UUID
  propertyId: string;            // Foreign Key → Property
  roomId: string | null;         // Foreign Key → Room (可选)
  
  type: 'image' | 'video';
  url: string;                   // 文件 URL
  thumbnailUrl: string;          // 缩略图 URL
  
  filename: string;              // 原始文件名
  mimeType: string;              // 文件类型
  size: number;                  // 文件大小 (bytes)
  width: number;                 // 图片宽度
  height: number;                // 图片高度
  
  caption: string;               // 标题/描述
  alt: string;                   // Alt 文本
  
  sortOrder: number;             // 排序
  isCover: boolean;              // 是否封面
  
  // 版权
  copyright: string;             // 版权信息
  source: string;                // 图片来源
  
  createdAt: Date;
}
```

**索引**:
- `propertyId`
- `roomId`

### 2.6 JoinedHub (已加入的 Hub)

记录 Property 加入的 Hub。

```typescript
interface JoinedHubAttributes {
  id: string;
  propertyId: string;            // Foreign Key → Property
  hubId: string;                 // Hub 标识
  hubEndpoint: string;           // Hub 访问地址
  
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  tier: 'basic' | 'pro' | 'premium';
  
  // 同步
  lastSyncAt: Date | null;
  syncCursor: string | null;
  
  // 费用
  subscriptionAmount: number;
  subscriptionInterval: 'monthly' | 'yearly';
  commissionRate: number;        // 分成比例 (0-100)
  
  approvedAt: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Hospitality Hub 模型

### 3.1 Hub (聚合平台)

```typescript
interface HubAttributes {
  id: string;                    // UUID
  did: string;                   // 运营方 DID
  
  name: string;                  // Hub 名称
  slug: string;                  // URL 标识
  description: string;           // 描述
  logoUrl: string;               // Logo
  coverImageUrl: string;         // 封面图
  
  // 区域/垂类
  region: string;                // 覆盖区域
  category: string;              // 垂类 (民宿/酒店/青旅)
  languages: string[];           // 支持语言
  
  // 联系
  website: string;
  email: string;
  
  // 链上
  nodeNftAddress: string;
  nodeNftTokenId: string;
  
  // 配置
  pricing: {
    basic: { monthly: number; yearly: number };
    pro: { monthly: number; yearly: number };
    premium: { monthly: number; yearly: number };
  };
  defaultCommissionRate: number;
  
  // 状态
  status: 'active' | 'inactive';
  
  // 统计
  propertyCount: number;
  totalBookings: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**索引**:
- `did` (unique)
- `slug` (unique)
- `status`

### 3.2 JoinRequest (入驻申请)

```typescript
interface JoinRequestAttributes {
  id: string;                    // UUID
  hubId: string;                 // Foreign Key → Hub
  
  // Property 信息
  propertyId: string;
  propertyDid: string;
  propertyEndpoint: string;
  propertyName: string;
  
  // 申请材料
  licenseNumber: string;
  licenseImageUrl: string;
  description: string;
  
  // 申请
  requestedTier: 'basic' | 'pro' | 'premium';
  
  // 状态
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  
  // 审核
  reviewedBy: string | null;     // 审核员 DID
  reviewNotes: string | null;
  reviewedAt: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**索引**:
- `hubId`
- `propertyId`
- `status`

### 3.3 IndexedProperty (同步的 Property 索引)

Hub 从 Property 同步的房源索引。

```typescript
interface IndexedPropertyAttributes {
  id: string;
  hubId: string;                 // Foreign Key → Hub
  
  // Property 来源信息
  propertyId: string;
  propertyDid: string;
  propertyEndpoint: string;
  
  // 同步的数据 (快照)
  name: string;
  description: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  facilities: string[];
  
  // 房型摘要
  roomTypes: {
    id: string;
    name: string;
    maxGuests: number;
    basePrice: number;
    currency: string;
  }[];
  minPrice: number;
  maxPrice: number;
  
  // Hub 配置
  tier: 'basic' | 'pro' | 'premium';
  hubTags: string[];             // Hub 自定义标签
  isFeatured: boolean;           // 是否推荐
  
  // 状态
  syncStatus: 'syncing' | 'synced' | 'error';
  lastSyncAt: Date;
  syncCursor: string;
  
  // 统计
  viewCount: number;
  clickCount: number;
  bookingCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**索引**:
- `hubId`
- `propertyId` (unique per hub)
- `city`, `country`
- `minPrice`, `maxPrice`
- `facilities` (GIN index for PostgreSQL)

### 3.4 AuditLog (审核日志)

```typescript
interface AuditLogAttributes {
  id: string;
  hubId: string;
  
  action: 'review' | 'suspend' | 'restore' | 'feature';
  targetType: 'property' | 'join_request';
  targetId: string;
  
  operatorDid: string;           // 操作员 DID
  details: object;               // 详情
  
  createdAt: Date;
}
```

---

## 4. 模型关系图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Property Studio                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    1:N    ┌──────────┐    1:N    ┌────────────────┐  │
│  │  Property    │◄──────────│   Room   │◄──────────│    Calendar    │  │
│  │              │           │          │           │    (per day)   │  │
│  └──────┬───────┘           └────┬─────┘           └────────────────┘  │
│         │                        │                                     │
│         │ 1:N                    │ 1:N                                 │
│         ▼                        ▼                                     │
│  ┌──────────────┐           ┌──────────┐                              │
│  │    Media     │           │  Booking │                              │
│  └──────────────┘           └──────────┘                              │
│         │                                                             │
│         │ 1:N                                                         │
│         ▼                                                             │
│  ┌──────────────┐                                                     │
│  │  JoinedHub   │◄───────────────────────────────────────────────┐    │
│  │  (Hub list)  │                                                │    │
│  └──────────────┘                                                │    │
│                                                                  │    │
└──────────────────────────────────────────────────────────────────┼────┘
                                                                   │
                                                                   │ NHSP Sync
                                                                   │
┌──────────────────────────────────────────────────────────────────┼────┐
│                      Hospitality Hub                             │    │
├──────────────────────────────────────────────────────────────────┼────┤
│                                                                  │    │
│  ┌──────────────┐    1:N    ┌─────────────────────┐              │    │
│  │     Hub      │◄──────────│   JoinRequest       │              │    │
│  │              │           │   (applications)    │              │    │
│  └──────┬───────┘           └─────────────────────┘              │    │
│         │                                                         │    │
│         │ 1:N                                                     │    │
│         ▼                                                         │    │
│  ┌─────────────────────────────────────┐                         │    │
│  │       IndexedProperty               │◄────────────────────────┘    │
│  │  (synced snapshot from Property)    │                              │
│  └─────────────────────────────────────┘                              │
│         │                                                             │
│         │ 1:N                                                         │
│         ▼                                                             │
│  ┌──────────────┐                                                     │
│  │   AuditLog   │                                                     │
│  └──────────────┘                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 数据库迁移

### 5.1 Property Studio 迁移

```sql
-- 创建 Property 表
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  -- ... 其他字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建 Room 表
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  -- ...
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建 Calendar 表
CREATE TABLE calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  price DECIMAL(10,2),
  -- ...
  UNIQUE(room_id, date)
);

-- 创建索引
CREATE INDEX idx_properties_did ON properties(did);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_rooms_property ON rooms(property_id);
CREATE INDEX idx_calendars_room_date ON calendars(room_id, date);
CREATE INDEX idx_calendars_status ON calendars(status);
```

### 5.2 Hospitality Hub 迁移

```sql
-- 创建 Hub 表
CREATE TABLE hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  -- ...
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建 JoinRequest 表
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  property_id VARCHAR(255) NOT NULL,
  property_did VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- ...
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建 IndexedProperty 表
CREATE TABLE indexed_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  property_id VARCHAR(255) NOT NULL,
  -- ...
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(hub_id, property_id)
);

-- 创建索引
CREATE INDEX idx_join_requests_hub ON join_requests(hub_id);
CREATE INDEX idx_join_requests_status ON join_requests(status);
CREATE INDEX idx_indexed_properties_hub ON indexed_properties(hub_id);
CREATE INDEX idx_indexed_properties_geo ON indexed_properties(country, city);
```

---

## 6. 链上数据

### 6.1 合约事件

```typescript
// Property Node NFT
interface PropertyNodeMinted {
  tokenId: bigint;
  owner: string;
  endpoint: string;
  stakeAmount: bigint;
}

interface PropertyNodeActivated {
  tokenId: bigint;
  delegate: string;  // 委托的 Hub
}

// Hub Node NFT
interface HubNodeMinted {
  tokenId: bigint;
  operator: string;
  endpoint: string;
}

// 委托支付
interface SubscriptionCreated {
  property: string;
  hub: string;
  amount: bigint;
  interval: bigint;
}

interface PaymentCharged {
  property: string;
  hub: string;
  amount: bigint;
}
```

### 6.2 索引策略

使用 TheGraph 子图索引链上事件：

```yaml
# subgraph.yaml
specVersion: 0.0.4
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: PropertyNodeNFT
    mapping:
      eventHandlers:
        - event: NodeMinted(...)
          handler: handlePropertyNodeMinted
        - event: NodeActivated(...)
          handler: handlePropertyNodeActivated
```

---

## 7. 附录

### 7.1 命名规范

- 表名: 复数形式，下划线分隔 (`properties`, `join_requests`)
- 字段: 小写，下划线分隔 (`property_id`, `created_at`)
- 模型: PascalCase (`Property`, `JoinRequest`)
- 外键: `{table}_id` (`property_id`, `hub_id`)

### 7.2 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 0.1.0 | 2026-03-28 | 初始数据模型设计 |
