// ============================================================
// 页面标题组件：显示页面标题和描述信息
// ============================================================
// 作用：
// - 展示链切换和余额查询页面的主标题和副标题
// - 说明页面功能和使用说明
// ============================================================

export function Header() {
  return (
    <header className="space-y-4 text-center sm:text-left">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
        链切换与余额查询
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        切换链并查询余额
      </h1>
      <p className="text-base text-zinc-500 dark:text-zinc-400">
        在不同链之间切换，并查询不同链的账户余额
      </p>
    </header>
  );
}
