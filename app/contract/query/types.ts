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
  /** 合约 ABI（如果从 Etherscan 获取到） */
  abi?: AbiFunction[];
  /** 链 ID */
  chainId?: number;
  /** RPC URL */
  rpcUrl?: string;
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
  ABI?: string;
}

/**
 * 合约源代码信息（处理后的格式）
 */
export interface ContractSourceCodeInfo {
  sourceCode?: string;
  contractName?: string;
  compilerVersion?: string;
  optimizationUsed?: boolean;
  abi?: AbiFunction[];
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

/**
 * 合约状态变量
 */
export interface StateVariable {
  /** 变量名称 */
  name: string;
  /** 变量类型 */
  type: string;
  /** 变量值（格式化后的字符串） */
  value: string;
  /** 原始值 */
  rawValue: unknown;
}

/**
 * 合约 ABI 函数定义
 */
export interface AbiFunction {
  /** 函数类型 */
  type: "function" | "constructor" | "event" | "fallback" | "receive";
  /** 函数名称 */
  name?: string;
  /** 状态可变性 */
  stateMutability?: "pure" | "view" | "nonpayable" | "payable";
  /** 输入参数 */
  inputs?: Array<{ name: string; type: string }>;
  /** 输出参数 */
  outputs?: Array<{ name: string; type: string }>;
}

/**
 * 基本信息组件 Props
 */
export interface BasicInfoProps {
  /** 合约信息 */
  contractInfo: ContractInfo;
}

/**
 * 状态变量组件 Props
 */
export interface StateVariablesProps {
  /** 状态变量列表 */
  stateVariables: StateVariable[];
  /** 是否加载中 */
  isLoading: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 源代码组件 Props
 */
export interface SourceCodeProps {
  /** 源代码 */
  sourceCode?: string;
  /** 合约名称 */
  contractName?: string;
  /** 编译器版本 */
  compilerVersion?: string;
  /** 是否启用优化 */
  optimizationUsed?: boolean;
}
