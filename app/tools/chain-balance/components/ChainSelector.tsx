"use client";

// ============================================================
// 链选择器组件：处理链的切换和选择
// ============================================================
// 作用：
// - 显示支持的链列表
// - 处理链切换操作
// - 显示当前链和选中链的状态
// - 显示切换链的状态提示
// ============================================================

import { useAccount, useSwitchChain } from "wagmi";
import { supportedChains } from "@/lib/config/chains";

interface ChainSelectorProps {
  // 当前选择的链 ID
  selectedChainId: number | undefined;
  // 选择链的回调函数
  onSelectChain: (chainId: number) => void;
}

export function ChainSelector({
  selectedChainId,
  onSelectChain,
}: ChainSelectorProps) {
  // 获取当前连接的链和切换链的功能
  const { chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // 处理链切换
  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
      onSelectChain(targetChainId);
    } catch (error) {
      console.error("切换链失败:", error);
    }
  };

  // 处理链选择
  const handleSelectChain = (chainId: number) => {
    if (chain?.id === chainId) {
      // 如果已经是当前链，只更新选择状态
      onSelectChain(chainId);
    } else {
      // 如果不是当前链，尝试切换
      handleSwitchChain(chainId);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">链切换</h2>

      {/* 链选择按钮 */}
      <div className="mb-6 flex flex-wrap gap-3">
        {supportedChains.map((supportedChain) => {
          const isCurrentChain = chain?.id === supportedChain.id;
          const isSelected = selectedChainId === supportedChain.id;

          return (
            <button
              key={supportedChain.id}
              onClick={() => handleSelectChain(supportedChain.id)}
              disabled={isSwitching}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                isCurrentChain
                  ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                  : isSelected
                  ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              } ${isSwitching ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {supportedChain.name}
              {isCurrentChain && " (当前)"}
              {isSelected && !isCurrentChain && " (已选择)"}
            </button>
          );
        })}
      </div>

      {/* 切换链状态提示 */}
      {isSwitching && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
          正在切换链，请在钱包中确认...
        </div>
      )}
    </div>
  );
}
