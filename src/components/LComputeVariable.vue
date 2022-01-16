<script lang='ts'>
import { defineComponent, ref, watchEffect } from "vue"
import { LAYER_VARS } from '../data'
import { LayerCompute, useMapStore } from "../store/map"

export default defineComponent({
  props: {
    layerId: String,
    layerVarId: String
  },
  setup(props) {
    const map = useMapStore()
    let layer = map.layers[props.layerId] as LayerCompute
    let selectedValue = ref('')
    selectedValue.value = layer.layerVars[props.layerVarId].file


    return {
      LAYER_VARS, selectedValue, map, layer
    }
  }
})
</script>

<template>
  <p>{{ layerId }} {{ layerVarId }} {{ selectedValue }}</p>

  <!-- <select v-model="selectedValue">
    <option v-for="d in LAYER_VARS" :value="d.file" :key="d.file">{{ d.file.toLocaleUpperCase() }}</option>
  </select>
  <div v-if="layerVars.length > 1">
    <button @click="map.moveLayerVarUp($props.layerVarId)">Move up</button>
    <button @click="map.moveLayerVarDown($props.layerVarId)">Move down</button>
  </div>
  <input type="checkbox" @click="map.toggleVisibility($props.layerVarId)" /> Visible
  <button @click="map.removeLayerVar(layer, $props.layerVarId)">Delete</button>-->
</template>
