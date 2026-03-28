# OpenStay NFT System

OpenStay NFT 系统提供去中心化的节点质押、房源认证和会员权益管理功能。

## 🏗️ 架构概述

### NFT 类型

| 类型 | 用途 | 质押要求 | 可转让 |
|------|------|----------|--------|
| **Node NFT** | 网络节点身份 | 100 ABT | ✅ |
| **Property Certificate** | 房源认证证书 | 10 ABT | ❌ |
| **Host Membership** | 房东会员等级 | 50/200/500 ABT | ❌ |

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加您的钱包助记词：

```env
OPENSTAY_MNEMONIC=your_secret_mnemonic_here
```

### 3. 创建 NFT Factory

#### 创建网络节点 Factory

```bash
OPENSTAY_MNEMONIC="your mnemonic" \
  pnpm exec tsx web/api/src/mock/create-openstay-node-factory.ts create
```

#### 创建房源认证 Factory

```bash
OPENSTAY_MNEMONIC="your mnemonic" \
  pnpm exec tsx web/api/src/mock/create-openstay-property-cert-factory.ts create
```

#### 创建房东会员 Factory

```bash
# 银牌会员
OPENSTAY_MNEMONIC="your mnemonic" \
  pnpm exec tsx web/api/src/mock/create-openstay-host-membership-factory.ts create silver

# 金牌会员
OPENSTAY_MNEMONIC="your mnemonic" \
  pnpm exec tsx web/api/src/mock/create-openstay-host-membership-factory.ts create gold

# 钻石会员
OPENSTAY_MNEMONIC="your mnemonic" \
  pnpm exec tsx web/api/src/mock/create-openstay-host-membership-factory.ts create diamond
```

### 4. 记录 Factory 地址

创建成功后，将返回的 factory 地址添加到 `.env`：

```env
NODE_NFT_FACTORY=z1...
PROPERTY_CERTIFICATE_FACTORY=z1...
HOST_MEMBERSHIP_SILVER_FACTORY=z1...
HOST_MEMBERSHIP_GOLD_FACTORY=z1...
HOST_MEMBERSHIP_DIAMOND_FACTORY=z1...
```

## 📋 API 接口

### 获取质押要求

```http
GET /api/nft/stake-requirements
```

### 铸造 Node NFT

```http
POST /api/nft/node/mint
Content-Type: application/json

{
  "name": "Asia-Pacific Node #1",
  "endpoint": "https://node.openstay.network/apac-1",
  "region": "APAC-SG",
  "stake": 100,
  "capacity": 10000,
  "owner": "z1...",
  "pk": "0x..."
}
```

### 铸造房源认证 NFT

```http
POST /api/nft/property/mint
Content-Type: application/json

{
  "propertyId": "prop_001",
  "propertyName": "Cozy Apartment",
  "location": "Shanghai, China",
  "propertyType": "apartment",
  "hostDid": "z1...",
  "certifiedAt": "2024-03-28T00:00:00Z",
  "complianceRegion": "CN"
}
```

### 铸造会员 NFT

```http
POST /api/nft/membership/mint
Content-Type: application/json

{
  "hostDid": "z1...",
  "hostName": "Alice Chen",
  "tier": "gold",
  "memberSince": "2024-03-28",
  "propertyCount": 5,
  "totalBookings": 150,
  "rating": 4.8,
  "benefits": "10% fee reduction, Priority support"
}
```

### 查询用户 NFT

```http
GET /api/nft/user/:did
```

### 验证 NFT 所有权

```http
POST /api/nft/:address/verify
Content-Type: application/json

{
  "ownerDid": "z1..."
}
```

## 🎨 SVG 预览

生成 NFT SVG 预览文件：

```bash
# Node NFT SVG
pnpm exec tsx web/api/src/mock/create-openstay-node-factory.ts svg ./node-nft.svg

# Property Certificate SVG
pnpm exec tsx web/api/src/mock/create-openstay-property-cert-factory.ts svg ./property-cert.svg

# Host Membership SVG
pnpm exec tsx web/api/src/mock/create-openstay-host-membership-factory.ts svg silver ./membership-silver.svg
```

## 🛡️ 安全注意事项

1. **永远不要提交助记词**：使用环境变量 `OPENSTAY_MNEMONIC`
2. **.env 文件已加入 .gitignore**：确保敏感信息不会被提交
3. **Factory 地址**：记录在安全的地方，丢失后无法恢复

## 📁 文件结构

```
property/web/api/src/
├── services/nft/
│   └── nft.service.ts      # NFT 业务逻辑
├── utils/nft/
│   └── nft-svg.ts          # SVG 生成工具
├── routes/
│   └── nft.ts              # NFT API 路由
└── mock/
    ├── create-openstay-node-factory.ts           # 节点 Factory 创建脚本
    ├── create-openstay-property-cert-factory.ts  # 房源认证 Factory 创建脚本
    ├── create-openstay-host-membership-factory.ts # 会员 Factory 创建脚本
    └── libs/
        ├── load-env.ts     # 环境变量加载
        └── wallet-util.ts  # 钱包工具

property/web/src/pages/NFT/
├── NFTManager.tsx          # NFT 管理页面
└── NFTManager.css          # 样式文件
```

## 🔗 区块链集成

当前实现使用 ArcBlock OCAP SDK 与区块链交互：

- **Chain Host**: https://beta.abtnetwork.io/api
- **Token**: ABT (ArcBlock Token)
- **Wallet**: ArcBlock DID Wallet

## 📝 待办事项

- [ ] 实现链上合约调用
- [ ] 添加 NFT 转账功能
- [ ] 实现 NFT 市场功能
- [ ] 添加 NFT 租赁/抵押功能
- [ ] 集成 DID 登录
