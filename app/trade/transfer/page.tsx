"use client";

// ============================================================
// 转账页面：在指定网络上发送代币
// ============================================================
// 作用：
// - 整合所有转账相关的功能组件
// - 提供统一的页面布局和样式
// - 作为转账功能的入口页面
// ============================================================

import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { Form } from "./components/Form";
import { WalletNotConnected } from "@/components/wallet/WalletNotConnected";

export default function TransferPage() {
  // 获取钱包连接状态和当前链信息
  const { isConnected, chain } = useAccount();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="转账"
        title="发送代币"
        description={
          chain
            ? `在当前网络（${chain.name}）上发送代币到指定地址`
            : "连接钱包后，在当前网络上发送代币到指定地址"
        }
      />

      {/* 钱包连接组件 - 处理钱包连接，显示网络和余额信息 */}
      <WalletConnection
        title="连接钱包"
        description="请先连接钱包"
        showFullInfo={false}
        showInfoOnlyWhenConnected={true}
      />

      {/* 转账表单组件 - 仅在钱包已连接时显示，处理转账输入和交易提交 */}
      {isConnected && <Form />}

      {/* 空状态组件 - 仅在钱包未连接时显示，提示用户连接钱包 */}
      {!isConnected && (
        <WalletNotConnected message="请先连接钱包以使用转账功能" />
      )}
    </main>
  );
}
