<template>
  <div class="app-container">
    <TopNav />
    <MainPage />
  </div>
</template>

<script setup>
import TopNav from './components/TopNav.vue'
import MainPage from './pages/MainPage.vue'
</script>

<style>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

