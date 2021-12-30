<script lang='ts'>
// import LCompute from "./LCompute.vue";
import LBasemap from "./LBasemap.vue";
import { defineComponent } from "vue"

export default defineComponent({
  components: { //'l-compute': LCompute,
    'l-basemap': LBasemap
  },
  setup() {
    let layers = [] as Layer[]
    let count = 0

    const addComponent = function (type) {
      layers.push({
        id: count++,
        'type': type,
        label: 'New layer',
        URL: '',
        opacity: 0.8
      });
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

    <div style="padding: 1em;">
      <component v-for="field in layers" v-bind:is="field.type" :key="field.id"></component>

      <!-- <button type="button" v-on:click="addComponent('l-compute')">Add Compute Layer</button> -->
      <button type="button" v-on:click="addComponent('l-basemap')">Add Basemap Layer</button>
    </div>
  </div>
</template>


