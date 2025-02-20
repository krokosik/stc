<template>
<div class="max-w-screen-md mx-auto w-11/12 pb-4">
  <loading-spinner v-if="is_loading" class="custom-loading-spinner" :label="get_label('loading_document') + '...'"/>
  <connectivity-issues-view v-else-if="is_loading_failed"/>
  <div v-else-if="not_found">Not found</div>
  <document v-else-if="document" :document="document"/>
</div>
<footer-bar />
</template>

<script setup lang="ts">
import {ref, watch, onMounted} from 'vue'
import {useRoute} from "vue-router";

import ConnectivityIssuesView from '@/components/connectivity-issues.vue'
import Document from '@/components/document.vue'
import LoadingSpinner from '@/components/loading-spinner.vue'
import {search_service} from "@/services/search";
import {get_label} from "@/translations";
import {Document as DocumentType} from "@/types";
import FooterBar from "@/components/footer-bar.vue";

const props = defineProps({
  document_id_query: String,
});

const route = useRoute();

const document = ref(undefined as DocumentType | undefined);
const is_loading = ref(false);
const is_loading_failed = ref(false);
const not_found = ref(false);

watch(
  () => route.query,
  load_document,
);

async function load_document () {
  try {
    is_loading.value = true
    const collector_outputs = await search_service.search(props.document_id_query, {
      page: 1,
      page_size: 1,
      index_name: 'stc'
    })
    const scored_documents = collector_outputs[0].collector_output.documents.scored_documents
    if (scored_documents.length === 0) {
      not_found.value = true;
      return;
    }
    not_found.value = false;
    document.value = new DocumentType(scored_documents[0].document)
    window.document.title = `${document.value?.title} - STC`
  } catch (e) {
    is_loading_failed.value = true
  } finally {
    is_loading.value = false
  }
}

onMounted(load_document)
</script>
