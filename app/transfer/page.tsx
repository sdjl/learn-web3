"use client";

// ============================================================
// 转账页面：在 Sepolia 网络上发送测试币
// ============================================================
// 作用：
// - 整合所有转账相关的功能组件
// - 提供统一的页面布局和样式
// - 作为转账功能的入口页面
// ============================================================

import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Header } from "./components/Header";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { Form } from "./components/Form";
import { EmptyState } from "./components/EmptyState";

export default function TransferPage() {
  // 获取钱包连接状态
  const { isConnected } = useAccount();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-zinc-900 dark:text-zinc-100">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header />

      {/* 钱包连接组件 - 处理钱包连接，显示网络和余额信息，检查是否在 Sepolia 网络 */}
      <WalletConnection
        title="连接钱包"
        description="请先连接钱包并切换到 Sepolia 网络"
        showFullInfo={false}
        showInfoOnlyWhenConnected={true}
        requiredChain={sepolia}
      />

      {/* 转账表单组件 - 仅在钱包已连接时显示，处理转账输入和交易提交 */}
      {isConnected && <Form />}

      {/* 空状态组件 - 仅在钱包未连接时显示，提示用户连接钱包 */}
      {!isConnected && <EmptyState />}
    </main>
  );
}
