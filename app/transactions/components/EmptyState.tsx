// ============================================================
// 空状态组件：显示未连接钱包时的提示
// ============================================================
// 作用：
// - 当用户未连接钱包时显示提示信息
// - 引导用户连接钱包以查看交易历史
// ============================================================

export function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="text-zinc-500 dark:text-zinc-400">
        请先连接钱包以查看交易历史记录
      </p>
    </div>
  );
}
