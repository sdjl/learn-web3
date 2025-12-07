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
import { mainnet, sepolia } from "viem/chains";
import {
  ETHERSCAN_API_V2_URL,
  getEtherscanApiKey,
} from "@/lib/config/etherscan";
import type { ContractInfo, GetContractInfoParams } from "./types";

/**
 * 获取 Etherscan API V2 URL
 * V2 API 使用统一的端点，通过 chainid 参数指定链
 */
function getEtherscanApiUrl(): string {
  // V2 API 使用统一的端点，通过 chainid 参数指定链
  return ETHERSCAN_API_V2_URL;
}

/**
 * 从 Etherscan API 获取合约源代码
 */
async function getContractSourceCode(
  address: string,
  chainId: number
): Promise<{
  sourceCode?: string;
  contractName?: string;
  compilerVersion?: string;
  optimizationUsed?: boolean;
}> {
  try {
    const apiKey = getEtherscanApiKey();
    const apiUrl = getEtherscanApiUrl();

    // 构建 URL，V2 API 需要 chainid 参数
    let url = `${apiUrl}?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}`;
    if (apiKey) {
      url += `&apikey=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Etherscan API 请求失败: ${response.status} ${response.statusText}`
      );
      return {};
    }

    const data = await response.json();

    // 记录 API 响应以便调试
    console.log("Etherscan API 响应:", {
      status: data.status,
      message: data.message,
      hasResult: !!data.result,
      resultLength: data.result?.length,
    });

    if (data.status === "1" && data.result && data.result.length > 0) {
      const result = data.result[0];

      // 记录结果信息
      console.log("合约信息:", {
        contractName: result.ContractName,
        hasSourceCode: !!result.SourceCode,
        sourceCodeLength: result.SourceCode?.length,
        compilerVersion: result.CompilerVersion,
      });

      // 处理源代码：可能是字符串或 JSON 字符串（多文件合约）
      let sourceCode: string | undefined;
      if (result.SourceCode && result.SourceCode.trim() !== "") {
        // 检查是否是 JSON 字符串（多文件合约）
        if (
          result.SourceCode.startsWith("{{") ||
          result.SourceCode.startsWith("{")
        ) {
          try {
            // 尝试解析 JSON
            const parsed = JSON.parse(result.SourceCode);
            // 如果是对象，提取所有文件内容
            if (typeof parsed === "object" && parsed !== null) {
              const sources: string[] = [];
              const extractSources = (
                obj: Record<string, unknown>,
                prefix = ""
              ): void => {
                for (const [key, value] of Object.entries(obj)) {
                  const fullPath = prefix ? `${prefix}/${key}` : key;
                  if (
                    value &&
                    typeof value === "object" &&
                    "content" in value &&
                    typeof (value as { content: unknown }).content === "string"
                  ) {
                    sources.push(
                      `// File: ${fullPath}\n${
                        (value as { content: string }).content
                      }`
                    );
                  } else if (typeof value === "string") {
                    sources.push(`// File: ${fullPath}\n${value}`);
                  } else if (value && typeof value === "object") {
                    extractSources(value as Record<string, unknown>, fullPath);
                  }
                }
              };
              extractSources(parsed as Record<string, unknown>);
              sourceCode = sources.join("\n\n");
            } else {
              sourceCode = result.SourceCode;
            }
          } catch {
            // 解析失败，使用原始字符串
            sourceCode = result.SourceCode;
          }
        } else {
          sourceCode = result.SourceCode;
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
      };
    } else if (data.status === "0") {
      // API 返回错误
      const errorMessage = data.message || "未知错误";
      const errorResult = data.result || "";

      // 检查是否是 API Key 相关的错误
      if (
        errorMessage.includes("API Key") ||
        errorResult.includes("API Key") ||
        errorResult.includes("apikey")
      ) {
        console.warn(
          "Etherscan API 需要 API Key。请在环境变量中设置 ETHERSCAN_API_KEY"
        );
      } else {
        console.warn("Etherscan API 返回错误:", {
          message: errorMessage,
          result: errorResult,
        });
      }
    } else {
      // 其他情况
      console.warn("Etherscan API 响应异常:", {
        status: data.status,
        message: data.message,
        result: data.result,
      });
    }
  } catch (error) {
    console.error("获取合约源代码失败:", error);
  }

  return {};
}

/**
 * 获取合约信息
 */
export async function getContractInfo(
  params: GetContractInfoParams
): Promise<ContractInfo | { error: string }> {
  try {
    // 验证地址格式
    if (!isAddress(params.address)) {
      return { error: "无效的地址格式" };
    }

    // 根据链 ID 选择链配置（目前只支持主网和 Sepolia）
    const chain = params.chainId === 11155111 ? sepolia : mainnet;

    // 创建公共客户端
    const client = createPublicClient({
      chain,
      transport: http(params.rpcUrl),
    });

    // 获取合约字节码
    const bytecode = await client.getBytecode({
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

    // 基础合约信息
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
