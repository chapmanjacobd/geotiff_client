import { createApp } from "vue";
import App from "./App.vue";
import OpenLayersMap from "vue3-openlayers";
import "vue3-openlayers/dist/vue3-openlayers.css";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(OpenLayersMap);
app.use(createPinia());
app.mount("#app");
