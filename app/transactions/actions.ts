"use server";

// ============================================================
// 交易历史 Server Action：安全地调用 Etherscan API
// ============================================================
// 作用：
// - 在服务端调用 Etherscan API，避免暴露 API Key
// - 获取用户的交易历史记录
// - 支持不同链的 Etherscan API
// ============================================================

import { supportedChains } from "@/lib/config/chains";
import { getTransactions as getEtherscanTransactions } from "@/lib/services/etherscan";
import type {
  EtherscanApiResponse,
  Transaction,
} from "@/lib/services/etherscan";

/**
 * 获取指定地址的交易历史记录
 * @param address - 要查询的地址
 * @param chainId - 链 ID
 * @returns 交易列表响应
 */
export async function getTransactions(
  address: string,
  chainId: number
): Promise<EtherscanApiResponse<Transaction[]>> {
  if (!address) {
    throw new Error("地址参数是必需的");
  }

  if (!chainId) {
    throw new Error("链 ID 参数是必需的");
  }

  // 从配置中获取支持的链 ID 列表
  const supportedChainIds = supportedChains.map((chain) => chain.id);
  if (!supportedChainIds.includes(chainId)) {
    throw new Error("不支持的链 ID");
  }

  try {
    // 使用封装好的 Etherscan API 工具函数
    return await getEtherscanTransactions(address, chainId);
  } catch (error) {
    console.error("获取交易数据错误:", error);
    const errorMessage =
      error instanceof Error ? error.message : "获取交易数据时发生错误";
    throw new Error(errorMessage);
  }
}
