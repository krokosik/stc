<template>
  <div ref="wrapper">
    <div class="relative rounded-lg border custom-border-color pt-2 min-h-[calc(100vh-76px)] mx-1 mb-1">
      <h2 class="absolute flex top-0 left-1/2 transform -translate-x-1/2 invisible sm:visible -translate-y-1/3 md:-translate-y-1/2">
        <span class="custom-bg-main px-2 text-xs md:text-sm font-medium">{{ title }} {{ current_page }} / {{
            total_pages
          }}</span>
      </h2>
      <div class="flex flex-col">
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
            <button type="button" @click.stop.prevent="previous_page"
                    class="px-5 text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
              &lt;
            </button>
            <button type="button" @click.stop.prevent="next_page"
                    class="px-5 text-md font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
              &gt;
            </button>
          </div>
        </div>
        <canvas class="p-1 w-full min-h-[calc(100vh-108px)] m-auto rounded" id="djvu-reader" ref="reader"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {toRaw, ref, Ref, onMounted, onBeforeUnmount} from 'vue'

import router from "@/router";
import DjVu from "@/components/djvu.js";
import Hammer from "hammerjs";

const emits = defineEmits(["update-anchor"])
const props = defineProps(["anchor", "data", "filename", "title"])

const reader: Ref<HTMLCanvasElement | undefined> = ref();
const hammer: Ref<Hammer | undefined> = ref();

const scale_max = 1.5
const scale_min = 0.5
const scale = ref(1.0);

const current_page = ref(1);
let mounted = false;

if (props.anchor !== undefined) {
  current_page.value = Number.parseInt(props.anchor);
}

let worker = new DjVu.Worker();
await toRaw(worker).createDocument(props.data, undefined);
const total_pages = await toRaw(worker).doc.getPagesQuantity().run();

async function render(old_page: number | undefined = undefined) {
  try {
    const resultImageData = await toRaw(worker).doc.getPage(current_page.value).getImageData().run();
    reader.value!.width = resultImageData.width;
    reader.value!.height = resultImageData.height;
    reader.value!.style.width = `${100 * scale.value}%`
    reader.value!.style.minWidth = `${100 * scale.value}%`
    const context = reader.value!.getContext('2d')!;
    context.putImageData(resultImageData, 0, 0);
    emits("update-anchor", current_page.value.toString())
  } catch {
    if (old_page !== undefined) {
      current_page.value = old_page;
    }
  }
}

function on_tap(e) {
  const div = document?.querySelector('#djvu-reader')!;
  const offset_x = (e.center.x % (div.clientWidth - 8)) - div.clientLeft;

  if (offset_x < 0 || div.clientWidth < offset_x) {
    return;
  }

  if ((offset_x / div.clientWidth) < 0.25) {
    previous_page();
  }

  if ((offset_x / div.clientWidth) > 0.75) {
    next_page();
  }
}

function zoom_in() {
  scale.value += 0.1;
  render(current_page.value)
}

function zoom_out() {
  scale.value -= 0.1;
  render(current_page.value)
}

function previous_page() {
  const old_page = current_page.value;
  current_page.value -= 1;
  render(old_page);
}

function next_page() {
  const old_page = current_page.value;
  current_page.value += 1;
  render(old_page);
}

function key_listener(event: KeyboardEvent) {
  event.preventDefault();
  if (event.key == "ArrowLeft") {
    previous_page()
  } else if (event.key == "ArrowRight") {
    next_page()
  } else if (event.key === "Escape") {
    router.back();
    return;
  }
}

onMounted(async () => {
  hammer.value = Hammer(reader.value, {touchAction: 'manipulation'});
  document.addEventListener("keyup", key_listener);
  hammer.value.get('swipe').set({ enable: false })
  hammer.value.get('pinch').set({ enable: false });
  hammer.value.get('rotate').set({ enable: false });
  hammer.value.get('pan').set({ enable: false });
  hammer.value.on('tap', on_tap);
  hammer.value.on('doubletap', (e) => e.preventDefault());
  await render(undefined);
  mounted = true
})

onBeforeUnmount(() => {
  if (mounted) {
    document.removeEventListener("keyup", key_listener, {capture: true});
    hammer.value?.off("tap");
  }
  mounted = false;
})
</script>
