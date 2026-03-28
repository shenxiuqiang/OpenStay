# OpenStay 🏨

> 去中心化酒店管理平台 - 基于 ArcBlock Blocklet 架构

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.18.0-brightgreen)](https://nodejs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.8.21-blue)](https://turbo.build/)

## 🌟 项目概述

OpenStay 是一个模块化的去中心化酒店管理解决方案，采用微前端架构，包含三个核心组件：

| 组件 | 描述 | 技术栈 |
|------|------|--------|
| **Property Studio** | 单店管理端 | React 19 + Vite + Express |
| **Hospitality Hub** | 聚合平台 | React 19 + Vite + Express |
| **Travel App** | 旅行者应用 | React 19 + Vite + Express |
| **Theme** | 共享 UI 主题 | TypeScript + CSS Variables |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.18.0
- pnpm >= 8.0
- Git

### 安装

```bash
# 克隆仓库
git clone https://github.com/shenxiuqiang/OpenStay.git
cd OpenStay

# 安装依赖
pnpm install

# 构建所有包
pnpm run build

# 启动开发服务器
pnpm run dev
```

### 端口配置

| 服务 | 端口 | 描述 |
|------|------|------|
| Property Studio | 3030 | 单店管理端 |
| Hospitality Hub | 3031 | 聚合平台 |
| Travel App | 3032 | 旅行者应用 |

## 📁 项目结构

```
OpenStay/
├── property/web/          # Property Studio
│   ├── src/               # 前端源码
│   ├── api/               # 后端 API
│   └── package.json
├── hub/web/               # Hospitality Hub
│   ├── src/               # 前端源码
│   ├── api/               # 后端 API
│   └── package.json
├── travel-app/web/        # Travel App
│   ├── src/               # 前端源码
│   ├── api/               # 后端 API
│   └── package.json
├── theme/                 # 共享主题包
│   └── src/               # 组件和样式
├── pnpm-workspace.yaml    # 工作区配置
└── turbo.json             # 构建配置
```

## ✨ 核心功能

### Property Studio（单店管理）
- 🏠 房源信息管理
- 🛏️ 房型配置
- 📅 订单管理
- ⚙️ 基础设置（坐标、地图配置）

### Hospitality Hub（聚合平台）
- 📊 房源聚合展示
- 🗺️ 地图视图
- 📝 入驻申请审核
- 🔄 数据同步管理

### Travel App（旅行者应用）
- 🔍 房源搜索
- 📍 附近搜索（基于位置）
- 🗺️ 地图浏览
- 🛒 在线预订
- 📋 行程管理

## 🗺️ 地图功能

OpenStay 支持多地图服务商：

| 服务商 | 适用场景 | 配置 |
|--------|----------|------|
| Google Maps | 国际用户 | GOOGLE_MAPS_API_KEY |
| 高德地图 | 中国大陆 | AMAP_KEY |
| 百度地图 | 中国大陆 | BAIDU_MAP_KEY |

### 地图配置

1. 在 Property Studio 设置页面配置地图 API Key
2. Hub 和 Travel App 自动使用配置的地图服务
3. 支持坐标转换（WGS-84 / GCJ-02）

## 🛠️ 开发指南

### 构建

```bash
# 构建所有包
pnpm run build

# 仅构建特定包
cd property/web && pnpm run build
```

### 代码规范

```bash
# 运行 ESLint
pnpm run lint

# 自动修复
pnpm run lint:fix
```

### 数据库

默认使用 SQLite（开发环境），生产环境建议使用 PostgreSQL：

```bash
# 设置环境变量
export DATABASE_URL=postgresql://user:pass@localhost:5432/openstay
```

## 🔧 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | 3030/3031/3032 |
| `NODE_ENV` | 运行环境 | development |
| `DATABASE_URL` | 数据库连接 | SQLite |
| `GOOGLE_MAPS_API_KEY` | Google Maps API Key | - |
| `AMAP_KEY` | 高德地图 Key | - |

## 📦 部署

### 使用 Blocklet

```bash
# 打包 Blocklet
pnpm run bundle

# 部署到 Blocklet Server
blocklet deploy .blocklet/bundle
```

### Docker 部署（可选）

```bash
# 构建镜像
docker build -t openstay:latest .

# 运行容器
docker run -p 3030:3030 -p 3031:3031 -p 3032:3032 openstay:latest
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行特定包测试
pnpm --filter @openstay/property test
```

## 🤝 贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

[MIT](LICENSE) © 2026 OpenStay

## 🔗 相关链接

- [ArcBlock 文档](https://docs.arcblock.io/)
- [Blocklet 开发指南](https://developer.blocklet.io/)
- [项目 Wiki](https://github.com/shenxiuqiang/OpenStay/wiki)

---

<p align="center">
  Made with ❤️ by OpenStay Team
</p>
