"use server";

// ============================================================
// 合约源代码读取 Server Action
// ============================================================
// 作用：
// - 根据合约名称读取对应的源代码文件
// - 确保只能读取预定义的合约文件，防止路径遍历攻击
// ============================================================

import { promises as fs } from "fs";
import path from "path";
import { getContractByName, isValidContractName } from "./utils";

/**
 * 读取合约源代码
 *
 * @param contractName - 合约名称（不是文件路径）
 * @returns 源代码内容或错误信息
 */
export async function getContractSourceCode(contractName: string): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  // ============================================================
  // 步骤 1：验证合约名称是否有效
  // ============================================================
  // 这是一个安全检查，确保只能读取预定义的合约文件，
  // 防止恶意用户通过构造特殊的名称来读取其他文件。
  if (!isValidContractName(contractName)) {
    return {
      success: false,
      error: `无效的合约名称: ${contractName}`,
    };
  }

  // ============================================================
  // 步骤 2：获取合约信息并构建文件路径
  // ============================================================
  const contractInfo = getContractByName(contractName);
  if (!contractInfo) {
    return {
      success: false,
      error: `未找到合约: ${contractName}`,
    };
  }

  // 构建合约文件的绝对路径
  // process.cwd() 返回项目根目录
  const contractsDir = path.join(process.cwd(), "contracts");
  const filePath = path.join(contractsDir, contractInfo.filename);

  // ============================================================
  // 步骤 3：安全检查 - 确保文件路径在 contracts 目录内
  // ============================================================
  // 防止路径遍历攻击（如 ../../../etc/passwd）
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(contractsDir)) {
    return {
      success: false,
      error: "非法的文件路径",
    };
  }

  // ============================================================
  // 步骤 4：读取文件内容
  // ============================================================
  try {
    const code = await fs.readFile(filePath, "utf-8");
    return {
      success: true,
      code,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "读取文件失败";
    return {
      success: false,
      error: `读取合约源代码失败: ${errorMessage}`,
    };
  }
}
