// ============================================================
// 交易列表容器组件：处理交易列表的加载、错误和空状态
// ============================================================
// 作用：
// - 提供统一的交易列表容器
// - 处理加载、错误、空状态
// - 支持刷新功能
// ============================================================

import type { Transaction } from "@/lib/services/etherscan";
import { TransactionItem, type TransactionItemProps } from "./TransactionItem";

export interface TransactionListProps {
  /** 交易记录列表 */
  transactions: Transaction[];
  /** 标题 */
  title: string;
  /** 加载状态 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: Error | null;
  /** 加载中的提示文本 */
  loadingText?: string;
  /** 空状态的提示文本 */
  emptyText?: string;
  /** 错误状态的提示文本 */
  errorText?: string;
  /** 刷新函数 */
  onRefresh?: () => void;
  /** 格式化交易金额的函数 */
  formatValue: (tx: Transaction) => string;
  /** 货币符号 */
  currencySymbol: string;
  /** 格式化交易费用的函数 */
  formatFee: (tx: Transaction) => string;
  /** 费用货币符号 */
  feeCurrencySymbol?: string;
  /** 区块浏览器基础 URL */
  blockExplorerUrl: string;
  /** 传递给 TransactionItem 的其他属性 */
  itemProps?: Omit<
    TransactionItemProps,
    | "transaction"
    | "formattedValue"
    | "currencySymbol"
    | "formattedFee"
    | "feeCurrencySymbol"
    | "blockExplorerUrl"
  >;
}

export function TransactionList({
  transactions,
  title,
  isLoading = false,
  error = null,
  loadingText = "加载交易数据中...",
  emptyText = "暂无交易记录",
  errorText,
  onRefresh,
  formatValue,
  currencySymbol,
  formatFee,
  feeCurrencySymbol = "ETH",
  blockExplorerUrl,
  itemProps,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-red-500 dark:text-red-400">
            {errorText || error?.message || "获取交易数据失败"}
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
            >
              重试
            </button>
          )}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">{emptyText}</p>
        </div>
      </div>
    );
  }

  // 去重：确保每个交易哈希只出现一次
  // 使用 Map 保留第一次出现的交易记录
  const uniqueTransactions = Array.from(
    new Map(transactions.map((tx) => [tx.hash, tx])).values()
  );

  return (
    <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
      {/* 标题和刷新按钮 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            刷新
          </button>
        )}
      </div>

      {/* 交易列表 */}
      <div className="space-y-4">
        {uniqueTransactions.map((tx) => (
          <TransactionItem
            key={tx.hash}
            transaction={tx}
            formattedValue={formatValue(tx)}
            currencySymbol={currencySymbol}
            formattedFee={formatFee(tx)}
            feeCurrencySymbol={feeCurrencySymbol}
            blockExplorerUrl={blockExplorerUrl}
            {...itemProps}
          />
        ))}
      </div>
    </div>
  );
}
