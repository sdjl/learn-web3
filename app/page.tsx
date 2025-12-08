"use client";

// ============================================================
// 首页组件：钱包连接和查询功能的主页面
// ============================================================
// 作用：
// - 整合所有钱包相关的功能组件
// - 提供统一的页面布局和样式
// - 作为应用的入口页面
// ============================================================

import { useAccount, useBalance, useDisconnect } from "wagmi";
import { Header } from "@/components/layout/Header";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { Github, ExternalLink, BookOpen } from "lucide-react";

// GitHub 仓库地址
const GITHUB_URL = "https://github.com/sdjl/learn-web3";
// 作者个人网站
const AUTHOR_WEBSITE = "https://guoranzan.com";

export default function Home() {
  // ============================================================
  // 获取钱包地址（用于判断是否显示操作按钮）
  // ============================================================
  const { address } = useAccount();

  // ============================================================
  // 获取余额查询的 refetch 函数，用于手动刷新余额
  // ============================================================
  const { refetch: refetchBalance } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  // ============================================================
  // 获取断开连接的功能
  // ============================================================
  // disconnect: 断开连接的函数
  // isPending: 是否正在断开连接（用于显示加载状态）
  const { disconnect, isPending: isDisconnecting } = useDisconnect();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="learn web3"
        title="Web3学习笔记"
        description="点击下方连接按钮，选择钱包，即可体验钱包连接、链信息与余额查询。"
      />

      {/* 钱包连接组件 - 处理钱包连接和断开，显示连接状态、地址、网络和余额信息 */}
      <WalletConnection />

      {/* 钱包操作组件 - 提供重新获取余额和断开连接的按钮，仅在钱包已连接时显示 */}
      {address && (
        <div className="flex flex-wrap gap-4">
          {/* 重新获取余额按钮 */}
          <button
            onClick={() => refetchBalance()} // 调用 refetchBalance 重新查询余额
            className="rounded-full border border-primary/40 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            重新获取余额
          </button>
          {/* 断开连接按钮 */}
          <button
            onClick={() => disconnect()} // 调用 disconnect 断开钱包连接
            disabled={isDisconnecting} // 断开连接过程中禁用按钮，防止重复点击
            className="rounded-full border border-destructive/40 px-5 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDisconnecting ? "断开中..." : "断开连接"}
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 项目介绍区域 */}
      {/* ============================================================ */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground">关于本项目</h2>

        {/* 项目介绍 */}
        <div className="mb-6 space-y-4 text-muted-foreground">
          <p>
            这是我个人为了学习 Web3
            开发而创建的练手项目。作为一名程序员，我深知学习新技术时实践的重要性，
            因此创建了这个项目来记录我的学习历程和实践代码。
          </p>
          <p>
            我希望这份学习笔记不仅能帮助我自己巩固知识，也能为其他想要入门 Web3
            开发的程序员提供一些参考和帮助。 如果你也在学习
            Web3，欢迎一起交流学习！
          </p>
        </div>

        {/* 技术栈 */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-foreground">技术栈</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS 4",
              "wagmi",
              "viem",
              "RainbowKit",
              "Cursor 编辑器",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 学习笔记 */}
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
            <BookOpen className="h-5 w-5" />
            学习笔记
          </h3>
          <p className="text-muted-foreground">
            项目中提供了详细的「学习笔记」文档，用于帮助读者快速理解实现方案。
            你可以在项目仓库的{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              学习笔记
            </code>{" "}
            目录中找到这些文档。
          </p>
        </div>

        {/* 链接区域 */}
        <div className="flex flex-wrap gap-4">
          {/* GitHub 链接 */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Github className="h-5 w-5" />
            GitHub 仓库
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          {/* 作者网站链接 */}
          <a
            href={AUTHOR_WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            作者个人网站
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </section>
    </main>
  );
}
