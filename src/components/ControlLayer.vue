<script lang='ts'>
import { defineComponent } from 'vue'
import { appState } from '../store'
import { array_move } from '../utils'

export default defineComponent({
    props: {
        layerId: Number
    },
    setup(props) {
        let layers = appState.layers
        const moveLayerTo = (index) => {
            if (index < 0) return
            if (index >= layers.length - 1) return
            array_move(layers, props.layerId, index)
        }
        const deleteLayer = (layerId) => {
            layers.splice(layerId, 1)
        }


        const toggleVisibility = (layerId) => {
            const visible = layers[layerId].visible
            layers[layerId].visible = !visible
        }

        return { moveLayerTo, appState, deleteLayer, toggleVisibility }
    }
})
</script>

<template>
    <div v-if="appState.layers.length > 1">
        <button @click="moveLayerTo($props.layerId - 1)">Move up</button>
        <button @click="moveLayerTo($props.layerId + 1)">Move down</button>
    </div>
    <input type="checkbox" @click="toggleVisibility($props.layerId)" /> Visible
    <button @click="deleteLayer($props.layerId)">Delete</button>
</template>
