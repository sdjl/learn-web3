"use client";

// ============================================================
// 转账页面：在 Sepolia 网络上发送测试币
// ============================================================

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { parseEther, isAddress } from "viem";

export default function TransferPage() {
  // ============================================================
  // 获取钱包连接状态和账户信息
  // ============================================================
  const { address, chain, isConnected } = useAccount();

  // ============================================================
  // 查询当前账户余额
  // ============================================================
  const { data: balanceData } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  // ============================================================
  // 表单状态
  // ============================================================
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  // ============================================================
  // 准备交易数据
  // ============================================================
  const {
    data: hash,
    sendTransaction,
    isPending,
    error,
  } = useSendTransaction();

  // ============================================================
  // 等待交易确认
  // ============================================================
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // ============================================================
  // 处理转账
  // ============================================================
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证地址
    if (!isAddress(toAddress)) {
      alert("请输入有效的以太坊地址");
      return;
    }

    // 验证金额
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("请输入有效的金额");
      return;
    }

    // 检查余额
    if (balanceData && parseFloat(balanceData.formatted) < amountNum) {
      alert("余额不足");
      return;
    }

    // 检查网络
    if (chain?.id !== sepolia.id) {
      alert(`请切换到 Sepolia 网络。当前网络：${chain?.name || "未连接"}`);
      return;
    }

    // 发送交易
    try {
      sendTransaction({
        to: toAddress as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (err) {
      console.error("发送交易失败:", err);
    }
  };

  // ============================================================
  // 检查是否在正确的网络上
  // ============================================================
  const isWrongNetwork = isConnected && chain?.id !== sepolia.id;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-zinc-900 dark:text-zinc-100">
      {/* ============================================================
          页面标题区域
          ============================================================ */}
      <header className="space-y-4 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
          Sepolia 测试币转账
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          发送测试币
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          在 Sepolia 测试网络上发送测试币（Sepolia ETH）到指定地址
        </p>
      </header>

      {/* ============================================================
          连接钱包区域
          ============================================================ */}
      <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">连接钱包</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              请先连接钱包并切换到 Sepolia 网络
            </p>
          </div>
          <ConnectButton />
        </div>

        {/* 显示当前网络和余额 */}
        {isConnected && (
          <div className="mt-6 grid gap-4 rounded-2xl border border-dashed border-zinc-200 p-4 text-sm dark:border-zinc-700">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">当前网络</span>
              <span
                className={`text-base font-medium ${
                  isWrongNetwork ? "text-red-500" : "text-green-500"
                }`}
              >
                {chain?.name || "未知"}
                {isWrongNetwork && " (请切换到 Sepolia)"}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">账户余额</span>
              <span className="text-base font-medium font-mono">
                {balanceData
                  ? `${balanceData.formatted} ${balanceData.symbol}`
                  : "加载中..."}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================
          转账表单区域
          ============================================================ */}
      {isConnected && (
        <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-6 text-lg font-semibold">转账信息</h2>

          <form onSubmit={handleTransfer} className="space-y-6">
            {/* 接收地址输入 */}
            <div>
              <label
                htmlFor="toAddress"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                接收地址
              </label>
              <input
                id="toAddress"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
              {toAddress && !isAddress(toAddress) && (
                <p className="mt-1 text-sm text-red-500">无效的地址格式</p>
              )}
            </div>

            {/* 转账金额输入 */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                转账金额 (Sepolia ETH)
              </label>
              <input
                id="amount"
                type="number"
                step="0.000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
              {balanceData &&
                amount &&
                parseFloat(amount) > parseFloat(balanceData.formatted) && (
                  <p className="mt-1 text-sm text-red-500">余额不足</p>
                )}
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                错误: {error.message}
              </div>
            )}

            {/* 交易状态提示 */}
            {hash && (
              <div className="space-y-2">
                {isPending && (
                  <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                    交易已提交，等待钱包确认...
                  </div>
                )}
                {isConfirming && (
                  <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    交易已确认，等待区块确认...
                  </div>
                )}
                {isConfirmed && (
                  <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <p className="font-semibold">交易成功！</p>
                    <p className="mt-1 font-mono text-xs">交易哈希: {hash}</p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs underline"
                    >
                      在 Sepolia Etherscan 上查看
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={
                isPending ||
                isConfirming ||
                isWrongNetwork ||
                !toAddress ||
                !amount ||
                !isAddress(toAddress)
              }
              className="w-full rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "等待钱包确认..."
                : isConfirming
                ? "确认中..."
                : isWrongNetwork
                ? "请切换到 Sepolia 网络"
                : "发送交易"}
            </button>
          </form>
        </section>
      )}

      {/* ============================================================
          未连接钱包提示
          ============================================================ */}
      {!isConnected && (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-400">
            请先连接钱包以使用转账功能
          </p>
        </div>
      )}
    </main>
  );
}
