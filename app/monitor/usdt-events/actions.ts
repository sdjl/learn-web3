"use server";

// ============================================================
// USDT 合约事件 Server Action
// ============================================================
// 作用：
// - 获取 USDT 合约的最近事件（Transfer、Approval 等）
// - 解析事件日志为可读格式
// - 提供事件类型选择列表
//
// 学习要点：
// - 什么是智能合约事件（Event）
// - 如何通过 Etherscan API 获取事件日志
// - 如何解析事件日志的原始数据
// ============================================================

// ============================================================
// 内部库导入
// ============================================================
// getUSDTEvents: 封装的函数，调用 Etherscan API 获取 USDT 合约事件
// SAFE_CONFIRMATIONS: 安全确认区块数（12 个区块），避免查询未确认的数据
import { getUSDTEvents, SAFE_CONFIRMATIONS } from "@/lib/contracts/usdt";
// USDT_EVENT_ABI: USDT 合约的事件 ABI 定义（Transfer、Approval 等事件的结构）
// USDTEventName: USDT 事件名称的类型定义
import { USDT_EVENT_ABI, type USDTEventName } from "@/lib/abi/usdt";
// parseEventLogs: 使用 Viem 解析事件日志的原始数据为可读格式
import { parseEventLogs } from "@/lib/abi/parser";
import type {
  ParsedUSDTEvent,
  EventSelectOption,
  USDTEventsQueryResult,
} from "./types";

/**
 * 获取 USDT 合约最近的事件
 *
 * 智能合约事件（Event）是什么？
 * - 事件是合约与外部世界通信的方式
 * - 当合约执行某些操作时（如转账），会触发事件
 * - 事件会被记录在区块链上，可以通过 API 查询
 * - 常见事件：Transfer（转账）、Approval（授权）
 *
 * 为什么要回退 12 个区块？
 * - 最新的区块可能还未被完全确认
 * - Etherscan 的数据同步可能有延迟
 * - 回退 12 个区块可以确保查询到稳定的数据
 *
 * @param limit - 获取的事件数量，默认 10 条
 * @param eventName - 可选，指定要过滤的事件类型
 *   - 不传：获取所有类型的事件
 *   - "Transfer"：只获取转账事件
 *   - "Approval"：只获取授权事件
 *
 * @returns 返回 USDTEventsQueryResult 对象：
 * - `events`: ParsedUSDTEvent[] - 解析后的事件列表
 *   - 每个事件包含：事件名称、参数值、交易哈希、区块号、时间戳等
 * - `fromBlock`: number - 查询的起始区块号
 * - `currentBlock`: number - 当前最新区块号
 * - `confirmations`: number - 安全确认区块数
 *
 * @throws {Error} 当 API 调用失败时抛出异常
 */
export async function getUSDTRecentEvents(
  limit: number = 10,
  eventName?: USDTEventName
): Promise<USDTEventsQueryResult> {
  try {
    // ============================================================
    // 步骤 1：调用 Etherscan API 获取事件日志
    // ============================================================
    // getUSDTEvents 内部会：
    // - 获取当前区块号
    // - 计算安全的起始区块（当前区块 - 12）
    // - 调用 Etherscan 的 getLogs API 获取事件
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

    // ============================================================
    // 步骤 2：解析事件日志的原始数据
    // ============================================================
    // Etherscan 返回的事件日志是原始格式：
    // - topics: 事件签名和 indexed 参数的哈希值
    // - data: 非 indexed 参数的 ABI 编码数据
    //
    // parseEventLogs 使用 Viem 的 decodeEventLog 函数：
    // - 根据 ABI 定义解析 topics 和 data
    // - 提取出人类可读的参数值（地址、金额等）
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
 * USDT 合约支持多种事件类型，按发生频率排序：
 * - Transfer: 转账事件（最常见，每秒大量发生）
 * - Approval: 授权事件（用户授权 DEX 等合约花费代币）
 * - Issue: 增发事件（Tether 公司增发 USDT）
 * - Redeem: 赎回事件（Tether 公司赎回 USDT）
 * - AddedBlackList: 添加黑名单
 * - RemovedBlackList: 移除黑名单
 * - DestroyedBlackFunds: 销毁黑名单地址的资金
 * - Params: 修改合约参数（手续费等）
 * - Pause/Unpause: 暂停/恢复合约
 * - Deprecate: 废弃合约（指向新合约）
 *
 * @returns 事件选择选项列表，用于下拉菜单
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
 * 安全确认区块数是指查询事件时回退的区块数量。
 * 以太坊每个区块约 12 秒，12 个区块约 2.4 分钟。
 * 这意味着查询到的数据比实时数据延迟约 2-3 分钟。
 *
 * @returns 安全确认区块数（默认 12）
 */
export async function getSafeConfirmations(): Promise<number> {
  return SAFE_CONFIRMATIONS;
}
