// ============================================================
// 基本信息组件：显示合约的基本信息
// ============================================================
// 作用：
// - 展示合约的基本信息（地址、余额、是否合约等）
// - 显示合约名称和编译器信息（如果可用）
// ============================================================

import { useAccount } from "wagmi";
import type { BasicInfoProps } from "../types";

export function BasicInfo({ contractInfo }: BasicInfoProps) {
  const { chain } = useAccount();

  return (
    <div className="space-y-4">
      {/* 合约地址 */}
      <div>
        <label className="block text-sm font-medium text-foreground">
          合约地址
        </label>
        <div className="mt-1 flex items-center gap-2">
          <code className="rounded-lg bg-muted px-3 py-2 font-mono text-sm">
            {contractInfo.address}
          </code>
          {chain?.blockExplorers?.default && (
            <a
              href={`${chain.blockExplorers.default.url}/address/${contractInfo.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline hover:text-primary/80"
            >
              在 {chain.blockExplorers.default.name} 上查看
            </a>
          )}
        </div>
      </div>

      {/* 类型 */}
      <div>
        <label className="block text-sm font-medium text-foreground">
          类型
        </label>
        <div className="mt-1">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              contractInfo.isContract
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {contractInfo.isContract ? "智能合约" : "普通地址"}
          </span>
        </div>
      </div>

      {/* 余额 */}
      <div>
        <label className="block text-sm font-medium text-foreground">
          余额
        </label>
        <div className="mt-1">
          <span className="text-lg font-semibold">
            {contractInfo.balanceFormatted}{" "}
            {chain?.nativeCurrency?.symbol || "ETH"}
          </span>
        </div>
      </div>

      {/* 合约名称（如果有） */}
      {contractInfo.contractName && (
        <div>
          <label className="block text-sm font-medium text-foreground">
            合约名称
          </label>
          <div className="mt-1">
            <span className="font-semibold">{contractInfo.contractName}</span>
          </div>
        </div>
      )}

      {/* 编译器版本（如果有） */}
      {contractInfo.compilerVersion && (
        <div>
          <label className="block text-sm font-medium text-foreground">
            编译器版本
          </label>
          <div className="mt-1">
            <code className="rounded-lg bg-muted px-3 py-2 font-mono text-sm">
              {contractInfo.compilerVersion}
            </code>
          </div>
        </div>
      )}

      {/* 优化设置（如果有） */}
      {contractInfo.optimizationUsed !== undefined && (
        <div>
          <label className="block text-sm font-medium text-foreground">
            优化设置
          </label>
          <div className="mt-1">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                contractInfo.optimizationUsed
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {contractInfo.optimizationUsed ? "已优化" : "未优化"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
