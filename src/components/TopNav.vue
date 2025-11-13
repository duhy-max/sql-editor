<template>
  <el-header height="40px" class="top-nav">
    <el-row justify="space-between" align="middle">
      <el-col :span="4">
        <strong>湖仓查询-造数平台</strong>
      </el-col>
      <el-col :span="12">
        
      </el-col>
    </el-row>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
const selectedDB = ref('demo_db')
</script>

<style scoped>
.top-nav {
  background: #f5f7fa;
  border-bottom: 1px solid #ddd;
  padding: 5px 15px;
}
</style>

