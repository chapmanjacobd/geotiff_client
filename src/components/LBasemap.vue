<script lang='ts'>
import { defineComponent, reactive, ref } from "vue"
import ControlLayer from "./ControlLayer.vue"
import { appState } from "../store"

export default defineComponent({
    components: { ControlLayer },
    props: { layerId: Number },
    setup(props) {

        const BASEMAPS = [{ 'label': 'B&W Mapnik', 'value': 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png' }, { 'label': 'Google Satellite', 'value': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }, { 'label': 'Google Hybrid', 'value': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }, { 'label': 'Stamen Toner', 'value': 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png' }]
        let selectedValue = ref('');
        selectedValue.value = BASEMAPS[Math.floor(Math.random() * BASEMAPS.length)].value

        return {
            layer: { type: 'l-basemap' } as Layer, BASEMAPS, selectedValue, appState
        }
    }
})
</script>

<template>
    <p>{{ layer.type }} - {{ $props.layerId }} {{ selectedValue }}</p>
    <h5>Basemap</h5>
    <select
        v-model="selectedValue"
        @change="appState.layers[$props.layerId].tileURL = selectedValue"
    >
        <option v-for="b in BASEMAPS" :value="b.value" :key="b.value">{{ b.label }}</option>
    </select>
    <ControlLayer v-bind="{ layerId }"></ControlLayer>
</template>
