<script lang='ts'>
import LComputeVariable from "./LComputeVariable.vue";
import LayerControls from "./ControlLayer.vue";
import { computed, defineComponent, watchEffect } from "vue"
import { LAYER_VARS, appState, getRandomLayerVar } from "../store";
import { computeQueryParams } from "../utils";


export default defineComponent({
    components: { "l-compute-variable": LComputeVariable, LayerControls },
    props: { layerId: Number },
    setup(props) {

        let layer = appState.layers[props.layerId] as LayerCompute
        let count = 1

        const addLayerVar = function () {
            layer.layerVars.push({
                ...getRandomLayerVar(),
                id: count++
            });
        }

        watchEffect(() => {
            layer.tileURL = computeQueryParams(layer)
        })

        return { addLayerVar, layerVars: layer.layerVars }
    },
})


</script>

<template>
    <div
        style="background-color: burlywood;
padding: 0.8em;
line-height: 1em;
margin: 0.2em;
display: inline-flex;
flex-direction: column;
"
    >
        <h3>{{ layerId }} {{ layerVars.length }}</h3>
        <component
            v-for="layerVar in layerVars.filter(Boolean)"
            :is="layerVar.type"
            :key="`${layerVar.id}${layerVar.file}`"
            v-bind="{ layerId: layerId, layerVarId: layerVar.id }"
        ></component>
        <button type="button" v-on:click="addLayerVar()">Add Compute Variable</button>
        <LayerControls v-bind="{ layerId }"></LayerControls>
    </div>
</template>

