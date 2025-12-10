"use server";

// ============================================================
// USDT 交易监控 Server Action
// ============================================================
// 作用：
// - 获取 USDT 合约的最近交易记录
// - 在服务端调用 Etherscan API，保护 API Key 不被泄露
//
// 学习要点：
// - 如何通过 Etherscan API 获取代币交易记录
// - 交易记录（Transaction）和事件日志（Event）的区别
//
// 交易 vs 事件的区别：
// - 交易（Transaction）：用户发起的操作，包含 from、to、value、gas 等信息
// - 事件（Event）：合约执行时触发的日志，包含合约定义的参数
// - 一笔交易可能触发多个事件（如 Uniswap 交易会触发多个 Transfer 事件）
// ============================================================

// ============================================================
// 内部库导入
// ============================================================
// getUSDTTransactions: 封装的函数，调用 Etherscan API 获取 USDT 代币交易
// EtherscanApiResponse: Etherscan API 的标准响应格式
// Transaction: 交易记录的数据结构
import {
  getUSDTTransactions,
  type EtherscanApiResponse,
  type Transaction,
} from "@/lib/contracts/usdt";

/**
 * 获取 USDT 合约最近的交易记录
 *
 * 此函数调用 Etherscan 的 tokentx API，获取 USDT 代币的转账记录。
 * 与普通 ETH 转账不同，代币转账是通过调用合约的 transfer 函数实现的。
 *
 * @param limit - 获取的交易记录数量，默认 10 条
 *
 * @returns 返回 EtherscanApiResponse<Transaction[]> 对象：
 * - `status`: string - API 调用状态（"1" 成功，"0" 失败）
 * - `message`: string - 响应消息
 * - `result`: Transaction[] - 交易记录列表，每条记录包含：
 *   - `hash`: string - 交易哈希，唯一标识一笔交易
 *   - `from`: string - 发送方地址
 *   - `to`: string - 接收方地址
 *   - `value`: string - 转账金额（最小单位，USDT 需要除以 10^6）
 *   - `timeStamp`: string - 交易时间戳（Unix 时间，秒）
 *   - `blockNumber`: string - 交易所在的区块号
 *   - `gasUsed`: string - 实际消耗的 Gas
 *   - `gasPrice`: string - Gas 价格（wei）
 *
 * @throws {Error} 当 API 调用失败时抛出异常
 */
export async function getUSDTRecentTransactions(
  limit: number = 10
): Promise<EtherscanApiResponse<Transaction[]>> {
  try {
    // 调用 Etherscan 的 tokentx API 获取 USDT 代币交易
    // chainId = 1 表示以太坊主网
    // sort = "desc" 表示按时间倒序（最新的在前）
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
