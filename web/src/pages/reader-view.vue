<template>
  <div class="contents">
    <div v-if="error !== undefined">
      <connectivity-issues-view/>
    </div>
    <div v-else-if="downloading_status !== undefined">
      <loading-spinner class="custom-loading-spinner" :percentage="downloading_status"/>
    </div>
    <div v-else-if="data !== undefined">
      <suspense v-if="filename.endsWith('epub')">
        <epub-reader :anchor="anchor" :filename="filename" :data="data" :title="title"
                     v-on:update-anchor="update_anchor"/>
      </suspense>
      <suspense v-else-if="filename.endsWith('djvu')">
        <djvu-reader :anchor="anchor" :filename="filename" :data="data" :title="title"
                     v-on:update-anchor="update_anchor"/>
      </suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'

import router from "@/router";
import {tracked_download} from "@/components/download-progress";
import ConnectivityIssuesView from "@/components/connectivity-issues.vue";
import LoadingSpinner from "@/components/loading-spinner.vue";
import DjvuReader from "@/components/djvu-reader.vue";
import EpubReader from "@/components/epub-reader.vue";
import {db} from "@/database.ts";

const props = defineProps(["anchor", "nexus_key", "filename"])
const data = ref(undefined);
const error = ref(undefined);
const downloading_status = ref(undefined);

function update_anchor(new_anchor: string) {
  db.bookmarks.put({nexus_key: props.nexus_key, anchor: new_anchor});
  router.replace({
    name: 'reader',
    query: {
      nexus_key: props.nexus_key,
      filename: props.filename,
      anchor: new_anchor,
    }
  })
}

const title = computed(() => {
  if (!props.filename) {
    return "";
  }
  const parts = props.filename.split('.');
  const extension = parts.pop();
  const filename = parts.join('.')
  let builder_parts = [];
  let counter = 0;
  for (const part of filename.split('-')) {
    counter += part.length;
    if (counter < 24) {
      builder_parts.push(part)
    }
  }
  return builder_parts.join('-') + '.' + extension;
});

onMounted(async () => {
  window.document.title = `${title.value} - STC`
  const local_link = `/repo/${props.nexus_key}?&filename=${props.filename}`;
  try {
    const files = await tracked_download([local_link], downloading_status);
    data.value = files[0];
    error.value = undefined;
  } catch (e) {
    error.value = e.toString();
  }
})
</script>
