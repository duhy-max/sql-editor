<template>
  <div class="editor-container">
    <div class="editor-toolbar">
      <!-- 数据源选择 -->
      <select v-model="selectedSource" class="source-select">
        <option value="" disabled>请选择数据源</option>
        <option v-for="env in envs" :key="env" :value="env">
          {{ env }}
        </option>
      </select>

			<div class="run-buttons">
			  <!-- 单条 SQL -->
			  <button
				class="run-btn run-btn--single"
				:disabled="!selectedSource || loadingData"
				@click="runSql"
				title="执行单条 SQL 语句"
			  >
				<img src="../assets/icons/famicons--play-outline.svg" alt="DB" width="20" height="20"/>

			  </button>
			</div>


    </div>

    <div ref="editorContainer" class="editor"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import { cleanSQL } from '../utils/sqlCleaner.js'


const emit = defineEmits(['run-sql-result'])
const editorContainer = ref(null)
let editorInstance = null

// 模拟可选数据源（从接口加载）
const envs = ref([]) // 存储从 /api/envs 获取的环境列表
const selectedSource = ref('')
const loadingSources = ref(false)

const loadingData = ref(false)

// 初始化加载数据源（环境列表）
onMounted(async () => {
  // 创建编辑器实例
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: '-- 在这里写 SQL 语句',
    language: 'sql',
    theme: 'vs-light',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
  })

  // 加载环境列表
  await fetchEnvs()

})

async function fetchEnvs() {
  loadingSources.value = true
  try {
    const res = await axios.get('/api/env-dbs')
    if (Array.isArray(res.data)) {
      envs.value = res.data
    }
  } catch (e) {
    console.error('加载环境数据源失败:', e)
  } finally {
    loadingSources.value = false
  }
}

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose()
  }
})

async function runSql() {
  if (!editorInstance) return

  if (!selectedSource.value) {
    ElMessage.warning('请先选择数据源')
    return
  }

  if (loadingData.value) {
    ElMessage.warning('请稍等有正在运行的SQL ...')
    return
  }

  const model = editorInstance.getModel()
  const selection = editorInstance.getSelection()
  let rawSql = selection && !selection.isEmpty()
    ? model.getValueInRange(selection)
    : model.getValue()


  const clean_result = cleanSQL(rawSql)

  if (!clean_result.ok) {
    ElMessage.warning(clean_result.message)
    return
  }

  console.log('Cleaned SQL:', clean_result.sql)
  const sql = clean_result.sql 

  loadingData.value = true
  emit('run-sql-result', { loading: true, env:selectedSource.value, db:'', sql:sql })
  try {
    const res = await axios.post('/api/run-sql', {
      env: selectedSource.value,  
      db: selectedSource.value,
      sql: sql
    })
    // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    // await sleep(5000) 
    console.log('执行结果:', res.data)
    emit('run-sql-result', res.data)  // 通知父组件显示结果
  } catch (err) {
    console.error('执行 SQL 出错:', err)
    emit('run-sql-result', { success: false, error: err.message })
  } finally {
    loadingData.value = false
  }

}

// 处理选择数据源变化的事件
// const onSourceChange = () => {
  // 选中数据源时触发
//   emit('update:selectedEnv', selectedSource.value)
// }
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 6px 10px;
  border-bottom: 1px solid #ddd;
  gap: 16px;
}

.source-select {
  min-width: 220px;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
  outline: none;
}

.source-select:focus {
  border-color: #3b82f6;
}
.run-buttons {
  display: flex;
  align-items: center;
  gap: 18px; /* 两个按钮之间的间距 */
}

/* 通用按钮样式 */
.run-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.run-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* 单条 SQL 执行按钮（） */
.run-btn--single {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.editor-toolbar button {
  background-color: #3b82f6;
  border: none;
  color: white;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.editor-toolbar button:hover {
  background-color: #2563eb;
}

.editor {
  flex: 1;
}

.icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-right: 4px;
}
</style>


