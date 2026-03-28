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

        watch(layer.layerVars, () => {
            if (layer.layerVars.length === 0) return;
            const topLayerVar = layer.layerVars[0];
            layer.stretchedRange = { min: topLayerVar.actualRange.min, max: topLayerVar.actualRange.max };
        }, { deep: true })

        watch(layer, () => {
            computeQueryParams(layer);
        }, { deep: true })

        return { layer, map, COLORSCALES, debounce: createDebounce() }
    },
})

</script>

<template>
    <div
        style="
    display: flex;
    flex-direction: column;
    gap: 0.5em;"
    >
        <div style="font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 0.5em; margin-bottom: 0.5em;">
            Compute Layer ({{ $props.layerId.substring(0,8) }}...)
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.2em;">
            <label style="font-size: 0.8em; color: #666;">Colorscale</label>
            <select v-model="layer.colorScale" style="padding: 0.4em;">
                <option v-for="label in COLORSCALES" :key="label" :value="label">{{ label }}</option>
            </select>
        </div>

        <LayerControls v-bind="{ layerId: $props.layerId }"></LayerControls>

        <div style="margin-top: 1em; display: flex; flex-direction: column; gap: 1em;">
            <div
                v-for="layerVar in layer.layerVars"
                :key="layerVar.id"
                style="border-left: 2px solid #ccc; padding-left: 0.5em;"
            >
                <component
                    :is="layerVar.type"
                    v-bind="{ layerId: layerId, layerVarId: layerVar.id }"
                ></component>
            </div>
        </div>

        <button
            type="button"
            v-on:click="map.addLayerVar($props.layerId)"
            style="margin-top: 0.5em; padding: 0.5em; cursor: pointer;"
        >
            Add Compute Variable
        </button>
    </div>
</template>

