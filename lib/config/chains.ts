// ============================================================
// 链配置：定义应用支持的区块链网络
// ============================================================
// 作用：
// - 集中管理应用支持的所有链
// - 方便统一修改和维护
// - 确保所有页面使用相同的链配置
// ============================================================

import { mainnet, sepolia, Chain } from "wagmi/chains";

/**
 * 应用支持的链列表
 * 修改此数组即可添加或移除支持的链
 */
export const supportedChains: Chain[] = [mainnet, sepolia];

/**
 * 判断指定的链 ID 是否是支持的链
 * @param chainId - 链 ID
 * @returns 如果链 ID 在支持的链列表中，返回 true，否则返回 false
 */
export function isSupportedChain(chainId: number): boolean {
  return supportedChains.some((chain) => chain.id === chainId);
}

/**
 * 根据链 ID 从支持的链列表中找到对应的链配置
 * @param chainId - 链 ID
 * @returns 如果找到对应的链配置，返回 Chain 对象，否则返回 undefined
 */
export function getChainById(chainId: number): Chain | undefined {
  return supportedChains.find((chain) => chain.id === chainId);
}
