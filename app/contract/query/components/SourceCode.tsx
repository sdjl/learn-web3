// ============================================================
// 源代码组件：显示合约的源代码
// ============================================================
// 作用：
// - 展示合约的源代码（如果已验证）
// - 提供代码格式化显示
// ============================================================

import type { SourceCodeProps } from "../types";

export function SourceCode({ sourceCode }: SourceCodeProps) {
  // 无源代码状态
  if (!sourceCode) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>无法获取源代码</p>
        <p className="mt-2 text-sm">
          可能原因：合约未在 Etherscan 上验证源代码
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="max-h-[500px] overflow-auto rounded-lg border border-border bg-muted p-4">
        <pre className="wrap-break-word whitespace-pre-wrap font-mono text-xs text-foreground">
          {sourceCode}
        </pre>
      </div>
      <p className="text-xs text-muted-foreground">
        源代码长度：{sourceCode.length.toLocaleString()} 字符
      </p>
    </div>
  );
}
