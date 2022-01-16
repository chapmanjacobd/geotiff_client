<script lang='ts'>
import { defineComponent, ref, watch, watchEffect } from "vue"
import { LAYER_VARS } from '../data'
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

    watch(layerVar, () => {
      map.updateLayerVar(props.layerId, props.layerVarId)
      map.refreshComputeLayerTileURL(props.layerId)
    })

    return {
      LAYER_VARS, map, layer, layerVar
    }
  }
})
</script>

<template>
  <p>{{ layerVarId }} {{ layerVar.file }}</p>

  <select v-model="layerVar.file">
    <option v-for="d in LAYER_VARS" :value="d.file" :key="d.file">{{ d.file.toLocaleUpperCase() }}</option>
  </select>
  <!-- <div v-if="layerVars.length > 1">
    <button @click="map.moveLayerVarUp($props.layerVarId)">Move up</button>
    <button @click="map.moveLayerVarDown($props.layerVarId)">Move down</button>
  </div>
  <input type="checkbox" @click="map.toggleVisibility($props.layerVarId)" /> Visible
  <button @click="map.removeLayerVar(layer, $props.layerVarId)">Delete</button>-->
</template>
