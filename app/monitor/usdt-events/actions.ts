"use server";

// ============================================================
// USDT 合约事件 Server Action
// ============================================================
// 本模块提供 USDT 事件监听页面的后端逻辑。
// 所有 Etherscan API 调用都在服务端执行，以保护 API Key 不被泄露。
//
// 主要功能：
// - 获取 USDT 合约的最近事件
// - 解析事件数据为可读格式
// - 提供事件类型选择列表
// ============================================================

import { getUSDTEvents, SAFE_CONFIRMATIONS } from "@/lib/contracts/usdt";
import { USDT_EVENT_ABI, type USDTEventName } from "@/lib/abi/usdt";
import { parseEventLogs } from "@/lib/abi/parser";
import type {
  ParsedUSDTEvent,
  EventSelectOption,
  USDTEventsQueryResult,
} from "./types";

/**
 * 获取 USDT 合约最近的事件
 *
 * 查询 USDT 合约的事件日志，解析为可读格式，并返回区块信息。
 * 为了确保数据稳定性，查询会自动回退 SAFE_CONFIRMATIONS 个区块。
 *
 * @param limit - 获取的事件数量，默认 10 条
 * @param eventName - 可选，指定要过滤的事件类型（如 "Transfer"）
 * @returns 查询结果，包含事件列表和区块信息
 * @throws {Error} 当 API 调用失败时抛出异常
 */
export async function getUSDTRecentEvents(
  limit: number = 10,
  eventName?: USDTEventName
): Promise<USDTEventsQueryResult> {
  try {
    // 调用 USDT 合约封装函数获取事件
    const { response, fromBlock, currentBlock, confirmations } =
      await getUSDTEvents(1, {
        eventName,
        page: "1",
        offset: limit.toString(),
      });

    // 如果没有事件数据，返回空结果
    if (!response.result || response.result.length === 0) {
      return {
        events: [],
        fromBlock,
        currentBlock,
        confirmations,
      };
    }

    // 使用 viem 解析事件日志
    const parsedEvents = parseEventLogs(
      response.result,
      USDT_EVENT_ABI,
      true // 按时间戳倒序排列（最新的在前）
    );

    // 转换为 USDT 特定的类型
    const events: ParsedUSDTEvent[] = parsedEvents.map((e) => ({
      ...e,
      eventName: e.eventName as USDTEventName,
    }));

    return {
      events,
      fromBlock,
      currentBlock,
      confirmations,
    };
  } catch (error) {
    console.error("获取 USDT 事件数据错误:", error);
    const errorMessage =
      error instanceof Error ? error.message : "获取 USDT 事件数据时发生错误";
    throw new Error(errorMessage);
  }
}

/**
 * 获取所有可选的事件类型
 *
 * 返回事件类型选择器的选项列表，包含"所有事件"和各个具体事件类型。
 * 事件按照发生频率排序（Transfer 最常见，Deprecate 最少）。
 *
 * @returns 事件选择选项列表
 */
export async function getEventSelectOptions(): Promise<EventSelectOption[]> {
  const eventNames = USDT_EVENT_ABI.map((e) => e.name);

  return [
    { value: "all", label: "所有事件" },
    ...eventNames.map((name) => ({
      value: name,
      label: name,
    })),
  ];
}

/**
 * 获取安全确认区块数
 *
 * 返回当前配置的安全确认区块数，用于在 UI 中显示数据延迟提示。
 *
 * @returns 安全确认区块数
 */
export async function getSafeConfirmations(): Promise<number> {
  return SAFE_CONFIRMATIONS;
}
