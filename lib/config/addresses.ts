// ============================================================
// 合约地址配置：定义应用中使用的智能合约地址
// ============================================================
// 作用：
// - 集中管理所有智能合约地址
// - 按网络组织地址配置
// - 方便统一修改和维护
// - 支持多链部署的合约地址
// ============================================================

import { TOKENS, type TokenSymbol } from "./tokens";

/**
 * 按网络组织的代币地址配置
 * key 是链 ID，value 是该网络上的代币地址映射
 */
const tokenAddresses: Record<number, Partial<Record<TokenSymbol, string>>> = {
  // 以太坊主网 (Chain ID: 1)
  1: {
    [TOKENS.USDT]: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  // Sepolia 测试网 (Chain ID: 11155111)
  11155111: {
    [TOKENS.USDT]: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
  },
};

/**
 * 根据链 ID 和代币符号获取合约地址
 *
 * @param chainId - 区块链的 Chain ID
 * @param tokenSymbol - 代币符号（如 TOKENS.USDT）
 * @returns 合约地址，如果配置不存在则返回空字符串
 *
 * @example
 * // 获取以太坊主网上的 USDT 地址
 * const address = getTokenAddress(1, TOKENS.USDT);
 * // 返回: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
 *
 * @example
 * // 获取 Sepolia 测试网上的 USDT 地址
 * const address = getTokenAddress(11155111, TOKENS.USDT);
 * // 返回: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0"
 *
 * @example
 * // 获取不存在的配置
 * const address = getTokenAddress(999, TOKENS.USDT);
 * // 返回: ""
 */
export function getTokenAddress(
  chainId: number,
  tokenSymbol: TokenSymbol
): string {
  const networkTokens = tokenAddresses[chainId];
  if (!networkTokens) {
    return "";
  }
  return networkTokens[tokenSymbol] || "";
}
