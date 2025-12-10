"use server";

// ============================================================
// 合约查询 Server Actions
// ============================================================
// 作用：
// - 查询合约基本信息（是否为合约、余额、字节码）
// - 获取合约源代码和 ABI（从 Etherscan）
// - 读取合约的状态变量值
//
// 学习要点：
// - 如何判断一个地址是普通钱包还是智能合约
// - 如何使用 Viem 的 PublicClient 与区块链交互
// - 如何从 Etherscan 获取已验证合约的源代码
// - 如何读取合约的 public 状态变量
// ============================================================

// ============================================================
// Viem 库导入说明
// ============================================================
// createPublicClient: 创建公共客户端，用于与区块链节点通信
//   - 作用：提供只读的区块链查询功能（不能发送交易）
//   - 可以查询余额、调用 view 函数、获取区块信息等
//
// http: 创建 HTTP 传输层，用于连接 RPC 节点
//   - 作用：指定通过 HTTP 协议连接到哪个 RPC 节点
//   - 输入：RPC URL（如 "https://eth-mainnet.g.alchemy.com/v2/xxx"）
//
// isAddress: 验证字符串是否为有效的以太坊地址格式
//   - 作用：检查地址是否为 0x 开头的 40 位十六进制字符串
//   - 输出：boolean
//
// formatEther: 将 wei 转换为 ETH 字符串
//   - 作用：把区块链使用的最小单位转换为人类可读的格式
//   - 输入：BigInt（如 1000000000000000000n）
//   - 输出：string（如 "1.0"）
import { createPublicClient, http, isAddress, formatEther } from "viem";

// ============================================================
// 内部库导入
// ============================================================
// callEtherscanApi: 封装的 Etherscan API 调用函数
import { callEtherscanApi } from "@/lib/services/etherscan";
// getChainById: 根据链 ID 获取链配置（用于 Viem 的 chain 参数）
import { getChainById } from "@/lib/config/chains";
// parseSourceCode: 解析合约源代码（处理单文件和多文件合约）
// formatVariableValue: 格式化状态变量的值为可读字符串
import { parseSourceCode, formatVariableValue } from "./utils";
import type {
  ContractInfo,
  GetContractInfoParams,
  ContractSourceCodeResult,
  ContractSourceCodeInfo,
  ContractQueryError,
  AbiFunction,
  StateVariable,
} from "./types";

/**
 * 从 Etherscan API 获取合约源代码
 *
 * 什么是合约验证？
 * - 部署合约时，只有编译后的字节码会上传到区块链
 * - 开发者可以在 Etherscan 上「验证」合约，上传源代码
 * - Etherscan 会重新编译源代码，确认与链上字节码一致
 * - 验证后的合约，用户可以查看源代码和 ABI
 *
 * @param address - 合约地址
 * @param chainId - 链 ID
 *
 * @returns 返回 ContractSourceCodeInfo 对象（部分字段可能为 undefined）：
 * - `sourceCode`: string | undefined - 合约源代码
 * - `contractName`: string | undefined - 合约名称
 * - `compilerVersion`: string | undefined - 编译器版本
 * - `optimizationUsed`: boolean | undefined - 是否启用优化
 * - `abi`: AbiFunction[] | undefined - 合约 ABI
 */
async function getContractSourceCode(
  address: string,
  chainId: number
): Promise<ContractSourceCodeInfo> {
  try {
    // 调用 Etherscan 的 getsourcecode API
    // 只有已验证的合约才能获取到源代码
    const response = await callEtherscanApi<ContractSourceCodeResult[]>({
      chainid: chainId.toString(),
      module: "contract",
      action: "getsourcecode",
      address: address,
    });

    // 检查响应数据
    if (
      response.status === "1" &&
      response.result &&
      response.result.length > 0
    ) {
      const result = response.result[0];

      // 处理源代码
      // 源代码可能是：
      // 1. 单文件合约：直接的 Solidity 代码字符串
      // 2. 多文件合约：JSON 字符串，包含多个文件的内容
      const sourceCode =
        result.SourceCode && result.SourceCode.trim() !== ""
          ? parseSourceCode(result.SourceCode)
          : undefined;

      // 解析 ABI（Application Binary Interface）
      // ABI 是合约的接口定义，描述了合约有哪些函数、事件、参数类型等
      // 调用合约时需要根据 ABI 编码参数
      let abi: AbiFunction[] | undefined;
      if (result.ABI && result.ABI !== "Contract source code not verified") {
        try {
          abi = JSON.parse(result.ABI) as AbiFunction[];
        } catch {
          // ABI 解析失败，忽略
        }
      }

      return {
        sourceCode,
        contractName: result.ContractName || undefined,
        compilerVersion: result.CompilerVersion || undefined,
        optimizationUsed:
          result.OptimizationUsed === "1"
            ? true
            : result.OptimizationUsed === "0"
            ? false
            : undefined,
        abi,
      };
    }
  } catch (error) {
    // 获取源代码失败，记录错误并返回空对象
    console.error("获取合约源代码失败:", error);
  }

  // 如果获取失败或合约未验证，返回空对象
  return {};
}

/**
 * 获取合约信息
 *
 * 此函数查询指定地址的详细信息，包括：
 * 1. 判断是否为智能合约（通过检查是否有字节码）
 * 2. 获取地址余额
 * 3. 如果是合约，尝试从 Etherscan 获取源代码和 ABI
 *
 * 如何判断地址是合约还是普通钱包？
 * - 智能合约地址存储有字节码（编译后的合约代码）
 * - 普通钱包地址（EOA）没有字节码
 * - 使用 getCode 方法获取字节码，如果不为空则是合约
 *
 * @param params - 查询参数
 * - `address`: string - 要查询的地址
 * - `chainId`: number - 链 ID（1 = 以太坊主网）
 * - `rpcUrl`: string - RPC 节点 URL
 *
 * @returns 成功时返回 ContractInfo 对象：
 * - `address`: string - 合约地址
 * - `isContract`: boolean - 是否为智能合约
 * - `bytecode`: string | undefined - 合约字节码
 * - `balance`: bigint - 地址余额（wei）
 * - `balanceFormatted`: string - 格式化后的余额（ETH）
 * - `sourceCode`: string | undefined - 合约源代码（如已验证）
 * - `contractName`: string | undefined - 合约名称
 * - `abi`: AbiFunction[] | undefined - 合约 ABI
 *
 * 失败时返回 ContractQueryError 对象：
 * - `error`: string - 错误信息
 */
export async function getContractInfo(
  params: GetContractInfoParams
): Promise<ContractInfo | ContractQueryError> {
  try {
    // 验证地址格式（0x 开头的 40 位十六进制）
    if (!isAddress(params.address)) {
      return { error: "无效的地址格式" };
    }

    // 根据链 ID 获取链配置（包含链名称、RPC URL 等）
    const chain = getChainById(params.chainId);
    if (!chain) {
      return { error: `不支持的链 ID: ${params.chainId}` };
    }

    // ============================================================
    // 步骤 1：创建 Viem 公共客户端
    // ============================================================
    // PublicClient 提供只读的区块链查询功能
    // 通过 HTTP 连接到指定的 RPC 节点
    const client = createPublicClient({
      chain,
      transport: http(params.rpcUrl),
    });

    // ============================================================
    // 步骤 2：获取地址的字节码和余额
    // ============================================================
    // getCode: 获取地址存储的字节码
    // - 合约地址：返回编译后的合约代码（十六进制字符串）
    // - 普通地址：返回 "0x"（空）
    const bytecode = await client.getCode({
      address: params.address as `0x${string}`,
    });

    // getBalance: 获取地址的 ETH 余额（单位：wei）
    const balance = await client.getBalance({
      address: params.address as `0x${string}`,
    });

    // 判断是否为合约（有字节码且不为空）
    const isContract = Boolean(bytecode && bytecode !== "0x");

    // 将 wei 转换为 ETH（1 ETH = 10^18 wei）
    const balanceFormatted = formatEther(balance);

    // 创建基础合约信息
    const contractInfo: ContractInfo = {
      address: params.address,
      isContract,
      bytecode: bytecode || undefined,
      balance,
      balanceFormatted,
      chainId: params.chainId,
      rpcUrl: params.rpcUrl,
    };

    // ============================================================
    // 步骤 3：如果是合约，获取源代码
    // ============================================================
    if (isContract) {
      const sourceInfo = await getContractSourceCode(
        params.address,
        params.chainId
      );
      Object.assign(contractInfo, sourceInfo);
    }

    return contractInfo;
  } catch (error) {
    console.error("获取合约信息失败:", error);
    return {
      error:
        error instanceof Error ? error.message : "获取合约信息时发生未知错误",
    };
  }
}

/**
 * 获取合约的状态变量值
 *
 * 什么是状态变量？
 * - 状态变量是存储在区块链上的数据
 * - 例如 USDT 合约的 totalSupply（总供应量）、owner（合约所有者）等
 * - 状态变量的值会随着合约调用而改变
 *
 * 如何读取状态变量？
 * - Solidity 中 public 状态变量会自动生成同名的 getter 函数
 * - 例如 `uint public totalSupply` 会生成 `function totalSupply() view returns (uint)`
 * - 通过调用这些 getter 函数可以读取状态变量的值
 *
 * 实现步骤：
 * 1. 从 ABI 中筛选出无参数的 view/pure 函数
 * 2. 使用 Viem 的 readContract 方法调用这些函数
 * 3. readContract 会发起 eth_call RPC 请求，从链上读取数据
 *
 * @param params - 查询参数
 * - `address`: string - 合约地址
 * - `chainId`: number - 链 ID
 * - `rpcUrl`: string - RPC 节点 URL
 * - `abi`: AbiFunction[] - 合约 ABI（从 Etherscan 获取）
 *
 * @returns 成功时返回 { variables: StateVariable[] }：
 * - 每个 StateVariable 包含：
 *   - `name`: string - 变量名称
 *   - `type`: string - 变量类型（uint256、address、bool 等）
 *   - `value`: string - 格式化后的值
 *   - `rawValue`: unknown - 原始值
 *
 * 失败时返回 { error: string }
 */
export async function getContractStateVariables(params: {
  address: string;
  chainId: number;
  rpcUrl: string;
  abi: AbiFunction[];
}): Promise<{ variables: StateVariable[] } | { error: string }> {
  try {
    // 验证地址格式
    if (!isAddress(params.address)) {
      return { error: "无效的地址格式" };
    }

    // 根据链 ID 获取链配置
    const chain = getChainById(params.chainId);
    if (!chain) {
      return { error: `不支持的链 ID: ${params.chainId}` };
    }

    // 创建公共客户端，用于与区块链节点通信
    const client = createPublicClient({
      chain,
      transport: http(params.rpcUrl),
    });

    // ============================================================
    // 步骤 1：从 ABI 中筛选可读取的状态变量
    // ============================================================
    // 筛选条件：
    // - 类型为 function
    // - 状态可变性为 view 或 pure（只读，不修改状态）
    // - 没有输入参数（无参数的 getter）
    // - 有返回值
    const readableFunctions = params.abi.filter(
      (item) =>
        item.type === "function" &&
        (item.stateMutability === "view" || item.stateMutability === "pure") &&
        (!item.inputs || item.inputs.length === 0) &&
        item.outputs &&
        item.outputs.length > 0
    );

    // ============================================================
    // 步骤 2：并发调用所有 getter 函数
    // ============================================================
    // 使用 Promise.allSettled 而不是 Promise.all
    // 这样即使部分函数调用失败，也能获取其他成功的结果
    const results = await Promise.allSettled(
      readableFunctions.map(async (func) => {
        // readContract 会发起 eth_call RPC 请求
        // eth_call 是只读操作，不会消耗 Gas，不需要签名
        const result = await client.readContract({
          address: params.address as `0x${string}`,
          abi: [func],
          functionName: func.name!,
        });

        return {
          name: func.name!,
          type: func.outputs![0].type,
          value: formatVariableValue(result),
          rawValue: result,
        };
      })
    );

    // 收集成功的结果（部分函数可能因权限等原因调用失败）
    const variables: StateVariable[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        variables.push(result.value);
      }
    }

    return { variables };
  } catch (error) {
    console.error("获取合约状态变量失败:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "获取合约状态变量时发生未知错误",
    };
  }
}
