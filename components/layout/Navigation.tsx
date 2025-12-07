"use client";

// ============================================================
// 导航栏组件：用于在页面间切换
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/lib/config/navigation";

export function Navigation() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 检查路径是否匹配某个导航项或其子项
  const isItemActive = (item: (typeof navItems)[0]): boolean => {
    if (item.href && pathname === item.href) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => child.href === pathname);
    }
    return false;
  };

  // 检查子项是否激活
  const isChildActive = (childHref?: string): boolean => {
    return childHref ? pathname === childHref : false;
  };

  return (
    <nav className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive = isItemActive(item);
            const hasChildren = item.children && item.children.length > 0;
            const itemKey = item.href || item.label;

            // 如果有子菜单，渲染下拉菜单
            if (hasChildren) {
              return (
                <div
                  key={itemKey}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(itemKey)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {item.label}
                    <span className="ml-1 inline-block">▼</span>
                  </button>
                  {hoveredItem === itemKey && (
                    <div className="absolute left-0 top-full z-50 pt-1 min-w-[180px]">
                      <div className="rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                        {item.children!.map((child) => {
                          const isChildActiveState = isChildActive(child.href);
                          return (
                            <Link
                              key={child.href || child.label}
                              href={child.href || "#"}
                              className={`block px-4 py-2 text-sm transition first:rounded-t-lg last:rounded-b-lg ${
                                isChildActiveState
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 普通菜单项
            return (
              <Link
                key={itemKey}
                href={item.href || "#"}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Learn Wagmi
          </span>
        </div>
      </div>
    </nav>
  );
}
