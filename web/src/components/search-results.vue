<template>
  <div class="space-y-4">
    <div
      v-for="search_document in search_documents"
      :key="search_document.document.id"
      class="p-3 md:px-5 border border-solid border-gray-500 rounded"
    >
      <search-result-item :search_document="search_document" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {SearchDocument} from "@/types";
import {PropType} from "vue";
import SearchResultItem from "@/components/search-result-item.vue";

defineProps({
  search_documents: Object as PropType<SearchDocument[]>,
});
</script>
