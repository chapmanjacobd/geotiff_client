<script lang='ts'>
import LComputeVariable from "./LComputeVariable.vue";
import LayerControls from "./ControlLayer.vue";
import { computed, defineComponent, reactive, ref, watch, watchEffect } from "vue"
import { COLORSCALES, createDebounce } from '../data'
import { computeQueryParams, LayerCompute, useMapStore } from "../store/map";


export default defineComponent({
    components: { "l-compute-variable": LComputeVariable, LayerControls },
    props: { layerId: String },
    setup(props) {
        const map = useMapStore()
        const layer = map.layerById(props.layerId) as LayerCompute

        watch(reactive(layer.layerVars), () => {
            if (layer.layerVars.length === 0) return;
            const topLayerVar = layer.layerVars[0];
            layer.stretchedRange = { min: topLayerVar.actualRange.min, max: topLayerVar.actualRange.max };
        })

        watch(reactive([layer.stretchedRange, layer.colorScale, layer.opacity, layer.visible, ...layer.layerVars]), () => {
            computeQueryParams(layer);
        })

        return { layer, map, COLORSCALES, debounce: createDebounce() }
    },
})

</script>

<template>
    <div
        style="
    background-color: burlywood;
    padding: 0.8em;
    line-height: 1em;
    margin: 0.2em;
    display: inline-flex;
    flex-direction: column;"
    >
        <small>compute layer {{ $props.layerId }}</small>
        <small>{{ layer.layerVars.length }} variables</small>

        <label>Colorscale</label>
        <select v-model="layer.colorScale">
            <option v-for="label in COLORSCALES" :key="label" :value="label">{{ label }}</option>
        </select>
        <div>
            <label>Stretch first variable color</label>
            <input
                type="range"
                :min="layer.stretchedRange.min"
                :max="layer.stretchedRange.max"
                step="0.01"
                :value="layer.stretchedRange.min"
                @update:value="debounce(() => { layer.stretchedRange.min = Number(($event.target as HTMLInputElement).value) })"
            />
        </div>
        <LayerControls v-bind="{ layerId: $props.layerId }"></LayerControls>

        <component
            v-for="layerVar in layer.layerVars"
            :is="layerVar.type"
            :key="layerVar.id"
            v-bind="{ layerId: layerId, layerVarId: layerVar.id }"
        ></component>
        <button type="button" v-on:click="map.addLayerVar($props.layerId)">Add Compute Variable</button>
    </div>
</template>

