// ============================================================
// 钱包未连接状态组件：显示未连接钱包时的提示
// ============================================================
// 作用：
// - 当用户未连接钱包时显示提示信息
// - 引导用户连接钱包以使用相关功能
// ============================================================

interface WalletNotConnectedProps {
  message?: string;
}

export function WalletNotConnected({
  message = "请先连接钱包",
}: WalletNotConnectedProps) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
