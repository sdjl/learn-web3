"use client";

// ============================================================
// 通用钱包连接组件：处理钱包连接和显示连接信息
// ============================================================
// 作用：
// - 显示 RainbowKit 的 ConnectButton，用于连接/断开钱包
// - 展示当前连接状态、钱包地址、网络信息和余额
// - 支持自定义标题和描述
// - 支持指定必需的网络（如 Sepolia），并显示网络警告
// - 自动处理钱包连接逻辑（浏览器插件和手机钱包）
// ============================================================

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { Chain, formatEther } from "viem";
import { InfoRow } from "@/app/components/InfoRow";

interface WalletConnectionProps {
  // 标题文本
  title?: string;
  // 描述文本
  description?: string;
  // 是否显示完整信息（连接状态、地址、网络、余额）
  showFullInfo?: boolean;
  // 是否只在已连接时显示信息
  showInfoOnlyWhenConnected?: boolean;
  // 必需的网络（如果指定，会检查当前网络是否匹配）
  requiredChain?: Chain;
}

export function WalletConnection({
  title = "连接你的钱包",
  description = "RainbowKit 自带钱包列表、主题与 WC v2 支持。",
  showFullInfo = true,
  showInfoOnlyWhenConnected = false,
  requiredChain,
}: WalletConnectionProps) {
  // 获取钱包连接状态和账户信息
  const { address, chain, status, isConnected } = useAccount();

  // 查询钱包余额
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  // 检查是否在正确的网络上
  const isWrongNetwork =
    requiredChain && isConnected && chain?.id !== requiredChain.id;

  // 判断是否显示信息区域
  const shouldShowInfo = showInfoOnlyWhenConnected ? isConnected : true;

  return (
    <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
      {/* 连接钱包按钮区域 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>

        {/* ConnectButton: RainbowKit 提供的连接钱包按钮
            功能说明：
            1. 未连接时：显示"连接钱包"按钮
            2. 点击后：弹出钱包选择模态框
            3. 用户选择钱包：
               - 浏览器插件（如 MetaMask 插件）→ 直接调用 window.ethereum 连接
               - 手机钱包（如 MetaMask Mobile）→ 生成二维码，通过 WalletConnect Cloud 中继
            4. 已连接时：显示账户信息、余额、断开按钮
            
            二维码生成逻辑：
            - 当用户选择不支持浏览器注入的钱包时（如手机钱包）
            - ConnectButton 内部会：
              1. 使用配置的 projectId 连接到 WalletConnect Cloud
              2. 生成连接会话信息
              3. 将会话信息编码成二维码显示
              4. 用户手机扫码后，通过 WalletConnect Cloud 建立连接
            
            这一切都是自动的，不需要手动写二维码生成代码！ */}
        <ConnectButton />
      </div>

      {/* 连接信息显示区域 */}
      {shouldShowInfo && (
        <div className="mt-6 grid gap-4 rounded-2xl border border-dashed border-zinc-200 p-4 text-sm dark:border-zinc-700">
          {showFullInfo ? (
            <>
              {/* 显示连接状态 */}
              <InfoRow
                label="连接状态"
                value={status === "connected" ? "已连接" : "未连接"}
              />
              {/* 显示钱包地址，使用等宽字体以便对齐 */}
              <InfoRow
                label="钱包地址"
                value={address ?? "连接后显示"}
                isMono
              />
              {/* 显示当前连接的区块链网络 */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  当前网络
                </span>
                <span
                  className={`text-base font-medium ${
                    isWrongNetwork ? "text-red-500" : ""
                  }`}
                >
                  {chain?.name ?? "连接后显示"}
                  {isWrongNetwork && (
                    <span className="text-red-500">
                      {" "}
                      (请切换到 {requiredChain?.name})
                    </span>
                  )}
                </span>
              </div>
              {/* 显示余额，格式化后的数字 + 代币符号 */}
              <InfoRow
                label="余额"
                value={
                  address
                    ? isBalanceLoading
                      ? "查询中..."
                      : balanceData?.value
                      ? `${formatEther(balanceData.value)} ${
                          balanceData?.symbol ?? ""
                        }`
                      : "--"
                    : "连接后显示"
                }
              />
            </>
          ) : (
            <>
              {/* 简化模式：只显示网络和余额 */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  当前网络
                </span>
                <span
                  className={`text-base font-medium ${
                    isWrongNetwork ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {chain?.name || "未知"}
                  {isWrongNetwork && ` (请切换到 ${requiredChain?.name})`}
                </span>
              </div>
              <InfoRow
                label="账户余额"
                value={
                  balanceData && balanceData.value
                    ? `${formatEther(balanceData.value)} ${balanceData.symbol}`
                    : "加载中..."
                }
                isMono
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
