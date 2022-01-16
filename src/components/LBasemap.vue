<script lang='ts'>
import { defineComponent, reactive, ref, watchEffect } from "vue"
import { useMapStore } from "../store/map"
import ControlLayer from "./ControlLayer.vue"

export default defineComponent({
    components: { ControlLayer },
    props: { layerId: String },
    setup(props) {
        const map = useMapStore()
        const layer = map.layerById(props.layerId)

        const BASEMAPS = [{ 'label': 'B&W Mapnik', 'value': 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png' }, { 'label': 'Google Satellite', 'value': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }, { 'label': 'Google Hybrid', 'value': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }, { 'label': 'Stamen Toner', 'value': 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png' }]
        // layer.tileURL = ref('')
        layer.tileURL = BASEMAPS[Math.floor(Math.random() * BASEMAPS.length)].value

        return {
            BASEMAPS, map, layer
        }
    }
})
</script>
<template>
    <p>{{ $props.layerId }} {{ layer.tileURL }}</p>
    <h5>Basemap</h5>
    <select v-model="layer.tileURL">
        <option v-for="b in BASEMAPS" :value="b.value" :key="b.value">{{ b.label }}</option>
    </select>
    <ControlLayer v-bind="{ layerId }"></ControlLayer>
</template>
