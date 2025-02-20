<template>
  <div ref="wrapper">
    <div class="relative rounded-lg border custom-border-color pt-2 min-h-[calc(100vh-76px)] h-[calc(100vh-102px)] mx-1 mb-1">
      <h2 class="absolute flex top-0 left-1/2 transform -translate-x-1/2 invisible sm:visible -translate-y-1/3 md:-translate-y-1/2">
        <span class="custom-bg-main px-2 text-xs md:text-sm font-medium">{{ title }} {{ ~~(progress * 100) }}%</span>
      </h2>
      <loading-spinner v-if="is_rendering" class="custom-loading-spinner m-auto h-full"/>
      <div v-show="!is_rendering" class="flex flex-col">
        <div class="flex justify-between mx-1 -mt-1">
          <div role="group">
            <button type="button" @click.stop.prevent="zoom_out" :disabled="scale <= scale_min"
                    class="px-5 text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
              -
            </button>
            <button type="button" @click.stop.prevent="zoom_in" :disabled="scale >= scale_max"
                    class="px-5 text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
              +
            </button>
          </div>
          <div role="group">
            <button type="button" @click.stop.prevent="rendition.prev()"
                    class="px-5 text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
              &lt;
            </button>
            <button type="button" @click.stop.prevent="rendition.next()"
                    class="px-5 text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
              &gt;
            </button>
          </div>
        </div>
        <div id="epub-reader" ref="reader" class="p-1 w-full h-[calc(100vh-108px)]"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onBeforeUnmount, ref} from 'vue'

import ePub from "epubjs";
import router from "@/router";
import Hammer from "hammerjs";
import {Ref} from "vue";
import LoadingSpinner from "@/components/loading-spinner.vue";

const emits = defineEmits(["update-anchor"]);
const props = defineProps(["anchor", "data", "filename", "title"]);

const rendition: Ref<ePub | undefined> = ref();
const reader: Ref<HTMLElement | undefined> = ref();
const progress = ref(0);
const is_rendering = ref(true);

const scale_max = 1.5
const scale_min = 0.5
const scale = ref(1.0);

let mounted = false;

const book = ePub();

function key_listener(event: KeyboardEvent) {
  event.preventDefault();
  if (event.key == "ArrowLeft") {
    rendition.value?.prev();
  } else if (event.key == "ArrowRight") {
    rendition.value?.next();
  } else if (event.key === "Escape") {
    router.back();
    return;
  }
}

function zoom_in() {
  scale.value += 0.1;
  set_theme();
}

function zoom_out() {
  scale.value -= 0.1;
  set_theme();
}

function on_tap(e) {
  const iframe = document?.querySelector('#epub-reader')!;
  const offset_x = (e.center.x % (iframe.clientWidth - 8)) - iframe.clientLeft;

  if (offset_x < 0 || iframe.clientWidth < offset_x) {
    return;
  }

  if ((offset_x / iframe.clientWidth) < 0.25) {
    rendition.value?.prev()
  }

  if ((offset_x / iframe.clientWidth) > 0.75) {
    rendition.value?.next()
  }
}

function set_theme() {
  rendition.value.themes.register("light", {
    "body": {"background-color": "#fff", "color": "#000", "font-size": `${scale.value}em !important`}
  });
  rendition.value.themes.select("light");
}

onMounted(async () => {
  document.addEventListener("keyup", key_listener, {capture: true})
  await book.open(props.data);
  await book.ready;
  await book.locations.generate(1000);
  is_rendering.value = false;
  rendition.value = book.renderTo(
      "epub-reader", {
        flow: "paginated",
        method: "continuous",
        width: "100%",
        height: "100%",
        resizeOnOrientationChange: true,
        allowScriptedContent: true,
      });
  rendition.value?.on("locationChanged", (e) => {
    let anchor = undefined;
    if (e !== undefined) {
      anchor = e.start;
      progress.value = e.percentage;
    }
    emits('update-anchor', anchor);
  });
  rendition.value?.on("rendered", () => {
    const iframe = document?.querySelector('iframe')!;
    iframe.focus();
    const iframe_content_document = iframe.contentDocument;
    const hammer = new Hammer(iframe_content_document?.documentElement!, {
      touchAction: 'manipulation',
    });
    set_theme();
    hammer.get('swipe').set({ enable: false })
    hammer.get('pinch').set({ enable: false });
    hammer.get('rotate').set({ enable: false });
    hammer.get('pan').set({ enable: false });
    hammer.on('tap', on_tap);
    hammer.on('doubletap', (e) => e.preventDefault());
    iframe_content_document?.addEventListener("keyup", key_listener, {capture: true});
  });
  await rendition.value?.display(props.anchor);
  mounted = true
})
onBeforeUnmount(() => {
  if (mounted) {
    document.removeEventListener("keyup", key_listener, {capture: true});
    reader.value?.removeEventListener("keyup", key_listener, {capture: true});
  }
  mounted = false;
})
</script>
