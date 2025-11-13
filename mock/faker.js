export default [
  {
    url: '/api/faker',
    method: 'get',
    response: ({ query }) => {
      console.log('[MOCK] /api/faker 被调用:', query)
      const { env, db, table } = query

      const mockResult = {
        env,
        db,
        table,
        columns: ['字段名称', '字段类型', '字段注释'],
        rows: [
          ['id', 'Int32', '主键ID'],
          ['name', 'String', '用户姓名'],
          ['email', 'String', '邮箱地址'],
          ['created_at', 'DateTime', '创建时间']
        ],
        message: '字段结构加载成功',
        success: true,
        time: `${(Math.random() * 0.2 + 0.1).toFixed(3)}s`
      }

      // 模拟 20% 的错误概率
      const failChance = Math.random() < 0.2
      if (failChance) {
        return {
          env,
          db,
          table,
          columns: [],
          rows: [],
          message: '字段结构加载失败',
          success: false,
          time: `${(Math.random() * 0.2 + 0.1).toFixed(3)}s`
        }
      }

      return mockResult
    }
  },
  {
    url: '/api/run-faker',
    method: 'post',
    response: ({ body }) => {
      const { env, db, table, columns } = body
      console.log('[MOCK] /api/run-faker 被调用:', body)

      const success = Math.random() > 0.2
      if (success) {
        return {
          success: true,
          message: `成功向 ${env}.${db}.${table} 造入 `,
          time: `${(Math.random() * 0.3 + 0.2).toFixed(3)}s`,
          rows: [],
          columns: []
        }
      } else {
        return {
          success: false,
          message: `造数失败：模拟错误（${env}.${db}.${table}）`,
          time: `${(Math.random() * 0.3 + 0.2).toFixed(3)}s`,
          rows: [],
          columns: []
        }
      }
    }
  }
]
 