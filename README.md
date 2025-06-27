# YouTube Clone

一个使用现代技术栈构建的功能完整的YouTube克隆项目。
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mabinhang2021/youtube-clone)

## 🌐 在线演示

[在线预览](https://youtube-clone-eight-vert-50.vercel.app/)

## 📸 项目截图

<div align="center">
  <p><i>项目截图将在这里展示</i></p>

  <details>
    <summary>查看更多截图</summary>
    <p>主页</p>
    <p>视频播放页面</p>
    <p>创作者工作室</p>
    <p>用户个人资料</p>
  </details>
</div>

## ⚡ 快速开始

想要快速体验项目？按照以下步骤操作：

```bash
# 克隆仓库
git clone <repository-url>

# 进入项目目录
cd new-tube

# 安装依赖
bun install

# 编辑环境变量,使用你喜欢的编辑器创建并打开 .env.local 并填写必要的环境变量
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
CLERK_SIGNING_SECRET = 
DATABASE_URL = 
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=
UPLOADTHING_TOKEN=
QSTASH_TOKEN=
UPSTASH_WORKFLOW_URL=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=

# 启动开发服务器
bun run dev:all
//现在你可以在浏览器中访问 http://localhost:3000 查看项目！
```

### 开发命令

- `bun run dev:all` - 启动开发服务器
- `bun run build` - 构建生产版本
- `bunx drizzle-kit push` - 同步数据库架构
- `bunx drizzle-kit studio ` - 启动数据库管理界面

## 🛠 技术栈

- **前端框架**
  - Next.js 15.1.6
  - React 19
  - TypeScript
  - TailwindCSS
  - Shadcn/ui
- **后端服务**
  - tRPC
  - Drizzle ORM
  - NeonDB (PostgreSQL)
  - Redis
- **媒体处理**
  - Mux (视频处理和播放)
  - UploadThing (文件上传)
- **认证**
  - Clerk

## 🏛️ 技术架构与亮点

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 应用                           │
├─────────────┬─────────────────────────────┬────────────────┤
│             │                             │                │
│  React UI   │        tRPC API 路由        │   服务器组件   │
│  组件       │                             │                │
│             │                             │                │
├─────────────┴─────────────────────────────┴────────────────┤
│                                                            │
│                        Drizzle ORM                         │
│                                                            │
├────────────────┬───────────────────┬──────────────────────┤
│                │                   │                      │
│  PostgreSQL    │      Redis        │     Mux 视频         │
│  (NeonDB)      │    (Upstash)      │                      │
│                │                   │                      │
└────────────────┴───────────────────┴──────────────────────┘
```

### 架构设计原则

1. **模块化设计**
   - 功能模块独立封装（视频、评论、用户等）
   - 每个模块包含自己的UI组件、服务器逻辑和类型定义
   - 清晰的关注点分离，提高代码可维护性

2. **类型安全的API层**
   - 使用tRPC实现端到端类型安全
   - 自动生成API客户端，消除前后端类型不匹配
   - 简化API调用，提高开发效率

3. **高性能数据访问策略**
   - Drizzle ORM提供类型安全的数据库操作
   - Redis缓存减少数据库负载
   - NeonDB无服务器PostgreSQL实现可扩展存储
   - 优化的查询设计，几乎无原生SQL

4. **媒体处理工作流**
   - 完整的视频生命周期管理：
     1. UploadThing处理安全文件上传
     2. Mux进行视频转码和优化
     3. 自动生成视频缩略图
     4. 自适应比特率流媒体播放

5. **前端架构**
   - 基于组件的UI设计
   - 服务器组件与客户端组件合理分离
   - 路由级别代码分割
   - 响应式设计适配各种设备

## ✨ 功能特性

### 🎥 视频系统
- **上传与处理**
  - 支持多种格式视频文件上传
  - 使用Mux进行专业视频处理
  - 自适应比特率流媒体播放
  - 视频可见性控制（公开/私有）
  
- **智能处理**
  - Mux自动生成视频标题及描述
  - 使用OpenAI生成视频缩略图
  - 自动视频元数据提取
  - 视频质量优化

### 👥 用户系统
- **账户管理**
  - Clerk提供的安全用户认证
  - 个人资料定制
  - 用户频道页面
  - 自定义频道横幅和布局
- **创作者工作室**
  - 视频管理仪表板
  - 内容编排工具
  - 批量操作功能

### 💫 社交互动
- **基础互动**
  - 视频点赞/不喜欢
  - 嵌套评论系统
  - 用户订阅关注
  - 观看历史记录
  
  - 自定义播放列表

### 🔍 发现系统
- **搜索功能**
  - 高级视频搜索
  - 分类过滤系统
  - 标签导航
- **推荐引擎**
  - 相关内容推荐
  - 趋势视频发现

## 📦 项目结构

```
src/
├── app/                # Next.js 应用路由
├── components/         # 可重用组件
├── db/                # 数据库配置和模式
├── modules/           # 功能模块
│   ├── auth/         # 认证相关
│   ├── videos/       # 视频功能
│   ├── comments/     # 评论系统
│   ├── playlists/    # 播放列表
│   ├── studio/       # 创作者工作室
│   └── ...
├── lib/              # 工具函数和配置
└── trpc/             # tRPC API 路由
```

## 📅 项目路线图

### 当前阶段 (v1.0)
✅ 核心视频功能
✅ 用户认证系统
✅ 基本互动功能
✅ 创作者工作室
✅ 响应式设计

### 短期计划 (v1.x)
- [ ] 黑暗模式
- [ ] 多语言支持

### 中期计划 (v2.0)
- [ ] 直播功能
- [ ] 高级分析仪表板
- [ ] 社区功能增强

### 长期愿景 (v3.0+)
- [ ] 引入AI推荐算法
- [ ] 创作者货币化功能

## 🙏 致谢

这个项目的开发得益于许多优秀的开源项目和工具：

- [Next.js](https://nextjs.org/) - React 框架
- [tRPC](https://trpc.io/) - 端到端类型安全 API
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Clerk](https://clerk.dev/) - 认证解决方案
- [Mux](https://mux.com/) - 视频处理平台
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [UploadThing](https://uploadthing.com/) - 文件上传解决方案

特别感谢所有贡献者和社区成员的支持和反馈！

## 🤝 贡献指南

我们欢迎所有形式的贡献！以下是参与项目的方法：

### 提交问题

如果你发现了bug或有功能请求，请通过GitHub Issues提交：
1. 使用清晰的标题描述问题
2. 提供详细的复现步骤
3. 如果可能，附上截图或错误日志

### 提交代码

1. Fork 仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

### 代码风格

- 遵循项目的TypeScript和React最佳实践
- 确保代码通过所有测试
- 为新功能添加适当的测试
- 保持代码整洁和可读

## 🚀 部署指南

### Vercel 部署
推荐使用 Vercel 进行部署，过程非常简单：

1. 在 Vercel 上导入项目
2. 配置环境变量
3. 不要忘记在uploadingthing，mux中改变你的生产环境变量并在vercel中修改
4. 部署应用

## 📄 许可

MIT License
