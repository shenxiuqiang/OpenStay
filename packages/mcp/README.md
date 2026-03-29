# @openstay/mcp

OpenStay MCP (Model Context Protocol) Server - 让 AI 代理能够与 OpenStay 去中心化住宿平台交互。

## 概述

这个包提供了 OpenStay 的 MCP 服务器实现，允许 AI 代理通过标准化的 Model Context Protocol 与住宿预订系统进行交互。

## 功能

### 工具 (Tools)

| 工具名 | 描述 |
|--------|------|
| `property/search` | 搜索可用房源 |
| `property/get` | 获取房源详情 |
| `property/create` | 创建新房源 |
| `property/update` | 更新房源信息 |
| `booking/create` | 创建预订 |
| `booking/get` | 获取预订详情 |
| `booking/list` | 列出预订 |
| `booking/checkAvailability` | 检查房间可用性 |
| `booking/updateStatus` | 更新预订状态 |
| `search/natural` | 自然语言搜索 |
| `search/nearby` | 附近搜索 |
| `search/filterFacilities` | 按设施筛选 |
| `search/compare` | 比较房源 |
| `identity/verify` | 验证 DID |
| `identity/getProfile` | 获取用户资料 |
| `identity/getBookings` | 获取用户预订 |

### 资源 (Resources)

| 资源 URI | 描述 |
|----------|------|
| `property://{id}/details` | 房源详情 |
| `property://{id}/rooms` | 房源房间列表 |
| `booking://{id}` | 预订详情 |
| `booking://number/{number}` | 通过预订号获取 |
| `did://{did}/profile` | 用户资料 |
| `did://{did}/bookings` | 用户预订列表 |

## 安装

```bash
pnpm install @openstay/mcp
```

## 使用方式

### 1. 作为 Express 中间件

在 OpenStay Property API 中已经集成：

```typescript
import { createMCPRouter } from '@openstay/mcp';
import { sequelize } from './libs/db.js';

// 添加 MCP 路由
app.use('/api/mcp', createMCPRouter({ sequelize }));
```

MCP 端点：`POST /api/mcp`

### 2. 作为独立进程 (stdio)

```bash
# 构建
pnpm run build

# 运行 MCP 服务器
pnpm start
# 或使用 npx
npx @openstay/mcp
```

### 3. 在 AI 客户端中配置

#### Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openstay": {
      "command": "npx",
      "args": ["@openstay/mcp"],
      "env": {
        "DATABASE_URL": "/path/to/openstay.db"
      }
    }
  }
}
```

#### Cursor

在 `.cursor/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "openstay": {
      "command": "npx",
      "args": ["@openstay/mcp"]
    }
  }
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式 (热重载)
pnpm run dev

# 构建
pnpm run build

# 运行测试
pnpm test
```

## 示例对话

配置好 MCP 后，你可以向 AI 助手提问：

- "搜索上海附近可以住2个人的房源"
- "帮我预订 2024-04-15 到 2024-04-17 的房间"
- "检查房源 {id} 在下周是否有空房"
- "比较这三个房源的设施和价格"
- "查看我的预订历史"

## 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│   MCP Protocol   │────▶│  OpenStay MCP   │
│  (Claude/Cursor)│     │  (JSON-RPC 2.0)  │     │    Server       │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                              ┌───────────────────────────┼───────────┐
                              ▼                           ▼           ▼
                        ┌──────────┐               ┌─────────────┐ ┌────────┐
                        │ Property │               │   Booking   │ │ Search │
                        │  Tools   │               │    Tools    │ │ Tools  │
                        └──────────┘               └─────────────┘ └────────┘
```

## 许可证

MIT
