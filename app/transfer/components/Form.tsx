"use client";

// ============================================================
// 转账表单组件：处理转账输入和交易提交
// ============================================================
// 作用：
// - 提供接收地址和转账金额的输入框
// - 实时验证地址格式和余额
// - 处理转账交易提交
// - 显示交易状态和错误信息
// ============================================================

import { useState } from "react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { parseEther, formatEther, isAddress } from "viem";

export function Form() {
  // 获取钱包连接状态和账户信息
  const { address, chain } = useAccount();

  // 查询当前账户余额
  const { data: balanceData } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  // 表单状态
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  // 准备交易数据
  const {
    data: hash,
    sendTransaction,
    isPending,
    error,
  } = useSendTransaction();

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // 检查是否在正确的网络上
  const isWrongNetwork = chain?.id !== sepolia.id;

  // 处理转账
  const handleTransfer = async (e: React.FormEvent) => {
    // 阻止表单默认提交行为
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
    if (balanceData && balanceData.value) {
      const balanceInEther = parseFloat(formatEther(balanceData.value));
      if (balanceInEther < amountNum) {
        alert("余额不足");
        return;
      }
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

  return (
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
            balanceData.value &&
            amount &&
            parseFloat(amount) > parseFloat(formatEther(balanceData.value)) && (
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
  );
}
