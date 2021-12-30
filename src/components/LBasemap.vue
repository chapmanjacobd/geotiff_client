<script lang='ts'>
import { defineComponent, reactive } from "vue"
import ControlLayer from "./ControlLayer.vue"

export default defineComponent({
    components: { ControlLayer },
    props: { id: Number },
    setup() {
        const BASEMAPS = [{ 'label': 'None', 'value': '' }, { 'label': 'B&W Mapnik', 'value': 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png' }, { 'label': 'Google Satellite', 'value': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }, { 'label': 'Google Hybrid', 'value': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }, { 'label': 'Stamen Toner', 'value': 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png' }]
        return {
            layer: { type: 'l-basemap' } as Layer, BASEMAPS
        }
    }
})
</script>

<template>
    <p>{{ layer.type }} - {{ $props.id }}</p>
    <h5>Basemap</h5>
    <select>
        <option v-for="b in BASEMAPS">{{ b.label }}</option>
    </select>
    <ControlLayer v-bind="{ id }"></ControlLayer>
</template>
