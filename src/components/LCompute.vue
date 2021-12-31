<script lang='ts'>
import LComputeVariable from "./LComputeVariable.vue";
import LayerControls from "./ControlLayer.vue";
import { defineComponent } from "vue"
import { LAYER_VARS, appState } from "../store";


export default defineComponent({
    components: { "l-compute-variable": LComputeVariable, LayerControls },
    props: { layerId: Number },
    setup(props) {

        let layer = appState.layers[props.layerId] as LayerCompute
        let layerVars = layer.layerVars
        let count = 0

        const addComponent = function (type) {
            layerVars.push({
                id: count++,
                type: type,
                dataset: LAYER_VARS[0].file,
                actualRange: { min: LAYER_VARS[0].min, max: LAYER_VARS[0].max },
                filteredRange: { min: LAYER_VARS[0].min, max: LAYER_VARS[0].max },
            });
        }

        addComponent('l-compute-variable')

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
            v-bind:is="layerVar.type"
            :key="layerVar.id"
            v-bind="{ layerId: layerId, layerVarId: layerVar.id }"
        ></component>
        <button type="button" v-on:click="addComponent('l-compute-variable')">Add Compute Variable</button>
        <LayerControls v-bind="{ layerId }"></LayerControls>
    </div>
</template>
