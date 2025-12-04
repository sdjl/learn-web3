"use client";

// ============================================================
// 钱包操作组件：提供钱包相关的操作按钮
// ============================================================
// 作用：
// - 提供重新获取余额的按钮
// - 提供断开钱包连接的按钮
// - 仅在钱包已连接时显示
// ============================================================

import { useAccount, useBalance, useDisconnect } from "wagmi";

export function WalletActions() {
  // ============================================================
  // 获取钱包地址（用于判断是否显示操作按钮）
  // ============================================================
  const { address } = useAccount();

  // ============================================================
  // 获取余额查询的 refetch 函数，用于手动刷新余额
  // ============================================================
  const { refetch: refetchBalance } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  // ============================================================
  // 获取断开连接的功能
  // ============================================================
  // disconnect: 断开连接的函数
  // isPending: 是否正在断开连接（用于显示加载状态）
  const { disconnect, isPending: isDisconnecting } = useDisconnect();

  // 如果钱包未连接，不显示操作按钮
  if (!address) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {/* 重新获取余额按钮 */}
      <button
        onClick={() => refetchBalance()} // 调用 refetchBalance 重新查询余额
        className="rounded-full border border-sky-500/40 px-5 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-500/10 dark:text-sky-300"
      >
        重新获取余额
      </button>
      {/* 断开连接按钮 */}
      <button
        onClick={() => disconnect()} // 调用 disconnect 断开钱包连接
        disabled={isDisconnecting} // 断开连接过程中禁用按钮，防止重复点击
        className="rounded-full border border-red-500/40 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-300"
      >
        {isDisconnecting ? "断开中..." : "断开连接"}
      </button>
    </div>
  );
}
