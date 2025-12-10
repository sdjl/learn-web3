"use client";

// ============================================================
// 页面链接浮动按钮组件
// ============================================================
// 作用：
// - 在页面右上角显示浮动按钮组
// - 提供跳转到 GitHub 上学习笔记和页面代码的快捷入口
// - 根据页面配置自动显示/隐藏按钮
// ============================================================

import { usePathname } from "next/navigation";
import { BookOpen, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNavItemByPath, GITHUB_REPO_URL } from "@/lib/config/navigation";

export function PageLinks() {
  // 获取当前页面路径并查找对应的导航项配置
  const pathname = usePathname();
  const navItem = getNavItemByPath(pathname);

  // 如果没有导航项配置，或者两个路径都没有，不显示组件
  if (!navItem || (!navItem.actionsPath && !navItem.notesPath)) {
    return null;
  }

  const hasActions = !!navItem.actionsPath;
  const hasNotes = !!navItem.notesPath;

  // 打开学习笔记
  const handleOpenNotes = () => {
    if (navItem.notesPath) {
      // 对中文路径进行编码
      const encodedPath = navItem.notesPath
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");
      const url = `${GITHUB_REPO_URL}/blob/main/${encodedPath}`;
      window.open(url, "_blank");
    }
  };

  // 打开页面代码
  const handleOpenCode = () => {
    if (navItem.actionsPath) {
      const url = `${GITHUB_REPO_URL}/blob/main/${navItem.actionsPath}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="fixed right-6 top-20 z-40 flex flex-col gap-2">
      {/* 学习笔记按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenNotes}
        disabled={!hasNotes}
        className="shadow-lg"
        title={hasNotes ? "查看学习笔记" : "暂无学习笔记"}
      >
        <BookOpen className="mr-1 h-4 w-4" />
        此页面学习笔记
      </Button>

      {/* 此页面代码按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenCode}
        disabled={!hasActions}
        className="shadow-lg"
        title={hasActions ? "查看页面代码" : "暂无页面代码"}
      >
        <Code className="mr-1 h-4 w-4" />
        此页面代码
      </Button>
    </div>
  );
}
