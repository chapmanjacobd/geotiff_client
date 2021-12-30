<script lang='ts'>
import { defineComponent, reactive, ref } from "vue"
import ControlLayer from "./ControlLayer.vue"

export default defineComponent({
    components: { ControlLayer },
    props: { id: Number },
    setup() {
        const BASEMAPS = [{ 'label': 'B&W Mapnik', 'value': 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png' }, { 'label': 'Google Satellite', 'value': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }, { 'label': 'Google Hybrid', 'value': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }, { 'label': 'Stamen Toner', 'value': 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png' }]
        let selectedValue = ref('');
        selectedValue.value = BASEMAPS[Math.floor(Math.random() * BASEMAPS.length)].value

        return {
            layer: { type: 'l-basemap' } as Layer, BASEMAPS, selectedValue
        }
    }
})
</script>

<template>
    <p>{{ layer.type }} - {{ $props.id }} {{ selectedValue }}</p>
    <h5>Basemap</h5>
    <select v-model="selectedValue">
        <option v-for="b in BASEMAPS" :value="b.value">{{ b.label }}</option>
    </select>
    <ControlLayer v-bind="{ id }"></ControlLayer>
</template>
