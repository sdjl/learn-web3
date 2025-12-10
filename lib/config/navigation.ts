// ============================================================
// 导航配置：定义应用的导航菜单项
// ============================================================
// 作用：
// - 集中管理应用的导航菜单
// - 方便统一修改和维护
// - 确保所有页面使用相同的导航配置
// - 支持二级菜单分类
// ============================================================

export interface NavItem {
  href?: string; // 如果提供，点击该项会跳转；如果不提供，仅作为分类标题
  label: string;
  children?: NavItem[]; // 二级菜单项
}

/**
 * 导航菜单项列表
 * 修改此数组即可添加或移除导航项
 * 支持二级菜单：如果 NavItem 有 children 属性，将显示为下拉菜单
 *
 * 注意：除首页外，所有页面都应放入对应的二级菜单分类中
 */
export const navItems: NavItem[] = [
  { href: "/", label: "首页" },
  {
    label: "交易",
    children: [
      { href: "/trade/transfer", label: "转账" },
      { href: "/trade/transactions", label: "交易历史" },
      { href: "/trade/gas-estimator", label: "Gas 估算" },
    ],
  },
  {
    label: "监听",
    children: [
      { href: "/monitor/usdt-transactions", label: "USDT 交易监听" },
      { href: "/monitor/usdt-events", label: "USDT 合约事件" },
    ],
  },
  {
    label: "合约",
    children: [{ href: "/contract/query", label: "合约查询" }],
  },
  {
    label: "工具",
    children: [{ href: "/tools/chain-balance", label: "链切换" }],
  },
  { href: "/contract/source-code", label: "合约代码解读" },
];
