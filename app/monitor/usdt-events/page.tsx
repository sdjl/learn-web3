"use client";

// ============================================================
// USDT 合约事件监听页面：监控 USDT 合约的 Transfer 事件
// ============================================================
// 作用：
// - 整合 USDT 事件监控相关的功能组件
// - 提供统一的页面布局和样式
// - 作为 USDT 事件监控功能的入口页面
// ============================================================

import { Header } from "@/components/layout/Header";
import { USDTEventList } from "./components/USDTEventList";

export default function USDTEventsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="USDT 合约事件"
        title="实时监听 USDT 合约事件"
        description="监控 USDT 合约在以太坊主网上的所有事件，支持按事件类型筛选，可开启自动刷新（12秒一次）"
      />

      {/* USDT 事件列表组件 - 显示最近的事件记录 */}
      <USDTEventList />
    </main>
  );
}
