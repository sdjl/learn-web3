// ============================================================
// USDT 合约 ABI：定义 USDT 合约的事件 ABI
// ============================================================
// 作用：
// - 定义 USDT 合约的所有事件 ABI
// - 仅包含配置数据，不包含工具函数
// ============================================================

import type { EventAbiItem } from "./types";

/**
 * USDT 合约事件 ABI
 * 包含 USDT (Tether) 合约的所有事件
 * 按事件发生频率从高到低排序
 */
export const USDT_EVENT_ABI: readonly EventAbiItem[] = [
  // 高频事件：每秒钟都有大量发生
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  // 中频事件：定期发生
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "amount", type: "uint256" }],
    name: "Issue",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "amount", type: "uint256" }],
    name: "Redeem",
    type: "event",
  },
  // 低频事件：偶尔发生
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "_user", type: "address" }],
    name: "AddedBlackList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "_user", type: "address" }],
    name: "RemovedBlackList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_blackListedUser", type: "address" },
      { indexed: false, name: "_balance", type: "uint256" },
    ],
    name: "DestroyedBlackFunds",
    type: "event",
  },
  // 极少发生的事件
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "feeBasisPoints", type: "uint256" },
      { indexed: false, name: "maxFee", type: "uint256" },
    ],
    name: "Params",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "Pause",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "Unpause",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "newAddress", type: "address" }],
    name: "Deprecate",
    type: "event",
  },
];

/**
 * USDT 事件名称列表（按发生频率从高到低排序）
 */
export const USDT_EVENT_NAMES = [
  "Transfer", // 最高频：每秒大量转账
  "Approval", // 高频：授权操作
  "Issue", // 中频：增发 USDT
  "Redeem", // 中频：赎回 USDT
  "AddedBlackList", // 低频：添加黑名单
  "RemovedBlackList", // 低频：移除黑名单
  "DestroyedBlackFunds", // 低频：销毁黑名单资金
  "Params", // 极少：修改参数
  "Pause", // 极少：暂停合约
  "Unpause", // 极少：恢复合约
  "Deprecate", // 极少：废弃合约
] as const;

/**
 * USDT 事件名称类型
 */
export type USDTEventName = (typeof USDT_EVENT_NAMES)[number];
