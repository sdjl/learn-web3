// ============================================================
// USDT 合约封装
// ============================================================
// 本模块提供 USDT（Tether USD）合约的高层封装函数。
// USDT 是以太坊上最大的稳定币，本模块封装了查询其交易和事件的常用操作。
//
// 主要功能：
// - 获取 USDT 代币的转账交易记录
// - 获取 USDT 合约的事件日志（如 Transfer、Approval 等）
//
// 支持的网络：
// - 以太坊主网（chainId = 1）
// - Sepolia 测试网（chainId = 11155111）
// - 其他 EVM 兼容链（需在 lib/config/addresses.ts 中配置合约地址）
// ============================================================

import { getTokenAddress } from "@/lib/config/addresses";
import { TOKENS } from "@/lib/config/tokens";
import { USDT_EVENT_ABI, type USDTEventName } from "@/lib/abi/usdt";
import { buildEventTopicsMap } from "@/lib/abi/utils";
import {
  getTransactions,
  getContractEventLogs,
  getSafeBlockNumber,
  SAFE_CONFIRMATIONS,
  type EtherscanApiResponse,
  type Transaction,
  type EventLog,
} from "@/lib/services/etherscan";

// 重新导出类型，方便外部模块直接从本模块导入
export type { EtherscanApiResponse, Transaction, EventLog };
export { SAFE_CONFIRMATIONS };

/**
 * USDT 事件查询结果
 *
 * 包含事件数据和查询的区块信息，用于在 UI 中显示当前查询的是哪个区块的数据。
 */
export interface USDTEventsResult {
  /** API 响应数据 */
  response: EtherscanApiResponse<EventLog[]>;
  /** 查询的起始区块号（安全区块） */
  fromBlock: number;
  /** 当前最新区块号 */
  currentBlock: number;
  /** 延迟的区块数（currentBlock - fromBlock） */
  confirmations: number;
}

/**
 * 获取 USDT 合约的代币交易记录
 *
 * 查询 USDT 合约的 ERC20 代币转账记录。
 * 这些是通过调用 USDT 合约的 transfer 函数产生的交易。
 *
 * @param chainId - 区块链的 Chain ID，默认为以太坊主网（1）
 * @param options - 可选的查询参数
 * @param options.startBlock - 起始区块号
 * @param options.endBlock - 结束区块号
 * @param options.page - 分页页码
 * @param options.offset - 每页记录数
 * @param options.sort - 排序方式："asc" 或 "desc"
 * @returns USDT 交易列表
 * @throws 如果该网络未配置 USDT 地址，则抛出错误
 *
 * @example
 * const result = await getUSDTTransactions(1, { offset: "10", sort: "desc" });
 * console.log(`获取到 ${result.result.length} 条 USDT 交易`);
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
  const usdtAddress = getTokenAddress(chainId, TOKENS.USDT);
  if (!usdtAddress) {
    throw new Error(
      `请在 lib/config/addresses.ts 文件中添加链 ID ${chainId} 的 ${TOKENS.USDT} 地址配置`
    );
  }

  return getTransactions(usdtAddress, chainId, {
    type: "token",
    contractAddress: usdtAddress,
    ...options,
  });
}

/**
 * 获取 USDT 合约的事件日志
 *
 * 查询 USDT 合约触发的事件（如 Transfer、Approval、Issue 等）。
 * 事件数据可以用于监控合约活动、追踪资金流向等。
 *
 * 为了避免查询最新区块时数据未同步的问题，本函数会自动回退 SAFE_CONFIRMATIONS 个区块。
 * 返回结果中包含区块信息，可用于在 UI 中提示用户当前显示的数据延迟。
 *
 * @param chainId - 区块链的 Chain ID，默认为以太坊主网（1）
 * @param options - 可选的查询参数
 * @param options.eventName - 要过滤的事件名称（如 "Transfer"、"Approval"）
 * @param options.fromBlock - 起始区块号（如不指定，自动使用安全区块）
 * @param options.toBlock - 结束区块号
 * @param options.page - 分页页码
 * @param options.offset - 每页记录数
 * @returns 包含事件日志和区块信息的结果对象
 * @throws 如果该网络未配置 USDT 地址，则抛出错误
 *
 * @example
 * // 获取最近的 Transfer 事件
 * const result = await getUSDTEvents(1, { eventName: "Transfer", offset: "10" });
 * console.log(`显示 ${result.confirmations} 个区块前的数据`);
 * console.log(`从区块 ${result.fromBlock} 开始查询`);
 */
export async function getUSDTEvents(
  chainId: number = 1,
  options?: {
    eventName?: USDTEventName;
    fromBlock?: string;
    toBlock?: string;
    page?: string;
    offset?: string;
  }
): Promise<USDTEventsResult> {
  const usdtAddress = getTokenAddress(chainId, TOKENS.USDT);
  if (!usdtAddress) {
    throw new Error(
      `请在 lib/config/addresses.ts 文件中添加链 ID ${chainId} 的 ${TOKENS.USDT} 地址配置`
    );
  }

  // 获取安全的区块号
  const { safeBlock, currentBlock } = await getSafeBlockNumber(chainId);

  // 如果没有指定 fromBlock，使用安全区块
  const fromBlock = options?.fromBlock || safeBlock.toString();

  // 计算事件签名
  let topic0: string | undefined;
  if (options?.eventName) {
    const topicsMap = buildEventTopicsMap(USDT_EVENT_ABI);
    topic0 = topicsMap[options.eventName];
  }

  const response = await getContractEventLogs(usdtAddress, chainId, {
    topic0,
    fromBlock,
    toBlock: options?.toBlock,
    page: options?.page,
    offset: options?.offset,
  });

  return {
    response,
    fromBlock: parseInt(fromBlock),
    currentBlock,
    confirmations: currentBlock - parseInt(fromBlock),
  };
}
