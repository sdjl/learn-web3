// ============================================================
// Etherscan API 路由：安全地调用 Etherscan API
// ============================================================
// 作用：
// - 在服务端调用 Etherscan API，避免暴露 API Key
// - 获取用户的交易历史记录
// - 支持不同链的 Etherscan API
// ============================================================

import { NextRequest, NextResponse } from "next/server";

// Etherscan API V2 统一端点
const ETHERSCAN_API_V2_URL = "https://api.etherscan.io/v2/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const chainId = searchParams.get("chainId");

  if (!address) {
    return NextResponse.json({ error: "地址参数是必需的" }, { status: 400 });
  }

  if (!chainId) {
    return NextResponse.json({ error: "链 ID 参数是必需的" }, { status: 400 });
  }

  const apiKey = process.env.ETHERSCAN_API_KEY;
  const chainIdNum = Number(chainId);

  // 支持的链 ID 列表
  const supportedChainIds = [1, 11155111]; // Ethereum Mainnet, Sepolia Testnet
  if (!supportedChainIds.includes(chainIdNum)) {
    return NextResponse.json({ error: "不支持的链 ID" }, { status: 400 });
  }

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

    // 记录完整的响应以便调试
    console.log("Etherscan API 响应:", JSON.stringify(data, null, 2));

    // 处理 Etherscan API 的错误响应
    if (data.status === "0") {
      // "No transactions found" 是正常情况，返回空数组
      if (data.message === "No transactions found") {
        return NextResponse.json({
          status: "1",
          message: "OK",
          result: [],
        });
      }
      // 其他错误情况，返回详细的错误信息
      console.error("Etherscan API 错误响应:", data);
      return NextResponse.json(
        { error: data.message || data.result || "获取交易数据失败" },
        { status: 500 }
      );
    }

    // 确保 result 是数组
    const result = Array.isArray(data.result) ? data.result : [];

    return NextResponse.json({
      status: data.status,
      message: data.message,
      result,
    });
  } catch (error) {
    console.error("Etherscan API 错误:", error);
    const errorMessage =
      error instanceof Error ? error.message : "获取交易数据时发生错误";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
