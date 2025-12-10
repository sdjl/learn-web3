# 如何估算 Gas 费用

## 技术栈

- **Viem**: 以太坊工具库
  - `encodeFunctionData`: 将合约函数调用编码为十六进制数据，用于构造交易的 data 字段
  - `parseUnits`: 将人类可读的数字（如 "100"）转换为区块链使用的最小单位（如 100000000）

## 实现概览

- 用 **Viem** 的 `encodeFunctionData` 将「调用哪个函数 + 传什么参数」编码成区块链能理解的格式
- 用 **Viem** 的 `parseUnits` 处理代币精度，把用户输入的金额转换为合约需要的最小单位
- 用 **fetch** 调用 Etherscan API 的 `eth_estimateGas` 接口，让节点模拟执行交易并返回 Gas 消耗量
- 用 **fetch** 调用 Etherscan API 的 `gasoracle` 接口，获取当前网络的实时 Gas 价格

## 核心概念

### Gas 是什么？

Gas 是以太坊网络中衡量计算量的单位。每个操作（转账、合约调用等）都需要消耗一定的 Gas。

### Gas 费用计算公式

```
交易费用 = Gas Units × Gas Price
```

- **Gas Units（Gas 消耗量）**：交易执行所需的计算量，由交易复杂度决定
  - 简单 ETH 转账：约 21,000 Gas
  - ERC20 代币转账：约 50,000-65,000 Gas
  - 复杂合约交互：可能需要几十万甚至上百万 Gas
- **Gas Price（Gas 价格）**：每单位 Gas 的价格，单位是 Gwei（1 ETH = 10^9 Gwei）

### EIP-1559 之后的 Gas 机制

2021 年 8 月，以太坊引入了 EIP-1559，改变了 Gas 费用机制：

**Base Fee（基础费用）**
- 由网络自动调整，根据上一个区块的 Gas 使用率
- 区块 Gas 使用率 > 50%：基础费用上涨
- 区块 Gas 使用率 < 50%：基础费用下降
- **这部分费用会被销毁（burn）**，不归任何人所有，有助于 ETH 通缩

**Priority Fee / Tip（优先费用/小费）**
- 用户额外支付给验证者的费用
- 优先费越高，交易被打包的优先级越高
- 网络拥堵时，需要更高的优先费才能快速确认

**Max Fee（最高费用）**
- 用户愿意支付的最高价格
- 实际费用 = Base Fee + Priority Fee
- 如果 Max Fee > 实际费用，多余的部分会退还给用户

**Gas 价格三档含义**
- **Safe（安全）**：使用较低的优先费，交易确认较慢（可能需要几分钟）
- **Propose（建议）**：使用中等优先费，平均确认时间（约 1-2 分钟）
- **Fast（快速）**：使用较高的优先费，快速确认（约 15-30 秒）

### Gas 费用不足或过多会怎样？

**Gas Limit 不足（Out of Gas）**
- 交易执行到一半，Gas 用完了
- 交易失败，但已消耗的 Gas 不会退还
- 解决：设置足够的 Gas Limit（通常是估算值的 1.1-1.2 倍）

**Gas 设置过多**
- Gas Limit 设置过高：多余的 Gas 会退还，不会浪费
- Gas Price 设置过高：多付的钱不会退还（但交易会更快确认）

## 核心实现详情

### 1. 定义合约 ABI

调用合约函数前，需要知道函数的接口定义（ABI）：

```typescript
// USDT 合约的 transfer 和 approve 函数 ABI
// ABI 描述了函数名、参数类型、返回值类型等信息
const USDT_ABI = [
  {
    name: "transfer",           // 函数名
    type: "function",           // 类型：函数
    stateMutability: "nonpayable", // 不接收 ETH
    inputs: [
      { name: "to", type: "address" },     // 第一个参数：接收地址
      { name: "value", type: "uint256" },  // 第二个参数：转账金额
    ],
    outputs: [],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" }, // 被授权的地址
      { name: "value", type: "uint256" },   // 授权金额
    ],
    outputs: [],
  },
] as const;  // as const 让 TypeScript 能正确推断类型
```

### 2. 编码合约函数调用

使用 Viem 的 `encodeFunctionData` 将函数调用编码为十六进制数据：

```typescript
import { encodeFunctionData, parseUnits } from "viem";

// 将人类可读的金额转换为最小单位
// USDT 精度是 6 位，所以 100 USDT = 100 * 10^6 = 100000000
const amount = parseUnits("100", 6);

// 编码 transfer 函数调用
const data = encodeFunctionData({
  abi: USDT_ABI,
  functionName: "transfer",
  args: [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // 接收地址
    amount, // 金额（最小单位）
  ],
});

// data 的值类似：
// "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000005f5e100"
//
// 解析：
// - 0xa9059cbb: 函数选择器（transfer 函数签名的 keccak256 哈希前 4 字节）
// - 后面 32 字节: 地址参数（补齐到 32 字节）
// - 最后 32 字节: 金额参数（补齐到 32 字节）
```

### 3. 估算 Gas 消耗量

调用 Etherscan API 的 `eth_estimateGas` 接口：

```typescript
// 构建 API 请求 URL
const params = new URLSearchParams({
  chainid: "1",               // 以太坊主网
  module: "proxy",            // proxy 模块提供 JSON-RPC 接口
  action: "eth_estimateGas",  // 估算 Gas
  to: usdtContractAddress,    // USDT 合约地址
  data: encodedData,          // 编码后的函数调用数据
  from: holderAddress,        // 发送方地址（需要持有足够代币）
  apikey: "YOUR_API_KEY",     // Etherscan API Key
});

const response = await fetch(
  `https://api.etherscan.io/v2/api?${params.toString()}`
);
const result = await response.json();

// 返回格式（JSON-RPC 格式）：
// { "jsonrpc": "2.0", "id": 1, "result": "0xb58f" }

// 解析十六进制结果
const gasUnits = parseInt(result.result, 16);
// gasUnits = 46479（约 46,000 Gas）
```

**重要：`from` 地址的作用**

`eth_estimateGas` 会模拟执行交易。对于代币转账，如果 `from` 地址没有足够余额，模拟会失败。解决方案是使用一个已知持有大量代币的地址：

```typescript
// Binance 热钱包地址，持有大量 USDT
const USDT_HOLDER_ADDRESS = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
```

### 4. 获取实时 Gas 价格

调用 Etherscan API 的 `gasoracle` 接口：

```typescript
const params = new URLSearchParams({
  chainid: "1",
  module: "gastracker",
  action: "gasoracle",
  apikey: "YOUR_API_KEY",
});

const response = await fetch(
  `https://api.etherscan.io/v2/api?${params.toString()}`
);
const result = await response.json();

// 返回数据结构：
// {
//   "status": "1",
//   "message": "OK",
//   "result": {
//     "LastBlock": "21234567",      // 最新区块号
//     "SafeGasPrice": "10",         // 安全价格（Gwei）
//     "ProposeGasPrice": "15",      // 建议价格（Gwei）
//     "FastGasPrice": "20",         // 快速价格（Gwei）
//     "suggestBaseFee": "8.5",      // 当前基础费用（Gwei）
//     "gasUsedRatio": "0.45,0.52,0.48,0.51,0.49"  // 最近 5 个区块的 Gas 使用率
//   }
// }
```

### 5. 计算预估费用

```typescript
// 假设估算结果：gasUnits = 46479
// 假设 Gas 价格：proposeGasPrice = 15 Gwei

// 计算费用（Gwei）
const costInGwei = gasUnits * 15;  // 46479 * 15 = 697185 Gwei

// 转换为 ETH（1 ETH = 10^9 Gwei）
const costInEth = costInGwei / 1e9;  // 0.000697185 ETH

// 不同价格档位的费用对比
const costs = {
  safe: (gasUnits * 10) / 1e9,     // 0.00046479 ETH（慢）
  propose: (gasUnits * 15) / 1e9,  // 0.00069719 ETH（建议）
  fast: (gasUnits * 20) / 1e9,     // 0.00092958 ETH（快）
};
```

## 常见问题

### 为什么估算会返回 "execution reverted"？

通常是因为：

1. `from` 地址没有足够的代币余额（最常见）
2. 合约调用参数不正确
3. 合约有访问限制（如只允许特定地址调用）

解决方案：使用一个已知持有足够代币的地址作为 `from` 参数。

### Gas 估算值是精确的吗？

不是完全精确。估算值是基于当前区块状态的模拟结果，实际执行时可能因为区块状态变化、其他交易的影响而有所不同。

建议在实际交易时设置 Gas Limit 为估算值的 1.1-1.2 倍，多余的会退还。

### 为什么不同操作的 Gas 消耗不同？

Gas 消耗取决于：

- 操作的复杂度：简单转账 < 代币转账 < 复杂合约交互
- 存储变更：首次写入（约 20,000 Gas）比修改现有值（约 5,000 Gas）更贵
- 合约代码的优化程度：优化过的合约消耗更少 Gas
