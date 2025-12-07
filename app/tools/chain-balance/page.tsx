"use client";

// ============================================================
// 链切换和余额查询页面
// ============================================================
// 作用：
// - 整合所有链切换和余额查询相关的功能组件
// - 提供统一的页面布局和样式
// - 作为链切换和余额查询功能的入口页面
// ============================================================

import { useAccount } from "wagmi";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { ChainSelector } from "./components/ChainSelector";
import { BalanceDisplay } from "./components/BalanceDisplay";
import { WalletNotConnected } from "@/components/wallet/WalletNotConnected";

export default function ChainBalancePage() {
  // 获取钱包连接状态和当前链信息
  const { chain, isConnected, address } = useAccount();

  // 当前选择的链（用于查询余额），默认使用当前连接的链
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(
    chain?.id
  );

  // 当链切换时，同步更新选中的链 ID（使用 useMemo 避免在 effect 中 setState）
  const currentChainId = useMemo(() => chain?.id, [chain?.id]);
  const effectiveSelectedChainId = selectedChainId ?? currentChainId;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="链切换与余额查询"
        title="切换链并查询余额"
        description="在不同链之间切换，并查询不同链的账户余额"
      />

      {/* 链切换和余额查询区域 - 仅在钱包已连接时显示 */}
      {isConnected && address && (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          {/* 链选择器组件 - 处理链的切换和选择 */}
          <ChainSelector
            selectedChainId={effectiveSelectedChainId}
            onSelectChain={(chainId) => {
              setSelectedChainId(chainId);
            }}
          />

          {/* 余额显示组件 - 显示当前链和选中链的余额，提供刷新按钮 */}
          <BalanceDisplay selectedChainId={effectiveSelectedChainId} />
        </section>
      )}

      {/* 空状态组件 - 仅在钱包未连接时显示，提示用户连接钱包 */}
      {!isConnected && (
        <WalletNotConnected message="请先连接钱包以使用链切换和余额查询功能" />
      )}
    </main>
  );
}
