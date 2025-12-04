// ============================================================
// 信息行组件：用于显示标签和对应的值
// ============================================================
// 作用：
// - 统一的信息展示格式，包含标签和值两部分
// - 支持等宽字体显示（适合显示地址、哈希等需要对齐的内容）
// - 响应式布局，在移动端和桌面端都有良好的显示效果
// ============================================================

interface InfoRowProps {
  label: string; // 标签文本（如"钱包地址"、"余额"等）
  value: string; // 要显示的值
  isMono?: boolean; // 是否使用等宽字体（适合显示地址、哈希等）
}

export function InfoRow({ label, value, isMono }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`text-base font-medium ${isMono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
