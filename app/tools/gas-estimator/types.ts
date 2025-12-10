// ============================================================
// Gas 估算页面类型定义
// ============================================================

/**
 * 操作类型：transfer 或 approve
 */
export type OperationType = "transfer" | "approve";

/**
 * Gas 价格信息（来自 Gas Oracle）
 */
export interface GasPriceInfo {
  /** 最新区块号 */
  lastBlock: string;
  /** 安全价格（Gwei） */
  safeGasPrice: string;
  /** 建议价格（Gwei） */
  proposeGasPrice: string;
  /** 快速价格（Gwei） */
  fastGasPrice: string;
  /** 基础费用（Gwei） */
  suggestBaseFee: string;
}

/**
 * Gas 估算结果
 */
export interface GasEstimateResult {
  /** 是否成功 */
  success: boolean;
  /** 错误信息（失败时） */
  error?: string;
  /** 估算的 Gas 单位数量 */
  gasUnits?: number;
  /** 当前 Gas 价格信息 */
  gasPrices?: GasPriceInfo;
  /** 预估费用（单位：Gwei） */
  estimatedCostGwei?: {
    safe: string;
    propose: string;
    fast: string;
  };
  /** 预估费用（单位：ETH） */
  estimatedCostEth?: {
    safe: string;
    propose: string;
    fast: string;
  };
}

/**
 * 估算参数
 */
export interface EstimateParams {
  /** 操作类型 */
  operationType: OperationType;
  /** 接收方地址（transfer 时使用） */
  toAddress: string;
  /** 转账金额（USDT 单位） */
  amount: string;
  /** 被授权方地址（approve 时使用） */
  spenderAddress: string;
}
