// ============================================================
// Etherscan API 配置：定义 Etherscan API 相关配置
// ============================================================
// 作用：
// - 集中管理 Etherscan API 的配置
// - 方便统一修改和维护
// ============================================================

/**
 * Etherscan API V2 统一端点
 * V2 API 使用统一的端点，通过 chainid 参数指定链
 */
export const ETHERSCAN_API_V2_URL = "https://api.etherscan.io/v2/api";

/**
 * 获取 Etherscan API Key
 * 从环境变量中读取，如果不存在则返回 undefined
 */
export function getEtherscanApiKey(): string | undefined {
  return process.env.ETHERSCAN_API_KEY;
}
