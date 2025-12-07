"use client";

// ============================================================
// 合约查询页面：查询合约信息和源代码的主页面
// ============================================================
// 作用：
// - 整合所有合约查询相关的功能组件
// - 提供统一的页面布局和样式
// - 作为合约查询功能的入口页面
// ============================================================

import { useState } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { WalletNotConnected } from "@/components/wallet/WalletNotConnected";
import { Form } from "./components/Form";
import { ContractInfoDisplay } from "./components/ContractInfo";
import type { ContractInfo } from "./types";

export default function ContractQueryPage() {
  // 获取钱包连接状态
  const { isConnected } = useAccount();

  // 查询状态
  const [contractInfo, setContractInfo] = useState<
    ContractInfo | { error: string } | null
  >(null);

  // 处理查询结果
  const handleQuery = (result: ContractInfo | { error: string }) => {
    setContractInfo(result);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="合约查询"
        title="查询合约信息"
        description="输入合约地址，查看合约的基本信息、余额和源代码。"
      />

      {/* 查询表单组件 - 处理合约地址输入和查询提交 */}
      <Form onQuery={handleQuery} />

      {/* 查询结果展示 - 显示合约信息 */}
      {contractInfo && !("error" in contractInfo) && (
        <ContractInfoDisplay contractInfo={contractInfo} />
      )}

      {/* 错误信息展示 */}
      {contractInfo && "error" in contractInfo && (
        <div className="rounded-3xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
          <p className="font-semibold">查询失败</p>
          <p className="mt-1">{contractInfo.error}</p>
        </div>
      )}

      {/* 空状态组件 - 仅在钱包未连接时显示，提示用户连接钱包 */}
      {!isConnected && (
        <WalletNotConnected message="请先连接钱包以使用合约查询功能" />
      )}
    </main>
  );
}
