"use client";

// ============================================================
// Gas 估算表单组件
// ============================================================
// 作用：
// - 提供操作类型选择（transfer/approve）
// - 提供参数输入（地址、金额）
// - 触发 Gas 估算
// ============================================================

import { useState } from "react";
import { isAddress } from "viem";
import { TOKENS } from "@/lib/config/tokens";
import type { GasEstimateResult, OperationType } from "../types";
import { estimateUsdtGas } from "../actions";
import { DEFAULT_ADDRESS } from "../utils";

interface GasEstimatorFormProps {
  onEstimateComplete: (result: GasEstimateResult) => void;
}

export function GasEstimatorForm({
  onEstimateComplete,
}: GasEstimatorFormProps) {
  // 表单状态
  const [operationType, setOperationType] = useState<OperationType>("transfer");
  const [toAddress, setToAddress] = useState(DEFAULT_ADDRESS);
  const [amount, setAmount] = useState("100");
  const [spenderAddress, setSpenderAddress] = useState(DEFAULT_ADDRESS);
  const [isLoading, setIsLoading] = useState(false);

  // 获取当前操作使用的地址
  const currentAddress =
    operationType === "transfer" ? toAddress : spenderAddress;
  const isAddressValid = isAddress(currentAddress);

  // 处理估算
  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await estimateUsdtGas(
        operationType,
        toAddress,
        amount,
        spenderAddress
      );
      onEstimateComplete(result);
    } catch (error) {
      onEstimateComplete({
        success: false,
        error: error instanceof Error ? error.message : "估算失败",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
      <h2 className="mb-6 text-lg font-semibold">估算参数</h2>

      {/* 网络提示 */}
      <div className="mb-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        仅支持 <span className="font-bold text-primary">以太坊主网</span> 上的{" "}
        <span className="font-bold text-primary">{TOKENS.USDT}</span> 合约
      </div>

      <form onSubmit={handleEstimate} className="space-y-6">
        {/* 操作类型选择 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            操作类型
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="operationType"
                value="transfer"
                checked={operationType === "transfer"}
                onChange={() => setOperationType("transfer")}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-sm">Transfer（转账）</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="operationType"
                value="approve"
                checked={operationType === "approve"}
                onChange={() => setOperationType("approve")}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-sm">Approve（授权）</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {operationType === "transfer"
              ? "Transfer: 将 USDT 从你的地址转账到目标地址"
              : "Approve: 授权某个地址（如 DEX）可以使用你的 USDT"}
          </p>
        </div>

        {/* 地址输入 */}
        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {operationType === "transfer" ? "接收方地址" : "被授权方地址"}
          </label>
          <input
            id="address"
            type="text"
            value={operationType === "transfer" ? toAddress : spenderAddress}
            onChange={(e) =>
              operationType === "transfer"
                ? setToAddress(e.target.value)
                : setSpenderAddress(e.target.value)
            }
            placeholder="0x..."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          {currentAddress && !isAddressValid && (
            <p className="mt-1 text-sm text-destructive">无效的地址格式</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            已预填默认地址用于演示，你可以修改为任意有效地址
          </p>
        </div>

        {/* 金额输入 */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            金额 ({TOKENS.USDT})
          </label>
          <input
            id="amount"
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {operationType === "transfer"
              ? "要转账的 USDT 数量"
              : "授权的 USDT 数量上限"}
          </p>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isLoading || !isAddressValid || !amount}
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "估算中..." : "估算 Gas"}
        </button>
      </form>
    </section>
  );
}
