"use client";

// ============================================================
// Gas 估算页面：估算 USDT 合约调用的 Gas 费用
// ============================================================
// 作用：
// - 整合所有 Gas 估算相关的功能组件
// - 提供统一的页面布局和样式
// - 作为 Gas 估算功能的入口页面
// ============================================================

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TOKENS } from "@/lib/config/tokens";
import { GasEstimatorForm } from "./components/GasEstimatorForm";
import { GasEstimateResult } from "./components/GasEstimateResult";
import type { GasEstimateResult as GasEstimateResultType } from "./types";

export default function GasEstimatorPage() {
  // 估算结果状态
  const [estimateResult, setEstimateResult] =
    useState<GasEstimateResultType | null>(null);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="工具"
        title="Gas 费用估算"
        description={`估算 ${TOKENS.USDT} 合约调用（Transfer 和 Approve）所需的 Gas 费用，基于以太坊主网当前的 Gas 价格`}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 估算表单组件 - 输入参数并触发估算 */}
        <GasEstimatorForm onEstimateComplete={setEstimateResult} />

        {/* 结果展示组件 - 显示估算结果和费用预估 */}
        <GasEstimateResult result={estimateResult} />
      </div>
    </main>
  );
}
