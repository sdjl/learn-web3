// ============================================================
// 合约代码解读类型定义
// ============================================================
// 作用：
// - 定义合约信息的类型接口
// - 定义代码查看器的配置类型
// ============================================================

/**
 * 合约信息接口
 */
export interface ContractInfo {
  /** 合约名称（唯一标识符，用于前端选择） */
  name: string;
  /** 合约显示名称 */
  displayName: string;
  /** 源代码文件名（相对于 contracts 目录） */
  filename: string;
  /** 学习价值说明 */
  description: string;
  /** 为什么值得学习 */
  learningPoints: string[];
}

/**
 * 代码查看器配置
 */
export interface CodeViewerConfig {
  /** 字体大小（单位：px） */
  fontSize: number;
  /** 是否使用暗色主题 */
  isDarkTheme: boolean;
}
