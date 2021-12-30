<script lang='ts'>
import { defineComponent } from 'vue'
import { appState } from '../store'

export default defineComponent({
    props: {
        key: Number
    },
    setup(props) {
        const moveLayerTo = (position) => {
        }

        const opacity = { min: 0, max: 1, value: 0.8, step: 0.01 }


        return { moveLayerTo, appState }
    }
})
</script>

<template>
    <div v-if="appState.layers.length > 1">
        <button @click="moveLayerTo($props.key + 1)">Move up</button>
        <button @click="moveLayerTo($props.key - 1)">Move down</button>
    </div>
</template>

