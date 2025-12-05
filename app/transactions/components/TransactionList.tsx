"use client";

// ============================================================
// 交易列表组件：显示用户的交易历史记录
// ============================================================
// 作用：
// - 通过 Server Action 获取交易数据
// - 显示交易列表，包括交易哈希、时间、金额等信息
// - 提供加载状态和错误处理
// - 支持刷新交易列表
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useState } from "react";
import { getTransactions } from "../actions";
import type { Transaction, EtherscanResponse } from "../types";

export function TransactionList() {
  const { address, chain } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取交易数据
  const { data, isLoading, error, refetch } = useQuery<EtherscanResponse>({
    queryKey: ["transactions", address, chain?.id, refreshKey],
    queryFn: async () => {
      if (!address || !chain?.id) {
        throw new Error("地址或链 ID 缺失");
      }

      // 使用 Server Action 获取交易数据
      return await getTransactions(address, chain.id);
    },
    enabled: Boolean(address && chain?.id),
    refetchOnWindowFocus: false,
  });

  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 格式化地址（显示前6位和后4位）
  const formatAddress = (addr: string) => {
    if (!addr) return "--";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 判断是否为发送交易
  const isSent = (tx: Transaction) => {
    return tx.from.toLowerCase() === address?.toLowerCase();
  };

  // 计算交易费用（ETH）
  const calculateFee = (tx: Transaction) => {
    const gasUsed = BigInt(tx.gasUsed);
    const gasPrice = BigInt(tx.gasPrice);
    return formatEther(gasUsed * gasPrice);
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">加载交易数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-red-500 dark:text-red-400">
            {error instanceof Error ? error.message : "获取交易数据失败"}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const transactions = data?.result || [];

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">暂无交易记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
      {/* 标题和刷新按钮 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">交易历史</h2>
        <button
          onClick={() => {
            setRefreshKey((prev) => prev + 1);
            refetch();
          }}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          刷新
        </button>
      </div>

      {/* 交易列表 */}
      <div className="space-y-4">
        {transactions.map((tx) => {
          const isSentTx = isSent(tx);
          const value = formatEther(BigInt(tx.value));
          const fee = calculateFee(tx);
          const isFailed = tx.isError === "1" || tx.txreceipt_status === "0";

          return (
            <div
              key={tx.hash}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
            >
              <div className="flex flex-col gap-3">
                {/* 交易哈希和状态 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isSentTx
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {isSentTx ? "发送" : "接收"}
                    </span>
                    {isFailed && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        失败
                      </span>
                    )}
                  </div>
                  <a
                    href={`${chain?.blockExplorers?.default.url}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-sky-500 hover:underline"
                  >
                    {formatAddress(tx.hash)}
                  </a>
                </div>

                {/* 交易金额 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    金额
                  </span>
                  <span
                    className={`font-mono text-base font-semibold ${
                      isSentTx
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {isSentTx ? "-" : "+"}
                    {value} {chain?.nativeCurrency?.symbol || "ETH"}
                  </span>
                </div>

                {/* 交易费用 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    交易费用
                  </span>
                  <span className="font-mono text-sm">
                    {fee} {chain?.nativeCurrency?.symbol || "ETH"}
                  </span>
                </div>

                {/* 对方地址 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {isSentTx ? "接收地址" : "发送地址"}
                  </span>
                  <a
                    href={`${chain?.blockExplorers?.default.url}/address/${
                      isSentTx ? tx.to : tx.from
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-sky-500 hover:underline"
                  >
                    {formatAddress(isSentTx ? tx.to : tx.from)}
                  </a>
                </div>

                {/* 时间 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    时间
                  </span>
                  <span className="text-sm">
                    {formatTimestamp(tx.timeStamp)}
                  </span>
                </div>

                {/* 区块号 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    区块
                  </span>
                  <a
                    href={`${chain?.blockExplorers?.default.url}/block/${tx.blockNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-sky-500 hover:underline"
                  >
                    {tx.blockNumber}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
