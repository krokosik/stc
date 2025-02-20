<template>
  <div class="contents">
    <div class="max-w-screen-md mx-auto w-11/12 pb-4">
      <div v-if="initializing_status">
        <loading-spinner
            class="custom-loading-spinner"
            :label="initializing_status"
        />
      </div>
      <div v-else>
        <search-bar :query="query" @update-query="on_update_query_route"/>
      </div>
      <form class="grid grid-cols-12 gap-2 mt-3">
        <select
            class="col-span-6 lg:col-span-3 border custom-border-color custom-input-box bg-transparent base-text-color text-md rounded-md block w-full"
            v-model="selected_type"
            aria-label="Type of search content"
            @change="switch_parameter()">
          <option v-for="[type, display_type] of types" :value="type" v-bind:key="type">{{ display_type }}</option>
        </select>
        <select
            class="col-span-6 lg:col-span-3 border custom-border-color custom-input-box bg-transparent base-text-color text-md rounded-md block w-full"
            v-model="selected_language"
            aria-label="Documents language"
            @change="switch_parameter()">
          <option v-for="[language, display_language] of languages" :value="language" v-bind:key="language">
            {{ display_language }}
          </option>
        </select>
        <select
            class="col-span-6 lg:col-span-3 border custom-border-color custom-input-box bg-transparent base-text-color text-md rounded-md block w-full"
            v-model="selected_timerange"
            aria-label="Period for searching"
            @change="switch_parameter()">
          <option v-for="[year, display_year] of years" :value="year" v-bind:key="year">{{ display_year }}</option>
        </select>
        <button
            class="col-span-6 lg:col-span-3 text-lg ml-auto my-auto me-4"
            v-if="!is_loading && !is_documents_loading"
            @click.stop.prevent="on_update(true)"
        > 🎲
        </button>
      </form>
      <loading-spinner
          v-if="is_documents_loading"
          class="custom-loading-spinner"
          :label="get_label('loading') + '...'"
      />
      <div v-else-if="loading_documents_failure_reason !== undefined">
        <connectivity-issues :reason="loading_documents_failure_reason"/>
      </div>
      <div v-else>
        <hr v-if="search_response.count" class="custom-separator"/>
        <div v-if="query && !is_rolled" class="mt-2 text-md text-end">
          {{ search_response.count }} results
        </div>
        <div class="mt-3">
          <search-results :search_documents="search_response.search_documents"/>
          <div
              v-if="search_response.count > per_page && !is_rolled"
              class="flex items-center justify-center mt-4"
          >
            <fwb-pagination
                large
                :model-value="page"
                previous-label="<"
                next-label=">"
                :per-page="per_page"
                :total-items="search_response.count"
                @update:model-value="on_update_page_route"
            />
          </div>
        </div>
      </div>
    </div>
    <footer-bar/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import SearchBar from "@/components/search-bar.vue";
import {search_service} from "@/services/search";
import {Language, Type} from "@/services/search/query-processor";
import {get_label} from "@/translations";
import SearchResults from "@/components/search-results.vue";
import {generate_year_ranges} from "@/utils.ts"
import {SearchResponse} from "@/types";
import LoadingSpinner from "@/components/loading-spinner.vue";
import ConnectivityIssues from "@/components/connectivity-issues.vue";
import {FwbPagination} from "flowbite-vue";
import FooterBar from "@/components/footer-bar.vue";

const router = useRouter();
const route = useRoute();

const per_page = 10;
const current_query_id = ref(0);
const query = ref(route.query.q);
const page = ref(Number(route.query.p || 1));
const is_documents_loading = ref(false);
const initializing_status = ref(undefined);
const is_loading = ref(false);
const is_rolled = ref(false);
const is_search_used = ref(false);
const selected_language = ref(route.query.l);
const selected_timerange = ref(route.query.r);
const selected_type = ref(route.query.t);
const search_response: SearchResponse = reactive(SearchResponse.empty());
const loading_documents_failure_reason = ref(undefined);

const languages = ref([[undefined, get_label("all_languages")], ...Object.entries(Language)]);
const types = ref([[undefined, get_label("all_types")], ...Object.entries(Type)]);
const years = ref(generate_year_ranges());

watch(
    () => route.query,
    () => {
      query.value = route.query.q;
      page.value = Number(route.query.p || 1);
      selected_language.value = route.query.l;
      selected_timerange.value = route.query.r;
      selected_type.value = route.query.t;
      on_update();
    },
);

async function on_update_query_route(new_query: string) {
  await router.push({name: 'search', query: {...route.query, q: new_query, p: 1}})
}

async function on_update_page_route(new_page: string) {
  await router.push({name: 'search', query: {...route.query, p: new_page}})
}

async function switch_parameter() {
  is_rolled.value = false;
  await router.push({
    name: 'search', query: {
      q: query.value,
      p: 1,
      t: selected_type.value,
      r: selected_timerange.value,
      l: selected_language.value,
    }
  })
}

function is_requestable() {
  return query.value || selected_type.value || selected_timerange.value || selected_language.value;
}

function preprocess_query(q: string) {
  const doiPattern = /\b(10\.\d{4,}(?:\.\d+)*\/(?:(?!["&'<>])\S)+)\b/gi;
  return q.replace(doiPattern, 'uris:"doi:$1"');
}

async function on_update(is_roll: boolean = false) {
  if (!is_requestable()) {
    Object.assign(search_response, SearchResponse.empty());
    return;
  }
  is_documents_loading.value = true;
  is_rolled.value = is_roll;
  current_query_id.value += 1;
  const guard = current_query_id.value.valueOf();
  const real_query = preprocess_query(query.value)

  const collector_outputs = await search_service.search(real_query, {
    page: page.value,
    type: selected_type.value,
    language: selected_language.value,
    timerange: selected_timerange.value,
    random: is_roll,
  });
  if (query.value) {
    document.title = `${query.value} - STC`;
  }
  if (guard == current_query_id.value) {
    Object.assign(search_response, new SearchResponse({
      search_documents: collector_outputs[0].collector_output.documents.scored_documents,
      count: collector_outputs[1].collector_output.count.count,
      has_next: collector_outputs[0].collector_output.documents.has_next,
    }));
  }
  is_documents_loading.value = false;
  is_search_used.value = true;
  typeof window !== 'undefined' ? window.scrollTo({top: 0, behavior: 'smooth'}) : '';
}

onMounted(on_update)
</script>
