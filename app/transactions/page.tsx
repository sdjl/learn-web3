"use client";

// ============================================================
// 交易历史页面：查看用户的历史交易记录
// ============================================================
// 作用：
// - 整合所有交易历史相关的功能组件
// - 提供统一的页面布局和样式
// - 作为交易历史功能的入口页面
// ============================================================

import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { TransactionList } from "./components/TransactionList";
import { EmptyState } from "./components/EmptyState";

export default function TransactionsPage() {
  // 获取钱包连接状态和当前链信息
  const { isConnected, chain } = useAccount();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-zinc-900 dark:text-zinc-100">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="交易历史"
        title="查看交易记录"
        description={
          isConnected && chain
            ? `查看你的钱包地址在 ${chain.name} 上的所有交易历史记录`
            : "查看你的钱包地址在区块链上的所有交易历史记录"
        }
      />

      {/* 交易列表组件 - 仅在钱包已连接时显示，展示交易历史数据 */}
      {isConnected && <TransactionList />}

      {/* 空状态组件 - 仅在钱包未连接时显示，提示用户连接钱包 */}
      {!isConnected && <EmptyState />}
    </main>
  );
}
