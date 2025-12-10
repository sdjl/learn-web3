"use client";

// ============================================================
// 代码查看器组件
// ============================================================
// 作用：
// - 使用语法高亮显示合约源代码
// - 支持 Solidity 语法高亮
// - 支持深色/浅色主题切换
// - 支持字体大小调整
// - 提供下载和 GitHub 链接功能
// ============================================================

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Download, ExternalLink, Plus, Minus, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GITHUB_CONTRACTS_PATH,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  FONT_SIZE_STEP,
} from "../utils";

interface CodeViewerProps {
  /** 源代码内容 */
  code: string;
  /** 合约文件名 */
  filename: string;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: string;
  /** 字体大小 */
  fontSize: number;
  /** 字体大小变更回调 */
  onFontSizeChange: (size: number) => void;
  /** 是否使用暗色主题 */
  isDarkTheme: boolean;
  /** 主题切换回调 */
  onThemeChange: (isDark: boolean) => void;
}

export function CodeViewer({
  code,
  filename,
  isLoading,
  error,
  fontSize,
  onFontSizeChange,
  isDarkTheme,
  onThemeChange,
}: CodeViewerProps) {
  // 下载合约文件
  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 在 GitHub 上查看
  const handleOpenGitHub = () => {
    const githubUrl = `${GITHUB_CONTRACTS_PATH}/${filename}`;
    window.open(githubUrl, "_blank");
  };

  // 增大字体
  const handleIncreaseFontSize = () => {
    if (fontSize < MAX_FONT_SIZE) {
      onFontSizeChange(fontSize + FONT_SIZE_STEP);
    }
  };

  // 减小字体
  const handleDecreaseFontSize = () => {
    if (fontSize > MIN_FONT_SIZE) {
      onFontSizeChange(fontSize - FONT_SIZE_STEP);
    }
  };

  // 切换主题
  const handleToggleTheme = () => {
    onThemeChange(!isDarkTheme);
  };

  // 工具栏 JSX
  const toolbar = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h3 className="text-lg font-semibold text-foreground">📄 源代码</h3>
      <div className="flex flex-wrap items-center gap-2">
        {/* 字体大小控制 */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDecreaseFontSize}
            disabled={fontSize <= MIN_FONT_SIZE}
            title="减小字体"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[3rem] text-center text-sm text-muted-foreground">
            {fontSize}px
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleIncreaseFontSize}
            disabled={fontSize >= MAX_FONT_SIZE}
            title="增大字体"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* 主题切换 */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={handleToggleTheme}
          title={isDarkTheme ? "切换到浅色主题" : "切换到深色主题"}
        >
          {isDarkTheme ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* 下载按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!code}
          title="下载合约文件"
        >
          <Download className="mr-1 h-4 w-4" />
          下载
        </Button>

        {/* GitHub 链接 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenGitHub}
          title="在 GitHub 上查看"
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  );

  // 加载状态
  if (isLoading) {
    return (
      <div>
        {toolbar}
        <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>加载源代码中...</span>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div>
        {toolbar}
        <div className="flex h-96 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // 无代码状态
  if (!code) {
    return (
      <div>
        {toolbar}
        <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-muted/30">
          <p className="text-muted-foreground">请选择要查看的合约</p>
        </div>
      </div>
    );
  }

  // 代码高亮显示
  return (
    <div>
      {toolbar}
      <div className="overflow-hidden rounded-lg border border-border">
        <SyntaxHighlighter
          language="solidity"
          style={isDarkTheme ? oneDark : oneLight}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: `${fontSize}px`,
            lineHeight: "1.5",
          }}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: isDarkTheme ? "#636d83" : "#9ca3af",
            userSelect: "none",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
