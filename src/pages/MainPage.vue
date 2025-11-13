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

  if (result.loading) {
    console.log("result.loading ... ")
    // 创建一个“执行中”的占位页签
    results.value.push({
      id: id,
      title: `执行中...`,
      data: null,
      success: null,
      message: `${result.env}\n${result.sql}.`,
      time: 0,
      loading:result.loading,
    })
  } else {

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
		Object.assign(last, {
		  id,
		  title: `结果 ${results.value.length}`, // 使用当前数组长度作为序号
		  data: tableData,
		  message: result.message,
		  success: result.success,
		  time: result.time,
      loading:false
		})
  }
}

function handleFakerInfo(data) {
  results.value.push({
    id: Date.now(),
    title: `造数 ${results.value.length + 1}`,
    data, // 原始字段信息数组
    component: 'FakerResult'
  })
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
