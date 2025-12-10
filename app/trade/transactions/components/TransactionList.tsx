"use client";

// ============================================================
// 交易列表组件：显示用户的交易历史记录
// ============================================================
// 作用：
// - 通过 Server Action 获取交易数据
// - 使用通用交易列表组件显示交易记录
// - 提供加载状态和错误处理
// - 支持刷新交易列表
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useState } from "react";
import { TOKENS } from "@/lib/config/tokens";
import { getTransactions } from "../actions";
import type {
  Transaction,
  EtherscanApiResponse,
} from "@/lib/services/etherscan";
import { TransactionList as CommonTransactionList } from "@/components/transaction/TransactionList";

export function TransactionList() {
  const { address, chain } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取交易数据
  const { data, isLoading, error, refetch } = useQuery<
    EtherscanApiResponse<Transaction[]>
  >({
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

  // 格式化交易金额（ETH）
  const formatValue = (tx: Transaction) => {
    return formatEther(BigInt(tx.value));
  };

  // 格式化交易费用（ETH）
  const formatFee = (tx: Transaction) => {
    const gasUsed = BigInt(tx.gasUsed);
    const gasPrice = BigInt(tx.gasPrice);
    return formatEther(gasUsed * gasPrice);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  return (
    <CommonTransactionList
      transactions={data?.result || []}
      title="交易历史"
      isLoading={isLoading}
      error={error instanceof Error ? error : null}
      loadingText="加载交易数据中..."
      emptyText="暂无交易记录"
      onRefresh={handleRefresh}
      formatValue={formatValue}
      currencySymbol={chain?.nativeCurrency?.symbol || TOKENS.ETH}
      formatFee={formatFee}
      feeCurrencySymbol={chain?.nativeCurrency?.symbol || TOKENS.ETH}
      blockExplorerUrl={
        chain?.blockExplorers?.default.url || "https://etherscan.io"
      }
      itemProps={{
        showDirection: true,
        userAddress: address,
      }}
    />
  );
}
