import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "ol/ol.css";
import "vue3-openlayers/vue3-openlayers.css";
import "ol-contextmenu/dist/ol-contextmenu.css";
import "./style.css";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
