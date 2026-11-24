import { createApp } from "vue";
import App from "./App.vue";
import "ol/ol.css";
import "vue3-openlayers/vue3-openlayers.css";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
