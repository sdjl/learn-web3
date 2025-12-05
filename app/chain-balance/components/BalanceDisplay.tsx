"use client";

// ============================================================
// 余额显示组件：显示当前链和选中链的余额
// ============================================================
// 作用：
// - 显示当前连接链的余额
// - 显示选中链的余额（如果选择了不同的链）
// - 提供刷新余额的按钮
// ============================================================

import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { supportedChains } from "@/lib/config/chains";

interface BalanceDisplayProps {
  // 当前选择的链 ID
  selectedChainId: number | undefined;
}

export function BalanceDisplay({ selectedChainId }: BalanceDisplayProps) {
  // 获取钱包地址和当前连接的链
  const { address, chain, isConnected } = useAccount();

  // 查询当前连接链的余额
  const {
    data: currentBalanceData,
    isLoading: isCurrentBalanceLoading,
    refetch: refetchCurrentBalance,
  } = useBalance({
    address,
    query: { enabled: Boolean(address && isConnected) },
  });

  // 查询指定链的余额（如果选择了不同的链）
  const {
    data: selectedBalanceData,
    isLoading: isSelectedBalanceLoading,
    refetch: refetchSelectedBalance,
  } = useBalance({
    address,
    chainId: selectedChainId,
    query: {
      enabled: Boolean(
        address && selectedChainId && selectedChainId !== chain?.id
      ),
    },
  });

  // 处理刷新余额
  const handleRefreshBalance = () => {
    if (selectedChainId === chain?.id) {
      refetchCurrentBalance();
    } else {
      refetchSelectedBalance();
    }
  };

  return (
    <div>
      {/* 当前链余额显示 */}
      <div className="mb-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            当前链余额 ({chain?.name || "未知"})
          </span>
        </div>
        <div className="text-2xl font-bold">
          {isCurrentBalanceLoading ? (
            <span className="text-zinc-400">查询中...</span>
          ) : currentBalanceData?.value ? (
            `${formatEther(currentBalanceData.value)} ${
              currentBalanceData.symbol || ""
            }`
          ) : (
            <span className="text-zinc-400">--</span>
          )}
        </div>
      </div>

      {/* 选中链余额显示（如果选择了不同的链） */}
      {selectedChainId && selectedChainId !== chain?.id && (
        <div className="mb-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-sky-600 dark:text-sky-400">
              选中链余额 (
              {supportedChains.find((c) => c.id === selectedChainId)?.name ||
                "未知"}
              )
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              (需要切换链才能查询)
            </span>
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            {isSelectedBalanceLoading ? (
              <span>查询中...</span>
            ) : selectedBalanceData?.value ? (
              `${formatEther(selectedBalanceData.value)} ${
                selectedBalanceData.symbol || ""
              }`
            ) : (
              <span>--</span>
            )}
          </div>
        </div>
      )}

      {/* 刷新余额按钮 */}
      <div className="mt-4">
        <button
          onClick={handleRefreshBalance}
          disabled={
            isCurrentBalanceLoading || isSelectedBalanceLoading || !isConnected
          }
          className="rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:text-sky-300"
        >
          {isCurrentBalanceLoading || isSelectedBalanceLoading
            ? "刷新中..."
            : "刷新余额"}
        </button>
      </div>
    </div>
  );
}
