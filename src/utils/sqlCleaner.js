// utils/sqlCleaner.js
export function cleanSQL(sql) {
  if (!sql || typeof sql !== 'string') return { ok: false, message: 'SQL 为空', sql: '' }

  let cleaned = sql.trim()

  // 1️⃣ 删除注释（-- 注释 或 /* ... */）
  cleaned = cleaned
    .replace(/--.*(\r?\n|$)/g, '')     // 单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '')  // 多行注释

  // 2️⃣ 去掉多余空格与换行
  cleaned = cleaned
    .replace(/\s+/g, ' ') // 所有连续空格或换行替换为一个空格
    .trim()

  // 3️⃣ 去掉末尾分号
  cleaned = cleaned.replace(/;+\s*$/, '')

  // 4️⃣ 检查是否包含多个 SQL（出现多个分号中间有内容）
  const hasMultiple = /;.+/.test(sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*(\r?\n|$)/g, ''))
  if (hasMultiple) {
    return { ok: false, message: '检测到多个 SQL 语句，请仅提交一条', sql: cleaned }
  }

  // 5️⃣ 最终结果
  if (!cleaned) {
    return { ok: false, message: 'SQL 为空，请检查输入', sql: '' }
  }

  return { ok: true, message: 'SQL 清洗完成', sql: cleaned }
}