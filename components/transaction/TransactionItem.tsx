// ============================================================
// 交易项组件：显示单条交易记录的详细信息
// ============================================================
// 作用：
// - 通用的交易记录显示组件
// - 支持不同的货币单位和显示模式
// - 可配置的区块浏览器链接
// ============================================================

import type { Transaction } from "@/lib/services/etherscan";

export interface TransactionItemProps {
  /** 交易记录数据 */
  transaction: Transaction;
  /** 格式化后的交易金额 */
  formattedValue: string;
  /** 货币符号（如 ETH、USDT） */
  currencySymbol: string;
  /** 格式化后的交易费用 */
  formattedFee: string;
  /** 费用货币符号（通常是 ETH） */
  feeCurrencySymbol?: string;
  /** 区块浏览器基础 URL */
  blockExplorerUrl: string;
  /** 是否显示发送/接收状态（用于用户自己的交易） */
  showDirection?: boolean;
  /** 用户地址（用于判断发送/接收） */
  userAddress?: string;
  /** 交易类型标签（如 "USDT 转账"） */
  typeLabel?: string;
  /** 是否显示发送地址和接收地址（默认根据 showDirection 决定） */
  showBothAddresses?: boolean;
  /** 是否显示秒（时间格式） */
  showSeconds?: boolean;
}

export function TransactionItem({
  transaction,
  formattedValue,
  currencySymbol,
  formattedFee,
  feeCurrencySymbol = "ETH",
  blockExplorerUrl,
  showDirection = false,
  userAddress,
  typeLabel,
  showBothAddresses = false,
  showSeconds = false,
}: TransactionItemProps) {
  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds && { second: "2-digit" }),
    });
  };

  // 格式化地址（显示前6位和后4位）
  const formatAddress = (addr: string) => {
    if (!addr) return "--";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 判断是否为发送交易
  const isSent =
    showDirection && userAddress
      ? transaction.from.toLowerCase() === userAddress.toLowerCase()
      : false;

  const isFailed =
    transaction.isError === "1" || transaction.txreceipt_status === "0";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex flex-col gap-3">
        {/* 交易哈希和状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showDirection && (
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  isSent
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {isSent ? "发送" : "接收"}
              </span>
            )}
            {typeLabel && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {typeLabel}
              </span>
            )}
            {isFailed && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                失败
              </span>
            )}
          </div>
          <a
            href={`${blockExplorerUrl}/tx/${transaction.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-sky-500 hover:underline"
          >
            {formatAddress(transaction.hash)}
          </a>
        </div>

        {/* 交易金额 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">金额</span>
          <span
            className={`font-mono text-base font-semibold ${
              showDirection
                ? isSent
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {showDirection && isSent ? "-" : showDirection ? "+" : ""}
            {formattedValue} {currencySymbol}
          </span>
        </div>

        {/* 地址显示 */}
        {showBothAddresses ? (
          <>
            {/* 发送地址 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                发送地址
              </span>
              <a
                href={`${blockExplorerUrl}/address/${transaction.from}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-sky-500 hover:underline"
              >
                {formatAddress(transaction.from)}
              </a>
            </div>

            {/* 接收地址 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                接收地址
              </span>
              <a
                href={`${blockExplorerUrl}/address/${transaction.to}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-sky-500 hover:underline"
              >
                {formatAddress(transaction.to)}
              </a>
            </div>
          </>
        ) : (
          /* 对方地址（仅显示一个） */
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {isSent ? "接收地址" : "发送地址"}
            </span>
            <a
              href={`${blockExplorerUrl}/address/${
                isSent ? transaction.to : transaction.from
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-sky-500 hover:underline"
            >
              {formatAddress(isSent ? transaction.to : transaction.from)}
            </a>
          </div>
        )}

        {/* 交易费用 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            交易费用
          </span>
          <span className="font-mono text-sm">
            {formattedFee} {feeCurrencySymbol}
          </span>
        </div>

        {/* 时间 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">时间</span>
          <span className="text-sm">
            {formatTimestamp(transaction.timeStamp)}
          </span>
        </div>

        {/* 区块号 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">区块</span>
          <a
            href={`${blockExplorerUrl}/block/${transaction.blockNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-sky-500 hover:underline"
          >
            {transaction.blockNumber}
          </a>
        </div>
      </div>
    </div>
  );
}
