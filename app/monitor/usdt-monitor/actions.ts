"use server";

// ============================================================
// USDT 监控 Server Action：安全地调用 Etherscan API
// ============================================================
// 作用：
// - 在服务端调用 Etherscan API，获取 USDT 合约交易记录
// - 避免暴露 API Key
// - 支持获取最近的交易记录
// ============================================================

import { getUSDTTransactions } from "@/lib/services/usdt";
import type {
  EtherscanApiResponse,
  Transaction,
} from "@/lib/services/etherscan";

/**
 * 获取 USDT 合约最近的交易记录
 * @param limit - 获取的交易记录数量，默认 10 条
 * @returns USDT 交易列表响应
 */
export async function getUSDTRecentTransactions(
  limit: number = 10
): Promise<EtherscanApiResponse<Transaction[]>> {
  try {
    // 使用封装好的 USDT 服务函数
    // 默认获取以太坊主网（chainId = 1）的交易记录
    return await getUSDTTransactions(1, {
      page: "1",
      offset: limit.toString(),
      sort: "desc",
    });
  } catch (error) {
    console.error("获取 USDT 交易数据错误:", error);
    const errorMessage =
      error instanceof Error ? error.message : "获取 USDT 交易数据时发生错误";
    throw new Error(errorMessage);
  }
}
