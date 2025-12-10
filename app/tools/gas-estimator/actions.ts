"use server";

// ============================================================
// Gas 估算 Server Actions
// ============================================================
// 作用：
// - 获取当前 Gas 价格（从 Etherscan API 的 gasoracle 接口）
// - 估算 USDT transfer 和 approve 操作的 Gas 费用
//
// 学习要点：
// - 如何使用 Viem 编码合约函数调用数据
// - 如何通过 Etherscan API 估算 Gas 消耗
// - 如何获取实时 Gas 价格并计算交易费用
// ============================================================

// ============================================================
// Viem 库导入说明
// ============================================================
// encodeFunctionData: 将合约函数调用编码为十六进制数据
//   - 作用：把「调用哪个函数 + 传什么参数」编码成区块链能理解的格式
//   - 输入：ABI（合约接口定义）、函数名、参数
//   - 输出：0x 开头的十六进制字符串，如 "0xa9059cbb000000..."
//   - 场景：发送交易前，需要把函数调用编码成 data 字段
//
// parseUnits: 将人类可读的数字转换为区块链使用的最小单位
//   - 作用：处理代币精度，避免浮点数精度问题
//   - 输入：数字字符串（如 "100"）和小数位数（如 USDT 是 6 位）
//   - 输出：BigInt 类型的最小单位数值（如 100 USDT = 100000000n）
//   - 场景：用户输入 100 USDT，需要转换为合约能理解的 100 * 10^6
import { encodeFunctionData, parseUnits } from "viem";

// ============================================================
// 内部库导入
// ============================================================
// getTokenAddress: 根据链 ID 和代币符号获取代币合约地址
import { getTokenAddress } from "@/lib/config/addresses";
// TOKENS: 代币符号常量（如 TOKENS.USDT = "USDT"）
// TOKEN_INFO: 代币信息（包含 decimals 精度等）
import { TOKENS, TOKEN_INFO } from "@/lib/config/tokens";
// estimateGas: 调用 Etherscan API 的 eth_estimateGas 接口估算 Gas
// getGasOracle: 调用 Etherscan API 的 gasoracle 接口获取实时 Gas 价格
import { estimateGas, getGasOracle } from "@/lib/services/etherscan";
// USDT_FUNCTION_ABI: USDT 合约的 transfer 和 approve 函数 ABI 定义
import { USDT_FUNCTION_ABI } from "@/lib/abi/usdt";
// 页面常量：USDT 持有者地址（用于 Gas 估算）、以太坊主网 Chain ID
import { USDT_HOLDER_ADDRESS, MAINNET_CHAIN_ID } from "./utils";
import type { GasEstimateResult, GasPriceInfo, OperationType } from "./types";

/**
 * 从 Etherscan API 获取当前以太坊网络的 Gas 价格信息
 *
 * Gas 价格会根据网络拥堵程度实时变化：
 * - 网络繁忙时，Gas 价格会上涨
 * - 网络空闲时，Gas 价格会下降
 *
 * @returns 返回一个包含以下字段的对象：
 * - `success`: boolean - 是否成功获取数据
 * - `error`: string | undefined - 失败时的错误信息
 * - `data`: GasPriceInfo | undefined - 成功时的 Gas 价格数据，包含：
 *   - `lastBlock`: string - 最新区块号，表示数据的时效性
 *   - `safeGasPrice`: string - 安全价格（Gwei），交易确认较慢（约几分钟）
 *   - `proposeGasPrice`: string - 建议价格（Gwei），平均确认时间（约 1-2 分钟）
 *   - `fastGasPrice`: string - 快速价格（Gwei），快速确认（约 15-30 秒）
 *   - `suggestBaseFee`: string - 建议的基础费用（Gwei），EIP-1559 后引入的概念
 *
 * @example
 * const result = await fetchGasPrices();
 * if (result.success) {
 *   console.log(`建议 Gas 价格: ${result.data.proposeGasPrice} Gwei`);
 * }
 */
export async function fetchGasPrices(): Promise<{
  success: boolean;
  error?: string;
  data?: GasPriceInfo;
}> {
  try {
    // 调用 Etherscan API 的 gasoracle 接口获取实时 Gas 价格
    const response = await getGasOracle(MAINNET_CHAIN_ID);

    if (response.status !== "1") {
      return {
        success: false,
        error: "获取 Gas 价格失败",
      };
    }

    return {
      success: true,
      data: {
        lastBlock: response.result.LastBlock,
        safeGasPrice: response.result.SafeGasPrice,
        proposeGasPrice: response.result.ProposeGasPrice,
        fastGasPrice: response.result.FastGasPrice,
        suggestBaseFee: response.result.suggestBaseFee,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取 Gas 价格失败",
    };
  }
}

/**
 * 估算 USDT 操作的 Gas 费用
 *
 * 此函数完成以下工作：
 * 1. 使用 Viem 的 encodeFunctionData 编码合约函数调用
 * 2. 调用 Etherscan API 的 eth_estimateGas 接口估算 Gas 消耗量
 * 3. 调用 Etherscan API 的 gasoracle 接口获取实时 Gas 价格
 * 4. 计算不同优先级下的预估交易费用
 *
 * @param operationType - 操作类型
 *   - "transfer": 代币转账，将 USDT 从一个地址转到另一个地址
 *   - "approve": 代币授权，允许其他地址（如 DEX 合约）花费自己的 USDT
 * @param toAddress - 接收方地址（仅 transfer 操作时使用）
 *   - 格式：0x 开头的 42 位十六进制字符串
 * @param amount - 转账或授权的金额（USDT 单位，如 "100" 表示 100 USDT）
 * @param spenderAddress - 被授权方地址（仅 approve 操作时使用）
 *   - 通常是 DEX 或其他 DeFi 协议的合约地址
 *
 * @returns 返回 GasEstimateResult 对象：
 * - `success`: boolean - 是否估算成功
 * - `error`: string | undefined - 失败时的错误信息
 * - `gasUnits`: number | undefined - 预估的 Gas 消耗量（单位：Gas）
 * - `gasPrices`: GasPriceInfo | undefined - 当前 Gas 价格信息
 * - `estimatedCostGwei`: object | undefined - 预估费用（Gwei）
 *   - `safe`: string - 使用安全价格的费用
 *   - `propose`: string - 使用建议价格的费用
 *   - `fast`: string - 使用快速价格的费用
 * - `estimatedCostEth`: object | undefined - 预估费用（ETH）
 *   - `safe`: string - 使用安全价格的费用
 *   - `propose`: string - 使用建议价格的费用
 *   - `fast`: string - 使用快速价格的费用
 *
 * @example
 * // 估算转账 100 USDT 的 Gas 费用
 * const result = await estimateUsdtGas(
 *   "transfer",
 *   "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
 *   "100",
 *   ""
 * );
 * if (result.success) {
 *   console.log(`Gas 消耗: ${result.gasUnits}`);
 *   console.log(`建议费用: ${result.estimatedCostEth.propose} ETH`);
 * }
 */
export async function estimateUsdtGas(
  operationType: OperationType,
  toAddress: string,
  amount: string,
  spenderAddress: string
): Promise<GasEstimateResult> {
  try {
    // 获取 USDT 合约地址（以太坊主网）
    const usdtAddress = getTokenAddress(MAINNET_CHAIN_ID, TOKENS.USDT);
    if (!usdtAddress) {
      return {
        success: false,
        error: "无法获取 USDT 合约地址",
      };
    }

    // ============================================================
    // 步骤 1：将人类可读的金额转换为合约使用的最小单位
    // ============================================================
    // USDT 的精度是 6 位小数，所以：
    // - 用户输入 "100"（100 USDT）
    // - 需要转换为 100 * 10^6 = 100000000（最小单位）
    // parseUnits 函数帮我们处理这个转换，避免浮点数精度问题
    const decimals = TOKEN_INFO[TOKENS.USDT].decimals; // USDT 是 6
    const amountInUnits = parseUnits(amount || "1", decimals);

    // ============================================================
    // 步骤 2：编码合约函数调用数据
    // ============================================================
    // 为什么需要编码？
    // - 区块链交易的 data 字段需要是十六进制格式
    // - encodeFunctionData 会把「函数名 + 参数」编码成这种格式
    // - 编码结果包含：函数选择器（4字节）+ 参数编码
    //
    // 例如 transfer(address to, uint256 value) 的编码：
    // - 函数选择器：0xa9059cbb（transfer 函数签名的 keccak256 哈希前 4 字节）
    // - 参数编码：地址补齐到 32 字节 + 金额补齐到 32 字节
    let data: `0x${string}`;

    if (operationType === "transfer") {
      // 验证接收方地址
      if (!toAddress || !toAddress.startsWith("0x")) {
        return {
          success: false,
          error: "请输入有效的接收方地址",
        };
      }

      // 编码 transfer 函数调用
      // transfer(address to, uint256 value) - 将代币转给指定地址
      data = encodeFunctionData({
        abi: USDT_FUNCTION_ABI,
        functionName: "transfer",
        args: [toAddress as `0x${string}`, amountInUnits],
      });
    } else {
      // approve 操作
      // 验证被授权方地址
      if (!spenderAddress || !spenderAddress.startsWith("0x")) {
        return {
          success: false,
          error: "请输入有效的被授权方地址",
        };
      }

      // 编码 approve 函数调用
      // approve(address spender, uint256 value) - 授权指定地址可以花费自己的代币
      // 常见场景：用户在 Uniswap 交易前，需要先 approve Uniswap 合约
      data = encodeFunctionData({
        abi: USDT_FUNCTION_ABI,
        functionName: "approve",
        args: [spenderAddress as `0x${string}`, amountInUnits],
      });
    }

    // ============================================================
    // 步骤 3：并行获取 Gas 估算和 Gas 价格
    // ============================================================
    // 使用 Promise.all 并行请求，提高效率
    //
    // 注意：eth_estimateGas 会模拟执行交易
    // - 如果 from 地址没有足够的代币余额，模拟会失败（execution reverted）
    // - 所以我们使用一个已知持有大量 USDT 的地址（Binance 热钱包）作为 from
    // - 这只是模拟，不会真的花费任何代币
    const [gasEstimateResponse, gasPricesResponse] = await Promise.all([
      estimateGas(MAINNET_CHAIN_ID, {
        to: usdtAddress, // USDT 合约地址
        data, // 编码后的函数调用数据
        from: USDT_HOLDER_ADDRESS, // 使用持有 USDT 的地址进行估算
      }),
      getGasOracle(MAINNET_CHAIN_ID),
    ]);

    // 检查 Gas 估算结果
    if (gasEstimateResponse.status !== "1") {
      return {
        success: false,
        error: "Gas 估算失败: " + gasEstimateResponse.message,
      };
    }

    // ============================================================
    // 步骤 4：解析估算结果
    // ============================================================
    // eth_estimateGas 返回的是十六进制字符串，如 "0xb58f"
    // 需要转换为十进制数字才能用于计算
    const gasUnits = parseInt(gasEstimateResponse.result, 16);

    // 检查 Gas 价格结果
    if (gasPricesResponse.status !== "1") {
      return {
        success: false,
        error: "获取 Gas 价格失败",
      };
    }

    const gasPrices: GasPriceInfo = {
      lastBlock: gasPricesResponse.result.LastBlock,
      safeGasPrice: gasPricesResponse.result.SafeGasPrice,
      proposeGasPrice: gasPricesResponse.result.ProposeGasPrice,
      fastGasPrice: gasPricesResponse.result.FastGasPrice,
      suggestBaseFee: gasPricesResponse.result.suggestBaseFee,
    };

    // ============================================================
    // 步骤 5：计算预估费用
    // ============================================================
    // 交易费用 = Gas Units × Gas Price
    // Gas Price 单位是 Gwei，计算结果也是 Gwei
    const safePrice = parseFloat(gasPrices.safeGasPrice);
    const proposePrice = parseFloat(gasPrices.proposeGasPrice);
    const fastPrice = parseFloat(gasPrices.fastGasPrice);

    const estimatedCostGwei = {
      safe: (gasUnits * safePrice).toFixed(2),
      propose: (gasUnits * proposePrice).toFixed(2),
      fast: (gasUnits * fastPrice).toFixed(2),
    };

    // 将 Gwei 转换为 ETH（1 ETH = 10^9 Gwei）
    const estimatedCostEth = {
      safe: ((gasUnits * safePrice) / 1e9).toFixed(8),
      propose: ((gasUnits * proposePrice) / 1e9).toFixed(8),
      fast: ((gasUnits * fastPrice) / 1e9).toFixed(8),
    };

    return {
      success: true,
      gasUnits,
      gasPrices,
      estimatedCostGwei,
      estimatedCostEth,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gas 估算失败",
    };
  }
}
