// ============================================================
// 合约信息展示组件：显示合约的基本信息、状态变量和源代码
// ============================================================
// 作用：
// - 使用 Tabs 组件整合三个信息板块
// - 协调子组件的数据获取和展示
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfo } from "./BasicInfo";
import { StateVariables } from "./StateVariables";
import { SourceCode } from "./SourceCode";
import { getContractStateVariables } from "../actions";
import type { ContractInfoProps, StateVariable } from "../types";

export function ContractInfoDisplay({ contractInfo }: ContractInfoProps) {
  // 状态变量数据
  const [stateVariables, setStateVariables] = useState<StateVariable[]>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [variablesError, setVariablesError] = useState<string | undefined>();
  const [hasLoadedVariables, setHasLoadedVariables] = useState(false);

  // 加载状态变量
  const loadStateVariables = useCallback(async () => {
    // 如果没有 ABI 或者不是合约，不加载
    if (!contractInfo.abi || !contractInfo.isContract) {
      return;
    }

    // 如果没有 chainId 和 rpcUrl，不加载
    if (!contractInfo.chainId || !contractInfo.rpcUrl) {
      return;
    }

    setIsLoadingVariables(true);
    setVariablesError(undefined);

    try {
      const result = await getContractStateVariables({
        address: contractInfo.address,
        chainId: contractInfo.chainId,
        rpcUrl: contractInfo.rpcUrl,
        abi: contractInfo.abi,
      });

      if ("error" in result) {
        setVariablesError(result.error);
      } else {
        setStateVariables(result.variables);
      }
    } catch (error) {
      setVariablesError(
        error instanceof Error ? error.message : "加载状态变量失败"
      );
    } finally {
      setIsLoadingVariables(false);
      setHasLoadedVariables(true);
    }
  }, [contractInfo]);

  // 当切换到状态变量标签时才加载数据
  const handleTabChange = (value: string) => {
    if (value === "variables" && !hasLoadedVariables && contractInfo.abi) {
      loadStateVariables();
    }
  };

  // 当合约信息变化时，重置状态
  useEffect(() => {
    setStateVariables([]);
    setHasLoadedVariables(false);
    setVariablesError(undefined);
  }, [contractInfo.address]);

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xl">
      <h2 className="text-lg font-semibold">合约信息</h2>

      <Tabs defaultValue="basic" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="variables" disabled={!contractInfo.abi}>
            状态变量
          </TabsTrigger>
          <TabsTrigger value="source" disabled={!contractInfo.sourceCode}>
            源代码
          </TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic">
          <BasicInfo contractInfo={contractInfo} />
        </TabsContent>

        {/* 状态变量 */}
        <TabsContent value="variables">
          {contractInfo.abi ? (
            <StateVariables
              stateVariables={stateVariables}
              isLoading={isLoadingVariables}
              error={variablesError}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>无法读取状态变量</p>
              <p className="mt-2 text-sm">
                可能原因：合约未在 Etherscan 上验证源代码
              </p>
            </div>
          )}
        </TabsContent>

        {/* 源代码 */}
        <TabsContent value="source">
          <SourceCode
            sourceCode={contractInfo.sourceCode}
            contractName={contractInfo.contractName}
            compilerVersion={contractInfo.compilerVersion}
            optimizationUsed={contractInfo.optimizationUsed}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
