// ============================================================
// USDT 合约事件页面类型定义
// ============================================================
// 作用：
// - 定义 USDT 事件监听页面相关的类型
// - 为 Server Action 和组件提供类型支持
// ============================================================

import type { USDTEventName } from "@/lib/abi/usdt";

/**
 * 解析后的 USDT 事件
 *
 * 包含事件的完整信息，参数已从原始十六进制格式解码为可读格式。
 */
export interface ParsedUSDTEvent {
  /** 事件名称，如 "Transfer"、"Approval" */
  eventName: USDTEventName;
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
   */
  params: Record<string, string>;
}

/**
 * 事件选择器选项
 *
 * 用于事件类型下拉选择器的选项数据。
 */
export interface EventSelectOption {
  /** 选项值："all" 表示所有事件，或具体的事件名称 */
  value: string;
  /** 选项显示文本 */
  label: string;
}

/**
 * USDT 事件查询结果
 *
 * 包含事件列表和区块信息，用于在 UI 中显示数据延迟提示。
 */
export interface USDTEventsQueryResult {
  /** 解析后的事件列表 */
  events: ParsedUSDTEvent[];
  /** 查询的起始区块号 */
  fromBlock: number;
  /** 当前最新区块号 */
  currentBlock: number;
  /** 数据延迟的区块数 */
  confirmations: number;
}
