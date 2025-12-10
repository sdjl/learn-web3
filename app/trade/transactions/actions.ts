"use server";

// ============================================================
// 交易历史查询 Server Action
// ============================================================
// 作用：
// - 查询指定钱包地址的交易历史记录
// - 在服务端调用 Etherscan API，保护 API Key 不被泄露
// - 支持多条链（以太坊主网、Sepolia 测试网等）
//
// 学习要点：
// - 如何通过 Etherscan API 查询交易历史
// - 普通交易（txlist）和代币交易（tokentx）的区别
// - 如何处理多链支持
//
// 交易类型说明：
// - 普通交易（txlist）：ETH 转账和合约调用
// - 代币交易（tokentx）：ERC20 代币转账
// - 内部交易（txlistinternal）：合约内部调用触发的转账
// ============================================================

// ============================================================
// 内部库导入
// ============================================================
// supportedChains: 支持的区块链列表（以太坊主网、测试网等）
import { supportedChains } from "@/lib/config/chains";
// getTransactions: 封装的 Etherscan API 调用函数
// EtherscanApiResponse: API 响应的类型定义
// Transaction: 交易记录的类型定义
import { getTransactions as getEtherscanTransactions } from "@/lib/services/etherscan";
import type {
  EtherscanApiResponse,
  Transaction,
} from "@/lib/services/etherscan";

/**
 * 获取指定地址的交易历史记录
 *
 * 此函数调用 Etherscan 的 txlist API，获取指定地址的所有交易记录。
 * 包括该地址作为发送方或接收方的所有交易。
 *
 * @param address - 要查询的钱包地址
 *   - 格式：0x 开头的 42 位十六进制字符串
 *   - 可以是普通钱包地址或合约地址
 *
 * @param chainId - 区块链的 Chain ID
 *   - 1: 以太坊主网
 *   - 11155111: Sepolia 测试网
 *   - 其他支持的链 ID 见 supportedChains 配置
 *
 * @returns 返回 EtherscanApiResponse<Transaction[]> 对象：
 * - `status`: string - API 状态（"1" 成功）
 * - `message`: string - 响应消息
 * - `result`: Transaction[] - 交易列表，每条记录包含：
 *   - `hash`: string - 交易哈希
 *   - `from`: string - 发送方地址
 *   - `to`: string - 接收方地址
 *   - `value`: string - 转账金额（wei）
 *   - `timeStamp`: string - 交易时间戳
 *   - `blockNumber`: string - 区块号
 *   - `gasUsed`: string - 消耗的 Gas
 *   - `gasPrice`: string - Gas 价格
 *   - `isError`: string - 是否失败（"0" 成功，"1" 失败）
 *
 * @throws {Error} 当参数无效或 API 调用失败时抛出异常
 */
export async function getTransactions(
  address: string,
  chainId: number
): Promise<EtherscanApiResponse<Transaction[]>> {
  // 参数验证
  if (!address) {
    throw new Error("地址参数是必需的");
  }

  if (!chainId) {
    throw new Error("链 ID 参数是必需的");
  }

  // 检查是否支持该链
  // 不同的链有不同的 Etherscan API 端点
  const supportedChainIds = supportedChains.map((chain) => chain.id);
  if (!supportedChainIds.includes(chainId)) {
    throw new Error("不支持的链 ID");
  }

  try {
    // 调用 Etherscan 的 txlist API
    // API 会返回该地址相关的所有交易（作为发送方或接收方）
    return await getEtherscanTransactions(address, chainId);
  } catch (error) {
    console.error("获取交易数据错误:", error);
    const errorMessage =
      error instanceof Error ? error.message : "获取交易数据时发生错误";
    throw new Error(errorMessage);
  }
}
