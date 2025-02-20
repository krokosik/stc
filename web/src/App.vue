<template>
<div class="flex flex-col min-h-screen bg-white dark:bg-gray-900 base-text-color">
  <navigation-bar />
  <router-view />
</div>
</template>
<script setup lang="ts">
import {onMounted} from 'vue'
import {initFlowbite} from "flowbite";
import NavigationBar from "@/components/navigation-bar.vue";
onMounted(initFlowbite);
onMounted(() => {
  let script = window.document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/mathpix-markdown-it@1.3.5/es5/bundle.js";
  window.document.head.append(script);
  script.onload = window.loadMathJax;
})
</script>
