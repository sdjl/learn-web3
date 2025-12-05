// ============================================================
// 交易历史类型定义：定义交易相关的 TypeScript 类型
// ============================================================
// 作用：
// - 集中管理交易相关的类型定义
// - 方便在多个文件中复用类型
// ============================================================

/**
 * 交易记录接口
 */
export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
}

/**
 * Etherscan API 响应接口
 */
export interface EtherscanResponse {
  status: string;
  message: string;
  result: Transaction[];
}
