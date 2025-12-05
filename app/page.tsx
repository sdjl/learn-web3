"use client";

// ============================================================
// 首页组件：钱包连接和查询功能的主页面
// ============================================================
// 作用：
// - 整合所有钱包相关的功能组件
// - 提供统一的页面布局和样式
// - 作为应用的入口页面
// ============================================================

// 导入各个功能组件
import { Header } from "@/components/layout/Header";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { WalletActions } from "./components/WalletActions";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-zinc-900 dark:text-zinc-100">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="learn web3"
        title="RainbowKit + Wagmi 上手指南"
        description="点击下方连接按钮，选择钱包，即可体验钱包连接、链信息与余额查询。"
      />

      {/* 钱包连接组件 - 处理钱包连接和断开，显示连接状态、地址、网络和余额信息 */}
      <WalletConnection />

      {/* 钱包操作组件 - 提供重新获取余额和断开连接的按钮，仅在钱包已连接时显示 */}
      <WalletActions />
    </main>
  );
}
