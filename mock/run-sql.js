// mock/run-sql.js
export default [
  {
    url: '/api/run-sql',
    method: 'post',
    response: ({ body }) => {
	  console.log('[MOCK] /api/run-sql 被调用:', body)
      const { env, sql } = body

      // 模拟延迟执行
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
	  
      // 模拟结果集
      const mockResult = {
        env,
        sql,
        columns: ['id', 'nasdfasdme', 'value'],
        rows: [
          [1, 'alpha', 123],
          [2, 'betsssssssssssssssssssssssa', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'beta', 456],
		            [1, 'alpha', 123],
          [2, 'abcdefg', 456],
          [3, 'gamma', 789]
        ],
        message: 'SQL 执行成功',
        success: true,
        time: `${(Math.random() * 0.2 + 0.1).toFixed(3)}s`
      }

      // 模拟错误几率
      const failChance = Math.random() < 0.2 // 20% 概率失败

      if (failChance) {
		return {
          env,
          sql,
          columns: [],
          rows: [],
          success: false,
          message: `执行 SQL 出错：语法错误或连接失败（环境：${env}）`,
          time
        }
      }

      // 成功返回
      return mockResult
    }
  } 
]




//rows: [
//          [1, 'alpha', 123],
//          [2, 'beta', 456],
//          [3, 'gamma', 789]
//        ],