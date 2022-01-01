<script lang='ts'>
import { defineComponent } from 'vue'
import { appState } from '../store'
import { array_move } from '../utils'

export default defineComponent({
    props: {
        layerId: Number,
        layerVarId: Number
    },
    setup(props) {
        let layer = appState.layers[props.layerId] as LayerCompute
        let layerVars = layer.layerVars

        const moveLayerVarTo = (index) => {
            if (index < 0) return
            if (index >= layerVars.length - 1) return

            array_move(layerVars, props.layerVarId, index)

        }
        const deleteLayerVar = (layerVarId) => {
            layerVars.splice(layerVarId, 1)
        }

        const toggleVisibility = (layerVarId) => {
            const visible = layerVars[layerVarId].visible
            layerVars[layerVarId].visible = !visible
        }

        return { moveLayerVarTo, toggleVisibility, deleteLayerVar, appState, layerVars }
    }
})
</script>

<template>
    <div v-if="layerVars.length > 1">
        <button @click="moveLayerVarTo($props.layerVarId - 1)">Move up</button>
        <button @click="moveLayerVarTo($props.layerVarId + 1)">Move down</button>
    </div>
    <input type="checkbox" @click="toggleVisibility($props.layerVarId)" /> Visible
    <button @click="deleteLayerVar($props.layerVarId)">Delete</button>
</template>

