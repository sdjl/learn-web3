// ============================================================
// Etherscan API 工具库：封装与 Etherscan 网站交互的常用函数
// ============================================================
// 作用：
// - 提供 Etherscan API 调用的工具函数
// - 封装 URL 组装逻辑
// - 封装 API 调用逻辑
// - 提供常用的 Etherscan API 调用函数
// ============================================================

import {
  ETHERSCAN_API_V2_URL,
  getEtherscanApiKey,
} from "@/lib/config/etherscan";

/**
 * Etherscan API 响应接口
 */
export interface EtherscanApiResponse<T = unknown> {
  status: string;
  message: string;
  result: T;
}

/**
 * 交易记录接口
 */
export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
}

/**
 * 构建 Etherscan API URL
 * @param params - URL 查询参数对象
 * @returns 完整的 API URL
 */
export function buildEtherscanApiUrl(params: Record<string, string>): string {
  const urlParams = new URLSearchParams(params);

  // 如果有 API key，添加到参数中
  const apiKey = getEtherscanApiKey();
  if (apiKey) {
    urlParams.append("apikey", apiKey);
  }

  return `${ETHERSCAN_API_V2_URL}?${urlParams.toString()}`;
}

/**
 * 调用 Etherscan API
 * @param params - API 请求参数
 * @returns API 响应数据
 */
export async function callEtherscanApi<T = unknown>(
  params: Record<string, string>
): Promise<EtherscanApiResponse<T>> {
  const apiUrl = buildEtherscanApiUrl(params);

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Etherscan API 请求失败: ${response.statusText}`);
  }

  const data = await response.json();

  // 处理 Etherscan API 的错误响应
  if (data.status === "0") {
    // "No transactions found" 是正常情况，返回空数组
    if (data.message === "No transactions found") {
      return {
        status: "1",
        message: "OK",
        result: [] as T,
      };
    }
    // 其他错误情况，抛出错误
    console.error("Etherscan API 错误响应:", data);
    throw new Error(data.message || data.result || "Etherscan API 调用失败");
  }

  return data;
}

/**
 * 获取指定地址的交易列表
 * @param address - 要查询的地址
 * @param chainId - 链 ID
 * @param options - 可选参数
 * @returns 交易列表响应
 */
export async function getTransactions(
  address: string,
  chainId: number,
  options?: {
    startBlock?: string;
    endBlock?: string;
    page?: string;
    offset?: string;
    sort?: "asc" | "desc";
  }
): Promise<EtherscanApiResponse<Transaction[]>> {
  if (!address) {
    throw new Error("地址参数是必需的");
  }

  if (!chainId) {
    throw new Error("链 ID 参数是必需的");
  }

  const params: Record<string, string> = {
    chainid: chainId.toString(),
    module: "account",
    action: "txlist",
    address: address,
    startblock: options?.startBlock || "0",
    endblock: options?.endBlock || "99999999",
    page: options?.page || "1",
    offset: options?.offset || "100",
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
