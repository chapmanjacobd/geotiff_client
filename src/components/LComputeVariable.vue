<script lang='ts'>
import { defineComponent, ref } from "vue"
import { LAYER_VARS } from '../store'
import ControlLayerVar from "./ControlLayerVar.vue"

export default defineComponent({
  components: { ControlLayerVar },
  props: {
    layerId: Number,
    layerVarId: Number
  },
  setup() {
    let selectedValue = ref('')
    selectedValue.value = LAYER_VARS[Math.floor(Math.random() * LAYER_VARS.length)].file

    return {
      layer: { type: 'l-compute-variable' } as Layer, LAYER_VARS, selectedValue
    }
  }
})
</script>

<template>
  <p>{{ layer.type }} {{ layerId }} {{ layerVarId }} {{ selectedValue }}</p>
  <select v-model="selectedValue">
    <option v-for="d in LAYER_VARS" :value="d.file">{{ d.file.toLocaleUpperCase() }}</option>
  </select>
  <ControlLayerVar v-bind="{ layerId, layerVarId }"></ControlLayerVar>
</template>
