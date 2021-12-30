<script lang='ts'>
import { defineComponent } from 'vue'
import { appState } from '../store'

export default defineComponent({
    props: {
        key: Number
    },
    setup(props) {
        const moveLayerVarTo = (position) => {
        }
        const filterSlider = { min: 0, max: 1, value: [0, 1], step: 0.01 }

        return { moveLayerVarTo, appState }
    }
})
</script>

<template>
    <div v-if="appState.layers.length > 1">
        <button @click="moveLayerVarTo($props.key + 1)">Move up</button>
        <button @click="moveLayerVarTo($props.key - 1)">Move down</button>
    </div>
</template>

