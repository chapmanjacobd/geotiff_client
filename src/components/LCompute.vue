<script lang='ts'>
import LComputeVariable from "./LComputeVariable.vue";
import { defineComponent } from "vue"
import LayerControls from "./LayerControls.vue";



export default defineComponent({
    components: { "l-compute-variable": LComputeVariable, LayerControls },
    props: { id: Number },
    setup() {

        let layerVars = [] as LayerVar[]
        let count = 0

        const addComponent = function (type) {
            layerVars.push({
                id: count++,
                type: type,
                dataset: 'osm_coffee_shops'
            });
        }

        // addComponent('l-compute-variable')

        return { addComponent, layerVars }
    },
})
</script>

<template>
    <div>
        <h3>{{ id }}</h3>
        <component v-for="field in layerVars" v-bind:is="field.type" :key="field.id"></component>
        <button type="button" v-on:click="addComponent('l-compute-variable')">Add Compute Variable</button>
        <!-- <LayerControls index="$parent.id"></LayerControls> -->
    </div>
</template>


