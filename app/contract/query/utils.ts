// ============================================================
// 合约查询工具函数：提供合约查询相关的辅助函数
// ============================================================
// 作用：
// - 提供源代码解析、错误处理等工具函数
// - 提供数据格式化函数
// - 与主要业务逻辑分离，提高代码可维护性
// ============================================================

/**
 * 从多文件合约的 JSON 结构中提取源代码
 */
export function extractMultiFileSources(
  obj: Record<string, unknown>,
  prefix = ""
): string[] {
  const sources: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}/${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      "content" in value &&
      typeof (value as { content: unknown }).content === "string"
    ) {
      sources.push(
        `// File: ${fullPath}\n${(value as { content: string }).content}`
      );
    } else if (typeof value === "string") {
      sources.push(`// File: ${fullPath}\n${value}`);
    } else if (value && typeof value === "object") {
      sources.push(
        ...extractMultiFileSources(value as Record<string, unknown>, fullPath)
      );
    }
  }

  return sources;
}

/**
 * 解析合约源代码（处理单文件和多文件合约）
 */
export function parseSourceCode(sourceCode: string): string {
  // 检查是否是 JSON 字符串（多文件合约）
  if (sourceCode.startsWith("{{") || sourceCode.startsWith("{")) {
    try {
      const parsed = JSON.parse(sourceCode);
      // 如果是对象，提取所有文件内容
      if (typeof parsed === "object" && parsed !== null) {
        const sources = extractMultiFileSources(
          parsed as Record<string, unknown>
        );
        return sources.join("\n\n");
      }
      return sourceCode;
    } catch {
      // 解析失败，使用原始字符串
      return sourceCode;
    }
  }

  // 单文件合约，直接返回
  return sourceCode;
}

/**
 * 格式化状态变量的值
 * 根据变量类型进行适当的格式化，将各种类型转换为可读的字符串
 */
export function formatVariableValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }

  // 处理 BigInt 类型：直接转换为字符串
  if (typeof value === "bigint") {
    return value.toString();
  }

  // 处理布尔值
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  // 处理数组
  if (Array.isArray(value)) {
    return JSON.stringify(value, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    );
  }

  // 处理对象
  if (typeof value === "object") {
    return JSON.stringify(value, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    );
  }

  // 其他类型直接转字符串
  return String(value);
}
