import { createApp } from 'vue'
import './assets/css/main.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'
import router from "./router.ts";


registerSW({ immediate: true })

const app = createApp(App);
app.use(router)
app.mount('#app')
