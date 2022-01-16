<script lang='ts'>
import LComputeVariable from "./LComputeVariable.vue";
import LayerControls from "./ControlLayer.vue";
import { computed, defineComponent, watchEffect } from "vue"
import { COLORSCALES } from '../data'
import { LayerCompute, useMapStore } from "../store/map";


export default defineComponent({
    components: { "l-compute-variable": LComputeVariable, LayerControls },
    props: { layerId: String },
    setup(props) {

        const map = useMapStore()
        const layer = map.layerById(props.layerId) as LayerCompute

        return { layer, map, COLORSCALES }
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
        <h3>{{ $props.layerId }} {{ layer.layerVars.length }}</h3>
        <component
            v-for="layerVar in layer.layerVars.filter(Boolean)"
            :is="layerVar.type"
            :key="`${layerVar.id}${layerVar.file}`"
            v-bind="{ layerId: layerId, layerVarId: layerVar.id }"
        ></component>
        <button type="button" v-on:click="map.addLayerVar(layer)">Add Compute Variable</button>
        <h5>Colorscale</h5>
        <select>
            <option v-for="label in COLORSCALES" :key="label" :value="label">{{ label }}</option>
        </select>
        <LayerControls v-bind="{ layerId }"></LayerControls>
    </div>
</template>

