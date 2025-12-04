// ============================================================
// 页面标题组件：显示页面标题和描述信息
// ============================================================
// 作用：
// - 展示页面的主标题和副标题
// - 提供页面功能的简要说明
// - 统一的页面头部样式
// ============================================================

export function Header() {
  return (
    <header className="space-y-4 text-center sm:text-left">
      {/* 页面标签 */}
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
        learn web3
      </p>
      {/* 主标题 */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        RainbowKit + Wagmi 上手指南
      </h1>
      {/* 页面描述 */}
      <p className="text-base text-zinc-500 dark:text-zinc-400">
        点击下方连接按钮，选择钱包，即可体验钱包连接、链信息与余额查询。
      </p>
    </header>
  );
}
