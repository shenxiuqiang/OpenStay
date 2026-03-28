# OpenStay（开放宿联）项目介绍

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.18%20%7C%7C%20%3C%3D24.x-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange)](https://pnpm.io/)

**🏨 Decentralized Hospitality Network | 去中心化住宿预订网络**

</div>

---

## 📋 项目概述

**OpenStay（开放宿联）** 是一个去中心化住宿预订网络，旨在让每一家旅店拥有自己的「数字店面」，同时通过多个可竞争的聚合平台（Hub）实现房源分发。

**核心愿景**: 让住宿业在数字化时代保留**单店的尊严**、**区域的多样性**，以及**旅客选择的自由**。

---

## 🎯 解决的核心问题

### 当前行业痛点

1. **平台锁定与高佣金**: 单体 OTA 掌握流量与规则，中小旅店议价弱
2. **数据与品牌不自主**: 房源描述、图片、客户关系多在平台侧，官网沦为附属
3. **信任与欺诈**: 虚假房源、刷单评价；用户难以分辨平台背书与真实店家
4. **区域合规碎片化**: 各国对短租、旅馆业许可要求不同，单一全球 App 往往「一刀切」
5. **创新被网关化**: 新功能（会员 NFT、连住权益）需平台排期，店家无法快速实验

### OpenStay 的解决方案

| 痛点 | OpenStay 解决方案 |
|------|------------------|
| 高佣金 | **多 Hub 竞争**，Property 可多渠道入驻，费用结构可谈判 |
| 数据不自主 | 每店拥有**独立 Blocklet**，一手数据与品牌展示 |
| 信任问题 | **DID 身份** + 链上凭证 + 订单绑定评价 |
| 合规碎片化 | **区域 Hub** 本地化合规，协议层统一 |
| 创新受限 | 单店可自定义主题、插件、实验套餐 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenStay 网络                           │
├─────────────────────────────────────────────────────────────┤
│  旅客端 (Travel App)                                        │
│  ├─ 链上发现 Hub/Property                                   │
│  ├─ Hub 模式：选择可信 Hub → 搜索预订                       │
│  └─ 直连模式：直达 Property → 自担风险                      │
├──────────────────────────────┬──────────────────────────────┤
│  Hospitality Hub Blocklet    │  Property Studio Blocklet    │
│  ├─ 入驻审核                 │  ├─ 房型/日历管理            │
│  ├─ 房源聚合展示             │  ├─ 预订/订单管理            │
│  ├─ 搜索与筛选               │  ├─ 品牌主题展示             │
│  ├─ 订阅费 + 分成            │  ├─ DID 身份展示             │
│  └─ 治理与风控               │  └─ 直连预订能力             │
├──────────────────────────────┴──────────────────────────────┤
│  链上基础设施                                               │
│  ├─ Property Node NFT（质押 + 委托）                        │
│  ├─ Hub Node NFT（质押 + 审核背书）                         │
│  ├─ 公开节点注册表（可发现性）                              │
│  └─ 委托支付合约（subscribe/delegate）                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 核心角色

| 角色 | 说明 | 核心诉求 |
|------|------|----------|
| **Property Owner** | 宾馆、民宿主、青旅运营者 | 自有品牌站、低佣金分销、多渠道入驻 |
| **Hub Operator** | 地区协会、OTA 创业者、KOL | 审核权、流量分成、差异化选品 |
| **Traveler** | 休闲/商务出行者 | 发现、比价、预订、可信身份 |
| **Developer** | Blocklet 生态建设者 | 主题市场、插件、支付适配 |

---

## 📦 项目结构

```
OpenStay/
├── 📁 docs/                          # 项目文档
│   ├── PRD.md                        # 产品需求文档
│   ├── architecture.md               # 技术架构文档
│   ├── api.md                        # API 接口文档
│   ├── data-model.md                 # 数据模型设计
│   └── user-guide.md                 # 用户指南
│
├── 📁 property/                      # Property Studio（单店 Blocklet）
│   ├── web/                          # Blocklet Web 应用
│   ├── api/                          # 后端 API
│   ├── src/                          # 前端代码
│   └── themes/                       # 主题模板
│
├── 📁 hub/                           # Hospitality Hub（聚合 Blocklet）
│   ├── web/                          # Blocklet Web 应用
│   ├── api/                          # 后端 API
│   └── src/                          # 前端代码
│
├── 📁 travel-app/                    # 旅客端应用
│   ├── mobile/                       # React Native App
│   └── web/                          # Web 轻应用
│
├── 📁 theme/                         # 主题市场
│   └── templates/                    # 可安装主题
│
├── package.json                      # Monorepo 配置
├── pnpm-workspace.yaml               # pnpm 工作区
└── turbo.json                        # Turborepo 配置
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.18 LTS (已测试至 24.x)
- **pnpm** >= 9.0.0
- **Git**

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/openstay.git
cd openstay

# 安装依赖
pnpm install

# 配置环境变量
cp property/web/.env.example property/web/.env
cp hub/web/.env.example hub/web/.env
```

### 启动开发环境

```bash
# 启动 Property Studio（单店）
pnpm --filter property dev

# 启动 Hospitality Hub（聚合平台）
pnpm --filter hub dev

# 启动旅客 App
pnpm --filter travel-app start
```

---

## 📖 文档索引

| 文档 | 说明 |
|------|------|
| [产品需求文档](docs/PRD.md) | 完整产品需求与功能规格 |
| [技术架构文档](docs/architecture.md) | 系统架构、数据流、安全设计 |
| [API 接口文档](docs/api.md) | RESTful API 完整参考 |
| [数据模型文档](docs/data-model.md) | 数据库设计与模型关系 |
| [用户指南](docs/user-guide.md) | 终端用户使用手册 |

---

## 🗓️ 开发路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| **M0** | 文档与社区反馈；确定 Hub/Property 法律定位与支付路径 | 📝 进行中 |
| **M1** | 单 Property Studio：房型、日历、下单、店家后台 | 📋 计划中 |
| **M2** | 单 Hub：入驻、审核、索引、只读聚合 API | 📋 计划中 |
| **M3** | 旅行 App：Hub 选择、列表/详情、预订跳转 | 📋 计划中 |
| **M4** | 委托扣费 + tier；评价与举报闭环 | 📋 计划中 |
| **M5** | 多 Hub、多区域、主题市场与插件 | 📋 计划中 |

---

## 🤝 参与贡献

OpenStay 是一个**社区驱动**的项目，欢迎各种形式的贡献：

- 💡 产品建议与反馈
- 🐛 Bug 报告
- 📝 文档改进
- 💻 代码贡献
- 🎨 主题设计

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献指南。

---

## 📜 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

## 🙏 致谢

- [ArcBlock](https://www.arcblock.io/) - Blocklet 框架与 DID 基础设施
- [GLofter](https://github.com/shenxiuqiang/glofter) - 架构范式参考

---

**让每一家旅店都拥有属于自己的数字店面** 🏨✨
