<template>
<div class="max-w-screen-lg mx-auto w-11/12 pb-4">
  <router-view id="hrv" />
</div>
<footer-bar />
</template>
<script setup lang="ts">
import FooterBar from "@/components/footer-bar.vue";

document.title = 'Help - STC';
</script>
