// ============================================================
// 空状态组件：显示未连接钱包时的提示
// ============================================================
// 作用：
// - 当用户未连接钱包时显示提示信息
// - 引导用户连接钱包以使用链切换和余额查询功能
// ============================================================

export function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
      <p>请先连接钱包以使用链切换和余额查询功能</p>
    </div>
  );
}
