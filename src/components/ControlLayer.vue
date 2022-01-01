<script lang='ts'>
import { defineComponent } from 'vue'
import { appState, COLORSCALES } from '../store'
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

        return { moveLayerTo, appState, deleteLayer, toggleVisibility, COLORSCALES }
    }
})
</script>

<template>
    <template v-if="appState.layers[layerId].type === 'l-compute'">
        <h5>Colorscale</h5>
        <select>
            <option v-for="label in COLORSCALES" :key="label" :value="label">{{ label }}</option>
        </select>
    </template>
    <div v-if="appState.layers.length > 1">
        <button @click="moveLayerTo($props.layerId - 1)">Move up</button>
        <button @click="moveLayerTo($props.layerId + 1)">Move down</button>
    </div>
    <label>
        Visible
        <input type="checkbox" :value="appState.layers[layerId].visible" />
    </label>
    <label>
        Opacity
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="appState.layers[layerId].opacity"
        />
    </label>
    <button @click="deleteLayer($props.layerId)">Delete</button>
</template>
