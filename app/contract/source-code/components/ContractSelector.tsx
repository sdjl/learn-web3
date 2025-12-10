"use client";

// ============================================================
// 合约选择器组件
// ============================================================
// 作用：
// - 提供下拉选择框让用户选择要查看的合约
// - 显示所选合约的学习价值说明
// ============================================================

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTRACTS } from "../utils";
import type { ContractInfo } from "../types";

interface ContractSelectorProps {
  /** 当前选中的合约名称 */
  selectedContract: string;
  /** 选中合约变更回调 */
  onContractChange: (contractName: string) => void;
}

export function ContractSelector({
  selectedContract,
  onContractChange,
}: ContractSelectorProps) {
  // 获取当前选中的合约信息
  const currentContract: ContractInfo | undefined = CONTRACTS.find(
    (c) => c.name === selectedContract
  );

  return (
    <div className="space-y-4">
      {/* 下拉选择器 */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-muted-foreground">
          选择合约：
        </label>
        <Select value={selectedContract} onValueChange={onContractChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="请选择合约" />
          </SelectTrigger>
          <SelectContent>
            {CONTRACTS.map((contract) => (
              <SelectItem key={contract.name} value={contract.name}>
                {contract.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 合约说明 */}
      {currentContract && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="mb-3 text-sm text-foreground">
            {currentContract.description}
          </p>
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground">
              📚 学习要点：
            </h4>
            <ul className="space-y-1">
              {currentContract.learningPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
