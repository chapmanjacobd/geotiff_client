<script lang='ts'>
import { defineComponent, ref, watchEffect } from "vue"
import { LAYER_VARS } from '../store'
import ControlLayerVar from "./ControlLayerVar.vue"
import { computeQueryParams } from "../utils";
import { appState } from '../store';

export default defineComponent({
  components: { ControlLayerVar },
  props: {
    layerId: Number,
    layerVarId: Number
  },
  setup(props) {
    let layer = appState.layers[props.layerId] as LayerCompute
    let selectedValue = ref('')
    selectedValue.value = layer.layerVars[props.layerVarId].file

    // layer.layerVars[props.layerVarId] = LAYER_VARS.find(lv => lv.file === selectedValue.value)[0]

    watchEffect(() => {
      // layer.layerVars[props.layerVarId] = LAYER_VARS.find((x) => (x.file === selectedValue.value))[0]
      layer.tileURL = computeQueryParams(layer)
    })

    return {
      LAYER_VARS, selectedValue
    }
  }
})
</script>

<template>
  <p>{{ layerId }} {{ layerVarId }} {{ selectedValue }}</p>

  <select v-model="selectedValue">
    <option v-for="d in LAYER_VARS" :value="d.file" :key="d.file">{{ d.file.toLocaleUpperCase() }}</option>
  </select>
  <ControlLayerVar v-bind="{ layerId, layerVarId }"></ControlLayerVar>
</template>
