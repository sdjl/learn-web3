// ============================================================
// 合约代码解读工具函数和常量
// ============================================================
// 作用：
// - 定义可查看的合约源代码列表
// - 提供合约元信息（名称、文件名、学习价值说明）
//
// 说明：
// 这些常量和工具函数与 Web3 核心开发逻辑关系不大，
// 读者可以跳过本文件，专注于 actions.ts 中的核心实现。
// ============================================================

import type { ContractInfo } from "./types";

/** GitHub 项目地址 */
export const GITHUB_REPO_URL = "https://github.com/sdjl/learn-web3";

/** 合约源代码在 GitHub 上的基础路径 */
export const GITHUB_CONTRACTS_PATH = `${GITHUB_REPO_URL}/blob/main/contracts`;

/** 默认字体大小（单位：px） */
export const DEFAULT_FONT_SIZE = 14;

/** 最小字体大小（单位：px） */
export const MIN_FONT_SIZE = 10;

/** 最大字体大小（单位：px） */
export const MAX_FONT_SIZE = 24;

/** 字体大小调整步长 */
export const FONT_SIZE_STEP = 2;

/**
 * 可查看的合约列表
 *
 * 注意：前端只能通过合约名称查询，不允许直接提交路径，
 * 以确保只能读取预定义的合约文件。
 */
export const CONTRACTS: ContractInfo[] = [
  {
    name: "usdt",
    displayName: "USDT (Tether USD)",
    filename: "usdt.sol",
    description:
      "USDT 是目前市值最大、使用最广泛的稳定币合约。它是 ERC-20 代币的经典实现，广泛应用于各大交易所和 DeFi 协议。",
    learningPoints: [
      "学习 ERC-20 代币标准的完整实现",
      "了解稳定币的增发和销毁机制",
      "理解代币授权（approve/allowance）的工作原理",
      "学习合约暂停（Pausable）功能的实现",
      "了解黑名单机制如何在合约中实现",
      "学习 Ownable 模式和权限控制",
    ],
  },
];

/**
 * 根据合约名称获取合约信息
 *
 * @param name - 合约名称
 * @returns 合约信息，如果未找到返回 undefined
 */
export function getContractByName(name: string): ContractInfo | undefined {
  return CONTRACTS.find((contract) => contract.name === name);
}

/**
 * 验证合约名称是否有效
 *
 * @param name - 合约名称
 * @returns 是否是有效的合约名称
 */
export function isValidContractName(name: string): boolean {
  return CONTRACTS.some((contract) => contract.name === name);
}
