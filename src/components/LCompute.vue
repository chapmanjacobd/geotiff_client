<script lang="ts">
import { computed, defineComponent } from "vue";
import { COLORSCALES } from "../colormaps";
import { MAX_LAYER_VARS, useMapStore } from "../store/map";
import ControlLayer from "./ControlLayer.vue";
import LComputeVariable from "./LComputeVariable.vue";

export default defineComponent({
  components: {
    "l-compute-variable": LComputeVariable,
    LayerControls: ControlLayer,
  },
  props: {
    layerId: { type: String, required: true },
  },
  setup(props) {
    const map = useMapStore();
    const layer = computed(() => map.computeLayerById(props.layerId));

    const onColorScaleChange = (event: Event) => {
      const value = (event.target as HTMLSelectElement).value;
      map.setColorScale(props.layerId, value);
    };

    return {
      MAX_LAYER_VARS,
      COLORSCALES,
      layer,
      map,
      onColorScaleChange,
    };
  },
});
</script>

<template>
  <div
    v-if="layer"
    style="display: flex; flex-direction: column; gap: 0.5em"
  >
    <div
      style="
        font-weight: bold;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5em;
        margin-bottom: 0.5em;
      "
    >
      Compute Layer ({{ layer.id.substring(0, 8) }}...)
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.2em">
      <label style="font-size: 0.8em; color: #666">Colorscale</label>
      <select
        :value="layer.colorScale"
        style="padding: 0.4em"
        @change="onColorScaleChange"
      >
        <option v-for="label in COLORSCALES" :key="label" :value="label">
          {{ label }}
        </option>
      </select>
    </div>

    <LayerControls :layer-id="layerId" />

    <p class="compute-help">
      The first variable is the output raster. Additional variables only
      restrict which output pixels are valid; use “Include in mask” to toggle
      each extra variable.
    </p>

    <div
      style="
        margin-top: 1em;
        display: flex;
        flex-direction: column;
        gap: 1em;
      "
    >
      <div
        v-for="layerVar in layer.layerVars"
        :key="layerVar.id"
        style="border-left: 2px solid #ccc; padding-left: 0.5em"
      >
        <component
          :is="layerVar.type"
          :layer-id="layerId"
          :layer-var-id="layerVar.id"
        />
      </div>
    </div>

    <button
      type="button"
      :disabled="
        map.catalogLoading ||
        layer.layerVars.length >= MAX_LAYER_VARS ||
        !map.hasDatasets
      "
      style="margin-top: 0.5em; padding: 0.5em; cursor: pointer"
      @click="map.addLayerVar(layerId)"
    >
      Add Compute Variable ({{ layer.layerVars.length }}/{{ MAX_LAYER_VARS }})
    </button>
  </div>
</template>

<style scoped>
.compute-help {
  margin: 0;
  font-size: 0.75em;
  color: #666;
  line-height: 1.35;
}
</style>
