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
import { parseEther, formatEther, isAddress } from "viem";
import { TOKENS } from "@/lib/config/tokens";

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

  // 检查是否已连接网络
  const isNoNetwork = !chain;

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
    if (!chain) {
      alert("请先连接钱包并选择网络");
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
    <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
      <h2 className="mb-6 text-lg font-semibold">转账信息</h2>

      {/* 当前网络提示 */}
      {chain && (
        <div className="mb-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          你正在{" "}
          <span className="font-bold text-primary">
            {chain.name}
          </span>{" "}
          网络上转账
        </div>
      )}

      <form onSubmit={handleTransfer} className="space-y-6">
        {/* 接收地址输入 */}
        <div>
          <label
            htmlFor="toAddress"
            className="mb-2 block text-sm font-medium text-foreground"
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
            className="w-full rounded-lg border border-input bg-background px-4 py-3 font-mono text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          {toAddress && !isAddress(toAddress) && (
            <p className="mt-1 text-sm text-destructive">无效的地址格式</p>
          )}
        </div>

        {/* 转账金额输入 */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            转账金额 (
            {chain?.nativeCurrency?.symbol || balanceData?.symbol || TOKENS.ETH})
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
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          {balanceData &&
            balanceData.value &&
            amount &&
            parseFloat(amount) > parseFloat(formatEther(balanceData.value)) && (
              <p className="mt-1 text-sm text-destructive">余额不足</p>
            )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            错误: {error.message}
          </div>
        )}

        {/* 交易状态提示 */}
        {hash && (
          <div className="space-y-2">
            {isPending && (
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                交易已提交，等待钱包确认...
              </div>
            )}
            {isConfirming && (
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                交易已确认，等待区块确认...
              </div>
            )}
            {isConfirmed && (
              <div className="rounded-lg bg-muted p-4 text-sm text-foreground">
                <p className="font-semibold">交易成功！</p>
                <p className="mt-1 font-mono text-xs">交易哈希: {hash}</p>
                {chain?.blockExplorers?.default && (
                  <a
                    href={`${chain.blockExplorers.default.url}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-primary underline hover:text-primary/80"
                  >
                    在 {chain.blockExplorers.default.name} 上查看
                  </a>
                )}
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
            isNoNetwork ||
            !toAddress ||
            !amount ||
            !isAddress(toAddress)
          }
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "等待钱包确认..."
            : isConfirming
            ? "确认中..."
            : isNoNetwork
            ? "请先连接钱包"
            : "发送交易"}
        </button>
      </form>
    </section>
  );
}
