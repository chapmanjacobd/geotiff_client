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
    }
  }
})
</script>

<template>
  <small>variable {{ layerVar.file }}</small>

  <select v-model="layerVar.file">
    <option v-for="d in LAYER_VARS" :value="d.file" :key="d.file">{{ d.file.toLocaleUpperCase() }}</option>
  </select>
  <div v-if="layer.layerVars.length > 1">
    <button @click="map.moveLayerVarUp($props.layerId, $props.layerVarId)">Move up</button>
    <button @click="map.moveLayerVarDown($props.layerId, $props.layerVarId)">Move down</button>
  </div>
  <div v-if="layerVar.id === layer.layerVars[0].id">
    <label>Filter range</label>
    <input
      type="range"
      :min="layerVar.filteredRange.min"
      :max="layerVar.filteredRange.max"
      step="0.01"
      :value="layerVar.filteredRange.min"
      @update:value="debounce(() => { layerVar.filteredRange.min = Number(($event.target as HTMLInputElement).value) })"
    />
  </div>
  <div v-else>
    <label>Variable visibility</label>
    <input type="checkbox" :checked="layerVar.visible" />
  </div>
  <button @click="map.removeLayerVar($props.layerId, $props.layerVarId)">Delete Variable</button>
</template>

