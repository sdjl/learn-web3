// ============================================================
// ABI 工具库
// Application Binary Interface（应用程序二进制接口）
// ============================================================
// 本模块提供与智能合约 ABI 相关的工具函数。
// 主要是对 viem 库函数的封装，提供更便捷的 API。
//
// 关于事件和 Topics：
// 智能合约的事件在区块链上以日志（Log）形式存储。每个日志包含：
// - topics[0]: 事件签名的 keccak256 哈希，用于识别事件类型
// - topics[1-3]: indexed 参数的值（最多 3 个）
// - data: 非 indexed 参数的 ABI 编码数据
// ============================================================

import { toEventSelector, type AbiEvent } from "viem";
import type { EventAbiItem } from "./types";

// 重新导出类型，方便外部模块使用
export type { EventAbiInput, EventAbiItem } from "./types";

// ============================================================
// 事件签名函数（使用 viem）
// ============================================================

/**
 * 获取事件的 topic0（事件选择器）
 *
 * 使用 viem 的 toEventSelector 计算事件签名的 keccak256 哈希。
 * 这个哈希值是事件日志的 topics[0]，用于识别事件类型。
 *
 * @param eventAbi - 事件的 ABI 定义
 * @returns 事件签名的 keccak256 哈希值（十六进制字符串，带 0x 前缀）
 *
 * @example
 * const topic0 = getEventTopic0({
 *   name: "Transfer",
 *   type: "event",
 *   inputs: [
 *     { indexed: true, name: "from", type: "address" },
 *     { indexed: true, name: "to", type: "address" },
 *     { indexed: false, name: "value", type: "uint256" },
 *   ],
 * });
 * // 返回: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
 */
export function getEventTopic0(eventAbi: EventAbiItem): string {
  // toEventSelector 函数会返回事件的 topic0
  return toEventSelector(eventAbi as AbiEvent);
}

// ============================================================
// 映射构建函数
// ============================================================

/**
 * 构建事件名称到 topic0 的映射表
 *
 * 将事件 ABI 数组转换为一个查找表，可以快速根据事件名称获取其 topic0。
 * 这在需要根据事件名称过滤事件日志时非常有用。
 *
 * @param eventAbiList - 事件 ABI 数组
 * @returns 事件名称到 topic0 的映射对象
 *
 * @example
 * const topicsMap = buildEventTopicsMap(USDT_EVENT_ABI);
 * const transferTopic = topicsMap["Transfer"];
 * // 使用 transferTopic 来过滤 Transfer 事件
 */
export function buildEventTopicsMap(
  eventAbiList: readonly EventAbiItem[]
): Record<string, string> {
  const topics: Record<string, string> = {};

  for (const event of eventAbiList) {
    topics[event.name] = getEventTopic0(event);
  }

  return topics;
}

/**
 * 构建 topic0 到事件名称的反向映射表
 *
 * 与 buildEventTopicsMap 相反，这个函数用于根据 topic0 反查事件名称。
 * 在解析事件日志时，我们已知 topic0，需要找出对应的事件类型。
 *
 * @param eventAbiList - 事件 ABI 数组
 * @returns topic0 到事件名称的映射对象
 *
 * @example
 * const reverseMap = buildTopicToEventNameMap(USDT_EVENT_ABI);
 * const eventName = reverseMap[log.topics[0]];
 * // eventName 可能是 "Transfer"、"Approval" 等
 */
export function buildTopicToEventNameMap(
  eventAbiList: readonly EventAbiItem[]
): Record<string, string> {
  const reverse: Record<string, string> = {};

  for (const event of eventAbiList) {
    const topic = getEventTopic0(event);
    reverse[topic] = event.name;
  }

  return reverse;
}

// ============================================================
// 辅助查询函数
// ============================================================

/**
 * 从事件 ABI 数组中提取所有事件名称
 *
 * 用于获取合约支持的所有事件类型列表，常用于 UI 中的事件选择器。
 *
 * @param eventAbiList - 事件 ABI 数组
 * @returns 事件名称数组
 *
 * @example
 * const names = getEventNames(USDT_EVENT_ABI);
 * // 返回: ["Transfer", "Approval", "Issue", ...]
 */
export function getEventNames(eventAbiList: readonly EventAbiItem[]): string[] {
  return eventAbiList.map((e) => e.name);
}

/**
 * 根据事件名称查找对应的 ABI 定义
 *
 * 在解析事件参数时，需要知道每个参数的类型和是否为 indexed。
 * 此函数用于根据事件名称获取完整的 ABI 定义。
 *
 * @param eventAbiList - 事件 ABI 数组
 * @param eventName - 要查找的事件名称
 * @returns 找到的事件 ABI，如果未找到则返回 undefined
 *
 * @example
 * const transferAbi = findEventAbi(USDT_EVENT_ABI, "Transfer");
 * if (transferAbi) {
 *   console.log(`Transfer 事件有 ${transferAbi.inputs.length} 个参数`);
 * }
 */
export function findEventAbi(
  eventAbiList: readonly EventAbiItem[],
  eventName: string
): EventAbiItem | undefined {
  return eventAbiList.find((e) => e.name === eventName);
}
