# ArcBlock MCP 技术研究与 OpenStay 项目接入方案

## 1. MCP 核心概念与功能特性

### 1.1 MCP 协议定义与设计目标

#### 1.1.1 协议定位：AI 领域的 HTTP 等效标准

Model Context Protocol（MCP）是由 Anthropic 于 2024 年 11 月推出的开放协议，其设计目标是为大型语言模型（LLM）与外部数据源、工具之间建立标准化的连接机制  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。MCP 被业界广泛类比为"AI 领域的 HTTP"或"USB-C 接口"，这一比喻精准地概括了其核心价值：消除 AI 应用与外部系统集成的碎片化问题，实现即插即用的互操作性  [(PkgPulse)](https://www.pkgpulse.com/blog/mcp-libraries-nodejs-2026) 。截至 2026 年初，MCP 已获得 Claude Desktop、Cursor、Cline、Continue.dev、VS Code Copilot 等主流 AI 开发环境的全面支持，成为事实上的行业标准  [(PkgPulse)](https://www.pkgpulse.com/blog/mcp-libraries-nodejs-2026) 。

MCP 协议采用 **JSON-RPC 2.0** 作为底层通信格式，这一选择兼顾了简洁性、可读性和跨语言实现的便利性。与 RESTful API 的无状态设计不同，MCP 强调**有状态连接（stateful connections）**，为复杂的 AI 交互场景提供了必要的会话管理能力  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。协议的最新稳定版本为 **2025-11-25**，在生命周期管理、传输机制、授权框架等方面进行了全面增强，特别是引入了 Streamable HTTP 作为推荐的远程部署传输方式，以及基于 OAuth 2.1 的增量授权同意机制  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。

从技术演进的角度看，MCP 的设计深受 **Language Server Protocol（LSP）** 的启发。LSP 成功标准化了编程语言支持在多种 IDE 中的集成方式，而 MCP 则致力于以类似方式标准化 AI 应用与外部上下文和工具的集成  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。这种类比不仅揭示了 MCP 的技术渊源，也预示了其潜在的行业影响力——正如 LSP 重塑了开发工具生态，MCP 有望重塑 AI 应用的开发范式。

#### 1.1.2 核心使命：打破 AI 模型与外部工具之间的壁垒

MCP 诞生的核心驱动力是解决 AI 集成领域的 **"N×M 问题"**——即 N 个 AI 应用需要与 M 个外部系统分别建立定制集成，导致集成复杂度呈指数级增长。在 MCP 出现之前，开发者必须为每个 AI 平台（OpenAI、Google、Anthropic 等）和每个目标系统编写特定的适配代码，形成严重的碎片化局面  [(CodiLime)](https://codilime.com/blog/model-context-protocol-explained/) 。

MCP 通过三层标准化策略系统性解决这一问题：

| 标准化维度 | 具体机制 | 解决的问题 |
|:---|:---|:---|
| **接口标准化** | 统一的 JSON-RPC 消息格式、请求-响应模式、错误处理规范 | 不同系统间的通信格式不一致 |
| **语义标准化** | 结构化的 Schema 描述（JSON Schema/Zod）定义工具输入输出 | AI 模型无法理解工具用途和参数 |
| **安全标准化** | OAuth 2.1 + PKCE 授权框架、能力协商、资源指示器 | 身份验证和权限控制缺乏统一方案 |

这种三位一体的标准化设计，使得任何实现了 MCP 的服务器都能被任何兼容的 AI 客户端调用，真正实现了 **"一次实现，处处可用"** 的愿景。对于 OpenStay 项目，这意味着其住宿预订服务可以同时支持 Claude、GPT、Gemini 等不同模型的调用，也可以被第三方开发者构建的创新应用所使用，无需为每个平台重复开发适配层。

MCP 的动态发现机制进一步增强了灵活性。与传统 API 需要预先硬编码端点不同，MCP 客户端可以在连接建立时获取服务器的完整能力清单（Resources、Tools、Prompts），并据此动态调整行为  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。这种"运行时适应"能力使 AI 代理能够使用从未见过的新工具，只要工具遵循 MCP 的模式描述规范即可  [(aurpay.net)](https://aurpay.net/aurspace/what-is-mcp-ai-agents-payment-apis/) 。

#### 1.1.3 设计哲学：去中心化、可组合、安全优先

MCP 的设计哲学体现了对现代分布式系统和 AI 应用需求的深刻洞察，与区块链技术的核心原则高度共鸣：

**去中心化** 体现在协议的多方参与架构中。MCP 不预设任何中心化的服务注册或协调机构，任何组织或个人都可以独立部署 MCP 服务器，通过标准的发现机制被客户端识别  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。这种开放性防止了能力垄断，促进了创新竞争。ArcBlock 进一步将这一原则推向极致，提出利用区块链解决 MCP 当前实现中的中心化风险——许多部署将服务器和客户端运行在同一台机器上，这不仅限制了可扩展性，也暴露了安全隐患  [(ArcBlock)](https://www.arcblock.io/blog/en/mcp-integration-blockchain-decentralized-ai) 。

**可组合性** 是 MCP 实现复杂 AI 工作流的关键。协议借鉴了 Unix 哲学和 Web 组件化思想，通过 Resources、Tools、Prompts、Sampling 四种原语的灵活组合，构建出从简单数据查询到复杂多步骤事务的广泛应用场景  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。ArcBlock 的 AIGNE 框架专门为此设计，提供了可视化的代理编排界面，使非技术用户也能构建多步骤、多工具的 AI 工作流  [(npm)](https://www.npmjs.com/package/@aigne/example-mcp-puppeteer) 。

**安全优先** 原则贯穿 MCP 设计的各个层面。协议内置了基于 **OAuth 2.1** 的授权框架，支持动态客户端注册（DCR）、PKCE（Proof Key for Code Exchange）、资源指示器（Resource Indicators，RFC 8707）等现代安全机制  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25) 。2025-11-25 版本进一步强化了身份验证能力，引入了客户端身份验证机制，允许服务器验证请求来源的客户端软件身份，防止恶意工具冒充合法代理  [(Github)](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1289) 。这些设计使 MCP 能够满足企业级部署的严格要求。

### 1.2 MCP 技术架构

#### 1.2.1 三层角色模型

MCP 协议定义了清晰的三层角色模型，这种分层架构是实现复杂 AI 系统解耦和扩展的基础  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  ：

| 角色 | 职责描述 | 典型实现 | 在 OpenStay 场景中的映射 |
|:---|:---|:---|:---|
| **Host** | 发起连接的 LLM 应用程序，负责协调用户交互、模型推理和工具调用决策 | Claude Desktop、Cursor IDE、AIGNE 框架、自定义 AI 应用 | OpenStay AI 预订助手、房东管理助手、第三方旅行规划应用 |
| **Client** | Host 内部的连接器组件，负责与 MCP Server 建立和维护连接，处理协议细节 | MCP SDK 提供的 Client 类、IDE 内置连接器 | AIGNE 框架的 MCPAgent、OpenStay 自定义 Client |
| **Server** | 提供上下文和能力的服务端，暴露 Resources、Tools、Prompts 等原语 | Blocklet 部署的 MCP 服务、第三方 MCP 服务器、ArcBlock 官方服务 | OpenStay MCP Server（房源服务、预订服务、支付服务） |

这种分层架构的关键洞察在于将 **能力发现** 与 **能力执行** 解耦。Host 专注于 AI 核心能力（理解、推理、生成），无需关心底层通信细节；Client 处理连接管理和协议转换，为 Host 提供统一的调用接口；Server 则专注于业务能力的实现和暴露。对于 OpenStay 项目，这意味着可以并行推进多个层面的开发工作：前端团队基于 AIGNE 框架构建用户交互界面，后端团队开发房源管理和预订处理等核心业务逻辑，基础设施团队负责 MCP Server 的部署和运维。

ArcBlock 的 AIGNE 框架对三层模型进行了扩展。**MCPAgent** 作为专门的 Client 层组件，封装了连接生命周期管理、工具发现缓存、调用重试、错误处理等复杂逻辑，使开发者能够专注于业务逻辑而非协议细节  [(npm)](https://www.npmjs.com/package/@aigne/example-mcp-puppeteer)  。框架还支持将多个 MCPAgent 组合为工作流，实现跨服务的复杂编排。

#### 1.2.2 通信机制

MCP 协议基于 **JSON-RPC 2.0** 构建消息层，支持多种传输机制以适应不同的部署场景  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  ：

| 传输方式 | 通信模式 | 适用场景 | 技术特点 | ArcBlock 支持状态 |
|:---|:---|:---|:---|:---|
| **标准 I/O (stdio)** | 双向，进程内 | 本地开发、CLI 工具集成 | 简单可靠，零网络依赖，进程级隔离 | ✅ 完整支持  [(Github)](https://github.com/ArcBlock/mcp-typescript-sdk)  |
| **Server-Sent Events (SSE)** | 服务器单向推送 | 实时通知、事件流场景 | 基于 HTTP，防火墙友好，适合订阅模式 | ✅ 支持 |
| **Streamable HTTP** | 全双工，请求-响应 + 服务器推送 | 生产部署、远程访问、弹性伸缩 | 兼容 HTTP 基础设施，支持负载均衡和 CDN，ArcBlock 推荐方式 | ✅ 重点推广  [(LinkedIn)](https://www.linkedin.com/posts/mtmckinney_decentralized-ai-activity-7359635276236812288-a_rR)  |

**Streamable HTTP** 是 MCP 2025 版本引入的推荐传输方式，专为远程、可扩展的部署场景设计  [(PkgPulse)](https://www.pkgpulse.com/blog/mcp-libraries-nodejs-2026)  。与 stdio 不同，Streamable HTTP 允许 MCP 服务器作为网络服务部署，支持多客户端并发访问、会话管理、DNS 重绑定保护等企业级特性。ArcBlock 的 MCP SDK 完整支持 Streamable HTTP，提供了 `StreamableHTTPServerTransport` 类，内置会话 ID 生成、健康检查、优雅关闭等高级功能  [(Github)](https://github.com/ArcBlock/mcp-typescript-sdk)  。

以下是一个典型的 Streamable HTTP 服务器配置示例：

```typescript
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";

const app = express();
app.use(express.json());

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;
  
  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => { transports[sid] = transport; },
    });
    // ... 服务器配置和连接
  }
  await transport.handleRequest(req, res, req.body);
});
```

MCP 协议的消息类型涵盖连接管理、能力发现、资源操作、工具调用、提示获取等多个方面  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  。关键消息类型包括：`initialize`/`initialized`（能力协商）、`ping`（健康检查）、`tools/list`/`tools/call`（工具发现和调用）、`resources/list`/`resources/read`/`resources/subscribe`（资源操作）、`prompts/list`/`prompts/get`（提示模板）、`sampling/createMessage`（LLM 采样请求）等。

#### 1.2.3 核心能力原语

MCP 协议定义了四种核心能力原语，构成 Server 向 Client 暴露功能的完整集合  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  ：

**Resources（资源）** 代表只读的数据暴露，通过 URI 进行唯一标识，支持 MIME 类型声明和动态模板参数。资源的设计灵感来自 RESTful API，但针对 LLM 消费进行了优化——每个资源包含元数据（名称、描述、MIME 类型）和实际内容，Client 可以请求特定资源或获取资源列表，还可以通过订阅机制接收实时更新  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  。对于 OpenStay，典型的资源包括：`property://{id}/details`（房源详情）、`user://{did}/bookings`（用户预订历史）、`market://trends`（市场趋势数据）。资源的只读特性并不意味着数据静态不变——Server 可以通过 `resources/subscribe` 机制支持实时更新推送。

**Tools（工具）** 是可调用的函数或能力，是 MCP 实现"AI 行动能力"的关键机制。每个 Tool 定义包含：名称（唯一标识）、描述（功能说明，供 LLM 理解何时调用）、输入参数 Schema（JSON Schema 或 Zod 格式，描述参数结构和约束）、输出结果 Schema（可选，描述返回值的结构） [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  。LLM 根据用户意图和 Tool 描述，自主决定是否调用以及传入哪些参数。ArcBlock 的 SDK 集成了 Zod 库，提供类型安全的 Schema 定义和运行时验证  [(Github)](https://github.com/ArcBlock/mcp-typescript-sdk)  。OpenStay 的核心业务操作都将封装为 Tools，例如 `property.search`、`booking.create`、`payment.process`、`dispute.resolve` 等。

**Prompts（提示）** 是可复用的消息模板，帮助 LLM 以一致的方式完成特定任务。Prompts 可以参数化，允许动态插入上下文信息，支持预定义的交互模式，简化常见操作的使用  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  。对于 OpenStay，可以定义 `booking-confirmation`（预订确认邮件模板）、`dispute-resolution`（争议调解对话引导）、`host-onboarding`（新房东入驻指导）等 Prompts。

**Sampling（采样）** 是 MCP 的高级特性，允许 Server 在需要时请求 Host 的 LLM 能力，实现"反向调用"  [(modelcontextprotocol.io)](https://modelcontextprotocol.io/specification/2025-11-25)  。这一机制使得 MCP Server 不再是单纯的被动响应者，而是能够主动利用 LLM 的认知能力完成复杂任务。典型应用场景包括：Server 获取原始数据后请求 LLM 生成摘要或分析、需要理解自然语言输入时委托 LLM 进行意图解析、复杂决策场景下收集信息后请求 LLM 提供建议。对于 OpenStay，Sampling 可用于智能客服场景——当用户提出模糊投诉时，Server 请求 LLM 分析情绪、识别关键问题、生成妥善回复建议。

### 1.3 ArcBlock 对 MCP 的增强与扩展

#### 1.3.1 原生协议集成：Blocklet 即 MCP Server

ArcBlock 将 MCP 协议深度整合到其 **Blocklet 开发框架** 中，实现了 **"Blocklet 即 MCP Server"** 的架构范式  [(ArcBlock)](https://www.arcblock.io/content/blog/en/ai-and-blockchain)  。这一设计的核心在于：每个 Blocklet 在部署时可以选择性地启用 MCP 服务端能力，将自身的业务功能自动转换为标准 MCP 接口，无需额外的适配层或网关转换。

Blocklet 作为 ArcBlock 生态的核心应用单元，具备自包含、可验证、易分发的特性，与 MCP 服务器的部署需求高度契合  [(The Coin Bureau)](https://coinbureau.com/review/arcblock-abt)  。ArcBlock 提供的 **MCP TypeScript SDK**（`@arcblock/mcp-typescript-sdk`）基于官方实现进行扩展，增加了对 ArcBlock 特有功能的支持：Blocklet 生命周期集成（MCP Server 启动与 Blocklet 服务启动绑定）、DID 身份自动注入（连接建立时自动验证客户端 DID）、ABT 网络原生支持（内置与 ArcBlock 主链、侧链的交互能力） [(Github)](https://github.com/ArcBlock/mcp-typescript-sdk)  。

开发者可以通过声明式配置定义暴露的 MCP 能力：

```yaml
# blocklet.yml 中的 MCP 配置示例
mcp:
  version: "2024-11-05"
  tools:
    - name: property.search
      description: 根据条件搜索可用房源
      inputSchema: ./schemas/property-search.json
    - name: booking.create
      description: 创建预订请求
      inputSchema: ./schemas/booking-create.json
  resources:
    - uriTemplate: property://{id}/details
      description: 获取特定房源的详细信息
      mimeType: application/json
```

运行时，Blocklet 框架自动将这些声明转换为标准的 MCP Server 实现，处理所有协议细节。这种"约定优于配置"的方法使开发者能够专注于业务逻辑，同时确保输出的服务完全符合 MCP 规范  [(ArcBlock)](https://www.arcblock.io/content/blog/en/ai-and-blockchain)  。

#### 1.3.2 DID 身份层增强：解决 MCP 身份验证缺口

MCP 基础协议在身份验证方面存在已知的设计缺口。2026 年 3 月的一项研究扫描了约 2000 个 MCP 服务器，发现全部缺乏身份验证机制，这使得 AI 代理在调用外部工具时面临严重的安全和信任风险  [(arXiv.org)](https://arxiv.org/html/2603.24775v1)  。ArcBlock 通过集成其成熟的 **DID（去中心化标识符）** 体系，为这一问题提供了生产级的解决方案  [(ArcBlock)](https://www.arcblock.io/blog/en/proof-of-personhood-vs-digital-identity)  。

ArcBlock 的 DID 实现基于 W3C 国际标准，自 2019 年起就是该领域的先行者，推出了业界首个真正的去中心化身份钱包 **ABT Wallet**  [(PR Newswire)](https://www.prnewswire.com/news-releases/arcblock-announces-new-decentralized-identity-solution-and-first-of-its-kind-did-wallet-300851170.html)  。DID 在 MCP 中的增强体现在三个层面：

| 增强维度 | 具体机制 | 解决的问题 |
|:---|:---|:---|
| **认证层面** | 每个 MCP 请求携带调用者 DID 和签名，服务端通过区块链验证 | 调用方身份真实性验证 |
| **授权层面** | 基于 DID 的可验证凭证（VC）实现属性基授权 | 细粒度权限控制，无需暴露完整身份 |
| **审计层面** | 所有关键操作记录在链上，形成不可篡改的日志 | 操作可追溯，争议可解决 |

ArcBlock 的 DID 认证协议涉及三个核心参与方：**WALLET**（用户端代理，如 ABT Wallet）、**DAPP**（去中心化应用）、**REGISTRY_CHAIN**（去中心化信任锚点，即 ABT 链） [(Github)](https://github.com/ArcBlock/abt-did-spec/blob/master/README.md)  。这一三方模型自然扩展到 MCP 场景：MCP Client 作为 WALLET 的扩展，MCP Server 作为 DAPP 的扩展，所有身份验证事件记录在 ABT 链上。

**MCP-I（Model Context Protocol Identity）** 协议进一步扩展了这一能力，定义了三个合规级别  [(modelcontextprotocol-identity.io)](https://modelcontextprotocol-identity.io/faq)  ：

| 级别 | 要求 | 应用场景 |
|:---|:---|:---|
| **Level 1（代理级）** | 代理具有稳定的 DID | 基础服务调用 |
| **Level 2（代理+用户级）** | 用户向代理颁发可验证凭证 | 敏感操作授权 |
| **Level 3（代理+用户+服务级）** | 完整的凭证生命周期管理和选择性披露 | 金融级合规场景 |

对于 OpenStay，DID 增强的 MCP 身份验证可以实现：旅客使用 DID Wallet 登录，无需密码；房东通过可验证凭证证明房产所有权；AI 代理以独立 DID 身份代表用户执行操作，所有行为可追溯可审计。

#### 1.3.3 加密支付层整合：实现 AI 代理自主经济行为

ArcBlock 将加密货币支付原生集成到 MCP 协议栈中，使 AI 代理能够执行真正的自主经济行为  [(ArcBlock)](https://www.arcblock.io/content/blog/en/ai-and-blockchain)  。Robert Mao 明确指出，**身份和支付是 AI 代理经济的两大核心组件**，而加密货币凭借其速度和安全性，是实现 AI 代理间无缝、自动交易的天然选择  [(ArcBlock)](https://www.arcblock.io/content/blog/en/ai-and-blockchain)  。

ArcBlock 的 **Payment Kit** 为这一愿景提供了基础设施支持。Payment Kit 是一个 Blocklet，提供完全去中心化的加密货币支付处理，支持 ArcBlock 原生 ABT 代币、EVM 兼容链上的代币，以及通过 Stripe 集成的法币支付  [(ArcBlock)](https://www.arcblock.io/blog/en/introducing-payment-kit)  。其核心特性包括：

| 特性 | 说明 | MCP 集成方式 |
|:---|:---|:---|
| 零中间商费用 | 加密交易无第三方抽成 | `payment/crypto/quote` + `payment/crypto/execute` 工具 |
| 秒级确认 | 交易在数秒内完成 | 实时状态资源 `payment://{txId}/status` |
| 无拒付风险 | 区块链交易不可逆 | 智能合约托管自动释放 |
| 灵活计费模式 | 一次性、订阅、按量、流支付 | 参数化工具配置 |
| 多链兼容 | ArcBlock、EVM 链、即将支持比特币闪电网络 | 链选择参数 |

MCP 在支付场景中的优势尤为明显  [(aurpay.net)](https://aurpay.net/aurspace/what-is-mcp-ai-agents-payment-apis/)  。支付是状态化的（发票经历创建、待处理、部分支付、确认、结算、过期等生命周期），时间敏感的（零确认与六确认的加密支付含义完全不同），且高度结构化（金额、货币、地址、交易哈希、时间戳）。这些特性与 MCP 的强类型工具模型完美匹配，使 AI 代理能够以高精度、低幻觉风险地操作支付数据。

通过 Payment Kit 与 MCP 的集成，OpenStay 可以实现：AI 代理自动查询支付状态并回复客户咨询；treasury 代理每日生成收入摘要；checkout 代理在客户选择加密支付时创建发票、嵌入二维码并轮询支付状态直至确认  [(aurpay.net)](https://aurpay.net/aurspace/what-is-mcp-ai-agents-payment-apis/)  。

#### 1.3.4 AIGNE 框架深度集成：AI 代理编排与 MCP 服务发现

**AIGNE（AI Agent Network Engine）** 是 ArcBlock 推出的 AI 原生应用开发框架，与 MCP 协议深度集成  [(ArcBlock)](https://www.arcblock.io/content/blog/en/ai-and-blockchain)  。AIGNE 的核心理念是将 AI 代理视为可组合、可编排的计算单元，而 MCP 则提供了代理与外部世界交互的标准接口。

AIGNE 框架中的 **MCPAgent** 类是 MCP 集成的核心抽象：

```typescript
import { MCPAgent } from '@arcblock/aigne-framework';

const openstayAgent = await MCPAgent.from({
  url: 'https://mcp.openstay.io/mcp',
  transport: 'streamableHttp',
  opts: {
    headers: {
      'Authorization': 'Bearer ' + await getAccessToken(),
    },
  },
});

// 将 OpenStay 能力集成到 AIGNE 工作流
const travelPlanner = new AIAgent({
  skills: [...openstayAgent.skills],
});
```

AIGNE 框架提供了 **MCP 服务发现机制**。Blocklet Store 中的每个应用都可以声明其 MCP 端点，AIGNE 运行时自动索引这些声明，使 AI 代理能够动态发现新服务而无需硬编码配置  [(ArcBlock)](https://www.arcblock.io/content/docs/aigne-cli/zh/aigne-cli-commands-serve-mcp)  。框架还支持工作流模式（顺序、并发、路由、交接），使多个 MCP 服务的组合能够构建复杂的业务逻辑  [(Libraries.io)](https://libraries.io/npm/@aigne%2Fexample-mcp-server-github-integrator)  。

对于 OpenStay 项目，AIGNE 框架的价值在于：快速构建能够调用 MCP 服务的 AI 代理；编排多个 MCP 服务器（身份验证、支付、存储等）完成复杂业务流程；利用 AIGNE Hub 进行代理的发现和共享。

## 2. MCP 应用场景与 ArcBlock 生态定位

### 2.1 通用应用场景

#### 2.1.1 AI 助手与外部系统交互

MCP 最直接的应用场景是增强 AI 助手与外部系统的交互能力。传统上，ChatGPT、Claude 等对话式 AI 虽然具备强大的语言理解和生成能力，但与外部世界的连接通常局限于预定义的插件或需要复杂的自定义集成  [(ArcBlock)](https://www.arcblock.io/blog/en/mcp-for-non-technical-builders)  。MCP 通过标准化这一连接层，使 AI 助手能够以统一的方式访问数据库、API、文件系统等多样化资源。

在住宿预订行业，这一应用场景具有直接的商业价值。传统的在线旅行社（OTA）平台通常拥有复杂的用户界面，用户需要在多个页面之间跳转才能完成搜索、比较、预订和支付等操作。通过 MCP 集成，用户可以直接向 AI 助手表达需求（如"帮我找一家东京市中心、每晚预算 200 美元以内、有免费 WiFi 的民宿"），AI 助手则自动调用 OpenStay 的 MCP Server 完成房源搜索、筛选和排序，并以对话形式呈现结果  [(ArcBlock)](https://www.arcblock.io/content/blog/ja/model-context-protocol-vs-apis)  。

ArcBlock 官方博客给出了生动的对比示例：想象一个使用 AIGNE 构建的代理，管理 ArcBlock 平台上的去中心化市场。采用传统 API 方式，需要为库存管理、价格查询、订单处理等多个系统集成编写自定义代码；而采用 MCP，代理可以动态发现库存工具、获取实时库存数据、更新商品列表——全部通过标准化协议完成  [(ArcBlock)](https://www.arcblock.io/content/blog/ja/model-context-protocol-vs-apis)  。

#### 2.1.2 多工具编排与复杂工作流自动化

MCP 的标准化接口使多工具编排成为可能。AI 代理可以动态发现和组合多个 MCP 服务器的能力，构建复杂的工作流。例如，一个旅行规划代理可以：

| 步骤 | 涉及 MCP Server | 执行操作 |
|:---|:---|:---|
| 1 | 日历 MCP Server | 查询用户的空闲时间 |
| 2 | 航班 MCP Server | 搜索合适的航班 |
| 3 | 酒店 MCP Server（OpenStay） | 查找住宿 |
| 4 | 支付 MCP Server | 完成预订支付 |
| 5 | 邮件 MCP Server | 发送确认信息 |

这种编排不是硬编码的，而是 AI 代理根据用户意图动态规划的。MCP 的工具描述使 AI 能够理解每个工具的功能和约束，自主决定调用顺序和参数  [(Lucidworks)](https://lucidworks.com/blog/real-world-examples-of-mcp-in-action-from-chatbots-to-enterprise-copilots)  。

ArcBlock 在其 AI 热点日报生成管道中展示了这一能力  [(Github)](https://github.com/ArcBlock/ai-hotspot-daily)  。该系统包含两个完整的工作流，每个步骤都是独立的 AI 代理，通过 MCP 工具与外部系统交互，步骤之间通过 AIGNE 框架编排。这种设计实现了高度的模块化和可扩展性——新增数据源只需添加对应的 MCP Server，无需修改核心流程。

#### 2.1.3 跨平台 AI 能力共享与复用

MCP 的标准化设计使 AI 能力能够在不同平台间共享。一个组织开发的 MCP Server 可以被任何兼容的 AI 应用调用，无需额外的适配工作。这种复用机制类似于 npm 包管理器对 JavaScript 生态的贡献，但针对的是 AI 可调用的服务能力  [(ArcBlock)](https://www.arcblock.io/content/blog/7-ways-mcp-transforms-ai-development-arcblock)  。

目前，MCP 生态系统已拥有超过 **10,000 个活跃的公共服务器** 和每月 **9700 万次 SDK 下载**，正迅速成为 AI 行业的共享基础设施  [(aurpay.net)](https://aurpay.net/aurspace/what-is-mcp-ai-agents-payment-apis/)  。这种丰富的能力库使 AI 应用开发者能够快速构建功能强大的应用，而无需从头实现每个集成。

### 2.2 ArcBlock 生态特色场景

#### 2.2.1 去中心化 AI 服务市场

ArcBlock 将 MCP 与区块链技术结合，构建了独特的去中心化 AI 服务市场。与传统云市场的关键区别在于：

| 维度 | 中心化云市场（AWS Marketplace 等） | ArcBlock MCP 市场 |
|:---|:---|:---|
| 准入门槛 | 需要企业资质审核、合同谈判 | 任何人部署 Blocklet 即可自动暴露 MCP 服务 |
| 定价机制 | 平台控制，固定费率或协商 | 链上透明定价，支持动态拍卖和订阅 |
| 支付结算 | 法币，平台托管，结算周期长 | ABT 代币，智能合约自动结算，实时到账 |
| 服务发现 | 中心化目录，搜索排名受平台控制 | 去中心化索引，声誉驱动排序 |
| 数据主权 | 服务数据存储于平台基础设施 | 用户 DID Space 自主控制，可验证计算 |

这一市场的经济模型设计是**双边激励**：服务提供者获得 ABT 收入，服务消费者获得 AI 增强的能力；平台通过交易手续费和网络效应增值，而非抽取高额佣金  [(Gate.io)](https://web.gate.it/zh-tw/crypto-wiki/article/arcblock-next-gen-cloud-native-blockchain-platform-for-dapp-innovation)  。

#### 2.2.2 自主 AI 代理经济（Agent Economy）

ArcBlock 对 MCP 的长远愿景是支撑 **"自主 AI 代理经济"**  [(ArcBlock)](https://www.arcblock.io/content/blog/en/ai-and-blockchain)  。在这一愿景中，AI 代理不仅是人类用户的工具，更是独立的经济参与者：它们可以拥有数字身份（DID）、持有和管理加密资产、自主决策并执行交易、与其他代理协作或竞争。

MCP 是这一经济的基础设施层——它定义了代理间交互的标准协议，使不同开发者、不同平台创建的代理能够无缝协作。对于 OpenStay，这意味着可以设计专门的"房源管理代理"（代表房东优化定价、响应咨询、处理预订）和"旅行规划代理"（代表旅客搜索房源、比较选项、协商价格），这些代理在 MCP 协议下自主交互，人类用户只需设定目标和约束条件。

#### 2.2.3 DID 驱动的可信 AI 交互

在 AI 生成内容日益泛滥的时代，内容的真实性和来源验证成为关键挑战。ArcBlock 的 DID 协议与 MCP 结合，为这一问题提供了解决方案。每个 MCP 服务器和 AI 代理都可以拥有独立的 DID，所有交互都可以通过数字签名验证来源  [(ArcBlock)](https://www.arcblock.io/blog/en/proof-of-personhood-vs-digital-identity)  。

在 OpenStay 场景中，这意味着：房源信息可以由房东 DID 签名，确保真实性；用户评价与用户的 DID 绑定，防止虚假评价；AI 代理的推荐行为可追溯，建立可审计的责任链。这种可信交互机制对于建立用户对 AI 驱动服务的信任至关重要。

#### 2.2.4 区块链原生 AI 应用开发

ArcBlock 为区块链原生 AI 应用开发提供了完整的技术栈。开发者可以使用 Blocklet Framework 构建应用后端，使用 AIGNE 框架开发 AI 代理，使用 DID 协议管理身份，使用 Payment Kit 处理支付，而 MCP 则作为统一的接口层将这些能力暴露给 AI 模型  [(ArcBlock)](https://www.arcblock.io/blog/en/ai-agents-on-arcblock)  。

这种技术栈的优势在于：所有组件都针对去中心化场景优化，避免了传统 Web2 技术与区块链的摩擦；统一的开发体验降低了学习成本；模块化的架构使开发者可以按需选择和替换组件。

### 2.3 Blocklet 与 MCP 的协同模式

#### 2.3.1 Blocklet 作为 MCP Server 的部署形态

Blocklet 作为 ArcBlock 的核心部署单元，可以自然地承载 MCP 服务器功能。一个 Blocklet 可以同时提供传统的 HTTP API 和 MCP 接口，服务不同类型的客户端  [(ArcBlock)](https://www.arcblock.io/content/blog/7-ways-mcp-transforms-ai-development-arcblock)  。Blocklet 的声明式配置（`blocklet.yml`）可以扩展为包含 MCP 能力描述，使 Blocklet Store 能够展示和索引 MCP 服务  [(来源)](about:blank)  。

Blocklet 的生命周期管理与 MCP 服务器的运行需求高度契合：Blocklet Server 负责容器的启动、停止、监控和自动恢复；Blocklet 的日志和指标收集机制可以扩展为包含 MCP 特定的遥测数据；Blocklet 的更新机制支持 MCP 服务器的无缝升级。

#### 2.3.2 Blocklet 作为 MCP Client 的消费模式

Blocklet 也可以作为 MCP 客户端，消费其他 MCP 服务器提供的能力。AIGNE 框架为 Blocklet 作为 MCP Client 提供了高级抽象。开发者可以使用 MCPAgent 类连接到远程 MCP 服务器，将暴露的工具、资源和提示作为 AIGNE 工作流的一部分使用  [(npm)](https://www.npmjs.com/package/@aigne/example-mcp-puppeteer)  。框架的编排能力支持多个 MCP 服务的组合，构建复杂的业务逻辑。

#### 2.3.3 Blocklet 市场与 MCP 服务发现机制

Blocklet Store（Blocklet 市场）可以扩展为 MCP 服务发现机制。每个发布到市场的 Blocklet 可以声明其提供的 MCP 能力，包括工具列表、资源模式、认证要求等。AI 代理（包括 AIGNE 框架中的代理）可以查询市场，发现满足需求的 MCP 服务，并自动完成安装和配置  [(来源)](about:blank)  。

这种服务发现机制对于构建动态的、可扩展的 AI 应用生态系统至关重要。它使 AI 代理能够在运行时发现新能力，而不是依赖预配置的固定服务列表。结合 ArcBlock 的 DID 和支付层，这一机制还支持服务的可信验证和经济结算。

## 3. OpenStay 项目 MCP 接入总体架构

### 3.1 OpenStay 项目背景分析

#### 3.1.1 项目定位：基于 ArcBlock 的去中心化住宿预订平台

OpenStay（https://github.com/shenxiuqiang/OpenStay）是一个基于 ArcBlock 生态构建的去中心化住宿预订平台。该项目旨在利用区块链技术解决传统住宿预订行业中的信任问题、高佣金问题和数据垄断问题。通过 ArcBlock 的 DID 协议，OpenStay 实现了用户自主身份管理；通过智能合约，实现了无需中介的信任租赁协议；通过加密支付，实现了全球无障碍的资金流转  [(arcblock.io)](https://community.arcblock.io/discussions/aeb72e68-d206-4e7a-b959-aa8f2944075d)  。

作为去中心化应用，OpenStay 面临与传统 Web2 平台不同的挑战：用户需要管理加密钱包和私钥，增加了使用门槛；智能合约交互需要理解区块链概念，对普通用户不够友好；跨链资产管理和支付流程复杂，容易出错。这些挑战正是 MCP 和 AI 代理可以发挥价值的领域。

#### 3.1.2 现有技术栈与架构梳理

基于 ArcBlock 生态的典型技术栈，OpenStay 的技术架构包含以下组件：

| 层级 | 技术组件 | 功能描述 | MCP 集成点 |
|:---|:---|:---|:---|
| **身份层** | DID Wallet、DID Connect | 用户身份管理和无密码登录 | DID 身份验证 Tools |
| **合约层** | ArcBlock 智能合约（Solidity/Rust） | 房源注册、预订管理、支付托管、争议仲裁 | 合约交互 Tools |
| **存储层** | DID Spaces、IPFS/Arweave | 用户私有数据、房源媒体文件、元数据索引 | 数据读写 Resources |
| **支付层** | Payment Kit、ABT Network | 加密货币支付、托管分账、结算清算 | 支付处理 Tools |
| **应用层** | Blocklet Framework、React/Vue 前端 | Web 应用界面、管理后台 | MCP Server 部署 |
| **集成层** | OCAR、跨链桥 | 多链资产互操作、外部链接入 | 跨链交互 Tools |

MCP 接入需要在现有架构基础上增加 MCP 服务器层，将各层能力暴露为 AI 可调用的接口。这一层应该与现有 API 层共存，服务不同类型的客户端（传统 Web 客户端和 AI 代理）。

#### 3.1.3 MCP 接入的价值主张与目标

OpenStay 接入 MCP 的核心价值主张包括：

| 价值维度 | 具体目标 | 预期效果 |
|:---|:---|:---|
| **用户体验升级** | AI 代理可以代表用户完成复杂的区块链操作，用户只需用自然语言描述意图 | 将平均预订时间从 15 分钟缩短至 3 分钟以内 |
| **运营效率提升** | AI 代理自动化处理 80% 以上的常规咨询和纠纷 | 客服成本降低 60% |
| **生态集成扩展** | 通过 MCP 标准接口，OpenStay 服务可被第三方 AI 应用发现和调用 | 吸引 10+ 第三方应用集成 |
| **创新商业模式** | AI 代理经济为 OpenStay 带来新的商业模式可能 | AI 旅行顾问服务、动态定价优化、智能收益管理 |

具体目标包括：Q2 2025 完成核心 MCP Server 的开发和测试网部署，支持房源搜索、预订查询和支付报价等基础功能；Q3 2025 主网上线并与 3-5 个 AI 旅行代理集成；Q4 2025 实现日均 1000+ MCP 调用。

### 3.2 MCP 接入架构设计

#### 3.2.1 服务端架构：OpenStay MCP Server 部署

OpenStay MCP Server 作为独立的 Blocklet 部署，与现有后端服务解耦，但共享数据库和区块链连接。这种架构具有以下优势：独立扩展（MCP 服务的负载模式可能与 Web API 不同，独立部署允许针对性的资源分配）、安全隔离（MCP 接口的认证授权机制可以与 Web API 不同，独立部署减少攻击面）、技术演进（MCP 协议快速演进，独立部署便于及时升级）。

基于 ArcBlock MCP TypeScript SDK 的服务端实现结构如下：

```typescript
// 基于 ArcBlock MCP SDK 的服务器初始化
import { Server } from '@arcblock/mcp-server';

const server = new Server({
  name: 'openstay-mcp-server',
  version: '1.0.0',
});

// 注册工具
server.registerTool('property/search', propertySearchSchema, async (params) => {
  // 调用 OpenStay 后端 API 或查询数据库
});

server.registerTool('booking/create', bookingCreateSchema, async (params) => {
  // 构建并提交智能合约交易
});

// 注册资源
server.registerResource('user://{did}/bookings', async (uri, params) => {
  // 返回用户的预订列表
});

// 启动服务器，支持多种传输方式
await server.start({
  transport: 'streamableHttp', // 或 'sse', 'stdio'
  port: 3000,
});
```

**传输层配置**：Streamable HTTP 传输层配置应该包括 TLS 1.3 强制加密、OAuth 2.1 认证端点集成、请求速率限制、连接池管理。与现有 Blocklet 服务的集成策略应该通过内部 API 或消息队列实现，避免直接数据库访问导致的耦合。

#### 3.2.2 客户端架构：AI 代理与 MCP 服务消费

客户端架构需要支持两种主要场景：AIGNE 框架原生集成和第三方 MCP Client 兼容。

**AIGNE 框架集成路径** 是 ArcBlock 生态的首选方式：

```typescript
import { MCPAgent } from '@aigne/core';

const openstayAgent = await MCPAgent.from({
  url: 'https://mcp.openstay.io/mcp',
  transport: 'streamableHttp',
  opts: {
    headers: {
      'Authorization': 'Bearer ' + await getAccessToken(),
    },
  },
});

// 将 OpenStay 能力集成到 AIGNE 工作流
const travelPlanner = new AIAgent({
  skills: [...openstayAgent.skills],
});
```

**第三方 MCP Client 兼容性设计** 确保 OpenStay 能够被更广泛的 AI 生态系统使用：严格遵循 MCP 协议规范，避免 ArcBlock 特定的扩展；提供清晰的工具描述和示例；支持标准的 OAuth 2.1 认证流程；提供沙盒环境供开发者测试。

#### 3.2.3 安全架构：DID 身份与加密通信

安全架构的核心是将 ArcBlock 的 DID 优势与 MCP 的 OAuth 2.1 基础相结合，形成独特的身份验证方案：

| 安全层面 | 机制 | 实现细节 |
|:---|:---|:---|
| 传输安全 | TLS 1.3 强制 | Blocklet Server 自动配置 |
| 身份验证 | DID 挑战-响应 + OAuth 2.1 | 每次连接重新验证 DID，会话令牌管理 |
| 消息完整性 | ED25519 签名 | 每个 JSON-RPC 消息签名 |
| 授权检查 | 基于角色的权限 + 资源级 ACL | RBAC + ABAC 混合模型 |
| 审计日志 | 链上记录 | 关键操作提交 ABT 网络 |

**服务端身份认证机制**：OpenStay MCP Server 作为 OAuth 2.1 资源服务器，验证每个请求的访问令牌。令牌可以通过多种方式获取：传统 OAuth 流程（适用于人类用户）、DID 签名验证（适用于 ArcBlock 生态用户）、客户端凭证流（适用于服务间调用）。

**客户端授权与权限控制**：基于 DID 的细粒度授权，将权限与 DID 绑定的可验证凭证关联。例如，房东 DID 持有"房源所有者"凭证，才能调用房源更新工具；平台运营方 DID 持有"管理员"凭证，才能访问敏感运营数据。

### 3.3 开发环境准备

#### 3.3.1 ArcBlock MCP SDK 安装与配置

ArcBlock 提供 TypeScript/JavaScript MCP SDK，可通过 npm 安装：

```bash
npm install @arcblock/mcp-server @arcblock/mcp-client
# 或
yarn add @arcblock/mcp-server @arcblock/mcp-client
```

SDK 配置需要指定：服务器元数据（名称、版本、描述）、传输方式及参数、认证提供者、日志级别和遥测配置。开发环境建议使用 stdio 传输便于调试，生产环境使用 StreamableHTTP 以获得最佳性能。

#### 3.3.2 开发工具链与调试环境

推荐的开发工具链包括：

| 工具 | 用途 | 配置要点 |
|:---|:---|:---|
| VS Code + MCP 插件 | 代码编辑和测试 | 语法高亮、智能提示 |
| Claude Desktop / Cursor | MCP Client 测试工具 | 配置 `claude_desktop_config.json` |
| AIGNE Monitor | 可视化代理工作流 | 代理执行轨迹、调用详情 |
| ArcBlock CLI | Blocklet 管理和部署 | `blocklet dev` 本地预览 |
| MCP Inspector | 协议级调试 | JSON-RPC 消息查看 |

本地调试环境可以使用 AIGNE 框架提供的开发服务器，支持热重载和详细日志输出。

#### 3.3.3 测试网络与主网部署策略

| 阶段 | 环境 | 目标 | 关键活动 |
|:---|:---|:---|:---|
| **开发** | 本地 | 功能验证 | 单元测试、集成测试、MCP 协议合规测试 |
| **测试** | ArcBlock 测试网 | 集成验证 | 与测试网合约交互、模拟真实负载、安全审计 |
| **预发布** | 主网镜像 | 生产演练 | 有限真实用户、监控和告警验证、回滚演练 |
| **生产** | ArcBlock 主网 | 全面上线 | 分阶段流量切换、持续监控、应急响应 |

Blocklet 打包使用 `blocklet bundle` 命令，发布到 Blocklet Store 或私有仓库。密钥管理应该使用 ArcBlock 的 Vault 解决方案，避免硬编码敏感信息。

## 4. MCP 在身份验证与授权中的应用

### 4.1 基于 DID 的身份验证体系

#### 4.1.1 用户 DID 注册与绑定

OpenStay 的 MCP 身份验证体系以 ArcBlock 的 DID 协议为核心，为不同类型的用户建立可验证的数字身份：

**旅客 DID 身份创建流程**：新用户通过 DID Wallet 应用创建自托管身份，生成唯一的 DID 标识符和对应的密钥对。用户可以选择将 DID 与邮箱、手机号等传统身份因子绑定，增强可恢复性。MCP 工具 `identity/traveler/register` 接受 DID 和可选的验证信息，在 OpenStay 系统中创建旅客档案，并发放"已验证旅客"可验证凭证（VC）。

**房东/物业方 DID 身份验证**：房东身份需要更强的验证，通常包括政府 ID 验证、房产所有权证明、银行账户验证等。MCP 工具 `identity/host/verify` 启动多步骤验证流程，可能涉及第三方 KYC 服务、文档上传和人工审核。验证通过后，发放"已验证房东"VC，其中包含验证级别和授权范围。

**第三方服务提供商身份接入**：清洁服务、维修服务等第三方提供商也需要 DID 身份，但其权限范围受限。MCP 工具 `identity/service/register` 创建服务提供商档案，关联到具体的服务类别和地理区域。

#### 4.1.2 MCP 工具：身份验证接口设计

OpenStay MCP Server 暴露以下身份验证相关工具：

| 工具名称 | 功能描述 | 输入模式 | 输出模式 | 权限要求 |
|:---|:---|:---|:---|:---|
| `identity/verify` | 验证 DID 签名有效性 | `{ did: string, challenge: string, signature: string }` | `{ verified: boolean, credentials: VC[] }` | 无（公开） |
| `identity/authenticate` | 启动多因素认证流程 | `{ did: string, factors: AuthFactor[] }` | `{ sessionToken: string, expiresAt: number }` | 需初始验证 |
| `identity/session` | 查询会话状态和权限 | `{ sessionToken: string }` | `{ active: boolean, did: string, permissions: string[] }` | 需有效令牌 |
| `identity/logout` | 终止会话 | `{ sessionToken: string }` | `{ success: boolean }` | 需有效令牌 |

`identity/verify` 工具实现核心的 DID 签名验证。挑战-响应机制防止重放攻击：服务器生成随机挑战字符串，客户端使用 DID 的私钥签名，服务器用 DID 文档中的公钥验证签名。验证成功后，服务器查询与该 DID 关联的所有可验证凭证，返回给调用方用于授权决策。

`identity/authenticate` 工具支持多因素认证，特别是对于高敏感操作（如大额支付、房源转让）。认证因素可以包括：DID Wallet 签名（必需）、邮箱/短信验证码、生物识别（通过 DID Wallet 集成）、硬件安全密钥。

#### 4.1.3 零知识证明与隐私保护

DID 协议与零知识证明（ZKP）技术结合，实现选择性身份属性披露。在 OpenStay 场景中，这具有重要隐私价值：

| 应用场景 | 证明内容 | 不暴露内容 |
|:---|:---|:---|
| 年龄验证 | 旅客年满 18 岁或 21 岁 | 具体出生日期 |
| 资质验证 | 房东拥有合法出租资质 | 完整营业执照信息 |
| 信用验证 | 用户信用评分达到某阈值 | 具体分数和历史 |
| 资金能力 | 账户有足够资金完成预订 | 具体余额和资产明细 |

MCP 资源 `did://{userDid}/zkp/{attribute}` 提供零知识证明生成接口。客户端指定要证明的属性和约束条件，服务器返回 ZKP 证明，可以在不暴露原始数据的情况下完成验证。

### 4.2 细粒度授权机制

#### 4.2.1 基于角色的访问控制（RBAC）

OpenStay 定义了清晰的角色体系和对应的权限集：

| 角色 | 权限范围 | 典型操作 |
|:---|:---|:---|
| **旅客（Traveler）** | 个人预订管理、个人信息管理 | 搜索房源、创建预订、取消预订、评价房源、更新个人资料 |
| **房东（Host）** | 自有房源管理、预订响应、收益管理 | 注册房源、更新房源信息、确认/拒绝预订、设置价格策略、查看收益报告 |
| **平台运营（Operator）** | 平台级管理、争议仲裁、合规监控 | 审核房源、处理争议、查看运营指标、执行合规操作 |
| **服务提供商（ServiceProvider）** | 受限的服务执行 | 更新清洁状态、提交维修报告 |
| **AI 代理（AIAgent）** | 用户委托的权限范围 | 根据用户授权执行操作，权限不超过委托用户 |

RBAC 通过 MCP 的 OAuth 2.1 范围（scope）机制实现。访问令牌包含授权的角色列表，MCP 服务器在每个工具调用前验证调用者是否拥有所需角色。

#### 4.2.2 资源级授权策略

除了角色，OpenStay 还实现了资源级的细粒度授权：

**房源信息访问权限**：房源数据分为公开和私有字段。公开字段（位置区域、价格范围、设施类型）对所有用户可见；私有字段（精确地址、房东联系方式、历史预订数据）仅对已确认预订的旅客或授权代理可见。MCP 资源 `property://{propertyId}/public` 和 `property://{propertyId}/private` 分别暴露不同级别的数据。

**预订记录查询权限**：旅客只能查看自己的预订；房东可以查看与自己房源相关的预订；平台运营可以查看所有预订用于合规和审计。MCP 工具 `booking/query` 自动根据调用者身份过滤结果。

**支付操作执行权限**：支付发起需要旅客身份确认；托管释放需要房东和平台双方确认（多签）；退款操作需要平台运营授权。MCP 工具 `payment/*` 系列实现了这些权限检查。

#### 4.2.3 动态授权与委托

OpenStay 支持临时权限授予和委托场景：

**临时权限授予**：旅客可以临时授权 AI 代理或第三方服务代表自己执行特定操作。MCP 工具 `delegation/grant` 创建有限范围的委托令牌，指定：被委托方 DID、授权操作列表、有效期、使用次数限制。例如，旅客可以授权旅行规划 AI 在接下来 24 小时内为自己预订最多 3 个住宿。

**权限回收与审计追踪**：委托可以随时通过 `delegation/revoke` 回收。所有委托和权限使用记录上链存储，提供完整的审计追踪。MCP 资源 `did://{userDid}/delegations` 查询当前有效的委托列表。

### 4.3 MCP 身份资源暴露

#### 4.3.1 `did://{userDid}/profile`：用户档案资源

用户档案资源暴露经过授权的身份信息。响应结构根据请求者的权限动态调整：

```json
// 公开访问（其他用户）
{
  "did": "did:abt:z1...",
  "profileType": "traveler|host|service|agent",
  "displayName": "Alice Chen",
  "avatar": "ipfs://Qm...",
  "verificationLevel": "basic|verified|premium",
  "joinedAt": "2024-03-15T08:30:00Z",
  "statistics": {
    "bookingsAsTraveler": 12,
    "bookingsAsHost": 0,
    "reviewsGiven": 8,
    "reviewsReceived": 0
  },
  "publicCredentials": ["vc:abt:traveler:verified:..."]
}

// 本人或授权应用访问（增加敏感字段）
{
  // ... 公开字段
  "email": "alice@example.com",
  "phone": "+86-138****8888",
  "preferences": {
    "currency": "CNY",
    "language": "zh-CN",
    "notifications": ["email", "push"]
  },
  "paymentMethods": [...]
}
```

#### 4.3.2 `did://{userDid}/credentials`：可验证凭证资源

可验证凭证资源列出用户持有的所有 VC，但仅暴露凭证元数据和声明类型，不暴露具体声明值（保护隐私）：

```json
{
  "credentials": [
    {
      "id": "vc:abt:age:over18:...",
      "type": "AgeVerificationCredential",
      "issuer": "did:abt:z2...",
      "issuedAt": "2024-01-10T00:00:00Z",
      "expiresAt": "2029-01-10T00:00:00Z",
      "claims": ["ageOver"], // 仅声明类型
      "proofType": "BBS+"
    }
  ]
}
```

需要验证具体声明值时，使用 ZKP 流程。

#### 4.3.3 `did://{userDid}/reputation`：平台信誉评分资源

信誉评分是 OpenStay 平台的重要激励机制：

```json
{
  "overallScore": 4.7,
  "scoreBreakdown": {
    "reliability": 4.8,
    "communication": 4.6,
    "cleanliness": 4.7
  },
  "reviewCount": 15,
  "platformActivities": {
    "successfulBookings": 12,
    "disputesInitiated": 0,
    "disputesResolved": 0
  },
  "onChainProof": "0x..." // 信誉数据的上链证明
}
```

信誉数据定期上链，确保不可篡改和跨平台可验证。

## 5. MCP 在智能合约交互中的应用

### 5.1 住宿预订核心合约交互

#### 5.1.1 房源管理合约

房源管理是 OpenStay 的核心功能，MCP 工具将复杂的合约交互封装为 AI 可调用的接口：

**`property/register`** — 房源上链注册

| 参数 | 类型 | 描述 |
|:---|:---|:---|
| `title` | string | 房源标题 |
| `description` | string | 详细描述 |
| `locationHash` | string | 地理位置哈希（保护精确位置隐私） |
| `propertyType` | enum | 公寓/别墅/单间等 |
| `maxGuests` | number | 最大容纳人数 |
| `amenities` | string[] | 设施列表 |
| `pricingRules` | object | 基础价格、周末加价、长期折扣等 |

| `availabilityCalendar` | object | 可预订日期范围 |
| `imagesCid` | string | IPFS 上图片文件夹的 CID |

工具执行流程：验证房东身份和资质 → 上传媒体到 IPFS → 构建合约调用交易 → 返回交易哈希和链上房源 ID。AI 代理可以指导房东完成信息收集，自动处理技术细节。

**`property/update`** — 房源信息更新

支持部分更新，仅修改指定字段。关键安全特性：验证调用者为房源所有者 DID；重大变更（如价格大幅调整）可能需要平台审核；更新历史链上可追溯。

**`property/verify`** — 房源真实性验证

触发平台或第三方验证流程，可能包括：地址验证（邮寄验证码）、现场核查（第三方服务）、文档验证（产权证明）。验证结果作为 VC 发放给房源。

#### 5.1.2 预订合约

预订合约管理从请求到完成的完整生命周期：

**`booking/create`** — 创建预订请求

输入包括房源 ID、入住/退房日期、客人数量、特殊需求。工具执行：检查日期可用性 → 计算总价（含平台服务费）→ 创建托管合约 → 锁定旅客资金 → 生成预订记录。返回预订 ID 和托管合约地址。

**`booking/confirm`** — 房东确认预订

房东在收到预订请求后，可以确认或拒绝。确认后，资金从"待处理"状态转为"已托管"，预订正式生效。工具自动处理通知（邮件/推送）和日历同步。

**`booking/cancel`** — 预订取消与退款触发

根据取消政策自动计算退款金额：房东在入住前 48 小时内取消，全额退款旅客；旅客在入住前 7 天取消，全额退款；7 天内取消，收取一晚房费。退款通过托管合约自动执行，无需人工介入。

#### 5.1.3 争议仲裁合约

争议处理是去中心化平台的关键挑战，MCP 工具提供结构化的仲裁流程：

**`dispute/file`** — 提交争议

输入包括预订 ID、争议类型（房源不符/清洁问题/未入住等）、争议描述、证据引用（图片/聊天记录 CID）。工具创建争议记录，启动仲裁流程，通知相关方。

**`dispute/evidence`** — 证据上链

支持补充提交证据，所有证据哈希上链确保完整性。证据可以包括：图片/视频（IPFS 存储）、通信记录（加密存储，争议解决时解密）、第三方报告（如清洁服务确认）。

**`dispute/resolve`** — 仲裁执行

根据仲裁结果执行资金分配。仲裁可以由平台运营方（中心化）、社区陪审团（去中心化）或预言机（自动化规则）完成。工具验证仲裁签名，执行托管释放。

### 5.2 合约事件监听与资源同步

#### 5.2.1 实时事件流暴露

MCP 资源可以暴露合约事件的实时流，使 AI 代理能够响应链上活动：

| 资源 URI | 描述 | 典型消费者 |
|:---|:---|:---|
| `contract://{contractAddress}/events/bookingCreated` | 新预订创建事件 | 房东通知服务、日历同步服务 |
| `contract://{contractAddress}/events/paymentReleased` | 托管资金释放事件 | 财务报告服务、税务计算服务 |
| `contract://{contractAddress}/events/disputeFiled` | 争议提交事件 | 客服系统、仲裁队列 |
| `contract://{contractAddress}/events/propertyVerified` | 房源验证完成事件 | 搜索索引更新、推荐系统 |

这些资源使用 SSE 传输，支持客户端订阅和实时推送。

#### 5.2.2 历史数据索引与查询

**`contract/history`** — 交易历史检索

支持多维度查询：按地址（用户/合约）、按事件类型、按时间范围、按状态。返回结构化的交易记录，包含：交易哈希、区块高度、时间戳、事件类型、解析后的参数。

**`contract/state`** — 合约当前状态查询

读取合约的当前状态变量，如：房源的当前可用性、预订的当前状态、托管合约的余额。这对于 AI 代理做出决策至关重要，确保基于最新数据操作。

### 5.3 多链与跨链交互

#### 5.3.1 ArcBlock 主网与侧链合约协调

OpenStay 可能利用 ArcBlock 的多链架构，将不同功能部署到优化的链环境：主网用于高价值交易（支付、产权记录），侧链用于高频操作（搜索、消息）。MCP 工具抽象这种复杂性，为 AI 代理提供统一的接口。

`property/register` 工具可能同时在主网注册所有权记录，在侧链创建搜索索引。`booking/create` 工具需要协调两条链的操作，确保原子性。

#### 5.3.2 跨链资产锁定与释放

对于跨链支付场景（如用户想用以太坊上的 USDC 支付），MCP 工具集成跨链桥：

| 工具 | 功能 |
|:---|:---|
| `bridge/quote` | 获取跨链兑换报价（含费用和时间） |
| `bridge/lock` | 在源链锁定资产 |
| `bridge/mint` | 在目标链铸造/释放对应资产 |
| `bridge/status` | 查询跨链交易状态 |

这些工具与 OCAR（Open Chain Access Protocol）集成，支持多条异构链。

#### 5.3.3 异构链互操作性设计

通过 Chainlink CCIP、LayerZero 等通用消息协议，或 ArcBlock 的原生桥接方案，实现与 Ethereum、Polygon、Solana 等生态的互操作。MCP 服务器抽象底层复杂性，为 AI 代理提供统一的跨链操作接口。

## 6. MCP 在数据存储与检索中的应用

### 6.1 DID Space 数据存储集成

#### 6.1.1 用户私有数据空间

ArcBlock DID Space 为每位用户提供加密控制的私有存储区域，与 MCP 深度集成实现 AI 原生的数据管理  [(LinkedIn)](https://www.linkedin.com/posts/mtmckinney_decentralized-ai-activity-7359635276236812288-a_rR)  ：

**个人偏好设置存储**：旅客的旅行偏好（住宿类型、设施要求、预算范围、取消政策容忍度等）以结构化格式存储于 DID Space。AI 代理通过 `space://{userDid}/preferences` 资源读取这些偏好，用于个性化房源推荐和自动筛选。偏好更新通过 `storage/user/preference/write` 工具执行，变更经用户签名后同步到所有授权服务。

**历史预订记录归档**：完整的预订历史（包括已取消和完成的）存储于用户控制的 Space，而非平台中心化数据库。这确保用户数据可移植性，支持跨平台信誉积累。MCP 资源 `space://{userDid}/history` 提供过滤和聚合查询，如"过去一年的商务旅行住宿"、"最常入住的城市"。

**身份凭证安全保管**：可验证凭证的原始内容加密存储于 DID Space，链上仅保留凭证哈希和状态。用户通过 MCP 工具授权特定披露，保持对身份信息的完全控制。

#### 6.1.2 MCP 数据写入工具

| 工具名称 | 功能 | 数据验证 | 冲突处理 |
|:---|:---|:---|:---|
| `storage/user/preference/write` | 写入用户偏好 | 模式验证、范围检查、恶意内容扫描 | 乐观并发控制，最后写入获胜或用户选择 |
| `storage/user/history/append` | 追加历史记录 | 来源验证（必须由授权合约触发） | 不可变追加，重复检测 |
| `storage/user/credential/store` | 存储可验证凭证 | 格式验证、发行方签名验证、过期检查 | 版本控制，支持凭证更新和撤销 |
| `storage/user/media/upload` | 上传用户相关媒体 | 内容类型、大小、版权检查 | 去重存储（基于内容哈希） |

#### 6.1.3 MCP 数据读取资源

资源设计遵循"最小权限"原则，请求者只能获取其被授权访问的数据子集：

| 资源 URI | 内容描述 | 访问控制 |
|:---|:---|:---|
| `space://{userDid}/preferences` | 完整偏好设置 | 所有者完全访问，授权代理读取相关子集 |
| `space://{userDid}/preferences/{category}` | 特定类别偏好（如 `budget`, `amenities`） | 细粒度授权，如仅向定价服务暴露预算范围 |
| `space://{userDid}/history` | 预订历史摘要 | 所有者完全访问，他人经授权查看匿名化统计 |
| `space://{userDid}/history/{bookingId}` | 特定预订详情 | 参与方（旅客、房东、平台）访问 |
| `space://{userDid}/credentials/index` | 凭证清单（无敏感内容） | 所有者完全访问，验证方可查询特定类型存在性 |
| `space://{userDid}/reputation/export` | 可移植信誉包 | 所有者请求生成，包含跨平台验证所需的证明 |

### 6.2 房源元数据与媒体存储

#### 6.2.1 去中心化存储方案

| 存储层 | 技术 | 适用内容 | 持久化机制 |
|:---|:---|:---|:---|
| 热缓存 | CDN 边缘节点 | 高频访问的图片缩略图 | 基于访问模式的 LRU 淘汰 |
| 温存储 | IPFS + Filecoin | 完整分辨率图片、视频、3D 导览 | 存储交易，定期续期 |
| 冷归档 | Arweave | 法律要求的长期保留内容 | 一次性支付，永久存储 |
| 元数据索引 | 自定义图数据库 | 房源关系、地理位置索引、语义标签 | 主链锚定，链下复制 |

#### 6.2.2 房源媒体资源暴露

MCP 资源提供统一的媒体访问接口，抽象底层存储细节：

| 资源模式 | 返回内容 | 参数选项 |
|:---|:---|:---|
| `ipfs://{cid}/property/{propertyId}/images` | 房源图片集 | `format` (thumbnail/preview/full), `aspect`, `limit` |
| `ipfs://{cid}/property/{propertyId}/images/{imageId}` | 单张图片 | `format`, `download` (触发下载头) |
| `ipfs://{cid}/property/{propertyId}/videos` | 视频内容清单 | `duration`, `quality`, `format` |
| `ipfs://{cid}/property/{propertyId}/tour` | 虚拟导览数据 | `format` (matterport/3d-tiles/custom), `startRoom` |
| `property://{propertyId}/media/featured` | 精选媒体组合 | `context` (search/detail/booking), `count` |

媒体资源支持内容协商，根据客户端能力和网络条件自动选择最优格式。AI 代理可请求特定格式的媒体用于分析（如低分辨率用于快速筛选，完整分辨率用于细节验证）。

#### 6.2.3 元数据索引与搜索

| MCP 工具 | 功能 | 查询能力 |
|:---|:---|:---|
| `search/property` | 多维度房源检索 | 地理位置（半径、区域）、时间可用性、容量、价格范围、设施标签、房东信誉 |
| `search/property/similar` | 相似房源推荐 | 基于房源 ID 或偏好向量的协同过滤 |
| `search/filter` | 高级筛选与排序 | 复合条件（如"海景+允许宠物+24小时入住"），多键排序 |
| `search/autocomplete` | 搜索建议 | 地理位置、设施、房东名称的前缀匹配 |
| `search/natural` | 自然语言搜索 | 解析查询意图，如"下周末适合家庭聚会的海边别墅" |

搜索工具对接混合索引架构：地理位置使用空间索引（如 H3），文本描述使用向量嵌入，结构化属性使用倒排索引。

### 6.3 实时数据流与缓存策略

#### 6.3.1 房源可用性实时状态

房源可用性是最关键的实时数据之一。MCP 通过 SSE 传输提供订阅机制：

```typescript
// 客户端订阅房源可用性变化
const subscription = await client.subscribeResource(
  'property://{propertyId}/availability'
);

// 服务器在可用性变化时推送更新
subscription.onUpdate((update) => {
  console.log('Availability changed:', update);
});
```

#### 6.3.2 价格动态更新机制

价格数据采用多级缓存策略：链上智能合约存储基础价格规则；链下索引服务预计算常用查询的价格；边缘 CDN 缓存热点数据；AI 代理本地缓存用户会话期间的价格。

价格更新触发条件：房东手动调整、动态定价算法触发、市场供需变化、特殊事件（节假日、大型活动）。

#### 6.3.3 边缘缓存与 CDN 优化

OpenStay MCP Server 部署采用边缘优先策略：静态资源（媒体文件、常见查询结果）通过 CDN 全球分发；动态查询（个性化推荐、实时可用性）路由到最近的边缘节点执行；写操作（预订创建、支付）回源到主数据中心确保一致性。

## 7. MCP 在支付与结算中的应用

### 7.1 加密货币支付流程

#### 7.1.1 ABT 代币支付

ArcBlock 原生 ABT 代币是 OpenStay 的主要支付手段，MCP 工具提供完整的支付流程：

**`payment/abt/quote`** — 获取实时汇率与费用

| 输入参数 | 说明 |
|:---|:---|
| `amount` | 支付金额（以目标货币计价） |
| `currency` | 目标货币（USD/CNY/EUR 等） |
| `paymentType` | 支付类型（full/deposit/installment） |

| 输出字段 | 说明 |
|:---|:---|
| `abtAmount` | 所需 ABT 数量 |
| `exchangeRate` | 实时汇率 |
| `networkFee` | 网络手续费 |
| `platformFee` | 平台服务费 |
| `totalCost` | 总成本 |
| `validUntil` | 报价有效期 |

**`payment/abt/initiate`** — 发起支付请求

创建支付会话，生成唯一的支付 ID，锁定报价（防止汇率波动），返回支付地址和二维码。AI 代理可以指导用户完成钱包扫码支付，或代表预授权用户自动执行。

**`payment/abt/confirm`** — 确认支付完成

监控链上交易状态，等待足够确认数（通常 6 确认视为最终），更新预订状态，触发后续流程（通知房东、更新日历、发送确认）。

#### 7.1.2 多币种支持

| 币种类型 | 支持方式 | 兑换机制 |
|:---|:---|:---|
| ABT（原生） | 直接支付 | 无 |
| USDT/USDC（稳定币） | 智能合约桥接 | 实时 DEX 报价，滑点保护 |
| ETH/BTC（主流币） | 跨链桥 + DEX | 自动路由最优路径 |
| 法币（USD/CNY/EUR） | Stripe 集成 | 商户端结算，用户无感知 |

多币种支付通过统一的 `payment/quote` 和 `payment/initiate` 接口暴露，AI 代理根据用户偏好和成本优化自动选择最优币种。

#### 7.1.3 支付状态资源

| 资源 URI | 功能 | 更新频率 |
|:---|:---|:---|
| `payment://{paymentId}/status` | 实时支付状态查询 | 事件驱动，状态变化即时推送 |
| `payment://{userDid}/history` | 用户支付历史 | 分页查询，支持时间范围过滤 |
| `payment://{propertyId}/revenue` | 房源收入统计（房东可见） | 每日聚合，实时估算 |

### 7.2 托管与分账机制

#### 7.2.1 预订资金托管

智能合约托管是 OpenStay 信任机制的核心：

**`escrow/lock`** — 资金锁定

旅客支付的资金不直接进入房东账户，而是锁定在智能合约托管地址。锁定条件包括：预订 ID、房东 DID、释放条件（入住日期、双方确认、争议解决期限）。

**`escrow/release`** — 条件释放

满足预设条件后，资金自动释放给房东。释放触发条件：入住完成且旅客确认、入住日期后 24 小时无争议、争议仲裁裁决支持房东。

**`escrow/refund`** — 争议退款

争议解决后，根据裁决结果执行部分或全额退款。退款可以原路返回（旅客支付地址），也可以按裁决指定地址分配。

#### 7.2.2 平台与房东分账

| 分账方 | 比例/金额 | 触发条件 | 结算方式 |
|:---|:---|:---|:---|
| 房东 | 85-95% | 预订完成，无争议 | 实时释放到房东钱包 |
| 平台（OpenStay） | 5-15% | 同上 | 累积到平台国库，定期结算 |
| 推荐人（如有） | 1-3% | 通过推荐链接预订 | 实时或月度结算 |
| 保险（可选） | 固定金额 | 用户购买保险 | 实时划转保险合约 |

分账比例动态调整：新房东优惠期（平台抽成降低）、SuperHost 奖励（平台抽成降低）、高价值预订（阶梯费率）。

#### 7.2.3 发票与合规

**链上发票生成**：每次支付自动生成不可篡改的电子发票，包含：发票编号、交易哈希、金额明细、税务信息、数字签名。

**合规性数据导出**：MCP 工具 `compliance/export` 支持按司法管辖区要求导出交易记录，格式包括：CSV（会计系统）、PDF（税务申报）、JSON（API 对接）。

**审计追踪与报告**：所有资金流动记录在链上，支持实时审计。MCP 资源 `audit://{period}/report` 生成指定期间的审计报告，包含：交易总量、分账明细、争议统计、异常标记。

### 7.3 发票与合规

#### 7.3.1 链上发票生成

每次支付交易自动生成对应的电子发票，存储于 IPFS 并在链上登记哈希。发票内容包含完整的交易信息，支持第三方验证真伪。

#### 7.3.2 合规性数据导出

针对不同司法管辖区的税务要求，提供灵活的数据导出：

| 导出格式 | 适用场景 | 包含字段 |
|:---|:---|:---|
| CSV | 会计系统导入 | 日期、金额、币种、交易类型、对手方 |
| PDF | 税务申报附件 | 格式化发票、汇总报表、数字签名 |
| JSON | API 自动化对接 | 完整交易详情、元数据、验证证明 |

#### 7.3.3 审计追踪与报告

MCP 工具 `audit/generateReport` 生成多维度审计报告：

- **财务审计**：资金流入流出、托管余额、分账准确性
- **合规审计**：KYC/AML 执行情况、可疑交易标记、监管报告
- **运营审计**：系统可用性、响应时间、错误率、用户满意度

审计报告本身上链存证，确保报告的真实性和不可篡改。

## 8. OpenStay MCP Server 实现指南

### 8.1 服务端核心实现

#### 8.1.1 基于 ArcBlock MCP SDK 的服务器初始化

```typescript
// src/server.ts
import { McpServer } from '@arcblock/mcp-server';
import { StreamableHTTPServerTransport } from '@arcblock/mcp-server/streamable-http';
import { didAuthMiddleware } from './auth/did';
import { registerPropertyTools } from './tools/property';
import { registerBookingTools } from './tools/booking';
import { registerPaymentTools } from './tools/payment';
import { registerIdentityTools } from './tools/identity';

async function main() {
  // 初始化 MCP 服务器
  const server = new McpServer({
    name: 'openstay-mcp-server',
    version: '1.0.0',
    description: 'OpenStay Decentralized Accommodation Platform MCP Service',
  });

  // 注册工具模块
  await registerPropertyTools(server);
  await registerBookingTools(server);
  await registerPaymentTools(server);
  await registerIdentityTools(server);

  // 配置 Streamable HTTP 传输
  const transport = new StreamableHTTPServerTransport({
    port: parseInt(process.env.MCP_PORT || '3000'),
    middleware: [didAuthMiddleware],
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://openstay.io'],
      credentials: true,
    },
    sessionTimeout: 3600, // 1小时会话超时
  });

  // 启动服务器
  await server.connect(transport);
  console.log(`OpenStay MCP Server running on port ${transport.port}`);
}

main().catch(console.error);
```

#### 8.1.2 Tools 注册与 Schema 定义

以房源搜索工具为例，展示完整的注册流程：

```typescript
// src/tools/property.ts
import { z } from 'zod';
import { propertyService } from '../services/property';

const SearchPropertiesSchema = z.object({
  location: z.string().describe('City, neighborhood, or landmark'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Check-in date (YYYY-MM-DD)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Check-out date (YYYY-MM-DD)'),
  guests: z.number().int().min(1).max(20).default(2).describe('Number of guests'),
  maxPrice: z.number().optional().describe('Maximum price per night in USD'),
  amenities: z.array(z.string()).optional().describe('Required amenities'),
  propertyType: z.enum(['apartment', 'house', 'villa', 'room']).optional(),
});

export async function registerPropertyTools(server: McpServer) {
  server.registerTool('property/search', {
    title: 'Search Properties',
    description: 'Search available accommodations with filters',
    inputSchema: SearchPropertiesSchema,
  }, async (params, context) => {
    // 验证用户身份和权限
    const { did } = context.auth;
    
    // 调用业务服务
    const results = await propertyService.search({
      ...params,
      userDid: did,
    });
    
    // 返回结构化结果
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          count: results.length,
          properties: results.map(p => ({
            id: p.id,
            title: p.title,
            location: p.location,
            pricePerNight: p.price,
            rating: p.rating,
            imageUrl: p.images[0],
            deepLink: `openstay://property/${p.id}`,
          })),
        }),
      }],
    };
  });

  // 更多工具注册...
}
```

#### 8.1.3 Resources 动态生成与缓存

```typescript
// src/resources/property.ts
import { ResourceTemplate } from '@arcblock/mcp-server';

export function registerPropertyResources(server: McpServer) {
  // 动态房源详情资源
  server.registerResource(
    new ResourceTemplate('property://{propertyId}/details', {
      list: async () => {
        // 返回热门房源列表（用于发现）
        const trending = await propertyService.getTrending();
        return trending.map(p => ({
          uri: `property://${p.id}/details`,
          name: p.title,
          mimeType: 'application/json',
        }));
      },
    }),
    async (uri, { propertyId }) => {
      // 获取房源详情，带缓存
      const cacheKey = `property:${propertyId}`;
      let details = await cache.get(cacheKey);
      
      if (!details) {
        details = await propertyService.getDetails(propertyId);
        await cache.set(cacheKey, details, 60); // 缓存60秒
      }
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(details),
        }],
      };
    }
  );
}
```

#### 8.1.4 错误处理与日志记录

```typescript
// src/utils/error-handler.ts
import { McpError, ErrorCode } from '@arcblock/mcp-server';

export function handleError(error: unknown): never {
  if (error instanceof McpError) {
    throw error; // 已格式化的 MCP 错误
  }
  
  if (error instanceof ValidationError) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid parameters: ${error.message}`,
      { field: error.field }
    );
  }
  
  if (error instanceof BlockchainError) {
    throw new McpError(
      ErrorCode.InternalError,
      'Blockchain operation failed',
      { 
        txHash: error.txHash,
        errorCode: error.code,
        // 不暴露敏感细节给客户端
      }
    );
  }
  
  // 未知错误，记录详细日志但返回通用消息
  logger.error('Unexpected error', error);
  throw new McpError(
    ErrorCode.InternalError,
    'An unexpected error occurred. Please try again later.'
  );
}
```

### 8.2 与现有后端服务集成

#### 8.2.1 API 适配层设计

```
┌─────────────────────────────────────────┐
│           OpenStay MCP Server           │
│  ┌─────────────────────────────────┐    │
│  │      MCP Protocol Handler       │    │
│  │  (Tools, Resources, Prompts)    │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │       API Adaptation Layer      │    │
│  │  - Request transformation       │    │
│  │  - Response mapping             │    │
│  │  - Error translation            │    │
│  │  - Caching & optimization       │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │      Existing OpenStay APIs     │    │
│  │  - REST/GraphQL endpoints       │    │
│  │  - Internal service calls       │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

适配层核心职责：将 MCP 的 JSON-RPC 请求转换为内部 API 格式；将内部响应映射为 MCP 标准格式；统一错误码和错误消息；实现请求去重和响应缓存。

#### 8.2.2 数据库连接与 ORM 集成

复用现有的数据库连接池和 ORM 配置，避免重复初始化。对于 MCP 特定的查询模式（如高频的可用性检查），实现专门的缓存优化策略。

#### 8.2.3 区块链节点交互封装

```typescript
// src/services/blockchain.ts
import { ForgeSDK } from '@arcblock/forge-sdk';

class BlockchainService {
  private client: ForgeSDK;
  
  async callContract(
    contractAddress: string,
    method: string,
    params: any[],
    options: { from: string; privateKey: string }
  ): Promise<TransactionReceipt> {
    // 构建交易
    const tx = await this.client.buildTransaction({
      itx: {
        type: 'CallContractTx',
        value: {
          address: contractAddress,
          method,
          params: JSON.stringify(params),
        },
      },
      from: options.from,
    });
    
    // 签名并发送
    const signed = await this.client.signTransaction(tx, options.privateKey);
    const hash = await this.client.sendTransaction(signed);
    
    // 等待确认
    return this.waitForConfirmation(hash);
  }
  
  // 更多区块链交互方法...
}

export const blockchainService = new BlockchainService();
```

### 8.3 部署与运维

#### 8.3.1 Blocklet 打包与发布

```yaml
# blocklet.yml
name: openstay-mcp-server
version: 1.0.0
description: OpenStay MCP Server for AI Agent Integration
group: dapp
main: dist/server.js
files:
  - dist/
  - schemas/
  - blocklet.yml
interfaces:
  - type: web
    name: publicUrl
    path: /
    port: BLOCKLET_PORT
    protocol: http
  - type: mcp
    name: mcpEndpoint
    path: /mcp
    port: MCP_PORT
    protocol: streamable-http
requirements:
  cpu: 1
  memory: 2048
  disk: 10240
environments:
  - name: MCP_PORT
    description: MCP server port
    default: '3000'
    required: true
  - name: ABT_CHAIN_HOST
    description: ArcBlock chain endpoint
    required: true
  - name: SERVER_DID
    description: Server DID for authentication
    required: true
  - name: SERVER_SK
    description: Server private key (encrypted)
    required: true
    secure: true
```

打包和发布命令：

```bash
# 构建
npm run build

# 打包 Blocklet
blocklet bundle

# 发布到测试网
blocklet publish --endpoint https://registry.arcblock.io

# 发布到主网（生产）
blocklet publish --endpoint https://registry.arcblock.io --production
```

#### 8.3.2 环境配置与密钥管理

| 环境类型 | 密钥管理方案 | 说明 |
|:---|:---|:---|
| 开发环境 | 本地 `.env` 文件 | 测试密钥，无真实资产 |
| 测试环境 | ArcBlock Vault 测试实例 | 隔离的密钥存储，模拟生产流程 |
| 生产环境 | ArcBlock Vault 生产实例 + HSM | 硬件安全模块保护，多签授权 |

密钥轮换策略：服务端 DID 密钥每年轮换，旧密钥保留 90 天用于验证历史签名；用户会话令牌 24 小时过期，支持静默刷新。

#### 8.3.3 监控、告警与弹性伸缩

| 监控维度 | 指标 | 告警阈值 | 响应动作 |
|:---|:---|:---|:---|
| 可用性 | HTTP 200 成功率 | < 99.9% | 自动重启，通知 on-call |
| 延迟 | P99 响应时间 | > 2s | 扩容实例，调查瓶颈 |
| 错误率 | 5xx 错误比例 | > 0.1% | 回滚版本，紧急修复 |
| 业务指标 | 预订转化率 | 环比下降 20% | 产品调查，A/B 测试 |
| 安全指标 | 异常认证尝试 | > 10/分钟/IP | 自动封禁，安全审计 |

弹性伸缩策略：基于 CPU 使用率（> 70% 扩容，< 30% 缩容）和请求队列深度（> 100 扩容）自动调整实例数量，最小 2 实例保证高可用，最大 20 实例应对峰值。

## 9. 安全考量与最佳实践

### 9.1 身份与访问安全

#### 9.1.1 DID 签名验证强制策略

所有 MCP 请求必须包含有效的 DID 签名，验证流程：

1. 提取请求中的 `Authorization` 头或 `X-DID-Signature` 头
2. 解析 DID 标识符，从链上或缓存获取 DID 文档
3. 使用 DID 文档中的公钥验证签名
4. 检查 DID 状态（未吊销、未过期）
5. 验证 nonce 防止重放攻击
6. 将验证结果缓存 60 秒，避免重复查询

#### 9.1.2 工具调用权限最小化原则

每个工具实现必须显式检查调用者权限：

```typescript
async function createBooking(params, context) {
  const { did, permissions } = context.auth;
  
  // 检查基础权限
  if (!permissions.includes('booking:create')) {
    throw new McpError(ErrorCode.InsufficientPermissions, 'Missing booking:create permission');
  }
  
  // 检查资源级权限（如代订场景）
  if (params.onBehalfOf && params.onBehalfOf !== did) {
    const delegation = await verifyDelegation(did, params.onBehalfOf, 'booking:create');
    if (!delegation.valid) {
      throw new McpError(ErrorCode.InsufficientPermissions, 'Invalid or expired delegation');
    }
  }
  
  // 执行业务逻辑...
}
```

#### 9.1.3 敏感操作多签机制

| 操作类型 | 多签要求 | 参与方 |
|:---|:---|:---|
| 大额支付（> 1000 ABT） | 2/2 | 用户 + 平台运营 |
| 智能合约升级 | 3/5 | 核心开发团队 |
| 紧急资金冻结 | 2/3 | 安全团队 + 法务 |
| 参数变更（手续费率） | 社区投票 | 代币持有者 |

### 9.2 数据安全与隐私

#### 9.2.1 传输层加密（TLS 1.3）

强制 TLS 1.3，禁用不安全的密码套件。证书由 Let's Encrypt 自动管理，90 天自动轮换。HSTS 头设置 max-age 为 2 年，includeSubDomains。

#### 9.2.2 敏感数据字段级加密

用户隐私数据（身份证号、银行账户）在存储前使用 AES-256-GCM 加密，密钥托管于 ArcBlock Vault。查询时动态解密，解密操作记录审计日志。

#### 9.2.3 数据保留与删除策略

| 数据类型 | 保留期限 | 删除方式 |
|:---|:---|:---|
| 用户活动日志 | 2 年 | 自动归档，到期删除 |
| 交易详情 | 永久（链上） | 不可删除，仅脱敏 |
| 媒体文件 | 用户账户存续期 + 1 年 | 用户删除请求后 30 天内执行 |
| 审计日志 | 7 年 | 合规要求，不可删除 |

### 9.3 智能合约安全

#### 9.3.1 合约调用参数校验

所有合约调用参数在链下严格校验，防止常见攻击：

```typescript
function validateBookingParams(params) {
  // 日期合理性
  const checkIn = new Date(params.checkIn);
  const checkOut = new Date(params.checkOut);
  const now = new Date();
  
  if (checkIn < now) throw new Error('Check-in date must be in the future');
  if (checkOut <= checkIn) throw new Error('Check-out must be after check-in');
  if (checkOut - checkIn > 90 * 24 * 60 * 60 * 1000) {
    throw new Error('Maximum stay is 90 days');
  }
  
  // 金额合理性
  if (params.totalAmount <= 0) throw new Error('Amount must be positive');
  if (params.totalAmount > 100000 * 1e18) { // 100k ABT
    throw new Error('Amount exceeds maximum allowed');
  }
  
  // 更多校验...
}
```

#### 9.3.2 重入攻击防护

智能合约实现遵循 Checks-Effects-Interactions 模式，关键操作使用重入锁。MCP 服务端也实现调用频率限制，同一用户 1 秒内最多 5 次合约调用。

#### 9.3.3 紧急暂停与升级机制

合约实现 `Pausable` 和 `Upgradeable` 模式：发现严重漏洞时，多签授权可立即暂停合约功能；升级通过代理合约实现，新合约部署后迁移状态，旧合约保留只读访问。

## 10. 未来演进与生态扩展

### 10.1 AI 代理自主决策能力

#### 10.1.1 基于用户偏好的自动预订

未来演进方向：AI 代理学习用户历史偏好，在获得预授权后，自动监控市场并执行最优预订。关键能力：

- 偏好建模：从历史行为提取价格敏感度、设施偏好、位置偏好、时间灵活性
- 市场监控：持续追踪目标区域的价格波动和新房源上线
- 决策优化：多目标优化（价格、质量、便利性），帕累托前沿分析
- 自动执行：条件触发预订，实时通知用户，支持人工覆盖

#### 10.1.2 动态定价策略优化

为房东提供的 AI 助手：基于需求预测、竞品分析、事件日历，自动优化定价策略。输入包括：历史预订数据、市场供需信号、本地事件信息、竞品价格追踪；输出为：每日最优价格建议、折扣策略、长期预订激励。

#### 10.1.3 智能客服与争议调解

AI 代理处理 90% 以上的客户咨询：常见问题自动回复、预订变更自助处理、退款政策解释。争议场景：AI 收集双方证据、分析合同条款、提出调解建议，复杂案例升级人工仲裁。

### 10.2 跨平台互操作性

#### 10.2.1 与其他 MCP 服务聚合

OpenStay 作为旅行服务的一环，与互补服务深度集成：

| 服务领域 | 集成 MCP 服务 | 协同场景 |
|:---|:---|:---|
| 交通 | 航班/火车/租车 MCP | 一站式行程规划，联程优惠 |
| 活动 | 景点/餐厅/体验 MCP | 目的地推荐，套餐打包 |
| 保险 | 旅行保险 MCP | 自动投保，理赔协助 |
| 签证 | 签证服务 MCP | 材料准备，进度追踪 |

#### 10.2.2 传统 OTA 系统桥接

为传统平台提供 MCP 适配层，使其服务可被 AI 代理调用。商业模式：OpenStay 作为技术提供商，向 OTA 输出 MCP 化能力，获取技术服务费或流量分成。

#### 10.2.3 物联网设备集成

智能门锁、温控设备、能源管理通过 MCP 暴露状态和控制能力，实现：自助入住（AI 代理授权临时门禁）、智能节能（根据入住状态自动调节）、预测维护（设备异常自动报修）。

### 10.3 代币经济与激励机制

#### 10.3.1 MCP 服务提供者激励

OpenStay MCP 服务的使用者（AI 代理、第三方应用）支付 ABT 作为服务费，分配机制：

| 参与方 | 分配比例 | 说明 |
|:---|:---|:---|
| OpenStay 平台 | 50% | 基础设施维护、持续开发 |
| 服务节点运营者 | 30% | 按贡献的计算资源和带宽分配 |
| 生态基金 | 15% | 开发者激励、社区建设 |
| 代币回购销毁 | 5% | 通缩机制，价值支撑 |

#### 10.3.2 数据贡献与隐私计算奖励

用户选择共享匿名化数据（搜索偏好、预订模式）用于市场分析，获得代币奖励。隐私计算（联邦学习、安全多方计算）确保数据"可用不可见"。

#### 10.3.3 社区治理与 DAO 演进

逐步过渡至去中心化治理：关键参数（手续费率、争议仲裁规则、升级提案）由代币持有者投票决定。OpenStay DAO 管理协议金库，资助生态发展。
