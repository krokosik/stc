<template>
  <div class="mx-auto">
      <input
        autofocus
        id="search-box"
        v-model="query"
        class="bg-transparent border custom-border-color custom-input-box rounded peer h-full w-full outline-none text-lg p-3"
        type="search"
        placeholder="by title, authors, content, dois..."
        @keyup.enter="$emit('update-query', query)"
        aria-label="Search query"
      >
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  query: String,
});

watch(
    () => props.query,
    (new_query: any) => {
      query.value = new_query;
    }
)

defineEmits(['update-query'])
const query = ref(props.query)
</script>
