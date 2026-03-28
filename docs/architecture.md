# OpenStay 技术架构文档

> **版本**: 0.1.0  > **日期**: 2026-03-28

---

## 1. 架构概述

### 1.1 设计原则

1. **去中心化**: 每个 Property 拥有独立 Blocklet，数据自主可控
2. **可互操作**: 标准化协议确保不同实现间可通信
3. **分层解耦**: Property、Hub、Travel App 三层独立演进
4. **链上背书**: 关键身份和信任数据上链，可验证

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19, TypeScript, Material-UI |
| **移动端** | React Native, Expo |
| **后端** | Node.js, Express, TypeScript |
| **数据库** | SQLite (dev), PostgreSQL (prod) |
| **ORM** | Sequelize |
| **链上** | ArcBlock Blocklet, DID, NFT |
| **存储** | Local, IPFS, S3 (可选) |
| **构建** | Vite, Turborepo, pnpm |

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                          旅客端 (Travel App)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Web App    │  │  Mobile App  │  │  DID Wallet  │              │
│  │  (React)     │  │(React Native)│  │   (Auth)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Gateway / Blocklet                       │
│                    ┌──────────────────────┐                         │
│                    │   ArcBlock Blocklet  │                         │
│                    │   (DID Auth + Router)│                         │
│                    └──────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Property     │      │     Hub       │      │    Chain      │
│  Studio       │      │   Blocklet    │      │   Layer       │
│  Blocklet     │      │               │      │               │
├───────────────┤      ├───────────────┤      ├───────────────┤
│ ┌───────────┐ │      │ ┌───────────┐ │      │ ┌───────────┐ │
│ │  Web UI   │ │      │ │  Web UI   │ │      │ │ Node NFT  │ │
│ │  (React)  │ │      │ │  (React)  │ │      │ │ Registry  │ │
│ └───────────┘ │      │ └───────────┘ │      │ └───────────┘ │
│ ┌───────────┐ │      │ ┌───────────┐ │      │ ┌───────────┐ │
│ │  API      │ │◄────►│ │  API      │ │      │ │ Delegate  │ │
│ │ (Express) │ │ NHSP  │ │ (Express) │ │      │ │ Contract  │ │
│ └───────────┘ │ Sync  │ └───────────┘ │      │ └───────────┘ │
│ ┌───────────┐ │      │ ┌───────────┐ │      │ ┌───────────┐ │
│ │ Database  │ │      │ │ Database  │ │      │ │ Payment   │ │
│ │(SQLite/  │ │      │ │(SQLite/  │ │      │ │ Contract  │ │
│ │ Postgres) │ │      │ │ Postgres) │ │      │ └───────────┘ │
│ └───────────┘ │      │ └───────────┘ │      └───────────────┘
└───────────────┘      └───────────────┘
```

---

## 3. 核心组件

### 3.1 Property Studio Blocklet

**职责**: 单店数字店面，管理房源、订单、品牌展示

**模块划分**:

```
property/
├── web/                          # Blocklet 配置
├── api/                          # 后端 API
│   ├── src/
│   │   ├── models/              # 数据模型
│   │   │   ├── property.ts      # 旅店信息
│   │   │   ├── room.ts          # 房型
│   │   │   ├── calendar.ts      # 日历
│   │   │   ├── booking.ts       # 订单
│   │   │   └── media.ts         # 媒体资源
│   │   ├── routes/
│   │   │   ├── property.ts      # 旅店 API
│   │   │   ├── rooms.ts         # 房型 API
│   │   │   ├── calendar.ts      # 日历 API
│   │   │   ├── bookings.ts      # 订单 API
│   │   │   └── public.ts        # 公开 API (供 Hub 拉取)
│   │   ├── services/
│   │   │   ├── property.service.ts
│   │   │   ├── room.service.ts
│   │   │   ├── calendar.service.ts
│   │   │   └── booking.service.ts
│   │   └── libs/
│   │       ├── db.ts            # 数据库连接
│   │       ├── auth.ts          # DID 认证
│   │       └── sync.ts          # NHSP 同步协议
│   └── package.json
├── src/                          # 前端 React
│   ├── pages/                   # 页面
│   ├── components/              # 组件
│   ├── contexts/                # Context
│   └── i18n/                    # 国际化
└── themes/                       # 主题模板
```

**公开 API (供 Hub 同步)**:

| 端点 | 说明 |
|------|------|
| `GET /api/public/properties/:id` | 旅店公开信息 |
| `GET /api/public/rooms` | 房型列表 |
| `GET /api/public/calendar` | 可售日历 |
| `GET /api/public/sync` | 增量同步接口 (NHSP) |

### 3.2 Hospitality Hub Blocklet

**职责**: 聚合平台，审核、展示、分发多个 Property

**模块划分**:

```
hub/
├── web/                          # Blocklet 配置
├── api/
│   ├── src/
│   │   ├── models/
│   │   │   ├── hub.ts           # Hub 信息
│   │   │   ├── join-request.ts  # 入驻申请
│   │   │   ├── indexed-property.ts # 同步的 Property 索引
│   │   │   └── audit-log.ts     # 审核日志
│   │   ├── routes/
│   │   │   ├── hub.ts           # Hub API
│   │   │   ├── join-requests.ts # 入驻申请 API
│   │   │   ├── properties.ts    # 房源搜索 API
│   │   │   └── sync.ts          # 同步控制 API
│   │   ├── services/
│   │   │   ├── hub.service.ts
│   │   │   ├── sync.service.ts  # NHSP 同步服务
│   │   │   └── audit.service.ts
│   │   └── libs/
│   │       ├── sync-client.ts   # Property 同步客户端
│   │       └── delegate.ts      # 委托支付
│   └── package.json
└── src/                          # 前端 React
```

**核心 API**:

| 端点 | 说明 |
|------|------|
| `POST /api/join-requests` | 提交入驻申请 |
| `GET /api/join-requests` | 审核列表 (管理员) |
| `POST /api/join-requests/:id/review` | 审核操作 |
| `GET /api/properties` | 搜索房源 |
| `GET /api/properties/:id` | 房源详情 |
| `POST /api/sync/trigger` | 触发同步 |

### 3.3 Travel App

**职责**: 旅客端应用，发现、搜索、预订

**模块划分**:

```
travel-app/
├── mobile/                       # React Native App
│   ├── src/
│   │   ├── screens/             # 屏幕
│   │   │   ├── discovery.tsx    # 发现/选择 Hub
│   │   │   ├── search.tsx       # 搜索
│   │   │   ├── property-detail.tsx
│   │   │   ├── booking.tsx      # 预订流程
│   │   │   └── orders.tsx       # 订单管理
│   │   ├── navigation/          # 导航
│   │   ├── api/                 # API 客户端
│   │   └── contexts/            # 状态管理
│   └── package.json
└── web/                          # Web 轻应用
    └── src/
```

---

## 4. 链上架构

### 4.1 NFT 合约设计

#### Property Node NFT

```solidity
struct PropertyNode {
    address owner;              // 店主 DID 地址
    string endpoint;            // Blocklet 访问地址
    string metadataURI;         // 元数据链接
    uint256 stakeAmount;        // 质押金额
    bool isActive;              // 是否激活
}
```

**功能**:
- 质押激活 Property
- 链上可发现
- 委托授权 Hub 扣费

#### Hub Node NFT

```solidity
struct HubNode {
    address operator;           // Hub 运营方
    string endpoint;            // Hub 访问地址
    string metadataURI;         # Hub 描述、规则
    uint256 stakeAmount;        // 质押金额
    uint256 propertyCount;      // 入驻 Property 数
    bool isActive;
}
```

### 4.2 委托支付合约

**DelegatePayment Contract**:

```solidity
// Property 授权 Hub 定期扣费
function subscribe(
    address hub,
    uint256 amount,
    uint256 interval
) external;

// Hub 执行扣费
function charge(
    address property,
    uint256 amount
) external;

// Property 取消授权
function unsubscribe(address hub) external;
```

### 4.3 节点发现

**链上注册表**:

```solidity
// Property 注册表
mapping(uint256 => PropertyNode) public properties;
uint256[] public propertyIds;

// Hub 注册表
mapping(uint256 => HubNode) public hubs;
uint256[] public hubIds;

// 查询活跃节点
function getActiveProperties() external view returns (uint256[] memory);
function getActiveHubs() external view returns (uint256[] memory);
```

---

## 5. 数据同步协议 (NHSP)

### 5.1 协议概述

**NHSP** (Node Hub Synchronization Protocol): Property 与 Hub 间的增量同步协议

**设计原则**:
- 最终一致性
- 增量同步，减少带宽
- 支持断点续传
- 可验证数据完整性

### 5.2 同步流程

```
┌──────────┐              ┌──────────┐
│   Hub    │ ── 1.请求 ──►│ Property │
│          │   cursor     │          │
│          │◄─ 2.返回 ────│          │
│          │   changes    │          │
│          │── 3.确认 ───►│          │
│          │   ack        │          │
└──────────┘              └──────────┘
```

### 5.3 API 规范

**Property 端**:

```typescript
// GET /api/public/sync?cursor={cursor}
interface SyncResponse {
  cursor: string;           // 下次同步游标
  hasMore: boolean;         // 是否还有更多
  changes: Change[];        // 变更列表
}

interface Change {
  id: string;               // 资源 ID
  type: 'property' | 'room' | 'calendar' | 'media';
  action: 'create' | 'update' | 'delete';
  data: object;             // 变更数据
  updatedAt: string;        // 变更时间
}
```

**Hub 端**:

```typescript
// 触发同步
POST /api/sync/trigger
{
  "propertyId": "uuid",
  "priority": "normal" | "high"
}
```

---

## 6. 身份与认证

### 6.1 DID 身份体系

**角色身份**:

| 角色 | DID 类型 | 用途 |
|------|----------|------|
| Property Owner | `did:abt:{wallet}` | 管理 Property |
| Hub Operator | `did:abt:{wallet}` | 管理 Hub |
| Traveler | `did:abt:{wallet}` | 预订、评价 |

### 6.2 认证流程

```
┌─────────┐         ┌──────────┐         ┌─────────┐
│ Client  │────────►│  Server  │◄───────►│  Chain  │
│         │  DID    │          │ Verify  │         │
│         │  Auth   │          │         │         │
└─────────┘         └──────────┘         └─────────┘
```

**实现**: 使用 `@arcblock/did-auth` 库

---

## 7. 安全设计

### 7.1 身份安全

- DID 签名验证所有管理操作
- JWT Token 有效期 24h
- 敏感操作二次确认

### 7.2 数据安全

- PII 加密存储 (AES-256)
- 传输层 TLS 1.3
- 数据库连接加密

### 7.3 内容安全

- CSP 策略防止 XSS
- 主题包双签验证
- 上传文件类型白名单

### 7.4 合约安全

- 委托扣费限额控制
- 紧急暂停机制
- 多签管理关键操作

---

## 8. 部署架构

### 8.1 开发环境

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  property:
    build: ./property
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=sqlite:./data/property.db
  
  hub:
    build: ./hub
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=sqlite:./data/hub.db
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: devpassword
```

### 8.2 生产环境

- Blocklet 部署至 ArcBlock 网络
- 数据库使用托管 PostgreSQL
- 媒体存储使用 S3/IPFS
- CDN 加速静态资源

---

## 9. 性能优化

### 9.1 前端优化

- 代码分割与懒加载
- 图片 WebP 格式 + 响应式
- Service Worker 缓存
- Skeleton 屏优化体验

### 9.2 后端优化

- 数据库索引优化
- Redis 缓存热点数据
- API 响应压缩
- 分页与游标分页

### 9.3 同步优化

- 增量同步而非全量
- 批量处理变更
- 失败重试与退避

---

## 10. 监控与运维

### 10.1 监控指标

| 指标 | 工具 |
|------|------|
| API 响应时间 | Prometheus + Grafana |
| 错误率 | Sentry |
| 业务指标 | 自建 Dashboard |
| 链上事件 | TheGraph 子图 |

### 10.2 日志规范

```typescript
// 统一日志格式
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  action: string;
  user?: string;
  metadata: object;
}
```

---

## 11. 附录

### 11.1 参考文档

- [ArcBlock Blocklet 文档](https://docs.arcblock.io/)
- [DID Auth 规范](https://www.w3.org/TR/did-core/)
- [GLofter 技术文档](https://github.com/shenxiuqiang/glofter)

### 11.2 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 0.1.0 | 2026-03-28 | 初始架构设计 |
