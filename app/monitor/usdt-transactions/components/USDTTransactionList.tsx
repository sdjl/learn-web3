"use client";

// ============================================================
// USDT 交易列表组件：显示 USDT 合约的交易记录
// ============================================================
// 作用：
// - 通过 Server Action 获取 USDT 交易数据
// - 使用通用交易列表组件显示交易记录
// - 提供加载状态和错误处理
// - 支持刷新交易列表
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { useState } from "react";
import { getUSDTRecentTransactions } from "../actions";
import type {
  Transaction,
  EtherscanApiResponse,
} from "@/lib/services/etherscan";
import { TransactionList as CommonTransactionList } from "@/components/transaction/TransactionList";
import { TOKENS, TOKEN_INFO } from "@/lib/config/tokens";

// USDT 代币精度
const USDT_DECIMALS = TOKEN_INFO[TOKENS.USDT].decimals;

export function USDTTransactionList() {
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取 USDT 交易数据
  const { data, isLoading, error, refetch } = useQuery<
    EtherscanApiResponse<Transaction[]>
  >({
    queryKey: ["usdt-transactions", refreshKey],
    queryFn: async () => {
      // 获取最近 10 条交易记录
      return await getUSDTRecentTransactions(10);
    },
    refetchOnWindowFocus: false,
    // 每 30 秒自动刷新一次
    refetchInterval: 30000,
  });

  // 格式化 USDT 数量
  const formatValue = (tx: Transaction) => {
    try {
      return formatUnits(BigInt(tx.value), USDT_DECIMALS);
    } catch {
      return "0";
    }
  };

  // 格式化交易费用（ETH）
  const formatFee = (tx: Transaction) => {
    try {
      const gasUsed = BigInt(tx.gasUsed);
      const gasPrice = BigInt(tx.gasPrice);
      return formatUnits(gasUsed * gasPrice, 18);
    } catch {
      return "0";
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  return (
    <CommonTransactionList
      transactions={data?.result || []}
      title={`${TOKENS.USDT} 最近交易记录`}
      isLoading={isLoading}
      error={error instanceof Error ? error : null}
      loadingText={`加载 ${TOKENS.USDT} 交易数据中...`}
      emptyText={`暂无 ${TOKENS.USDT} 交易记录`}
      errorText={
        error instanceof Error
          ? error.message
          : `获取 ${TOKENS.USDT} 交易数据失败`
      }
      onRefresh={handleRefresh}
      formatValue={formatValue}
      currencySymbol={TOKENS.USDT}
      formatFee={formatFee}
      feeCurrencySymbol={TOKENS.ETH}
      blockExplorerUrl="https://etherscan.io"
      itemProps={{
        typeLabel: `${TOKENS.USDT} 转账`,
        showBothAddresses: true,
        showSeconds: true,
      }}
    />
  );
}
