// ============================================================
// 页面标题组件：显示页面标题和描述信息
// ============================================================
// 作用：
// - 展示转账页面的主标题和副标题
// - 说明页面功能和使用说明
// ============================================================

export function Header() {
  return (
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
  );
}
