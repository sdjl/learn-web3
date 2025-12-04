"use client";
// 这是一个 Next.js 的 providers 文件，主要作用是为应用配置全局的 context provider（如 RainbowKit, Wagmi, React Query），用于包裹整个应用，提供 Web3 钱包连接等能力。

import { ReactNode } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "请在环境变量中设置 NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID 以使用 RainbowKit。"
  );
}

const wagmiConfig = getDefaultConfig({
  appName: "Learn Wagmi",
  projectId,
  chains: [mainnet, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
