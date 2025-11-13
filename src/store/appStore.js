import { reactive } from 'vue'

export const appStore = reactive({
  // 当前选中的数据库
  currentDB: 'demo_db',

  // SQL 编辑器标签
  sqlTabs: [
    { id: '1', title: 'Query 1', content: 'SELECT * FROM users;' }
  ],
  activeSqlTab: '1',

  // 输出结果标签
  outputTabs: [
    { id: '1', title: 'Result 1', data: [] }
  ],
  activeOutputTab: '1',

  // 方法
  addSqlTab() {
    const id = String(Date.now())
    this.sqlTabs.push({ id, title: `Query ${this.sqlTabs.length + 1}`, content: '' })
    this.activeSqlTab = id
  },

  removeSqlTab(id) {
    this.sqlTabs = this.sqlTabs.filter(tab => tab.id !== id)
    if (this.activeSqlTab === id && this.sqlTabs.length) {
      this.activeSqlTab = this.sqlTabs[0].id
    }
  },

  addOutputTab(resultData) {
    const id = String(Date.now())
    this.outputTabs.push({ id, title: `Result ${this.outputTabs.length + 1}`, data: resultData })
    this.activeOutputTab = id
  }
})

