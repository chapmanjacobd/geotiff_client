<script lang="ts">
import { computed, defineComponent } from "vue";
import { BASEMAPS } from "../basemaps";
import { useMapStore } from "../store/map";
import ControlLayer from "./ControlLayer.vue";

export default defineComponent({
  components: { ControlLayer },
  props: {
    layerId: { type: String, required: true },
  },
  setup(props) {
    const map = useMapStore();
    const layer = computed(() => map.basemapById(props.layerId));

    const onSourceChange = (event: Event) => {
      const value = (event.target as HTMLSelectElement).value;
      map.setBasemap(props.layerId, value);
    };

    return { BASEMAPS, map, layer, onSourceChange };
  },
});
</script>

<template>
  <div v-if="layer" style="display: flex; flex-direction: column; gap: 0.5em">
    <div
      style="
        font-weight: bold;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5em;
        margin-bottom: 0.5em;
      "
    >
      Basemap ({{ layer.id.substring(0, 8) }}...)
    </div>
    <div style="display: flex; flex-direction: column; gap: 0.2em">
      <label style="font-size: 0.8em; color: #666">Source</label>
      <select
        :value="layer.tileURL"
        style="padding: 0.4em"
        @change="onSourceChange"
      >
        <option v-for="basemap in BASEMAPS" :key="basemap.url" :value="basemap.url">
          {{ basemap.label }}
        </option>
      </select>
    </div>
    <ControlLayer :layer-id="layerId" />
  </div>
</template>
