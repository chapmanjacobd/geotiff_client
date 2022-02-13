import { createApp } from "vue";
import App from "./App.vue";
import OpenLayersMap from "vue3-openlayers";
import "vue3-openlayers/dist/vue3-openlayers.css";
import { createPinia } from "pinia";
import BalmUI from "balm-ui"; // Official Google Material Components
import BalmUIPlus from "balm-ui-plus"; // BalmJS Team Material Components
import "balm-ui-css";

const app = createApp(App);
app.use(OpenLayersMap);
app.use(createPinia());

app.use(BalmUI);
app.use(BalmUIPlus);
app.mount("#app");
