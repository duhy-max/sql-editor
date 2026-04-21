<template>
  <div class="main-layout">
    <splitpanes class="default-theme">
      <!-- 左侧树 -->
      <pane min-size="15" size="18">
        <TreePanel @run-sql-result="handleAddResult" @table-info-result="handleFakerInfo"/> 
      </pane>

      <!-- 右侧（上下结构） -->
      <pane>
        <splitpanes horizontal class="inner-split">
          <!-- 上半：SQL 编辑器 -->
          <pane min-size="15" size="25">
            <SqlEditorTabs @run-sql-result="handleAddResult"/>
          </pane>
          <!-- 下半：输出结果 -->
					<pane min-size="20">
					  <OutputTabs :results="results" @close-result="handleCloseResult" @faker-result="handleFakerResult" />
					</pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TreePanel from '../components/TreePanel.vue'
import SqlEditorTabs from '../components/SqlEditorTabs.vue'
import OutputTabs from '../components/OutputTabs.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'


const results = ref([])

function handleAddResult(result) {
  const id = Date.now()
  console.debug('[MainPage] handleAddResult 被调用:', { 
    id, 
    loading: result.loading, 
    env: result.env, 
    db: result.db,
    message: result.message,
    component: result.component 
  })

  if (result.loading) {
    console.debug('[MainPage] 处理 loading 状态')
    // 检查是否是制造数据的加载提示
    if (result.message && result.message.includes('表结构')) {
      console.debug('[MainPage] 检测到制造数据加载提示')
      // 这是制造数据的加载提示，我们添加一个特殊的加载页面
      results.value.push({
        id: id,
        title: `获取表结构...`,
        data: null,
        success: null,
        message: result.message,
        time: 0,
        loading: true,
        isFakerLoading: true // 标记这是制造数据的加载页面
      })
      console.debug('[MainPage] 添加了制造数据加载页面，当前 results 数量:', results.value.length)
    } else {
      console.debug('[MainPage] 普通查询加载提示')
      // 普通查询的加载提示
      results.value.push({
        id: id,
        title: `执行中...`,
        data: null,
        success: null,
        message: `${result.env}\n${result.sql}.`,
        time: 0,
        loading: true,
        isFakerLoading: false
      })
    }
  } else {
    console.debug('[MainPage] 处理完成状态，rows:', result.rows?.length, 'columns:', result.columns)
    // 转换 rows: [['a', 1], ['b', 2]] → [{col1: 'a', col2: 1}, ...]
    const tableData = Array.isArray(result.rows)
      ? result.rows.map((row) => {
          const obj = {}
          result.columns.forEach((col, i) => {
            obj[col] = row[i]
          })
          return obj
        })
      : []

    // 更新最后一个标签内容为真实结果
    const last = results.value[results.value.length - 1]
    console.debug('[MainPage] 更新最后一个标签，之前标题:', last?.title)
    Object.assign(last, {
      id,
      title: `结果 ${results.value.length}`, // 使用当前数组长度作为序号
      data: tableData,
      message: result.message,
      success: result.success,
      time: result.time,
      loading: false,
      isFakerLoading: false
    })
    console.debug('[MainPage] 更新后标题:', last.title)
  }
}

function handleFakerInfo(data) {
  console.debug('[MainPage] handleFakerInfo 被调用，data:', data)
  // 查找是否有制造数据的加载页面
  const loadingIndex = results.value.findIndex(r => r.loading && r.isFakerLoading)
  console.debug('[MainPage] 查找制造数据加载页面，index:', loadingIndex)
  
  if (loadingIndex !== -1) {
    console.debug('[MainPage] 找到制造数据加载页面，替换为造数界面')
    // 替换加载页面为造数界面
    results.value[loadingIndex] = {
      id: results.value[loadingIndex].id, // 保持相同的 ID
      title: `造数 ${loadingIndex + 1}`,
      data,
      component: 'FakerResult',
      loading: false,
      isFakerLoading: false
    }
    console.debug('[MainPage] 替换完成，当前 results 数量:', results.value.length)
  } else {
    console.debug('[MainPage] 未找到制造数据加载页面，添加新的造数标签页')
    // 如果没有找到加载页面，添加一个新的标签页
    results.value.push({
      id: Date.now(),
      title: `造数 ${results.value.length + 1}`,
      data, // 原始字段信息数组
      component: 'FakerResult',
      loading: false,
      isFakerLoading: false
    })
    console.debug('[MainPage] 添加完成，当前 results 数量:', results.value.length)
  }
}

function handleFakerResult(data) {
   results.value.push(data)
}

function handleCloseResult(id) {
  results.value = results.value.filter(r => r.id !== id)
}

</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 外层左右分割线 */
.default-theme .splitpanes__splitter {
  background-color: #dcdcdc;
  transition: background-color 0.2s;
}

.default-theme .splitpanes__splitter:hover {
  background-color: #0078d4;
}

/* 内层上下分割线（稍细一点） */
.inner-split .splitpanes__splitter {
  background-color: #e0e0e0;
  height: 4px !important;
  transition: background-color 0.2s;
}

.inner-split .splitpanes__splitter:hover {
  background-color: #0078d4;
}
</style>
