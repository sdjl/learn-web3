"use server";

// ============================================================
// 合约查询 Server Actions：获取合约信息和源代码
// ============================================================
// 作用：
// - 在服务端获取合约信息（字节码、余额等）
// - 从 Etherscan API 获取合约源代码
// - 避免在客户端暴露 API Key
// ============================================================

import { createPublicClient, http, isAddress, formatEther } from "viem";
import { callEtherscanApi } from "@/lib/services/etherscan";
import { getChainById } from "@/lib/config/chains";
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
 */
async function getContractSourceCode(
  address: string,
  chainId: number
): Promise<ContractSourceCodeInfo> {
  try {
    // 使用封装的 callEtherscanApi 函数调用 API
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

      // 处理源代码：可能是字符串或 JSON 字符串（多文件合约）
      const sourceCode =
        result.SourceCode && result.SourceCode.trim() !== ""
          ? parseSourceCode(result.SourceCode)
          : undefined;

      // 解析 ABI
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
 */
export async function getContractInfo(
  params: GetContractInfoParams
): Promise<ContractInfo | ContractQueryError> {
  try {
    // 验证地址格式
    if (!isAddress(params.address)) {
      return { error: "无效的地址格式" };
    }

    // 根据链 ID 从支持的链列表中找到对应的链配置
    const chain = getChainById(params.chainId);
    if (!chain) {
      return { error: `不支持的链 ID: ${params.chainId}` };
    }

    // 创建公共客户端
    const client = createPublicClient({
      chain,
      transport: http(params.rpcUrl),
    });

    // 获取合约字节码
    const bytecode = await client.getCode({
      address: params.address as `0x${string}`,
    });

    // 获取合约余额
    const balance = await client.getBalance({
      address: params.address as `0x${string}`,
    });

    // 判断是否为合约（有字节码）
    const isContract = Boolean(bytecode && bytecode !== "0x");

    // 格式化余额
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

    // 如果是合约，尝试获取源代码
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
 * 实现原理：
 * 1. 合约的 public 状态变量会自动生成同名的 getter 函数（view 函数）
 * 2. 从 Etherscan 获取的 ABI 中包含了这些函数的定义
 * 3. 筛选出无参数的 view/pure 函数，这些通常对应状态变量的 getter
 * 4. 通过 Viem 的 readContract 方法调用这些函数，会发起 RPC 请求到区块链节点
 * 5. 区块链节点从链上状态存储中读取变量的当前值并返回
 *
 * 数据来源：
 * - ABI（函数定义）：来自 Etherscan API，是合约验证时上传的
 * - 变量值：来自区块链节点，通过 RPC 调用 eth_call 方法读取链上状态
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

    // 从 ABI 中筛选出可以读取的状态变量
    // 条件：无参数的 view/pure 函数，且有返回值
    // 这些函数通常是 public 状态变量自动生成的 getter
    const readableFunctions = params.abi.filter(
      (item) =>
        item.type === "function" &&
        (item.stateMutability === "view" || item.stateMutability === "pure") &&
        (!item.inputs || item.inputs.length === 0) &&
        item.outputs &&
        item.outputs.length > 0
    );

    // 并发调用所有 getter 函数，从区块链读取状态变量的值
    // readContract 会发起 RPC 请求（eth_call），从链上状态存储读取数据
    const results = await Promise.allSettled(
      readableFunctions.map(async (func) => {
        // 调用合约的 view 函数，获取状态变量的当前值
        // 这是一个网络请求，会访问 RPC 节点读取链上数据
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
