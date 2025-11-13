
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

      <!-- 执行单个 SQL -->
      <button
        class="run-btn"
        :disabled="!selectedSource || loadingData"
        @click="runSql('single')"
        title="执行 SQL 语句 (Ctrl+Enter)"
      >
        ▶
      </button>

      <!-- 执行全部 SQL -->
      <button
        class="run-btn"
        :disabled="!selectedSource || loadingData"
        @click="runSql('all')"
        title="执行全部 SQL (Ctrl+Shift+Enter)"
      >
        ▸▸
      </button>

      <!-- 可以加更多按钮，例如清空、格式化等 -->
    </div>

    <div ref="editorContainer" class="editor"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['run-sql-result'])
const editorContainer = ref(null)
let editorInstance = null

const envs = ref([])
const selectedSource = ref('')
const loadingData = ref(false)

onMounted(async () => {
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: 'SELECT * FROM users;\n-- 在这里写 SQL 语句',
    language: 'sql',
    theme: 'vs-light',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
  })

  await fetchEnvs()
})

async function fetchEnvs() {
  try {
    const res = await axios.get('/api/env-dbs')
    if (Array.isArray(res.data)) envs.value = res.data
  } catch (e) {
    console.error('加载环境数据源失败:', e)
  }
}

onBeforeUnmount(() => {
  if (editorInstance) editorInstance.dispose()
})

async function runSql(mode = 'single') {
  if (!editorInstance) return
  if (!selectedSource.value) {
    ElMessage.warning('请先选择数据源')
    return
  }

  let sql = ''
  const model = editorInstance.getModel()
  const selection = editorInstance.getSelection()

  if (mode === 'single') {
    sql = selection && !selection.isEmpty()
      ? model.getValueInRange(selection)
      : model.getValue().split(';')[0] || ''
  } else if (mode === 'all') {
    sql = model.getValue()
  }

  if (!sql.trim()) {
    ElMessage.warning('SQL 不能为空')
    return
  }

  loadingData.value = true
  try {
    const res = await axios.post('/api/run-sql', {
      env: selectedSource.value,
      db: selectedSource.value,
      sql
    })
    emit('run-sql-result', res.data)
  } catch (err) {
    emit('run-sql-result', { success: false, error: err.message })
  } finally {
    loadingData.value = false
  }
}
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 6px 10px;
  border-bottom: 1px solid #ddd;
  gap: 8px;
}

.source-select {
  min-width: 220px;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.run-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.run-btn:hover {
  background-color: #2563eb;
}

.run-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
