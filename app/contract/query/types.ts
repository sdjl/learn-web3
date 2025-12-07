// ============================================================
// 合约查询类型定义：定义合约查询相关的类型
// ============================================================
// 作用：
// - 集中管理合约查询相关的类型定义
// - 确保类型安全
// ============================================================

/**
 * 合约基本信息
 */
export interface ContractInfo {
  /** 合约地址 */
  address: string;
  /** 是否为合约地址（有代码） */
  isContract: boolean;
  /** 合约字节码（如果有） */
  bytecode?: string;
  /** 合约余额（以 wei 为单位） */
  balance: bigint;
  /** 合约余额（格式化后的字符串） */
  balanceFormatted: string;
  /** 源代码（如果从 Etherscan 获取到） */
  sourceCode?: string;
  /** 合约名称（如果从 Etherscan 获取到） */
  contractName?: string;
  /** 编译器版本（如果从 Etherscan 获取到） */
  compilerVersion?: string;
  /** 优化设置（如果从 Etherscan 获取到） */
  optimizationUsed?: boolean;
}

/**
 * 获取合约信息的参数
 */
export interface GetContractInfoParams {
  /** 合约地址 */
  address: string;
  /** 链 ID */
  chainId: number;
  /** RPC URL */
  rpcUrl: string;
}

/**
 * 合约源代码响应接口（Etherscan API 返回的原始格式）
 */
export interface ContractSourceCodeResult {
  SourceCode?: string;
  ContractName?: string;
  CompilerVersion?: string;
  OptimizationUsed?: string;
}

/**
 * 合约源代码信息（处理后的格式）
 */
export interface ContractSourceCodeInfo {
  sourceCode?: string;
  contractName?: string;
  compilerVersion?: string;
  optimizationUsed?: boolean;
}

/**
 * 合约查询错误响应
 */
export interface ContractQueryError {
  error: string;
}

/**
 * 表单组件 Props
 */
export interface FormProps {
  /** 查询结果回调 */
  onQuery: (contractInfo: ContractInfo | ContractQueryError) => void;
}

/**
 * 合约信息展示组件 Props
 */
export interface ContractInfoProps {
  /** 合约信息 */
  contractInfo: ContractInfo;
}
