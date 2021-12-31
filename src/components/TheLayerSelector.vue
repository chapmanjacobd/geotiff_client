<script lang='ts'>
import LCompute from "./LCompute.vue";
import LBasemap from "./LBasemap.vue";
import { defineComponent, onUpdated } from "vue"
import { appState } from "../store";

export default defineComponent({
  components: {
    'l-compute': LCompute,
    'l-basemap': LBasemap
  },
  setup() {
    let count = 0
    let layers = appState.layers

    const addComponent = function (type) {
      const defaultLayer: Layer = {
        id: count++,
        'type': type,
        label: 'New layer',
        tileURL: '',
        opacity: 0.8,
      }
      if (type == 'l-basemap')
        layers.push(defaultLayer);
      const defaultLayerCompute: LayerCompute = {
        ...defaultLayer,
        layerVars: [], layerVarsExpression: '', colorScale: '', stretchedRange: { min: 0, max: 1 }
      }
      if (type == 'l-compute')
        layers.push(defaultLayerCompute);
    }


    return { addComponent, layers }
  },
})
</script>

<template>
  <div style="position: absolute;z-index: 9999;background-color: blanchedalmond;">
    <div style="display: inline-flex;">
      <a href="https://unli.xyz/">
        <img src="https://unli.xyz/unli.png" alt="UNLI" width="60" height="60" />
      </a>
      <a href="./">
        <img src="../assets/logo.png" alt="UNLI city window" width="60" height="60" />
      </a>
    </div>

    <div style="padding: 1em;
display: flex;
flex-direction: column;
width: 20em;
">
      <component
        v-for="layer in layers"
        :key="layer.id"
        :is="layer.type"
        v-bind="{ layerId: layer.id }"
      ></component>

      <button type="button" v-on:click="addComponent('l-basemap')">Add Basemap Layer</button>
      <button type="button" v-on:click="addComponent('l-compute')">Add Compute Layer</button>
    </div>
  </div>
</template>
