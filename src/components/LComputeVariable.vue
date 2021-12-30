<script lang='ts'>
import { defineComponent } from "vue"
import { LAYER_VARS } from '../store'

export default defineComponent({
  components: {},
  setup() {
    return {
      layer: { type: 'l-compute-variable' } as Layer, LAYER_VARS
    }
  }
})
</script>

<template>
  <p>{{ layer.type }}</p>

  <h5>Map to add</h5>
  <select>
    <option v-for="d in LAYER_VARS">{{ d.toLocaleUpperCase() }}</option>
  </select>
</template>
