export default [
  // ① 获取所有环境
  {
    url: '/api/envs',
    method: 'get',
    response: () => {
      return ['数据仓库-GaussDB-813', '数据仓库-TD', '数据湖-VER']
    }
  },

  // ② 根据环境获取数据库列表
  {
    url: '/api/dbs',
    method: 'get',
    response: ({ query }) => {
      const { env } = query
      if (env === '数据仓库-GaussDB-813') {
        return ['database1', 'database2']
      } else if (env === '数据仓库-TD') {
        return ['database3', 'database4']
      } else if (env === '数据湖-VER') {
        return ['database5']
      } else {
        return []
      }
    }
  },

  // ③ 根据环境 + 数据库 获取表列表
  {
    url: '/api/tables',
    method: 'get',
    response: ({ query }) => {
      const { env, db } = query
      const tableMap = {
        '数据仓库-GaussDB-813-database1': ['table_a', 'table_b', 'table_c'],
        '数据仓库-GaussDB-813-database2': ['user', 'order'],
        '数据仓库-TD-database3': ['t_user', 't_log'],
        '数据仓库-TD-database4': ['data_x', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z', 'data_y', 'data_z'],
        '数据湖-VER-database5': ['simple_table']
      }
      return tableMap[`${env}-${db}`] || []
    }
  },
    // 4 获取所有环境-DB
  {
    url: '/api/env-dbs',
    method: 'get',
    response: () => {
      return ['数据仓库-GaussDB-813-DB1', '数据仓库-TD-DB2', '数据湖-VER-DB3']
    }
  },
 
]
