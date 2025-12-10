# Learn Web3 - Web3 学习笔记

这是一个个人 Web3 学习项目，记录了我在学习 Web3 开发过程中的实践代码和心得体会。

[查看在线演示](https://learn-web3.guoranzan.com)

## 项目介绍

作为一名程序员，我深知学习新技术时实践的重要性。因此，我创建了这个项目来：

- 📝 记录学习过程中的代码实践
- 💡 整理和巩固 Web3 相关知识
- 🤝 希望能帮助到其他想要学习 Web3 开发的程序员

如果你也在学习 Web3，欢迎一起交流学习！

## 技术栈

- **框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **Web3 库**:
  - wagmi - React Hooks for Ethereum
  - viem - TypeScript Interface for Ethereum
  - RainbowKit - 钱包连接 UI 组件
- **开发工具**: Cursor 编辑器

## 功能特性

- ✅ 钱包连接（支持多种钱包）
- ✅ 链信息查询
- ✅ 余额查询
- 🚧 更多功能持续开发中...

## 学习笔记

项目中提供了详细的学习笔记文档，记录了我在学习过程中的理解和心得。你可以在 `学习笔记` 目录中找到这些文档。

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 其他命令

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run check
```

## 项目结构

```
learn-web3/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   └── layout.tsx         # 根布局
├── components/            # 通用组件
│   ├── layout/           # 布局组件
│   ├── ui/               # UI 组件
│   └── wallet/           # 钱包相关组件
├── lib/                   # 工具函数和配置
│   ├── abi/              # ABI 相关工具
│   └── config/           # 配置文件
├── 学习笔记/              # 学习笔记文档
└── README.md             # 项目说明文档
```

## 作者

- 个人网站: [guoranzan.com](https://guoranzan.com)
- GitHub: [@sdjl](https://github.com/sdjl)

## License

MIT