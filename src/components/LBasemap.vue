<script lang='ts'>
import { defineComponent, reactive } from "vue"
// import LayerControls from "./LayerControls.vue"

export default defineComponent({
    // components: { LayerControls },
    setup() {

        const BASEMAPS = [{ 'label': 'None', 'value': '' }, { 'label': 'B&W Mapnik', 'value': 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png' }, { 'label': 'Google Satellite', 'value': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }, { 'label': 'Google Hybrid', 'value': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }, { 'label': 'Stamen Toner', 'value': 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png' }]
        const basemaps = reactive(BASEMAPS)
        return {
            layer: { type: 'l-basemap' } as Layer, basemaps
        }
    }
})
</script>

<template>
    <p>{{ layer.type }}</p>
    <h5>Basemap</h5>
    <select>
        <option v-for="b in basemaps">{{ b.label }}</option>
    </select>
    <!-- <LayerControls index="this.$parent.id"></LayerControls> -->
</template>
