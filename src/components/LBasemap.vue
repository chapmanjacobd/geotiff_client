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

        const BASEMAPS = [{ 'label': 'OpenStreetMap', 'value': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' }, { 'label': 'Google Satellite', 'value': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }, { 'label': 'Google Hybrid', 'value': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }, { 'label': 'Stamen Toner', 'value': 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png' }]
        layer.tileURL = BASEMAPS[Math.floor(Math.random() * BASEMAPS.length)].value

        return {
            BASEMAPS, map, layer
        }
    }
})
</script>
<template>
    <div style="display: flex; flex-direction: column; gap: 0.5em;">
        <div style="font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 0.5em; margin-bottom: 0.5em;">
            Basemap ({{ $props.layerId.substring(0,8) }}...)
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.2em;">
            <label style="font-size: 0.8em; color: #666;">Source</label>
            <select v-model="layer.tileURL" style="padding: 0.4em;">
                <option v-for="b in BASEMAPS" :value="b.value" :key="b.value">{{ b.label }}</option>
            </select>
        </div>
        <ControlLayer v-bind="{ layerId }"></ControlLayer>
    </div>
</template>
