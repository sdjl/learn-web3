// ============================================================
// 状态变量组件：显示合约的状态变量
// ============================================================
// 作用：
// - 展示合约的公开状态变量（通过无参 view 函数读取）
// - 显示变量名称、类型和当前值
// ============================================================

import type { StateVariablesProps } from "../types";

export function StateVariables({
  stateVariables,
  isLoading,
  error,
}: StateVariablesProps) {
  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">正在读取合约状态变量...</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  // 无数据状态
  if (stateVariables.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>未找到可读取的状态变量</p>
        <p className="mt-2 text-sm">
          可能原因：合约未验证源代码，或没有公开的无参数 view 函数
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        以下是合约公开的状态变量（通过调用无参数的 view 函数读取）：
      </p>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-foreground">
                变量名
              </th>
              <th className="px-4 py-3 text-left font-medium text-foreground">
                类型
              </th>
              <th className="px-4 py-3 text-left font-medium text-foreground">
                值
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stateVariables.map((variable, index) => (
              <tr
                key={`${variable.name}-${index}`}
                className="hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-primary">
                    {variable.name}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
                    {variable.type}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <code className="wrap-break-word whitespace-pre-wrap rounded bg-muted px-2 py-1 font-mono text-xs">
                    {variable.value}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        共 {stateVariables.length} 个状态变量
      </p>
    </div>
  );
}
