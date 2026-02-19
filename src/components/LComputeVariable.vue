<script lang='ts'>
import { defineComponent, reactive, ref, watch, watchEffect } from "vue"
import { LAYER_VARS, createDebounce } from '../data'
import { LayerCompute, useMapStore } from "../store/map"

export default defineComponent({
  props: {
    layerId: String,
    layerVarId: String
  },
  setup(props) {
    const map = useMapStore()
    let layer = map.layerById(props.layerId) as LayerCompute
    let layerVar = map.layerVarById(props.layerId, props.layerVarId)

    watch(ref(layerVar.file), () => {
      map.updateLayerVar(props.layerId, props.layerVarId)
      // map.refreshComputeLayerTileURL(props.layerId)
    })

    return {
      LAYER_VARS, map, layer, layerVar, debounce: createDebounce()
      , stretchRange: [layer.stretchedRange.min, layer.stretchedRange.max]
    }
  }
})
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 0.8em; padding: 0.5em; background-color: #f9f9f9; border-radius: 4px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <small style="font-weight: bold; color: #555;">Variable: {{ layerVar.file }}</small>
      <button @click="map.removeLayerVar($props.layerId, $props.layerVarId)" style="padding: 0.2em 0.5em; font-size: 0.8em; color: #c33; border: 1px solid #ecc; background: #fff5f5; cursor: pointer;">&times;</button>
    </div>

    <select v-model="layerVar.file" style="padding: 0.3em; width: 100%;">
      <option v-for="d in LAYER_VARS" :value="d.file" :key="d.file">{{ d.file.toLocaleUpperCase() }}</option>
    </select>

    <div v-if="layer.layerVars.length > 1" style="display: flex; gap: 0.3em;">
      <button @click="map.moveLayerVarUp($props.layerId, $props.layerVarId)" style="flex: 1; font-size: 0.8em; padding: 0.2em;">&uarr;</button>
      <button @click="map.moveLayerVarDown($props.layerId, $props.layerVarId)" style="flex: 1; font-size: 0.8em; padding: 0.2em;">&darr;</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.3em; border-top: 1px solid #eee; padding-top: 0.5em;">
      <label style="font-size: 0.8em; color: #666; font-weight: bold;">Filter Range</label>
      <div style="display: flex; flex-direction: column; gap: 0.2em;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75em;">
          <span>Min: {{ layerVar.filteredRange.min.toFixed(2) }}</span>
          <input
            type="range"
            :min="layerVar.actualRange.min"
            :max="layerVar.actualRange.max"
            step="0.01"
            v-model.number="layerVar.filteredRange.min"
            style="width: 60%;"
          />
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75em;">
          <span>Max: {{ layerVar.filteredRange.max.toFixed(2) }}</span>
          <input
            type="range"
            :min="layerVar.actualRange.min"
            :max="layerVar.actualRange.max"
            step="0.01"
            v-model.number="layerVar.filteredRange.max"
            style="width: 60%;"
          />
        </div>
      </div>
    </div>

    <div v-if="layerVar.id === layer.layerVars[0].id" style="display: flex; flex-direction: column; gap: 0.3em; border-top: 1px solid #eee; padding-top: 0.5em;">
      <label style="font-size: 0.8em; color: #666; font-weight: bold;">Stretch Color</label>
      <div style="display: flex; flex-direction: column; gap: 0.2em;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75em;">
          <span>Min: {{ layer.stretchedRange.min.toFixed(2) }}</span>
          <input
            type="range"
            :min="layerVar.actualRange.min"
            :max="layerVar.actualRange.max"
            step="0.01"
            v-model.number="layer.stretchedRange.min"
            style="width: 60%;"
          />
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75em;">
          <span>Max: {{ layer.stretchedRange.max.toFixed(2) }}</span>
          <input
            type="range"
            :min="layerVar.actualRange.min"
            :max="layerVar.actualRange.max"
            step="0.01"
            v-model.number="layer.stretchedRange.max"
            style="width: 60%;"
          />
        </div>
      </div>
    </div>
    <div v-else style="display: flex; align-items: center; gap: 0.5em; border-top: 1px solid #eee; padding-top: 0.5em;">
      <input type="checkbox" v-model="layerVar.visible" :id="'var-vis-' + layerVar.id" />
      <label :for="'var-vis-' + layerVar.id" style="font-size: 0.85em;">Visible</label>
    </div>
  </div>
</template>

