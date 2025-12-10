// ============================================================
// Etherscan API 服务封装
// ============================================================
// 本模块封装了与 Etherscan 区块链浏览器 API 的所有交互。
// Etherscan 提供了查询以太坊及其他 EVM 兼容链的交易、事件、区块等数据的 API。
//
// 主要功能：
// - 构建和调用 Etherscan API
// - 获取地址的交易记录（普通交易和代币交易）
// - 获取合约的事件日志
// - 获取当前区块号
//
// 注意：所有 API 调用都需要在服务端进行，以保护 API Key 不被泄露。
// ============================================================

import {
  ETHERSCAN_API_V2_URL,
  getEtherscanApiKey,
} from "@/lib/config/etherscan";

// ============================================================
// 类型定义
// ============================================================

/**
 * Etherscan API 的标准响应格式
 *
 * Etherscan API 的所有响应都遵循这个格式：
 * - status: "1" 表示成功，"0" 表示失败
 * - message: 响应消息，如 "OK" 或错误描述
 * - result: 实际的数据内容，类型取决于具体的 API
 *
 * @template T - result 字段的类型，默认为 unknown
 */
export interface EtherscanApiResponse<T = unknown> {
  /** API 调用状态："1" 成功，"0" 失败 */
  status: string;
  /** 响应消息，成功时为 "OK"，失败时为错误描述 */
  message: string;
  /** API 返回的实际数据 */
  result: T;
}

/**
 * 交易记录数据结构
 *
 * 表示一笔区块链交易的详细信息。
 * 适用于普通交易（txlist）和代币交易（tokentx）的返回数据。
 */
export interface Transaction {
  /** 交易所在的区块号（十进制字符串） */
  blockNumber: string;
  /** 交易时间戳（Unix 时间戳，秒） */
  timeStamp: string;
  /** 交易哈希，唯一标识一笔交易 */
  hash: string;
  /** 发送方地址 */
  from: string;
  /** 接收方地址 */
  to: string;
  /** 交易金额（wei 单位，需要转换为 ETH 或代币单位） */
  value: string;
  /** 实际消耗的 Gas 数量 */
  gasUsed: string;
  /** Gas 价格（wei 单位） */
  gasPrice: string;
  /** 交易是否失败："0" 成功，"1" 失败 */
  isError: string;
  /** 交易收据状态："1" 成功，"0" 失败 */
  txreceipt_status: string;
}

/**
 * 事件日志数据结构
 *
 * 表示智能合约触发的一个事件日志。
 * 事件是智能合约与外部世界通信的主要方式，常用于记录重要操作（如转账、授权等）。
 */
export interface EventLog {
  /** 触发事件的合约地址 */
  address: string;
  /**
   * 事件的 topics 数组
   * - topics[0]: 事件签名的 keccak256 哈希（如 Transfer 事件的签名）
   * - topics[1-3]: indexed 参数的值（如 Transfer 事件的 from 和 to 地址）
   */
  topics: string[];
  /**
   * 非 indexed 参数的 ABI 编码数据
   * 每个参数占 32 字节（64 个十六进制字符），需要根据 ABI 解码
   */
  data: string;
  /** 事件所在的区块号（十六进制字符串） */
  blockNumber: string;
  /** 区块哈希 */
  blockHash: string;
  /** 事件时间戳（Unix 时间戳，秒） */
  timeStamp: string;
  /** Gas 价格（wei 单位） */
  gasPrice: string;
  /** Gas 消耗量 */
  gasUsed: string;
  /** 事件在区块中的日志索引 */
  logIndex: string;
  /** 触发该事件的交易哈希 */
  transactionHash: string;
  /** 交易在区块中的索引 */
  transactionIndex: string;
}

/**
 * 交易类型枚举
 *
 * 用于区分不同类型的交易查询：
 * - normal: 普通 ETH 转账交易
 * - token: ERC20 代币转账交易
 */
export type TransactionType = "normal" | "token";

// ============================================================
// 常量定义
// ============================================================

/**
 * 安全确认区块数
 *
 * 由于最新的区块可能还未被完全确认，或者数据同步有延迟，
 * 查询最新区块的数据可能返回空结果。
 * 通过回退一定数量的区块，可以确保查询到已确认的数据。
 *
 * 12 个区块约等于 2.4 分钟（以太坊每个区块约 12 秒）
 */
export const SAFE_CONFIRMATIONS = 12;

/**
 * 最大区块号
 *
 * 用于 Etherscan API 的 endBlock 参数默认值。
 * 这个值足够大，可以覆盖未来很长时间的区块。
 */
export const MAX_BLOCK_NUMBER = "9999999999999";

// ============================================================
// 内部工具函数
// ============================================================

/**
 * 构建 Etherscan API 的完整 URL
 *
 * 将查询参数对象转换为 URL 查询字符串，并自动附加 API Key（如果配置了的话）。
 *
 * @param params - 查询参数对象，键值对形式
 * @returns 完整的 API URL，可直接用于 fetch 请求
 *
 * @example
 * buildEtherscanApiUrl({ module: "account", action: "txlist", address: "0x..." })
 * // 返回: "https://api.etherscan.io/v2/api?module=account&action=txlist&address=0x...&apikey=YOUR_KEY"
 */
export function buildEtherscanApiUrl(params: Record<string, string>): string {
  const urlParams = new URLSearchParams(params);

  const apiKey = getEtherscanApiKey();
  if (apiKey) {
    urlParams.append("apikey", apiKey);
  }

  return `${ETHERSCAN_API_V2_URL}?${urlParams.toString()}`;
}

/**
 * 调用 Etherscan API 并处理响应
 *
 * 这是所有 Etherscan API 调用的底层函数。它处理：
 * - HTTP 请求错误
 * - API 返回的错误状态
 * - "No transactions found" 等特殊情况
 *
 * @template T - 期望的响应数据类型
 * @param params - API 请求参数
 * @returns API 响应数据，包含 status、message 和 result
 * @throws {Error} 当 HTTP 请求失败或 API 返回错误时抛出异常
 *
 * @example
 * const response = await callEtherscanApi<Transaction[]>({
 *   chainid: "1",
 *   module: "account",
 *   action: "txlist",
 *   address: "0x..."
 * });
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

  // 处理 JSON-RPC 格式的响应（如 eth_estimateGas、eth_blockNumber 等 proxy 模块的接口）
  // JSON-RPC 格式: { jsonrpc: "2.0", id: 1, result: "0x..." } 或 { jsonrpc: "2.0", id: 1, error: { code: -32000, message: "..." } }
  if (data.jsonrpc) {
    if (data.error) {
      console.error("Etherscan JSON-RPC 错误响应:", data);
      throw new Error(data.error.message || "Etherscan API 调用失败");
    }
    // 将 JSON-RPC 格式转换为标准响应格式
    return {
      status: "1",
      message: "OK",
      result: data.result as T,
    };
  }

  // 处理 API 返回的错误状态
  if (data.status === "0") {
    // "No transactions found" 和 "No records found" 是正常情况，返回空数组
    if (
      data.message === "No transactions found" ||
      data.message === "No records found"
    ) {
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

// ============================================================
// 区块相关函数
// ============================================================

/**
 * 获取指定链的当前最新区块号
 *
 * 通过 Etherscan 的 eth_blockNumber 代理接口获取当前区块高度。
 * 返回的是实时的最新区块号。
 *
 * @param chainId - 区块链的 Chain ID（如以太坊主网为 1）
 * @returns 当前区块号（十进制数字）
 *
 * @example
 * const blockNumber = await getCurrentBlockNumber(1);
 * console.log(`当前区块: ${blockNumber}`); // 输出: 当前区块: 21234567
 */
export async function getCurrentBlockNumber(chainId: number): Promise<number> {
  const params: Record<string, string> = {
    chainid: chainId.toString(),
    module: "proxy",
    action: "eth_blockNumber",
  };

  const response = await callEtherscanApi<string>(params);
  // API 返回十六进制字符串，如 "0x141b8a0"
  return parseInt(response.result, 16);
}

/**
 * 获取安全的查询起始区块号
 *
 * 由于最新区块的数据可能尚未完全同步到 Etherscan，
 * 直接查询最新区块可能返回空数据。
 * 此函数返回一个安全的起始区块号（当前区块 - SAFE_CONFIRMATIONS）。
 *
 * @param chainId - 区块链的 Chain ID
 * @returns 包含安全起始区块号和当前区块号的对象
 *
 * @example
 * const { safeBlock, currentBlock } = await getSafeBlockNumber(1);
 * // safeBlock = 21234555, currentBlock = 21234567
 * // 表示从 12 个区块之前开始查询
 */
export async function getSafeBlockNumber(
  chainId: number
): Promise<{ safeBlock: number; currentBlock: number }> {
  const currentBlock = await getCurrentBlockNumber(chainId);
  const safeBlock = Math.max(0, currentBlock - SAFE_CONFIRMATIONS);
  return { safeBlock, currentBlock };
}

// ============================================================
// 交易查询函数
// ============================================================

/**
 * 获取指定地址的交易记录
 *
 * 查询某个地址的历史交易记录，支持普通 ETH 交易和 ERC20 代币交易。
 * 这是查询钱包交易历史的主要函数。
 *
 * @param address - 要查询的钱包地址或合约地址
 * @param chainId - 区块链的 Chain ID（如以太坊主网为 1）
 * @param options - 可选的查询参数
 * @param options.type - 交易类型："normal"（普通交易）或 "token"（代币交易），默认 "normal"
 * @param options.contractAddress - 代币合约地址（仅当 type 为 "token" 时使用）
 * @param options.startBlock - 起始区块号，默认 "0"
 * @param options.endBlock - 结束区块号，默认 MAX_BLOCK_NUMBER
 * @param options.page - 分页页码，默认 "1"
 * @param options.offset - 每页记录数，默认 "100"
 * @param options.sort - 排序方式："asc"（升序）或 "desc"（降序），默认 "desc"
 * @returns 交易记录列表
 * @throws {Error} 当地址或 chainId 无效时抛出异常
 *
 * @example
 * // 获取钱包的普通交易
 * const txs = await getTransactions("0x...", 1);
 *
 * // 获取钱包的 USDT 代币交易
 * const tokenTxs = await getTransactions("0x...", 1, {
 *   type: "token",
 *   contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
 * });
 */
export async function getTransactions(
  address: string,
  chainId: number,
  options?: {
    type?: TransactionType;
    contractAddress?: string;
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

  const transactionType = options?.type || "normal";
  const action = transactionType === "token" ? "tokentx" : "txlist";

  const params: Record<string, string> = {
    chainid: chainId.toString(),
    module: "account",
    action: action,
    address: address,
    startblock: options?.startBlock || "0",
    endblock: options?.endBlock || MAX_BLOCK_NUMBER,
    page: options?.page || "1",
    offset: options?.offset || "100",
    sort: options?.sort || "desc",
  };

  // 如果是代币交易且指定了合约地址，添加 contractaddress 参数
  if (transactionType === "token" && options?.contractAddress) {
    params.contractaddress = options.contractAddress;
  }

  const response = await callEtherscanApi<Transaction[]>(params);

  // 确保 result 是数组
  const result = Array.isArray(response.result) ? response.result : [];

  return {
    status: response.status,
    message: response.message,
    result,
  };
}

// ============================================================
// 事件日志查询函数
// ============================================================

/**
 * 获取合约的事件日志
 *
 * 查询智能合约触发的事件日志。事件是智能合约与外部应用通信的重要机制，
 * 例如 ERC20 代币的 Transfer 和 Approval 事件。
 *
 * 注意：Etherscan 的 getLogs API 返回的数据是按区块顺序排列的（从小到大），
 * 如果需要最新的事件在前面，需要在应用层进行倒序排序。
 *
 * @param contractAddress - 合约地址
 * @param chainId - 区块链的 Chain ID
 * @param options - 可选的查询参数
 * @param options.topic0 - 事件签名的 keccak256 哈希，用于过滤特定类型的事件
 * @param options.fromBlock - 起始区块号，默认 "0"
 * @param options.toBlock - 结束区块号，默认 "latest"
 * @param options.page - 分页页码，默认 "1"
 * @param options.offset - 每页记录数，默认 "10"
 * @returns 事件日志列表
 * @throws {Error} 当合约地址或 chainId 无效时抛出异常
 *
 * @example
 * // 获取 USDT 合约的所有 Transfer 事件
 * const logs = await getContractEventLogs(
 *   "0xdAC17F958D2ee523a2206206994597C13D831ec7",
 *   1,
 *   {
 *     topic0: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
 *     fromBlock: "21234500"
 *   }
 * );
 */
export async function getContractEventLogs(
  contractAddress: string,
  chainId: number,
  options?: {
    topic0?: string;
    fromBlock?: string;
    toBlock?: string;
    page?: string;
    offset?: string;
  }
): Promise<EtherscanApiResponse<EventLog[]>> {
  if (!contractAddress) {
    throw new Error("合约地址参数是必需的");
  }

  if (!chainId) {
    throw new Error("链 ID 参数是必需的");
  }

  const params: Record<string, string> = {
    chainid: chainId.toString(),
    module: "logs",
    action: "getLogs",
    address: contractAddress,
    fromBlock: options?.fromBlock || "0",
    toBlock: options?.toBlock || "latest",
    page: options?.page || "1",
    offset: options?.offset || "10",
  };

  // 如果指定了事件签名，添加 topic0 过滤
  if (options?.topic0) {
    params.topic0 = options.topic0;
  }

  const response = await callEtherscanApi<EventLog[]>(params);

  // 确保 result 是数组
  const result = Array.isArray(response.result) ? response.result : [];

  return {
    status: response.status,
    message: response.message,
    result,
  };
}

// ============================================================
// Gas 相关函数
// ============================================================

/**
 * Gas Oracle 返回的数据结构
 *
 * EIP-1559 之后，SafeGasPrice、ProposeGasPrice、FastGasPrice 表示优先费用（priority fee），
 * suggestBaseFee 表示建议的基础费用。
 */
export interface GasOracleResult {
  /** 最新区块号 */
  LastBlock: string;
  /** 安全的 Gas 价格（Gwei），适合不急的交易 */
  SafeGasPrice: string;
  /** 建议的 Gas 价格（Gwei），平均确认时间 */
  ProposeGasPrice: string;
  /** 快速的 Gas 价格（Gwei），快速确认 */
  FastGasPrice: string;
  /** 建议的基础费用（Gwei） */
  suggestBaseFee: string;
  /** Gas 使用率，表示网络拥堵程度 */
  gasUsedRatio: string;
}

/**
 * 获取当前 Gas 价格预言机数据
 *
 * 返回当前网络的 Gas 价格建议，包括安全、建议和快速三档价格。
 * 这些价格基于网络拥堵情况动态计算。
 *
 * @param chainId - 区块链的 Chain ID（如以太坊主网为 1）
 * @returns Gas 价格预言机数据
 *
 * @example
 * const gasOracle = await getGasOracle(1);
 * console.log(`安全价格: ${gasOracle.result.SafeGasPrice} Gwei`);
 * console.log(`建议价格: ${gasOracle.result.ProposeGasPrice} Gwei`);
 * console.log(`快速价格: ${gasOracle.result.FastGasPrice} Gwei`);
 */
export async function getGasOracle(
  chainId: number
): Promise<EtherscanApiResponse<GasOracleResult>> {
  if (!chainId) {
    throw new Error("链 ID 参数是必需的");
  }

  const params: Record<string, string> = {
    chainid: chainId.toString(),
    module: "gastracker",
    action: "gasoracle",
  };

  return callEtherscanApi<GasOracleResult>(params);
}

/**
 * 估算交易所需的 Gas 数量
 *
 * 通过 Etherscan 的 eth_estimateGas 代理接口估算执行特定交易所需的 Gas 数量。
 * 这对于在发送交易前预估费用非常有用。
 *
 * ## 支持范围
 *
 * **支持的链：**
 * - 以太坊主网 (chainId: 1)
 * - 以太坊测试网（Sepolia、Goerli 等）
 * - 所有 Etherscan 支持的 EVM 兼容链（BSC、Polygon、Arbitrum、Optimism 等）
 *   只要该链有对应的 Etherscan API 服务即可
 *
 * **支持的合约：**
 * - 任意智能合约的任意函数调用
 * - 不限于特定代币（USDT、USDC、DAI 等都可以）
 * - 包括 ERC20、ERC721、ERC1155 等各种标准合约
 * - 也支持普通 ETH 转账（data 为空或 "0x"）
 *
 * **工作原理：**
 * 该函数调用 Etherscan 的 eth_estimateGas JSON-RPC 代理接口，
 * Etherscan 会将请求转发给对应链的节点执行模拟调用，返回估算的 Gas 消耗量。
 *
 * @param chainId - 区块链的 Chain ID（如以太坊主网为 1，BSC 为 56）
 * @param options - 交易参数
 * @param options.to - 目标地址（合约地址或 EOA 地址）
 * @param options.data - 调用数据（合约函数的 ABI 编码，普通转账可传 "0x"）
 * @param options.value - 发送的 ETH 数量（十六进制，可选）
 * @param options.from - 发送方地址（可选，某些合约调用可能需要）
 * @returns 估算的 Gas 数量（十六进制字符串）
 *
 * @example
 * // 估算 USDT transfer 调用的 Gas（以太坊主网）
 * const gasEstimate = await estimateGas(1, {
 *   to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
 *   data: "0xa9059cbb000000000000000000000000...",
 * });
 * const gasUnits = parseInt(gasEstimate.result, 16);
 *
 * @example
 * // 估算 BSC 上 USDT transfer 的 Gas
 * const gasEstimate = await estimateGas(56, {
 *   to: "0x55d398326f99059fF775485246999027B3197955", // BSC USDT
 *   data: "0xa9059cbb000000000000000000000000...",
 * });
 */
export async function estimateGas(
  chainId: number,
  options: {
    to: string;
    data: string;
    value?: string;
    from?: string;
  }
): Promise<EtherscanApiResponse<string>> {
  if (!chainId) {
    throw new Error("链 ID 参数是必需的");
  }

  if (!options.to) {
    throw new Error("目标地址参数是必需的");
  }

  if (!options.data) {
    throw new Error("调用数据参数是必需的");
  }

  const params: Record<string, string> = {
    chainid: chainId.toString(),
    module: "proxy",
    action: "eth_estimateGas",
    to: options.to,
    data: options.data,
  };

  if (options.value) {
    params.value = options.value;
  }

  if (options.from) {
    params.from = options.from;
  }

  return callEtherscanApi<string>(params);
}
