"use client";

// ============================================================
// 合约查询表单组件：处理合约地址输入和查询提交
// ============================================================
// 作用：
// - 提供合约地址输入框
// - 实时验证地址格式
// - 处理查询提交
// - 显示查询状态和错误信息
// ============================================================

import { useState } from "react";
import { isAddress } from "viem";
import { supportedChains } from "@/lib/config/chains";
import { USDT_CONTRACT_ADDRESS } from "@/lib/config/contracts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import type { FormProps } from "../types";

export function Form({ onQuery }: FormProps) {
  // 表单状态
  const [address, setAddress] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<string>(
    supportedChains[0].id.toString()
  ); // 默认选中第一个链
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 获取选中的链
  const selectedChain =
    supportedChains.find((c) => c.id.toString() === selectedChainId) ||
    supportedChains[0];

  // 处理查询
  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证地址格式
    if (!isAddress(address)) {
      setError("请输入有效的地址格式");
      return;
    }

    // 使用用户选择的网络
    const targetChainId = selectedChain.id;
    const targetRpcUrl = selectedChain.rpcUrls.default.http[0];
    if (!targetRpcUrl) {
      setError(`无法获取 ${selectedChain.name} 网络的 RPC URL`);
      return;
    }

    // 调用查询
    setIsLoading(true);
    try {
      const { getContractInfo } = await import("../actions");
      const result = await getContractInfo({
        address,
        chainId: targetChainId,
        rpcUrl: targetRpcUrl,
      });
      onQuery(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "查询失败，请重试";
      setError(errorMessage);
      onQuery({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
      <h2 className="mb-6 text-lg font-semibold">查询合约</h2>

      {/* 选择的网络提示 */}
      <div className="mb-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        查询网络:{" "}
        <span className="font-bold text-primary">{selectedChain.name}</span> (链
        ID: {selectedChain.id})
      </div>

      <form onSubmit={handleQuery} className="space-y-6">
        {/* 网络选择 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            选择网络
          </label>
          <ToggleGroup
            type="single"
            value={selectedChainId}
            onValueChange={(value) => {
              if (value) {
                setSelectedChainId(value);
                setError(null);
              }
            }}
            disabled={isLoading}
            className="w-full"
          >
            {supportedChains.map((chain) => (
              <ToggleGroupItem
                key={chain.id}
                value={chain.id.toString()}
                className="flex-1"
              >
                {chain.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* 合约地址输入 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="contractAddress"
              className="block text-sm font-medium text-foreground"
            >
              合约地址
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAddress(USDT_CONTRACT_ADDRESS);
                setError(null);
              }}
              disabled={isLoading}
            >
              使用 USDT 地址
            </Button>
          </div>
          <input
            id="contractAddress"
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError(null);
            }}
            placeholder="0x..."
            required
            disabled={isLoading}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {address && !isAddress(address) && (
            <p className="mt-1 text-sm text-destructive">无效的地址格式</p>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            错误: {error}
          </div>
        )}

        {/* 提交按钮 */}
        <Button
          type="submit"
          disabled={isLoading || !address || !isAddress(address)}
          className="w-full"
        >
          {isLoading ? "查询中..." : "查询合约"}
        </Button>
      </form>
    </section>
  );
}
