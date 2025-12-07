// ============================================================
// 页面标题组件：显示页面标题和描述信息
// ============================================================
// 作用：
// - 展示页面的主标题和副标题
// - 提供页面功能的简要说明
// - 统一的页面头部样式
// ============================================================

interface HeaderProps {
  /** 页面标签文本（显示在标题上方的小标签） */
  label: string;
  /** 主标题文本 */
  title: string;
  /** 页面描述文本 */
  description: string;
}

export function Header({ label, title, description }: HeaderProps) {
  return (
    <header className="space-y-4 text-center sm:text-left">
      {/* 页面标签 */}
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        {label}
      </p>
      {/* 主标题 */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {/* 页面描述 */}
      <p className="text-base text-muted-foreground">
        {description}
      </p>
    </header>
  );
}
