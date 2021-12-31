<script lang='ts'>
import LComputeVariable from "./LComputeVariable.vue";
import LayerControls from "./ControlLayer.vue";
import { computed, defineComponent } from "vue"
import { LAYER_VARS, appState } from "../store";
import { computeQueryParams } from "../utils";


export default defineComponent({
    components: { "l-compute-variable": LComputeVariable, LayerControls },
    props: { layerId: Number },
    setup(props) {

        let layer = appState.layers[props.layerId] as LayerCompute
        let layerVars = layer.layerVars
        let count = 1

        const addComponent = function (type) {
            const randomLayerVarOpt = LAYER_VARS[Math.floor(Math.random() * LAYER_VARS.length)]

            layerVars.push({
                id: count++,
                ...randomLayerVarOpt, type,
                actualRange: { min: randomLayerVarOpt.min, max: randomLayerVarOpt.max },
                filteredRange: { min: randomLayerVarOpt.min + 1, max: randomLayerVarOpt.max },
            });
        }

        layer.tileURL = computeQueryParams(layer)

        return { addComponent, layerVars }
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
        <h3>{{ layerId }}</h3>
        <component
            v-for="layerVar in layerVars"
            :is="layerVar.type"
            :key="layerVar.id"
            v-bind="{ layerId: layerId, layerVarId: layerVar.id }"
        ></component>
        <button type="button" v-on:click="addComponent('l-compute-variable')">Add Compute Variable</button>
        <LayerControls v-bind="{ layerId }"></LayerControls>
    </div>
</template>

