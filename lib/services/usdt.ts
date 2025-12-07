// ============================================================
// USDT 服务工具库：封装与 USDT 合约交互的常用函数
// ============================================================
// 作用：
// - 提供 USDT 合约相关的工具函数
// - 提供获取 USDT 交易记录的函数
// ============================================================

import { USDT_CONTRACT_ADDRESS } from "@/lib/config/contracts";
import { callEtherscanApi } from "./etherscan";
import type { EtherscanApiResponse, Transaction } from "./etherscan";

/**
 * 获取 USDT 合约的交易记录
 * @param chainId - 链 ID（目前仅支持以太坊主网，chainId = 1）
 * @param options - 可选参数
 * @returns USDT 交易列表响应
 */
export async function getUSDTTransactions(
  chainId: number = 1,
  options?: {
    startBlock?: string;
    endBlock?: string;
    page?: string;
    offset?: string;
    sort?: "asc" | "desc";
  }
): Promise<EtherscanApiResponse<Transaction[]>> {
  if (!chainId) {
    throw new Error("链 ID 参数是必需的");
  }

  // 目前仅支持以太坊主网
  if (chainId !== 1) {
    throw new Error("USDT 监控目前仅支持以太坊主网（chainId = 1）");
  }

  const params: Record<string, string> = {
    chainid: chainId.toString(),
    module: "account",
    action: "tokentx",
    contractaddress: USDT_CONTRACT_ADDRESS,
    startblock: options?.startBlock || "0",
    endblock: options?.endBlock || "99999999",
    page: options?.page || "1",
    offset: options?.offset || "10", // 默认获取 10 条
    sort: options?.sort || "desc",
  };

  const response = await callEtherscanApi<Transaction[]>(params);

  // 确保 result 是数组
  const result = Array.isArray(response.result) ? response.result : [];

  return {
    status: response.status,
    message: response.message,
    result,
  };
}
