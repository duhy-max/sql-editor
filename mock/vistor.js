export default [
  {
    url: '/api/visit_count',
    method: 'get',
    response: ({ query }) => {
      console.log('[MOCK] /api/faker 被调用:', query)
      const { env, db, table } = query

      const mockResult = { 
        count: 1000
      } 
      return mockResult
    }
  }
]
 