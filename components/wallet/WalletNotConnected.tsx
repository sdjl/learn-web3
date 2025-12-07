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
    <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
