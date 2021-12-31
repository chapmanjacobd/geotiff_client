<script lang='ts'>
import { computed, defineComponent, ref } from "vue"
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
    let layerVar = layer.layerVars[props.layerVarId]
    let selectedValue = ref('')
    selectedValue.value = layerVar.file

    layerVar = LAYER_VARS.find(lv => lv.file === selectedValue.value)[0]

    appState.layers[props.layerId].tileURL = computed(function () {
      return computeQueryParams(layer)
    }).value

    return {
      LAYER_VARS, selectedValue, appState, computeQueryParams, layer
    }
  }
})
</script>

<template>
  <p>{{ layerId }} {{ layerVarId }} {{ selectedValue }}</p>

  <select
    v-model="selectedValue"
    @change="layer.layerVars[$props.layerVarId] = LAYER_VARS.find((x) => (x.file === selectedValue))[0]"
  >
    <option v-for="d in LAYER_VARS" :value="d.file" :key="d.file">{{ d.file.toLocaleUpperCase() }}</option>
  </select>
  <ControlLayerVar v-bind="{ layerId, layerVarId }"></ControlLayerVar>
</template>
