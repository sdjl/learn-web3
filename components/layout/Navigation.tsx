"use client";

// ============================================================
// 导航栏组件：用于在页面间切换
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
    <nav className="border-b border-border bg-background/70 backdrop-blur">
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
                    className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {hoveredItem === itemKey && (
                    <div className="absolute left-0 top-full z-50 pt-1 min-w-[180px]">
                      <div className="rounded-lg border border-border bg-popover shadow-lg">
                        {item.children!.map((child) => {
                          const isChildActiveState = isChildActive(child.href);
                          return (
                            <Link
                              key={child.href || child.label}
                              href={child.href || "#"}
                              className={`block px-4 py-2 text-sm transition first:rounded-t-lg last:rounded-b-lg ${
                                isChildActiveState
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted"
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
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Learn Web3
          </span>
        </div>
      </div>
    </nav>
  );
}
