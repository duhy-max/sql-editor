<template>
  <splitpanes class="default-theme" horizontal>
    <pane size="20">
      <TreePanel />
    </pane>

    <pane>
      <splitpanes class="default-theme" horizontal>
        <pane size="60">
          <SqlEditorTabs />
        </pane>
        <pane>
          <OutputTabs />
        </pane>
      </splitpanes>
    </pane>
  </splitpanes>
</template>

<script setup>
import { Splitpanes, Pane } from 'splitpanes'
import TreePanel from '../components/TreePanel.vue'
import SqlEditorTabs from '../components/SqlEditorTabs.vue'
import OutputTabs from '../components/OutputTabs.vue'
</script>

<style scoped>
.default-theme {
  height: calc(100vh - 50px);
}
</style>

