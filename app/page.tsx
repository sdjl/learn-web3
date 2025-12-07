"use client";

// ============================================================
// 首页组件：钱包连接和查询功能的主页面
// ============================================================
// 作用：
// - 整合所有钱包相关的功能组件
// - 提供统一的页面布局和样式
// - 作为应用的入口页面
// ============================================================

import { useAccount, useBalance, useDisconnect } from "wagmi";
import { Header } from "@/components/layout/Header";
import { WalletConnection } from "@/components/wallet/WalletConnection";

export default function Home() {
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="learn web3"
        title="一边写代码一边学习 Web3"
        description="点击下方连接按钮，选择钱包，即可体验钱包连接、链信息与余额查询。"
      />

      {/* 钱包连接组件 - 处理钱包连接和断开，显示连接状态、地址、网络和余额信息 */}
      <WalletConnection />

      {/* 钱包操作组件 - 提供重新获取余额和断开连接的按钮，仅在钱包已连接时显示 */}
      {address && (
        <div className="flex flex-wrap gap-4">
          {/* 重新获取余额按钮 */}
          <button
            onClick={() => refetchBalance()} // 调用 refetchBalance 重新查询余额
            className="rounded-full border border-primary/40 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            重新获取余额
          </button>
          {/* 断开连接按钮 */}
          <button
            onClick={() => disconnect()} // 调用 disconnect 断开钱包连接
            disabled={isDisconnecting} // 断开连接过程中禁用按钮，防止重复点击
            className="rounded-full border border-destructive/40 px-5 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDisconnecting ? "断开中..." : "断开连接"}
          </button>
        </div>
      )}
    </main>
  );
}
