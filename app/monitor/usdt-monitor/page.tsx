"use client";

// ============================================================
// USDT 监控页面：监控 USDT 合约的交易记录
// ============================================================
// 作用：
// - 整合 USDT 监控相关的功能组件
// - 提供统一的页面布局和样式
// - 作为 USDT 监控功能的入口页面
// ============================================================

import { Header } from "@/components/layout/Header";
import { USDTTransactionList } from "./components/USDTTransactionList";

export default function USDTMonitorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="USDT 监控"
        title="实时监控 USDT 交易"
        description="查看 USDT 合约在以太坊主网上的最近 10 条交易记录，数据每 30 秒自动刷新"
      />

      {/* USDT 交易列表组件 - 显示最近的交易记录 */}
      <USDTTransactionList />
    </main>
  );
}
