<script>
import { defineComponent } from 'vue'
import { COLORSCALES } from '../store'

export default defineComponent({
    props: {
        index: Number
    },
    setup(props) {
        const moveLayerTo = (position) => {
        }

        const opacity = { min: 0, max: 1, value: 0.8, step: 0.01 }
        const rangeSlider = { min: 0, max: 1, value: [0, 1], step: 0.01 }

        const index = props.index

        return { moveLayerTo, index, COLORSCALES }
    }
})
</script>

<template>
    <button @click="moveLayerTo(index + 1)">Move up</button>
    <button @click="moveLayerTo(index - 1)">Move down</button>

    <h5>Colorscale</h5>
    <select v-model="$store.settings.colorscale">
        <option v-for="label in COLORSCALES" :value="label"></option>
    </select>
</template>

