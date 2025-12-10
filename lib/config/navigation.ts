// ============================================================
// 导航配置：定义应用的导航菜单项
// ============================================================
// 作用：
// - 集中管理应用的导航菜单
// - 方便统一修改和维护
// - 确保所有页面使用相同的导航配置
// - 支持二级菜单分类
// - 配置页面对应的代码文件和学习笔记路径
// ============================================================

/** GitHub 项目地址 */
export const GITHUB_REPO_URL = "https://github.com/sdjl/learn-web3";

export interface NavItem {
  href?: string; // 如果提供，点击该项会跳转；如果不提供，仅作为分类标题
  label: string;
  children?: NavItem[]; // 二级菜单项
  /** 页面对应的 actions.ts 文件路径（相对于项目根目录） */
  actionsPath?: string;
  /** 页面对应的学习笔记路径（相对于项目根目录） */
  notesPath?: string;
}

/**
 * 根据页面路径获取导航项
 *
 * @param pathname - 页面路径（如 /trade/transfer）
 * @returns 对应的导航项，如果未找到返回 undefined
 */
export function getNavItemByPath(pathname: string): NavItem | undefined {
  for (const item of navItems) {
    if (item.href === pathname) {
      return item;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) {
          return child;
        }
      }
    }
  }
  return undefined;
}

/**
 * 导航菜单项列表
 * 修改此数组即可添加或移除导航项
 * 支持二级菜单：如果 NavItem 有 children 属性，将显示为下拉菜单
 *
 * 注意：除首页外，所有页面都应放入对应的二级菜单分类中
 */
export const navItems: NavItem[] = [
  {
    href: "/",
    label: "首页",
    notesPath: "学习笔记/钱包/如何链接钱包.md",
  },
  {
    label: "交易",
    children: [
      {
        href: "/trade/transfer",
        label: "转账",
        actionsPath: "app/trade/transfer/components/Form.tsx",
        notesPath: "学习笔记/交易/如何实现转账.md",
      },
      {
        href: "/trade/transactions",
        label: "交易历史",
        actionsPath: "app/trade/transactions/actions.ts",
        notesPath: "学习笔记/交易/如何查询交易记录.md",
      },
      {
        href: "/trade/gas-estimator",
        label: "Gas 估算",
        actionsPath: "app/trade/gas-estimator/actions.ts",
        notesPath: "学习笔记/交易/如何估算Gas费用.md",
      },
    ],
  },
  {
    label: "监听",
    children: [
      {
        href: "/monitor/usdt-transactions",
        label: "USDT 交易监听",
        actionsPath: "app/monitor/usdt-transactions/actions.ts",
        notesPath: "学习笔记/监听/如何监听代币交易.md",
      },
      {
        href: "/monitor/usdt-events",
        label: "USDT 合约事件",
        actionsPath: "app/monitor/usdt-events/actions.ts",
        notesPath: "学习笔记/监听/如何监听合约事件.md",
      },
    ],
  },
  {
    label: "合约",
    children: [
      {
        href: "/contract/query",
        label: "合约查询",
        actionsPath: "app/contract/query/actions.ts",
        notesPath: "学习笔记/合约/如何查询合约信息.md",
      },
    ],
  },
  {
    label: "工具",
    children: [
      {
        href: "/tools/chain-balance",
        label: "链切换",
        notesPath: "学习笔记/工具/如何切换链.md",
      },
    ],
  },
  {
    href: "/contract/source-code",
    label: "合约代码解读",
    actionsPath: "app/contract/source-code/actions.ts",
  },
];
