"use client";

// ============================================================
// USDT 事件列表组件
// ============================================================
// 显示 USDT 合约的事件日志，支持：
// - 按事件类型筛选
// - 自动刷新（每 12 秒）
// - 显示数据延迟提示（显示的是多少个区块之前的数据）
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";
import { getUSDTRecentEvents, getEventSelectOptions } from "../actions";
import type {
  ParsedUSDTEvent,
  EventSelectOption,
  USDTEventsQueryResult,
} from "../types";
import type { USDTEventName } from "@/lib/abi/usdt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOKENS, TOKEN_INFO } from "@/lib/config/tokens";

// USDT 代币精度
const USDT_DECIMALS = TOKEN_INFO[TOKENS.USDT].decimals;

/**
 * 格式化时间戳为可读时间
 */
function formatTime(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 缩短地址显示
 */
function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 格式化 USDT 数量
 */
function formatUSDT(value: string): string {
  try {
    return formatUnits(BigInt(value), USDT_DECIMALS);
  } catch {
    return value;
  }
}

/**
 * 渲染事件参数
 */
function renderEventParams(event: ParsedUSDTEvent): React.ReactNode {
  const { eventName, params } = event;

  switch (eventName) {
    case "Transfer":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">从:</span>
            <a
              href={`https://etherscan.io/address/${params.from}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortenAddress(params.from)}
            </a>
            <span className="text-muted-foreground">→</span>
            <a
              href={`https://etherscan.io/address/${params.to}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortenAddress(params.to)}
            </a>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">金额:</span>{" "}
            <span className="font-medium">
              {parseFloat(formatUSDT(params.value)).toLocaleString()}{" "}
              {TOKENS.USDT}
            </span>
          </div>
        </div>
      );

    case "Approval":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">所有者:</span>
            <a
              href={`https://etherscan.io/address/${params.owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortenAddress(params.owner)}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">授权给:</span>
            <a
              href={`https://etherscan.io/address/${params.spender}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortenAddress(params.spender)}
            </a>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">授权额度:</span>{" "}
            <span className="font-medium">
              {parseFloat(formatUSDT(params.value)).toLocaleString()}{" "}
              {TOKENS.USDT}
            </span>
          </div>
        </div>
      );

    case "Issue":
    case "Redeem":
      return (
        <div className="text-sm">
          <span className="text-muted-foreground">数量:</span>{" "}
          <span className="font-medium">
            {parseFloat(formatUSDT(params.amount)).toLocaleString()}{" "}
            {TOKENS.USDT}
          </span>
        </div>
      );

    case "AddedBlackList":
    case "RemovedBlackList":
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">用户:</span>
          <a
            href={`https://etherscan.io/address/${params._user}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-primary hover:underline"
          >
            {shortenAddress(params._user)}
          </a>
        </div>
      );

    case "DestroyedBlackFunds":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">黑名单用户:</span>
            <a
              href={`https://etherscan.io/address/${params._blackListedUser}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {shortenAddress(params._blackListedUser)}
            </a>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">销毁金额:</span>{" "}
            <span className="font-medium">
              {parseFloat(formatUSDT(params._balance)).toLocaleString()}{" "}
              {TOKENS.USDT}
            </span>
          </div>
        </div>
      );

    case "Deprecate":
      return (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">新地址:</span>
          <a
            href={`https://etherscan.io/address/${params.newAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-primary hover:underline"
          >
            {shortenAddress(params.newAddress)}
          </a>
        </div>
      );

    case "Params":
      return (
        <div className="flex flex-col gap-1 text-sm">
          <div>
            <span className="text-muted-foreground">费率基点:</span>{" "}
            <span className="font-medium">{params.feeBasisPoints}</span>
          </div>
          <div>
            <span className="text-muted-foreground">最大费用:</span>{" "}
            <span className="font-medium">
              {parseFloat(formatUSDT(params.maxFee)).toLocaleString()}{" "}
              {TOKENS.USDT}
            </span>
          </div>
        </div>
      );

    case "Pause":
      return <span className="font-medium text-yellow-500">合约已暂停</span>;

    case "Unpause":
      return <span className="font-medium text-green-500">合约已恢复</span>;

    default:
      return (
        <pre className="text-xs text-muted-foreground">
          {JSON.stringify(params, null, 2)}
        </pre>
      );
  }
}

/**
 * 获取事件类型的徽章颜色
 */
function getEventBadgeColor(eventName: string): string {
  const colors: Record<string, string> = {
    Transfer: "bg-blue-500/10 text-blue-500",
    Approval: "bg-green-500/10 text-green-500",
    Issue: "bg-purple-500/10 text-purple-500",
    Redeem: "bg-orange-500/10 text-orange-500",
    AddedBlackList: "bg-red-500/10 text-red-500",
    RemovedBlackList: "bg-emerald-500/10 text-emerald-500",
    DestroyedBlackFunds: "bg-red-500/10 text-red-500",
    Deprecate: "bg-yellow-500/10 text-yellow-500",
    Params: "bg-gray-500/10 text-gray-500",
    Pause: "bg-yellow-500/10 text-yellow-500",
    Unpause: "bg-green-500/10 text-green-500",
  };
  return colors[eventName] || "bg-gray-500/10 text-gray-500";
}

export function USDTEventList() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  // 获取事件选择选项
  const { data: eventOptions = [] } = useQuery<EventSelectOption[]>({
    queryKey: ["usdt-event-options"],
    queryFn: getEventSelectOptions,
    staleTime: Infinity,
  });

  // 获取 USDT 事件数据
  const { data, isLoading, error, refetch } = useQuery<USDTEventsQueryResult>({
    queryKey: ["usdt-events", selectedEvent],
    queryFn: async () => {
      const eventName =
        selectedEvent === "all" ? undefined : (selectedEvent as USDTEventName);
      return await getUSDTRecentEvents(10, eventName);
    },
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 12000 : false,
  });

  // 切换自动刷新时手动刷新一次
  useEffect(() => {
    if (autoRefresh) {
      refetch();
    }
  }, [autoRefresh, refetch]);

  const events = data?.events || [];
  const confirmations = data?.confirmations || 0;
  const fromBlock = data?.fromBlock || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 事件类型选择器 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">事件类型</span>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择事件类型" />
              </SelectTrigger>
              <SelectContent>
                {eventOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 自动刷新开关 */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">自动刷新</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            {autoRefresh && (
              <span className="text-xs text-muted-foreground">
                (每 12 秒刷新)
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "加载中..." : "立即刷新"}
        </button>
      </div>

      {/* 状态指示器 */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              autoRefresh ? "animate-pulse bg-green-500" : "bg-gray-400"
            }`}
          />
          <span>{autoRefresh ? "监听中..." : "已暂停"}</span>
        </div>
        <span>·</span>
        <span>共 {events.length} 条事件</span>
        {confirmations > 0 && (
          <>
            <span>·</span>
            <span className="text-yellow-600">
              数据延迟 {confirmations} 个区块（从区块 #{fromBlock} 开始）
            </span>
          </>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error instanceof Error ? error.message : "获取事件数据失败"}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && events.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>加载事件数据中...</span>
          </div>
        </div>
      )}

      {/* 事件列表 */}
      {events.length > 0 && (
        <div className="flex flex-col gap-3">
          {events.map((event, index) => (
            <div
              key={`${event.transactionHash}-${event.logIndex}`}
              className={`rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30 ${
                index === 0 && autoRefresh ? "animate-pulse bg-primary/5" : ""
              }`}
            >
              {/* 事件头部 */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${getEventBadgeColor(
                      event.eventName
                    )}`}
                  >
                    {event.eventName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(event.timeStamp)}
                  </span>
                </div>
                <a
                  href={`https://etherscan.io/tx/${event.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {shortenAddress(event.transactionHash)}
                </a>
              </div>

              {/* 事件参数 */}
              <div className="text-sm">{renderEventParams(event)}</div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && events.length === 0 && !error && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          暂无事件数据
        </div>
      )}
    </div>
  );
}
