<template>


  <div class="tree-search-container">
    <input
      type="text"
      v-model="searchText"
      placeholder="搜索表名..."
    />
    <!-- 仅当有内容时显示 × 按钮 -->
    <span 
      v-if="searchText" 
      class="clear-btn" 
      @click="searchText = ''"
      title="清除输入"
    >×</span>
  </div>

 
  <div class="tree-container" @click="hideContextMenu" @contextmenu="handleBlankRightClick">

    <ul class="tree-root">
      <li v-for="env in filteredTree" :key="env.name" class="tree-node">
        <!-- 环境节点 -->
        <div class="node-label" @click="toggle(env)">
          <span :class="['arrow', env.expanded ? 'expanded' : '']">▹</span>
          <img src="../assets/icons/carbon--cics-db2-connection.svg" alt="env" width="20" height="20" class="icon"/>{{ env.name }}
        </div>

        <ul v-if="env.expanded" class="tree-children">
          <li v-for="db in env.children" :key="db.name" class="tree-node">
            <!-- ✅ 数据库节点 -->
            <div class="node-label" @click="toggle(db, env)">
              <span :class="['arrow', db.expanded ? 'expanded' : '']">▹</span>
              <img src="../assets/icons/devicon--azuresqldatabase.svg" alt="DB" width="20" height="20" class="icon"/>{{ db.name }}
            </div>

            <ul v-if="db.expanded" class="tree-children">
              <li
                v-for="table in db.children"
                :key="table"
                class="tree-leaf"
                @click.stop="selectTable(env.name, db.name, table.name)"
                @contextmenu.prevent.stop="showContextMenu($event, env.name, db.name, table.name)"
              >
                <img src="../assets/icons/carbon--data-table-reference.svg" alt="table" width="20" height="20" class="icon"/>{{ table.name }}
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>

    <!-- ✅ 右键菜单 -->
    <div
      v-if="menuVisible"
      class="context-menu"
      :style="{ top: `${menuY}px`, left: `${menuX}px` }"
    >
      <div class="menu-header" :title="currentNode?.label">
        <span class="menu-title">{{ currentNode?.label }}</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleAction('query')"><img src="../assets/icons/simple-icons--googlebigquery.svg" alt="query" width="20" height="20" class="icon"/>查询数据</div>
      <div class="menu-item" @click="handleAction('ddl')"><img src="../assets/icons/fluent-mdl2--show-grid.svg" alt="ddl" width="20" height="20" class="icon"/>建表语句</div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleAction('faker')"><img src="../assets/icons/streamline-ultimate-color--design-tool-magic-wand.svg" alt="faker" width="20" height="20" class="icon"/>制造数据</div>
      <div class="menu-item" @click="handleAction('import')"><img src="../assets/icons/oui--import.svg" alt="import" width="20" height="20" class="icon"/>导入数据</div>
      <div class="menu-item" @click="handleAction('export')"><img src="../assets/icons/oui--export.svg" alt="export" width="20" height="20" class="icon"/>导出数据</div>
    </div>

    <div v-if="menuVisible" class="context-menu-mask" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, onMounted,watch, onBeforeUnmount } from "vue"
import axios from "axios"

const emit = defineEmits(['run-sql-result','select-table','table-info-result'])

const treeData = ref([])
const searchText = ref('')
const filteredTree = ref([])
const allTablesCache = ref([])

// ✅ 初始化加载环境列表（懒加载入口）
// ================= 初始化树 =================
onMounted(async () => {
  try {
    const res = await axios.get('/api/envs')
    treeData.value = res.data.map((env) => ({
      name: env,
      expanded: false,
      loaded: false,
      children: []
    }))
    filteredTree.value = treeData.value

    // ✅ 启动预加载
    preloadAllTables()

  } catch (err) {
    console.error("加载环境失败:", err)
  }
})

// ================= 懒加载展开逻辑 =================
const toggle = async (node, parent = null) => {
  node.expanded = !node.expanded

  if (node.expanded && !node.loaded) {
    try {
      if (!parent) {
        // 加载数据库列表
        const res = await axios.get(`/api/dbs?env=${node.name}`)
        node.children = res.data.map((db) => ({
          name: db,
          expanded: false,
          loaded: false,
          children: []
        }))
      } else {
        // 加载表列表
        const res = await axios.get(`/api/tables?env=${parent.name}&db=${node.name}`)
        node.children = res.data.map(t => ({ name: t }))
			  // ✅ 缓存这些表
				const newTables = res.data.map(t => ({
				  env: parent.name,
				  db: node.name,
				  table: t
				}))
				allTablesCache.value.push(...newTables)

         console.log(`已缓存 ${parent.name}.${node.name} 下的 ${res.data.length} 张表`)
      }
      node.loaded = true
    } catch (err) {
      console.error("加载节点失败:", err)
    }
  }
}


// ================= 预加载所有表 =================
async function preloadAllTables() {
  try {
    const envsRes = await axios.get('/api/envs')
    const envs = envsRes.data

    for (const env of envs) {
      console.log(env)
      const dbRes = await axios.get(`/api/dbs?env=${env}`)
      const dbs = dbRes.data

      for (const db of dbs) {
       
        const tableRes = await axios.get(`/api/tables?env=${env}&db=${db}`)
        const tables = tableRes.data
       // console.log(tables)
				for (const t of tables) {
				  if (!allTablesCache.value.some(item => item.env === env && item.db === db && item.table === t)) {
					allTablesCache.value.push({ env, db, table: t })
				  }
				}

      }
    }

    console.log('✅ 预缓存完毕:', allTablesCache.value.length, '张表')
  } catch (err) {
    console.error('缓存表失败:', err)
  }
}


function filterTables(keyword) {
  const lower = keyword.toLowerCase()
  const matched = allTablesCache.value.filter(t => t.table.toLowerCase().includes(lower))

  // 构造一个仅包含匹配项的树结构
  const grouped = {}
  for (const item of matched) {
    if (!grouped[item.env]) grouped[item.env] = {}
    if (!grouped[item.env][item.db]) grouped[item.env][item.db] = []
    grouped[item.env][item.db].push(item.table)
  }

  filteredTree.value = Object.entries(grouped).map(([env, dbs]) => ({
    name: env,
    expanded: true,
    children: Object.entries(dbs).map(([db, tables]) => ({
      name: db,
      expanded: true,
      children: tables.map(t => ({ name: t }))
    }))
  }))
}


// ================= 搜索逻辑 =================
let debounceTimer = null
watch(searchText, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (!val.trim()) {
      filteredTree.value = treeData.value
      return
    }
    filterTables(val)
  }, 300)
})


// ================= 搜索结果高亮 =================
const highlightMatch = (tableName) => {
  const keyword = searchText.value.trim()
  if (!keyword) return tableName
  const regex = new RegExp(`(${keyword})`, 'gi')
  return tableName.replace(regex, `<span class="highlight">$1</span>`)
}

// ==================== 右键菜单逻辑 ====================
const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const currentNode = ref(null)

const showContextMenu = (event, env, db, table) => {
  menuX.value = event.clientX
  menuY.value = event.clientY
  currentNode.value = {
    env,
    db,
    table,
    label: `${env}.${db}.${table}`
  }
  menuVisible.value = true
}

const hideContextMenu = () => {
  menuVisible.value = false
}

const handleBlankRightClick = (event) => {
  if (event.target.classList.contains("tree-container")) {
    event.preventDefault()
    hideContextMenu()
  }
}

async function handleAction(action) {
  if (!currentNode.value) return
  const { env, db, table } = currentNode.value

  try {
    let payload = null

    // 🟦 构造 SQL
    if (action === 'query' || action === 'export') {
      payload = {
        env,
        db,
        sql: `SELECT * FROM ${db}.${table} `
      }
    }

    // 🟩 导出数据
    if (action === 'export') {
      emit('run-sql-result', { loading: true, env:env, db:db, sql:sql })
      const res = await axios.post('/api/run-sql', payload)
      const { rows, message, success, time } = res.data
      const SEP = '\x7F\x5E'
      const fileContent = rows.map(r => r.join(SEP)).join('\n') + '\n'

      // 下载数据文件
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${db}_${table}.dat`
      link.click()
      URL.revokeObjectURL(url)

      console.log(`💾 导出文件已生成: ${db}_${table}.dat`)

      // ---- 输出信息到 Output 面板 ----
      emit('run-sql-result', {
        env,
        db,
        sql: payload.sql,
        columns: [],
        message: `已导出数据，共 ${rows.length} 行\n${message}`,
        success,
        time
      })
      return
    }

    // 🟧 导入数据
    if (action === 'import') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.dat,.txt'
      input.click()

      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const text = await file.text()
        const lines = text.split('\n').filter(Boolean)
        const SEP = '\x7F\x5E'

        const valuesList = []
        for (const line of lines) {
          const fields = line.split(SEP)
          const escaped = fields.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')
          valuesList.push(`(${escaped})`)
        }

        const insertSql = `INSERT INTO ${db}.${table} VALUES ${valuesList.join(', ')}`
				emit('run-sql-result', { loading: true, env, db, sql:insertSql })
        const importPayload = { env, db, sql: insertSql }

        const importRes = await axios.post('/api/run-sql', importPayload)
        const { message, success, time } = importRes.data

        // ---- 输出导入结果到 Output 面板 ----
        emit('run-sql-result', {
          env,
          db,
          sql: insertSql,
          columns: [],
          rows: [],
          message: `导入文件成功，共 ${lines.length} 行\n${message}`,
          success,
          time
        })
      }

      return
    }

    // 🟦 获取表 DDL 结构
    if (action === 'ddl') {
      let ddlSql = ''

      switch (env.toLowerCase()) {
        case '数据仓库-gaussdb-813':
        case '数据仓库-gaussdb-821':
          ddlSql = `SELECT pg_get_tabledef('${db}.${table}') ddl_info `
          break
        case '数据仓库-td':
          ddlSql = `SHOW CREATE TABLE ${db}.${table}`
          break
        case '数据湖-uat':
        case '数据湖-ver':
          ddlSql = `SHOW CREATE TABLE ${db}.${table}`
          break
        default:
          // 未知环境
          emit('run-sql-result', {
            env,
            db,
            sql: '(不支持的 DDL 操作)',
            columns: [],
            rows: [],
            message: `环境 ${env} 不支持查看 DDL`,
            success: false,
            time: '0.000s'
          })
          return
      }
      emit('run-sql-result', { loading: true, env:env, db:db, sql:ddlSql })
      const res = await axios.post('/api/run-sql', {
        env,
        db,
        sql: ddlSql
      })
      emit('run-sql-result', res.data)
      return
    } 

    // 取 table info 
		if (action === 'faker') {
      emit('run-sql-result', { loading: true, env:env, db:db, sql:'' })
		  const res = await axios.get(`/api/faker?env=${env}&db=${db}&table=${table}`)
		  emit('table-info-result',res.data)
		  return
		}

    emit('run-sql-result', { loading: true, env:env, db:db, sql:payload.sql })
    // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    // await sleep(5000) 
    
    const res = await axios.post('/api/run-sql', payload)
    console.log(`✅ ${action} 调用成功:`, res.data)

    // ---- 把结果传递给父组件 OutputTabs ----
    emit('run-sql-result', res.data)

  } catch (err) {
    console.error(`${action} 调用失败:`, err)
    emit('run-sql-result', {
      env: currentNode.value?.env,
      db: currentNode.value?.db,
      sql: '(执行失败)',
      columns: [],
      rows: [],
      message: err.message || '执行出错',
      success: false,
      time: '0.000s'
    })
  } finally {
    closeMenu()
  }
}

function closeMenu() {
  menuVisible.value = false
}

const handleGlobalClick = (e) => {
  if (!e.target.closest(".context-menu")) hideContextMenu()
}
onMounted(() => document.addEventListener("click", handleGlobalClick))
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick))

// 选择表
const selectTable = (env, db, table) => {
  emit("select-table", { env, db, table })
}

// ==================== mock API ====================
async function mockApi(url) {
  console.log("mock 请求:", url)
  await new Promise((r) => setTimeout(r, 200))

  // 模拟右键API响应
  return { data: `mock result from ${url}` }
}
</script>

<style scoped>
.tree-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;   /* 上下滚动 */
  overflow-x: hidden; /* 横向不要滚动条，文字会显示省略号 */
  background: #f9fafb;
  padding: 10px;
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 14px;
  color: #333;
  position: relative;
}


/* Webkit 浏览器（Chrome / Edge / Safari）滚动条样式 */
.tree-container::-webkit-scrollbar {
  width: 8px;             /* 滚动条宽度 */
}

.tree-container::-webkit-scrollbar-track {
  background: #f1f1f1;    /* 滚动条轨道 */
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #999;       /* 滚动条滑块 */
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}



.tree-root {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-node {
  margin-left: 10px;
}

.node-label {
  cursor: pointer;
  padding: 3px 6px;
  display: flex;
  align-items: center;
  user-select: none;
  border-radius: 4px;
  transition: background 0.2s;
}

.tree-leaf {
  padding: 2px 6px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 4px;
}

/* 树节点文字不换行，超出显示省略号 */
.node-label, 
.tree-leaf {
  white-space: nowrap;        /* 禁止换行 */
  overflow: hidden;           /* 超出隐藏 */
  text-overflow: ellipsis;    /* 超出显示省略号 */
}

/* 保证图标和文字水平排列且不换行 */
.node-label {
  display: flex;
  align-items: center;
  gap: 4px;                   /* 图标和文字间距 */
}


.node-label:hover {
  background-color: #e9f3ff;
}

.arrow {
  display: inline-block;
  width: 12px;
  transition: transform 0.2s ease;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.tree-children {
  margin-left: 16px;
  list-style: none;
  padding-left: 4px;
  border-left: 1px dashed #ddd;
}


.tree-leaf:hover {
  background-color: #e0f0ff;
}

/* ================== 右键菜单样式 ================== */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  width: 140px;
  z-index: 999;
  padding: 4px 0;
}

.menu-item {
  padding: 8px 10px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-header {
  padding: 6px 10px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
  max-width: 180px; /* 限制最大宽度 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.menu-item:hover {
  background: #e6f3ff;
}

.context-menu-mask {
  position: fixed;
  inset: 0;
}

.icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-right: 4px;
}

.tree-search-container {
  position: sticky;
  top: 0; /* 固定在顶部 */
  background: #f9fafb;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  z-index: 10; /* 确保浮在树上方 */
}

.tree-search-container input {
  flex: 1;
  padding: 4px 28px 4px 8px; /* 给右侧留空间放清除按钮 */
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.tree-search-container input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.clear-btn {
  position: absolute;
  right: 18px;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  user-select: none;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #333;
}

</style>
