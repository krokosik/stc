<template>
  <div>
    <img v-if="cover" class="float-left object-cover border p-2 mr-3 mb-3 w-24 rounded custom-border-color" :src="cover"  alt="Book cover"/>
    <div class="leading-tight tracking-tight secondary-text-color custom-link-container text-xs" v-html="search_document!.document.format_coordinates()"/>
    <div class="leading-tight tracking-tight secondary-text-color custom-link-container text-xs" v-html="search_document!.document.extras()"/>
    <div class="mt-2">
      <a :href="`#/stc/id:${search_document?.document.id}`"
       v-html="html_title"
       class="text-xl custom-header custom-link leading-tight tracking-tight"
      ></a>
    </div>
  </div>
  <div class="mt-2 leading-tight base-text-color text-sm">
    <div v-html="snippet"/>
  </div>
  <tags-list class="mt-2 text-sm" :tags="search_document!.document.tags" />
  <div class="clear-both" />
</template>
<script setup lang="ts">
import {SearchDocument} from "@/types";
import {computed, PropType, onMounted, ref} from "vue";
import TagsList from "@/components/tags-list.vue";
import {remove_markdown} from "@/utils.ts";

const props = defineProps({
  search_document: Object as PropType<SearchDocument>
});

const cover = ref(undefined as string | undefined);

const html_title = computed(() => {
  if (props.search_document?.snippets.title && props.search_document?.snippets.title.html) {
    return remove_markdown(props.search_document?.snippets.title.html)
  }
  return remove_markdown(props.search_document!.document.title);
})

const snippet = computed(() => {
  if (!props.search_document?.document?.abstract) {
    return null
  }
  let abstract = ''
  if (props.search_document?.snippets.abstract) {
    abstract = props.search_document?.snippets.abstract.html
  }
  if (abstract.length === 0) {
    abstract = props.search_document?.document?.abstract.substring(0, 400)
    if (props.search_document?.document?.abstract.length > 400) {
      abstract += '...'
    }
  } else {
    const encoder = new TextEncoder()
    const original_length = encoder.encode(props.search_document?.document?.abstract).length
    const snippet_length = props.search_document?.snippets.abstract?.fragment.length || 0;

    if (original_length > snippet_length) {
      abstract += '...'
    }
    if (props.search_document?.document?.abstract.substring(0, 32) !== abstract.substring(0, 32)) {
      abstract = '...' + abstract
    }
  }
  return remove_markdown(abstract);
})
onMounted(async () => {
  cover.value = await props.search_document?.document.get_openlibrary_cover()
})
</script>
