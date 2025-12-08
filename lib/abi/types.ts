// ============================================================
// ABI 模块类型定义
// ============================================================
// 本文件定义了 lib/abi 模块使用的所有类型。
// 包括事件 ABI 的类型定义和事件解析相关的类型。
// ============================================================

// ============================================================
// 事件 ABI 类型定义
// ============================================================

/**
 * 事件 ABI 输入参数定义
 *
 * 描述事件的一个参数，包括参数名称、类型和是否为 indexed。
 * indexed 参数会被存储在 topics 中，便于高效过滤查询。
 */
export interface EventAbiInput {
  /**
   * 是否为 indexed 参数
   * indexed 参数存储在 topics 中，可用于事件过滤
   * 非 indexed 参数存储在 data 中
   */
  indexed: boolean;
  /** 参数名称，如 "from"、"to"、"value" */
  name: string;
  /** 参数的 Solidity 类型，如 "address"、"uint256"、"bytes32" */
  type: string;
}

/**
 * 事件 ABI 定义
 *
 * 完整描述一个智能合约事件的结构，包括事件名称和所有参数。
 * 这个类型与 Solidity 编译器生成的 ABI JSON 格式兼容。
 */
export interface EventAbiItem {
  /**
   * 是否为匿名事件
   * 匿名事件没有 topic0（事件签名），较少使用
   */
  anonymous: boolean;
  /** 事件的参数列表 */
  inputs: readonly EventAbiInput[];
  /** 事件名称，如 "Transfer"、"Approval" */
  name: string;
  /** ABI 项类型，对于事件固定为 "event" */
  type: "event";
}

// ============================================================
// 事件解析相关类型定义
// ============================================================

/**
 * 原始事件日志数据
 *
 * 这是从 Etherscan API 获取的事件日志的最小必要字段。
 * 用于解析事件参数和构建解析后的事件对象。
 */
export interface RawEventLog {
  /**
   * 事件的 topics 数组
   * - topics[0]: 事件签名的 keccak256 哈希
   * - topics[1-3]: indexed 参数的值
   */
  topics: string[];
  /**
   * 非 indexed 参数的 ABI 编码数据
   * 每个参数占 64 个十六进制字符（32 字节）
   */
  data: string;
  /** 事件所在区块号 */
  blockNumber: string;
  /** 事件时间戳（Unix 秒） */
  timeStamp: string;
  /** 事件在区块中的日志索引 */
  logIndex: string;
  /** 触发该事件的交易哈希 */
  transactionHash: string;
}

/**
 * 解析后的事件数据
 *
 * 包含事件的所有信息，参数已从原始十六进制格式转换为可读格式。
 */
export interface ParsedEvent {
  /** 事件名称，如 "Transfer"、"Approval" */
  eventName: string;
  /** 触发该事件的交易哈希 */
  transactionHash: string;
  /** 事件所在区块号 */
  blockNumber: string;
  /** 事件时间戳（Unix 秒） */
  timeStamp: string;
  /** 事件在区块中的日志索引 */
  logIndex: string;
  /**
   * 解析后的事件参数
   * 键为参数名称，值为参数值（字符串格式）
   * 例如：{ from: "0x...", to: "0x...", value: "1000000" }
   */
  params: Record<string, string>;
}
