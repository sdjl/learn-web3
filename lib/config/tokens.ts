// ============================================================
// 代币配置：定义应用中使用的代币名称和类型
// ============================================================
// 作用：
// - 集中管理所有代币名称常量
// - 提供类型安全的代币名称引用
// - 避免代币名称拼写错误
// - 方便 TypeScript 类型检查
// ============================================================

/**
 * 代币符号常量
 * 使用 as const 确保类型安全
 *
 * @example
 * import { TOKENS } from "@/lib/config/tokens";
 * const symbol = TOKENS.USDT; // "USDT"
 */
export const TOKENS = {
  /** Tether USD 稳定币 */
  USDT: "USDT",
  /** 以太坊原生代币 */
  ETH: "ETH",
} as const;

/**
 * 代币符号类型
 * 从 TOKENS 对象的值推导出联合类型
 */
export type TokenSymbol = (typeof TOKENS)[keyof typeof TOKENS];

/**
 * 代币信息接口
 * 定义代币的基本属性
 */
export interface TokenInfo {
  /** 代币符号 */
  symbol: TokenSymbol;
  /** 代币名称 */
  name: string;
  /** 代币精度（小数位数） */
  decimals: number;
}

/**
 * 代币信息配置
 * 包含所有已知代币的基本信息
 *
 * @example
 * import { TOKEN_INFO, TOKENS } from "@/lib/config/tokens";
 * const decimals = TOKEN_INFO[TOKENS.USDT].decimals; // 6
 */
export const TOKEN_INFO = {
  [TOKENS.USDT]: {
    symbol: TOKENS.USDT,
    name: "Tether USD",
    decimals: 6,
  },
  [TOKENS.ETH]: {
    symbol: TOKENS.ETH,
    name: "Ether",
    decimals: 18,
  },
} as const satisfies Record<TokenSymbol, TokenInfo>;

/**
 * 获取代币信息
 *
 * @param symbol - 代币符号
 * @returns 代币信息对象
 *
 * @example
 * import { getTokenInfo, TOKENS } from "@/lib/config/tokens";
 * const info = getTokenInfo(TOKENS.USDT);
 * console.log(info.decimals); // 6
 */
export function getTokenInfo(symbol: TokenSymbol): TokenInfo {
  return TOKEN_INFO[symbol];
}
