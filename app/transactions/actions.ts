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
import { ETHERSCAN_API_V2_URL } from "@/lib/config/etherscan";
import type { EtherscanResponse } from "./types";

export async function getTransactions(
  address: string,
  chainId: number
): Promise<EtherscanResponse> {
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

  const apiKey = process.env.ETHERSCAN_API_KEY;

  try {
    // 构建 Etherscan API V2 URL
    // V2 API 使用统一的端点，通过 chainid 参数指定链
    const params = new URLSearchParams({
      chainid: chainId.toString(),
      module: "account",
      action: "txlist",
      address: address,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: "100",
      sort: "desc",
    });

    // 如果有 API key，添加到参数中
    if (apiKey) {
      params.append("apikey", apiKey);
    }

    const apiUrl = `${ETHERSCAN_API_V2_URL}?${params.toString()}`;

    // 调用 Etherscan API V2 获取交易列表
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
          result: [],
        };
      }
      // 其他错误情况，抛出错误
      console.error("Etherscan API 错误响应:", data);
      throw new Error(data.message || data.result || "获取交易数据失败");
    }

    // 确保 result 是数组
    const result = Array.isArray(data.result) ? data.result : [];

    return {
      status: data.status,
      message: data.message,
      result,
    };
  } catch (error) {
    console.error("Etherscan API 错误:", error);
    const errorMessage =
      error instanceof Error ? error.message : "获取交易数据时发生错误";
    throw new Error(errorMessage);
  }
}
