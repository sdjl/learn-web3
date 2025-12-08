// ============================================================
// ABI 事件解析器
// ============================================================
// 本模块使用 viem 的 decodeEventLog 函数解析事件日志。
//
// 背景知识：
// 智能合约触发的事件以日志形式存储在区块链上，包含：
// - topics: 事件签名和 indexed 参数
// - data: 非 indexed 参数的 ABI 编码数据
//
// viem 的 decodeEventLog 函数可以自动解析这些数据，
// 我们只需要提供 ABI 定义和原始日志数据即可。
// ============================================================

import { decodeEventLog, type Hex, type AbiEvent } from "viem";
import type { EventAbiItem, RawEventLog, ParsedEvent } from "./types";
import { buildTopicToEventNameMap, findEventAbi } from "./utils";

// 重新导出类型，方便外部模块使用
export type { RawEventLog, ParsedEvent } from "./types";

// ============================================================
// 解析函数（使用 viem）
// ============================================================

/**
 * 使用 viem 解析单个事件日志
 *
 * 内部使用 viem 的 decodeEventLog 函数来解码事件数据。
 *
 * @param log - 原始事件日志数据
 * @param eventAbiList - 合约的所有事件 ABI 列表
 * @param topicToEventName - topic0 到事件名称的映射表
 * @returns 解析后的事件对象，如果事件无法识别则返回 null
 *
 * @example
 * const topicMap = buildTopicToEventNameMap(USDT_EVENT_ABI);
 * const event = parseEventLog(log, USDT_EVENT_ABI, topicMap);
 * if (event) {
 *   console.log(`${event.eventName}: ${JSON.stringify(event.params)}`);
 * }
 */
export function parseEventLog(
  log: RawEventLog,
  eventAbiList: readonly EventAbiItem[],
  topicToEventName: Record<string, string>
): ParsedEvent | null {
  // 从 topics[0] 获取事件签名，查找事件名称
  const topic0 = log.topics[0];
  const eventName = topicToEventName[topic0];

  if (!eventName) {
    // 未知事件（可能是合约的其他事件，不在提供的 ABI 中）
    return null;
  }

  // 查找事件的 ABI 定义
  const eventAbi = findEventAbi(eventAbiList, eventName);
  if (!eventAbi) {
    return null;
  }

  try {
    // 使用 viem 的 decodeEventLog 解析事件
    const decoded = decodeEventLog({
      abi: [eventAbi as AbiEvent],
      data: log.data as Hex,
      topics: log.topics as [Hex, ...Hex[]],
      strict: false, // 允许部分解码，避免因数据不完整而抛出错误
    });

    // 将解码后的参数转换为 Record<string, string> 格式
    const params: Record<string, string> = {};
    if (decoded.args && typeof decoded.args === "object") {
      for (const [key, value] of Object.entries(decoded.args)) {
        // 将各种类型的值转换为字符串
        if (typeof value === "bigint") {
          params[key] = value.toString();
        } else if (typeof value === "string") {
          params[key] = value;
        } else if (typeof value === "boolean") {
          params[key] = value.toString();
        } else if (value === null || value === undefined) {
          params[key] = "";
        } else {
          params[key] = String(value);
        }
      }
    }

    return {
      eventName,
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timeStamp: log.timeStamp,
      logIndex: log.logIndex,
      params,
    };
  } catch (error) {
    // 解码失败，返回 null
    console.warn(`解码事件 ${eventName} 失败:`, error);
    return null;
  }
}

/**
 * 批量解析事件日志
 *
 * 将多个原始事件日志转换为解析后的事件数组。
 * 自动过滤掉无法识别的事件，并可选择按时间戳排序。
 *
 * @param logs - 原始事件日志数组
 * @param eventAbiList - 合约的所有事件 ABI 列表
 * @param sortDesc - 是否按时间戳倒序排列（最新的在前），默认 true
 * @returns 解析后的事件数组，已过滤掉无法识别的事件
 *
 * @example
 * const events = parseEventLogs(response.result, USDT_EVENT_ABI, true);
 */
export function parseEventLogs(
  logs: RawEventLog[],
  eventAbiList: readonly EventAbiItem[],
  sortDesc: boolean = true
): ParsedEvent[] {
  // 构建 topic0 到事件名称的映射
  const topicToEventName = buildTopicToEventNameMap(eventAbiList);

  // 解析所有日志，过滤掉无法识别的事件
  const events = logs
    .map((log) => parseEventLog(log, eventAbiList, topicToEventName))
    .filter((e): e is ParsedEvent => e !== null);

  // 按时间戳排序
  if (sortDesc) {
    events.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
  }

  return events;
}
