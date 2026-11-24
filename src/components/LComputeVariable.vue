<script lang="ts">
import { computed, defineComponent } from "vue";
import { stretchBounds } from "../ranges";
import { getOutputVar, useMapStore } from "../store/map";

export default defineComponent({
  props: {
    layerId: { type: String, required: true },
    layerVarId: { type: String, required: true },
  },
  setup(props) {
    const map = useMapStore();
    const layer = computed(() => map.computeLayerById(props.layerId));
    const layerVar = computed(() =>
      map.layerVarById(props.layerId, props.layerVarId)
    );
    const isOutput = computed(
      () => Boolean(layer.value) && getOutputVar(layer.value!)?.id === props.layerVarId
    );
    const datasetOptions = computed(() => {
      const currentLayer = layer.value;
      if (!currentLayer) return [];
      const output = getOutputVar(currentLayer);
      if (isOutput.value || !output) return map.datasets;
      return map.datasets.filter(
        (dataset) => dataset.someKeys === output.someKeys
      );
    });
    const isConstant = computed(
      () =>
        Boolean(layerVar.value) &&
        layerVar.value!.actualRange.max <= layerVar.value!.actualRange.min
    );
    const stretchLimits = computed(() =>
      layerVar.value
        ? stretchBounds(layerVar.value.actualRange)
        : { min: 0, max: 1 }
    );

    const formatValue = (value: number): string =>
      value.toLocaleString(undefined, { maximumFractionDigits: 4 });

    const onDatasetChange = (event: Event) => {
      const value = (event.target as HTMLSelectElement).value;
      void map.setLayerVarDataset(props.layerId, props.layerVarId, value);
    };
    const onFilterMin = (event: Event) => {
      map.setFilteredMin(
        props.layerId,
        props.layerVarId,
        Number((event.target as HTMLInputElement).value)
      );
    };
    const onFilterMax = (event: Event) => {
      map.setFilteredMax(
        props.layerId,
        props.layerVarId,
        Number((event.target as HTMLInputElement).value)
      );
    };
    const onStretchMin = (event: Event) => {
      map.setStretchMin(
        props.layerId,
        Number((event.target as HTMLInputElement).value)
      );
    };
    const onStretchMax = (event: Event) => {
      map.setStretchMax(
        props.layerId,
        Number((event.target as HTMLInputElement).value)
      );
    };
    const onVisibilityChange = (event: Event) => {
      map.setLayerVarVisibility(
        props.layerId,
        props.layerVarId,
        (event.target as HTMLInputElement).checked
      );
    };

    return {
      map,
      layer,
      layerVar,
      isOutput,
      isConstant,
      stretchLimits,
      datasetOptions,
      formatValue,
      onDatasetChange,
      onFilterMin,
      onFilterMax,
      onStretchMin,
      onStretchMax,
      onVisibilityChange,
    };
  },
});
</script>

<template>
  <div
    v-if="layer && layerVar"
    style="
      display: flex;
      flex-direction: column;
      gap: 0.8em;
      padding: 0.5em;
      background-color: #f9f9f9;
      border-radius: 4px;
    "
  >
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5em;
      "
    >
      <div style="display: flex; align-items: center; gap: 0.4em; min-width: 0">
        <small
          style="
            font-weight: bold;
            color: #555;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          "
          :title="layerVar.label"
        >
          {{ layerVar.label }}
        </small>
        <span v-if="isOutput" class="role-badge output-badge">output</span>
        <span v-else class="role-badge mask-badge">mask</span>
      </div>
      <button
        type="button"
        title="Remove variable"
        style="
          padding: 0.2em 0.5em;
          font-size: 0.8em;
          color: #c33;
          border: 1px solid #ecc;
          background: #fff5f5;
          cursor: pointer;
        "
        @click="map.removeLayerVar(layerId, layerVarId)"
      >
        ×
      </button>
    </div>

    <select
      :value="layerVar.datasetId"
      :disabled="layerVar.loading"
      style="padding: 0.3em; width: 100%"
      @change="onDatasetChange"
    >
      <option
        v-for="dataset in datasetOptions"
        :key="dataset.datasetId"
        :value="dataset.datasetId"
      >
        {{ dataset.label }}
      </option>
    </select>

    <div v-if="layerVar.loading" class="status-text">
      Loading range from server…
    </div>
    <div v-else-if="layerVar.error" class="status-text error-text">
      Range unavailable: {{ layerVar.error }}
    </div>

    <div v-if="layer.layerVars.length > 1" style="display: flex; gap: 0.3em">
      <button
        type="button"
        :disabled="!map.canMoveLayerVarUp(layerId, layerVarId)"
        title="Move up in the list"
        style="flex: 1; font-size: 0.8em; padding: 0.2em"
        @click="map.moveLayerVarUp(layerId, layerVarId)"
      >
        ↑
      </button>
      <button
        type="button"
        :disabled="!map.canMoveLayerVarDown(layerId, layerVarId)"
        title="Move down in the list"
        style="flex: 1; font-size: 0.8em; padding: 0.2em"
        @click="map.moveLayerVarDown(layerId, layerVarId)"
      >
        ↓
      </button>
    </div>

    <div
      style="
        display: flex;
        flex-direction: column;
        gap: 0.3em;
        border-top: 1px solid #eee;
        padding-top: 0.5em;
      "
    >
      <label style="font-size: 0.8em; color: #666; font-weight: bold">
        Filter range
      </label>
      <div
        v-if="isConstant"
        class="status-text"
      >
        This dataset is constant, so filtering has no effect.
      </div>
      <div
        v-else
        style="display: flex; flex-direction: column; gap: 0.2em"
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            font-size: 0.75em;
          "
        >
          <span>Min: {{ formatValue(layerVar.filteredRange.min) }}</span>
          <input
            type="range"
            :min="layerVar.actualRange.min"
            :max="layerVar.actualRange.max"
            step="any"
            :value="layerVar.filteredRange.min"
            :disabled="layerVar.loading"
            style="width: 60%"
            @input="onFilterMin"
          />
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            font-size: 0.75em;
          "
        >
          <span>Max: {{ formatValue(layerVar.filteredRange.max) }}</span>
          <input
            type="range"
            :min="layerVar.actualRange.min"
            :max="layerVar.actualRange.max"
            step="any"
            :value="layerVar.filteredRange.max"
            :disabled="layerVar.loading"
            style="width: 60%"
            @input="onFilterMax"
          />
        </div>
      </div>
    </div>

    <div
      v-if="isOutput"
      style="
        display: flex;
        flex-direction: column;
        gap: 0.3em;
        border-top: 1px solid #eee;
        padding-top: 0.5em;
      "
    >
      <label style="font-size: 0.8em; color: #666; font-weight: bold">
        Color stretch (output)
      </label>
      <div
        style="display: flex; flex-direction: column; gap: 0.2em"
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            font-size: 0.75em;
          "
        >
          <span>Min: {{ formatValue(layer.stretchedRange.min) }}</span>
          <input
            type="range"
            :min="stretchLimits.min"
            :max="stretchLimits.max"
            step="any"
            :value="layer.stretchedRange.min"
            :disabled="layerVar.loading"
            style="width: 60%"
            @input="onStretchMin"
          />
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            font-size: 0.75em;
          "
        >
          <span>Max: {{ formatValue(layer.stretchedRange.max) }}</span>
          <input
            type="range"
            :min="stretchLimits.min"
            :max="stretchLimits.max"
            step="any"
            :value="layer.stretchedRange.max"
            :disabled="layerVar.loading"
            style="width: 60%"
            @input="onStretchMax"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      style="
        display: flex;
        align-items: center;
        gap: 0.5em;
        border-top: 1px solid #eee;
        padding-top: 0.5em;
      "
    >
      <input
        :id="'var-vis-' + layerVar.id"
        type="checkbox"
        :checked="layerVar.visible"
        @change="onVisibilityChange"
      />
      <label :for="'var-vis-' + layerVar.id" style="font-size: 0.85em">
        Include in mask
      </label>
    </div>
  </div>
</template>

<style scoped>
.role-badge {
  font-size: 0.65em;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.1em 0.35em;
  border-radius: 999px;
  flex-shrink: 0;
}

.output-badge {
  background: #dbeafe;
  color: #1d4ed8;
}

.mask-badge {
  background: #ede9fe;
  color: #6d28d9;
}

.status-text {
  font-size: 0.75em;
  color: #666;
}

.error-text {
  color: #b91c1c;
}
</style>
