"use client";

// ============================================================
// Gas 估算结果展示组件
// ============================================================
// 作用：
// - 展示 Gas 估算结果
// - 显示不同优先级的费用预估
// ============================================================

import { TOKENS } from "@/lib/config/tokens";
import type { GasEstimateResult as GasEstimateResultType } from "../types";

interface GasEstimateResultProps {
  result: GasEstimateResultType | null;
}

export function GasEstimateResult({ result }: GasEstimateResultProps) {
  if (!result) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">估算结果</h2>
        <p className="text-sm text-muted-foreground">
          点击「估算 Gas」按钮查看结果
        </p>
      </section>
    );
  }

  if (!result.success) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">估算结果</h2>
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          错误: {result.error}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
      <h2 className="mb-6 text-lg font-semibold">估算结果</h2>

      {/* Gas 单位数量 */}
      <div className="mb-6 rounded-lg bg-muted p-4">
        <div className="text-sm text-muted-foreground">预估 Gas 消耗</div>
        <div className="mt-1 text-2xl font-bold text-foreground">
          {result.gasUnits?.toLocaleString()}{" "}
          <span className="text-sm font-normal">Gas Units</span>
        </div>
      </div>

      {/* 当前 Gas 价格 */}
      {result.gasPrices && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-foreground">
            当前 Gas 价格 (Gwei)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-green-500/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">🐢 安全</div>
              <div className="mt-1 font-mono text-lg font-semibold text-green-600">
                {parseFloat(result.gasPrices.safeGasPrice).toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">🚗 建议</div>
              <div className="mt-1 font-mono text-lg font-semibold text-yellow-600">
                {parseFloat(result.gasPrices.proposeGasPrice).toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">🚀 快速</div>
              <div className="mt-1 font-mono text-lg font-semibold text-red-600">
                {parseFloat(result.gasPrices.fastGasPrice).toFixed(2)}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            基础费用: {parseFloat(result.gasPrices.suggestBaseFee).toFixed(2)}{" "}
            Gwei | 最新区块: #{result.gasPrices.lastBlock}
          </p>
        </div>
      )}

      {/* 预估费用 */}
      {result.estimatedCostEth && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">
            预估交易费用 ({TOKENS.ETH})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-green-500/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">🐢 安全</div>
              <div className="mt-1 font-mono text-sm font-semibold text-foreground">
                {parseFloat(result.estimatedCostEth.safe).toFixed(6)}
              </div>
              <div className="text-xs text-muted-foreground">
                {result.estimatedCostGwei?.safe} Gwei
              </div>
            </div>
            <div className="rounded-lg border border-yellow-500/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">🚗 建议</div>
              <div className="mt-1 font-mono text-sm font-semibold text-foreground">
                {parseFloat(result.estimatedCostEth.propose).toFixed(6)}
              </div>
              <div className="text-xs text-muted-foreground">
                {result.estimatedCostGwei?.propose} Gwei
              </div>
            </div>
            <div className="rounded-lg border border-red-500/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">🚀 快速</div>
              <div className="mt-1 font-mono text-sm font-semibold text-foreground">
                {parseFloat(result.estimatedCostEth.fast).toFixed(6)}
              </div>
              <div className="text-xs text-muted-foreground">
                {result.estimatedCostGwei?.fast} Gwei
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 说明信息 */}
      <div className="mt-6 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <p className="mb-1">
          💡 <strong>说明：</strong>
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>交易费用 = Gas Units × Gas Price</li>
          <li>安全价格：交易可能需要等待较长时间确认</li>
          <li>建议价格：平均确认时间，推荐使用</li>
          <li>快速价格：交易会更快被打包确认</li>
          <li>
            估算使用 Binance 热钱包地址作为 from：
            <code className="ml-1 break-all font-mono text-[10px]">
              0xF977814e90dA44bFA03b6295A0616a897441aceC
            </code>
          </li>
        </ul>
      </div>
    </section>
  );
}
