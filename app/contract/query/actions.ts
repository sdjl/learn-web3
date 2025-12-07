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
import { parseSourceCode } from "./utils";
import type {
  ContractInfo,
  GetContractInfoParams,
  ContractSourceCodeResult,
  ContractSourceCodeInfo,
  ContractQueryError,
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
