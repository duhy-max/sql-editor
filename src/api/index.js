export async function executeSQL(sql) {
  console.log('模拟执行 SQL:', sql)

  // 模拟网络延迟
  await new Promise(res => setTimeout(res, 500))

  // 返回一个虚拟表格结果
  return [
    { id: 1, name: 'Alice', sql },
    { id: 2, name: 'Bob', sql }
  ]
}

