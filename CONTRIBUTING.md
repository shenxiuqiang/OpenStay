# Contributing to OpenStay

感谢您考虑为 OpenStay 做出贡献！我们欢迎各种形式的贡献，包括：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 提交新功能
- 🎨 设计主题

---

## 开发环境设置

### 前置要求

- **Node.js** >= 18.18 LTS (已测试至 24.x)
- **pnpm** >= 9.0.0
- **Git**

### 设置步骤

```bash
# 1. Fork 仓库并克隆您的 Fork
git clone https://github.com/YOUR_USERNAME/openstay.git
cd openstay

# 2. 添加上游仓库
git remote add upstream https://github.com/your-org/openstay.git

# 3. 安装依赖
pnpm install

# 4. 配置环境变量
cp property/web/.env.example property/web/.env
cp hub/web/.env.example hub/web/.env

# 5. 验证安装
pnpm lint
```

---

## 开发流程

### 1. 创建分支

```bash
# 从主分支获取最新代码
git checkout main
git pull upstream main

# 创建功能分支
git checkout -b feature/your-feature-name

# 或修复分支
git checkout -b fix/issue-description
```

分支命名规范：
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关

### 2. 开发与测试

```bash
# 启动 Property Studio 开发服务器
pnpm --filter property dev

# 启动 Hub 开发服务器
pnpm --filter hub dev

# 启动旅客 App
pnpm --filter travel-app start

# 运行代码检查
pnpm lint

# 自动修复代码风格问题
pnpm lint:fix
```

### 3. 代码规范

#### TypeScript
- 所有代码必须使用 TypeScript
- 启用严格模式
- 避免使用 `any` 类型

#### 代码风格
- 使用项目配置的 ESLint 和 Prettier
- 遵循现有的代码结构
- 保持函数简短且单一职责

#### 提交信息
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

[可选的正文]

[可选的脚注]
```

类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(property): add calendar price rules

- Support weekend pricing
- Support holiday pricing
- Add min/max nights restriction

Fixes #123
```

### 4. 提交更改

```bash
# 添加更改的文件
git add .

# 提交（使用规范的提交信息）
git commit -m "feat(scope): description"

# 推送到您的 Fork
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

1. 访问您的 Fork 页面
2. 点击 "Compare & pull request"
3. 填写 PR 描述，包括：
   - 变更摘要
   - 相关问题链接
   - 测试说明
   - 截图（如适用）

---

## 代码审查

所有提交都需要通过代码审查。审查者会关注：

- ✅ 代码质量和可读性
- ✅ 测试覆盖率
- ✅ 文档更新
- ✅ 性能影响
- ✅ 安全考虑

---

## 报告 Bug

使用 GitHub Issues 报告 Bug，请包含：

- 清晰的标题和描述
- 重现步骤
- 期望行为 vs 实际行为
- 环境信息（Node.js 版本、操作系统等）
- 错误日志或截图

### Bug 报告模板

```markdown
**描述**
清晰的 Bug 描述

**重现步骤**
1. 进入 '...'
2. 点击 '...'
3. 看到错误

**期望行为**
清晰描述期望发生什么

**实际行为**
清晰描述实际发生什么

**环境**
- Node.js 版本: [e.g. 20.10.0]
- 操作系统: [e.g. macOS 14.0]
- 浏览器: [e.g. Chrome 120]

**附加信息**
截图、日志等
```

---

## 功能建议

使用 GitHub Issues 提交功能建议：

- 清晰描述功能
- 解释使用场景
- 提供可能的实现方案（可选）

### 功能建议模板

```markdown
**功能描述**
清晰描述建议的功能

**使用场景**
描述这个功能在什么场景下有用

**期望行为**
描述功能应该如何工作

**替代方案**
描述您考虑过的替代方案

**附加信息**
任何其他相关信息
```

---

## 开发规范

### 文件命名
- 组件：`PascalCase.tsx`
- 工具函数：`camelCase.ts`
- 样式：`kebab-case.css`
- 模型：`kebab-case.ts`

### 目录结构

```
property/web/api/src/
├── models/          # 数据模型
├── routes/          # API 路由
├── services/        # 业务逻辑
├── middlewares/     # 中间件
└── libs/            # 工具库
```

### API 设计
- 使用 RESTful 风格
- 统一响应格式：`{ success, data, error }`
- 适当使用 HTTP 状态码
- 添加 API 文档注释

### 数据库
- 使用 Sequelize 迁移
- 添加适当的索引
- 遵循命名规范（下划线分隔）

---

## 文档贡献

文档是项目的重要组成部分。您可以：

- 修复文档中的错别字
- 改进现有文档的清晰度
- 添加新的示例和教程
- 翻译文档到其他语言

文档文件位于 `docs/` 目录。

---

## 主题贡献

OpenStay 支持自定义主题。您可以：

- 创建新的主题模板
- 改进现有主题
- 分享您的主题到主题市场

主题位于 `theme/templates/` 目录。

---

## 社区

- 💬 [Discord](https://discord.gg/openstay)
- 📧 Email: support@openstay.example.com
- 🐦 Twitter: [@OpenStayNetwork](https://twitter.com/OpenStayNetwork)

---

## 许可证

通过贡献代码，您同意您的贡献将在 [MIT 许可证](LICENSE) 下发布。

---

再次感谢您的贡献！🙏
