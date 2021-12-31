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
        const filterSlider = { min: 0, max: 1, value: [0, 1], step: 0.01 }

        return { moveLayerVarTo, appState }
    }
})
</script>

<template>
    <div v-if="appState.layers.length > 1">
        <button @click="moveLayerVarTo($props.layerVarId + 1)">Move up</button>
        <button @click="moveLayerVarTo($props.layerVarId - 1)">Move down</button>
    </div>
</template>

