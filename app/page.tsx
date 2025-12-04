"use client";

// ============================================================
// 核心导入：连接钱包和查询区块链数据的功能
// ============================================================

// ConnectButton: RainbowKit 提供的连接钱包按钮组件
// - 自动处理钱包列表展示
// - 自动生成 WalletConnect 二维码（当用户选择手机钱包时）
// - 自动处理连接/断开逻辑
// - 自动显示账户信息和网络切换
import { ConnectButton } from "@rainbow-me/rainbowkit";

// useAccount: Wagmi hook，获取当前连接的钱包账户信息
// useBalance: Wagmi hook，查询钱包余额
import { useAccount, useBalance } from "wagmi";

export default function Home() {
  // ============================================================
  // 获取钱包连接状态和账户信息
  // ============================================================
  // address: 钱包地址（如 0x1234...）
  // chain: 当前连接的区块链网络信息（如 Ethereum Mainnet）
  // status: 连接状态（"connected" | "disconnected" | "connecting" | "reconnecting"）
  const { address, chain, status } = useAccount();

  // ============================================================
  // 查询钱包余额
  // ============================================================
  // data: 余额数据对象，包含 formatted（格式化后的余额）、symbol（代币符号如 ETH）等
  // isLoading: 是否正在查询余额
  // refetch: 手动重新查询余额的函数
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalance({
    address, // 要查询的地址
    query: { enabled: Boolean(address) }, // 只有当 address 存在时才发起查询
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-zinc-900 dark:text-zinc-100">
      {/* ============================================================
          页面标题区域
          ============================================================ */}
      <header className="space-y-4 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
          learn web3
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          RainbowKit + Wagmi 上手指南
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          点击下方连接按钮，选择钱包，即可体验钱包连接、链信息与余额查询。
        </p>
      </header>

      {/* ============================================================
          连接钱包区域
          ============================================================ */}
      <section className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">连接你的钱包</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              RainbowKit 自带钱包列表、主题与 WC v2 支持。
            </p>
          </div>

          {/* ============================================================
              ConnectButton: 最核心的组件
              ============================================================
              功能：
              1. 未连接时：显示"连接钱包"按钮
              2. 点击后：弹出钱包选择模态框
              3. 用户选择钱包：
                 - 浏览器插件（如 MetaMask 插件）→ 直接调用 window.ethereum 连接
                 - 手机钱包（如 MetaMask Mobile）→ 生成二维码，通过 WalletConnect Cloud 中继
              4. 已连接时：显示账户信息、余额、断开按钮
              
              二维码生成逻辑：
              - 当用户选择不支持浏览器注入的钱包时（如手机钱包）
              - ConnectButton 内部会：
                1. 使用你配置的 projectId 连接到 WalletConnect Cloud
                2. 生成连接会话信息
                3. 将会话信息编码成二维码显示
                4. 用户手机扫码后，通过 WalletConnect Cloud 建立连接
              
              这一切都是自动的，你不需要手动写二维码生成代码！
              ============================================================ */}
          <ConnectButton />
        </div>

        {/* ============================================================
            显示连接信息：状态、地址、网络、余额
            ============================================================ */}
        <div className="mt-6 grid gap-4 rounded-2xl border border-dashed border-zinc-200 p-4 text-sm dark:border-zinc-700">
          {/* 显示连接状态 */}
          <InfoRow
            label="连接状态"
            value={status === "connected" ? "已连接" : "未连接"}
          />
          {/* 显示钱包地址，isMono 表示使用等宽字体 */}
          <InfoRow label="钱包地址" value={address ?? "连接后显示"} isMono />
          {/* 显示当前连接的区块链网络 */}
          <InfoRow label="当前网络" value={chain?.name ?? "连接后显示"} />
          {/* 显示余额，格式化后的数字 + 代币符号 */}
          <InfoRow
            label="余额"
            value={
              address
                ? isBalanceLoading
                  ? "查询中..."
                  : `${balanceData?.formatted ?? "--"} ${
                      balanceData?.symbol ?? ""
                    }`
                : "连接后显示"
            }
          />
        </div>
      </section>

      {/* ============================================================
          手动刷新余额按钮（仅在已连接时显示）
          ============================================================ */}
      {address && (
        <button
          onClick={() => refetchBalance()} // 调用 refetchBalance 重新查询余额
          className="self-start rounded-full border border-sky-500/40 px-5 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-500/10 dark:text-sky-300"
        >
          重新获取余额
        </button>
      )}
    </main>
  );
}

// ============================================================
// 辅助组件：显示信息行（标签 + 值）
// ============================================================
function InfoRow({
  label,
  value,
  isMono,
}: { 
  label: string;
  value: string;
  isMono?: boolean; // 是否使用等宽字体（适合显示地址、哈希等）
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`text-base font-medium ${isMono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// ============================================================
// 总结：各功能对应的代码位置
// ============================================================
// 1. 生成二维码：<ConnectButton /> 内部自动完成
//    - 当用户选择手机钱包时自动显示二维码
//    - 使用你在配置文件中提供的 projectId 连接 WalletConnect Cloud
//
// 2. 连接钱包：<ConnectButton /> 处理所有连接逻辑
//    - 浏览器插件：直接通过 window.ethereum
//    - 手机钱包：通过 WalletConnect Cloud 中继
//
// 3. 获取账户信息：useAccount() hook
//    - 返回 address（地址）、chain（网络）、status（状态）
//
// 4. 查询余额：useBalance() hook
//    - 自动查询指定地址的余额
//    - 提供 refetch 函数用于手动刷新
//
// 5. WalletConnect Cloud 的使用：
//    - 你的代码中看不到直接调用，因为都封装在 RainbowKit 内部
//    - 当用户扫码连接时，ConnectButton 会：
//      a. 使用 projectId 连接到 WalletConnect Cloud
//      b. 生成会话并编码成二维码
//      c. 通过中继服务器与用户手机钱包通信
//    - 这些都是自动的，你只需要在配置文件中提供 projectId
// ============================================================