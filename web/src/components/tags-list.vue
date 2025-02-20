<template>
<div>
  <span v-for="(tag, index) in tags" v-bind:key="tag">
    <span class="mx-1" v-if="index > 0"> - </span>
    <router-link class="custom-link" :to='"/?q=tags:\"" + tag + "\""'> {{ tag }} </router-link>
  </span>
</div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

defineProps({
  tags: Array as PropType<string[]>,
});
</script>
