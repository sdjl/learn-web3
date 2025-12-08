import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 将 pino 相关包标记为外部包，避免 Turbopack 解析 thread-stream 中的测试文件和非 JS 文件
  // 这是因为 @walletconnect 依赖 pino，而 pino 的 thread-stream 包含无法被 Turbopack 处理的文件
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
};

export default nextConfig;
