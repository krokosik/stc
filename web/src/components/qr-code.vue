<template>
  <div id="qr-code" class="favicon-inversion-filter text-center" />
</template>

<script lang="ts">
import QrCreator from 'qr-creator'
import { onMounted } from 'vue'

const props = defineProps({
  url: String,
});

onMounted(() => {
  QrCreator.render(
      {
        text: props.url,
        radius: 0.5, // 0.0 to 0.5
        ecLevel: 'H', // L, M, Q, H
        fill: '#000000', // foreground color
        background: null, // color or null for transparent
        size: 280 // in pixels
      },
      document.querySelector('#qr-code')!
    )
})
</script>
