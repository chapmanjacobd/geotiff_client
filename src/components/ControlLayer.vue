<script lang="ts">
import { computed, defineComponent } from "vue";
import { useMapStore } from "../store/map";

export default defineComponent({
  props: {
    layerId: { type: String, required: true },
  },
  setup(props) {
    const map = useMapStore();
    const layer = computed(() => map.layerById(props.layerId));
    return { map, layer };
  },
});
</script>

<template>
  <div
    v-if="layer"
    style="
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      margin-top: 0.5em;
      padding-top: 0.5em;
      border-top: 1px dashed #eee;
    "
  >
    <div v-if="map.layers.length > 1" style="display: flex; gap: 0.5em">
      <button
        v-if="map.canMoveLayerForward(layerId)"
        type="button"
        title="Move this layer up in the sidebar (higher on the map)"
        @click="map.moveLayerForward(layerId)"
        style="flex: 1; padding: 0.3em"
      >
        Bring forward
      </button>
      <button
        v-if="map.canMoveLayerBackward(layerId)"
        type="button"
        title="Move this layer down in the sidebar (lower on the map)"
        @click="map.moveLayerBackward(layerId)"
        style="flex: 1; padding: 0.3em"
      >
        Send backward
      </button>
    </div>

    <div style="display: flex; align-items: center; gap: 0.5em">
      <input
        :id="'vis-' + layer.id"
        v-model="layer.visible"
        type="checkbox"
      />
      <label :for="'vis-' + layer.id" style="font-size: 0.9em">Visible</label>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.1em">
      <label style="font-size: 0.8em; color: #666">
        Opacity: {{ Math.round(layer.opacity * 100) }}%
      </label>
      <input
        v-model.number="layer.opacity"
        type="range"
        min="0"
        max="1"
        step="0.01"
        style="width: 100%"
      />
    </div>

    <button
      type="button"
      @click="map.removeLayer(layerId)"
      style="
        margin-top: 0.5em;
        padding: 0.4em;
        background-color: #fee;
        border: 1px solid #fcc;
        color: #933;
        cursor: pointer;
      "
    >
      Delete layer
    </button>
  </div>
</template>
