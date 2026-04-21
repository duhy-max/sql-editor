<template>
  <el-header height="40px" class="top-nav">
    <el-row justify="space-between" align="middle">
      <!-- 左侧标题和链接 -->
      <el-col :span="4" class="left-area">
        <strong>湖仓查询-造数平台</strong>
        <el-link type="primary" @click="drawerVisible = true" class="smart-link">AI造数</el-link>
      </el-col>

      <!-- 中间空白 -->
      <el-col :span="12"></el-col>

      <!-- 右侧访问量 -->
      <el-col :span="4" style="text-align: right;">
        <span>用户量：{{ visitCount }}</span>
      </el-col>
    </el-row>
  </el-header>

  <!-- 右侧抽屉 - 占屏幕一半宽度 -->
  <el-drawer
      v-model="drawerVisible"
      title="智能造数助手"
      direction="rtl"
      size="50%"
      :with-header="true"
  >
    <div class="drawer-content">
      <!-- iframe 嵌入外部AI聊天链接 -->
      <iframe
          :src="chatUrl"
          class="chat-iframe"
          frameborder="0"
      ></iframe>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const visitCount = ref(0)
const drawerVisible = ref(false)

// ⚠️ 请替换为您的AI聊天窗口实际地址
const chatUrl = ref('http://aiagent.ver.cmbc.cn/product/llm/chat/d7bhfpelvnd3lt6pl7i0')

onMounted(async () => {
  try {
    const res = await axios.get('/api/visit_count')
    visitCount.value = res.data.count
  } catch (error) {
    console.error("获取访问量失败：", error)
    visitCount.value = 0
  }
})
</script>

<style scoped>
.top-nav {
  background: #f5f7fa;
  border-bottom: 1px solid #ddd;
  padding: 5px 15px;
}

.left-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.smart-link {
  font-size: 14px;
  cursor: pointer;
}

.drawer-content {
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.chat-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
</style>