"use client";

// ============================================================
// 页面名称：合约代码解读
// ============================================================
// 作用：
// - 整合所有合约源代码查看相关的功能组件
// - 提供统一的页面布局和样式
// - 作为合约代码学习功能的入口页面
// ============================================================

import { useState, useTransition, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { ContractSelector } from "./components/ContractSelector";
import { CodeViewer } from "./components/CodeViewer";
import { ScrollToTop } from "./components/ScrollToTop";
import { getContractSourceCode } from "./actions";
import { CONTRACTS, DEFAULT_FONT_SIZE } from "./utils";

export default function ContractSourceCodePage() {
  // 默认选中 usdt 合约
  const [selectedContract, setSelectedContract] = useState(CONTRACTS[0].name);
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const isInitialMount = useRef(true);

  // 代码查看器配置
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // 获取当前选中的合约文件名
  const currentContract = CONTRACTS.find((c) => c.name === selectedContract);
  const filename = currentContract?.filename || "";

  // 加载合约源代码
  const loadSourceCode = async (contractName: string) => {
    setError(undefined);

    const result = await getContractSourceCode(contractName);

    if (result.success && result.code) {
      setCode(result.code);
    } else {
      setError(result.error || "加载失败");
      setCode("");
    }
  };

  // 初始加载
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      startTransition(() => {
        loadSourceCode(selectedContract);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 合约选择变更处理
  const handleContractChange = (contractName: string) => {
    setSelectedContract(contractName);
    startTransition(() => {
      loadSourceCode(contractName);
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-16 text-foreground">
      {/* 页面标题区域组件 - 显示页面标题和描述信息 */}
      <Header
        label="合约代码解读"
        title="阅读合约源代码"
        description="选择并阅读经典合约的源代码，学习 Solidity 开发的最佳实践。"
      />

      {/* 学习说明区域 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          📖 阅读说明
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            我已经阅读了这些合约的源代码，并添加了
            <span className="font-medium text-primary">详细的中文注释</span>
            ，便于读者理解每一行代码的含义和设计意图。
          </p>
          <p>
            <span className="font-medium text-foreground">建议学习顺序：</span>
            为了更好地理解这些合约，建议读者先学习相关的智能合约编程语言，如{" "}
            <span className="font-medium text-primary">Solidity</span>
            。了解基本语法和概念后，再来阅读这些真实的生产级合约代码，会有更深刻的理解。
          </p>
          <p className="rounded-lg bg-muted/50 p-3">
            💡 <span className="font-medium text-foreground">学习建议：</span>{" "}
            可以先快速浏览整体结构，了解合约的功能模块划分，然后再深入研究每个函数的实现细节。注释中会解释关键的设计决策和安全考量。
          </p>
        </div>
      </section>

      {/* 合约选择区域 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
        {/* 合约选择器组件 - 选择要查看的合约 */}
        <ContractSelector
          selectedContract={selectedContract}
          onContractChange={handleContractChange}
        />
      </section>

      {/* 源代码显示区域 */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
        {/* 代码查看器组件 - 显示语法高亮的源代码 */}
        <CodeViewer
          code={code}
          filename={filename}
          isLoading={isPending}
          error={error}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isDarkTheme={isDarkTheme}
          onThemeChange={setIsDarkTheme}
        />
      </section>

      {/* 回到顶部浮动按钮 */}
      <ScrollToTop />
    </main>
  );
}
