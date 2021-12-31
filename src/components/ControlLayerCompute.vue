<script lang='ts'>
import { defineComponent } from 'vue'
import { COLORSCALES, appState } from '../store'

export default defineComponent({
    props: {
        key: Number
    },
    setup(props) {
        const stretchSlider = { min: 0, max: 1, value: [0, 1], step: 0.01 }

        return { COLORSCALES, appState }
    }
})
</script>

<template>
    <h5>Colorscale</h5>
    <select>
        <option v-for="label in COLORSCALES" :key="label" :value="label">{{ label }}</option>
    </select>
</template>

