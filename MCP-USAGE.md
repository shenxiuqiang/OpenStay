# OpenStay MCP 集成指南

## 概述

OpenStay 现已支持 **Model Context Protocol (MCP)**，允许 AI 代理通过标准化协议与去中心化住宿平台进行交互。

## 已实现的 MCP 功能

### Tools (16 个)

| 工具名 | 描述 |
|--------|------|
| `property/search` | 搜索可用房源（支持城市、设施、日期筛选） |
| `property/get` | 获取房源详细信息 |
| `property/create` | 创建新房源（房东/运营方） |
| `property/update` | 更新房源信息 |
| `booking/create` | 创建预订 |
| `booking/get` | 获取预订详情（按 ID） |
| `booking/getByNumber` | 获取预订详情（按预订号） |
| `booking/updateStatus` | 更新预订状态 |
| `booking/list` | 列出预订（支持筛选） |
| `booking/checkAvailability` | 检查房间可用性 |
| `search/natural` | 自然语言搜索房源 |
| `search/nearby` | 基于坐标的附近搜索 |
| `search/filterFacilities` | 按设施筛选房源 |
| `search/compare` | 比较多个房源 |
| `identity/verify` | 验证 DID 身份 |
| `identity/getProfile` | 获取用户资料 |
| `identity/getBookings` | 获取用户预订历史 |
| `identity/registerTraveler` | 注册新旅客 |

### Resources (6 个)

| 资源 URI | 描述 |
|----------|------|
| `property://{id}/details` | 房源详情 |
| `property://{id}/rooms` | 房源房间列表 |
| `booking://{id}` | 预订详情 |
| `booking://number/{number}` | 通过预订号获取 |
| `did://{did}/profile` | 用户资料 |
| `did://{did}/bookings` | 用户预订列表 |

## 使用方式

### 1. 通过 OpenStay API 使用（已集成）

Property Studio API 已集成 MCP 端点：

```bash
# MCP 健康检查
curl http://localhost:3030/api/mcp/health

# MCP JSON-RPC 端点
curl -X POST http://localhost:3030/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### 2. 作为独立 MCP 服务器（stdio 模式）

```bash
# 构建 MCP 包
cd packages/mcp && pnpm run build

# 运行独立 MCP 服务器
pnpm start
```

### 3. 在 Claude Desktop 中配置

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openstay": {
      "command": "node",
      "args": ["/path/to/OpenStay/packages/mcp/dist/server.js"],
      "env": {
        "DATABASE_URL": "/path/to/openstay.db"
      }
    }
  }
}
```

### 4. 在 Cursor 中配置

创建 `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "openstay": {
      "command": "node",
      "args": ["./packages/mcp/dist/server.js"]
    }
  }
}
```

## 示例对话

配置 MCP 后，你可以向 AI 助手提问：

### 房源搜索
- "搜索上海附近可以住2个人的房源"
- "找一下有游泳池和免费WiFi的房源"
- "比较这三个房源的设施和价格"

### 预订管理
- "帮我预订 2024-04-15 到 2024-04-17 的房间"
- "检查房源 {id} 在下周是否有空房"
- "查看预订 OST-2024-0001 的状态"

### 用户身份
- "查看我的预订历史"
- "注册我的 DID"
- "获取我的用户资料"

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

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式 (热重载)
cd packages/mcp && pnpm run dev

# 构建
pnpm run build

# 运行测试
pnpm test
```

## 文件结构

```
packages/mcp/
├── src/
│   ├── index.ts              # MCP 服务器主类
│   ├── server.ts             # 独立服务器入口
│   ├── main.ts               # 导出定义
│   ├── tools/
│   │   ├── property.ts       # 房源工具
│   │   ├── booking.ts        # 预订工具
│   │   ├── search.ts         # 搜索工具
│   │   └── identity.ts       # 身份工具
│   └── utils/
│       └── express.ts        # Express 集成
├── package.json
├── tsconfig.json
└── README.md
```

## 下一步

- [ ] 集成 Payment Kit 支付工具
- [ ] 添加 DID 签名验证
- [ ] 实现资源订阅 (SSE)
- [ ] 添加更多自然语言意图解析
- [ ] 集成 AIGNE 框架

## 参考

- [MCP Specification](https://modelcontextprotocol.io/)
- [ArcBlock MCP Guide](/docs/mcp-integration-guide.md)
