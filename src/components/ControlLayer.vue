<script lang='ts'>
import { defineComponent } from 'vue'
import { useMapStore } from '../store/map'

export default defineComponent({
    props: {
        layerId: String
    },
    setup() {
        const map = useMapStore()

        return { map }
    }
})
</script>

<template>
    <div v-if="map.layers.length > 1">
        <button @click="map.moveLayerUp($props.layerId)">Move up</button>
        <button @click="map.moveLayerDown($props.layerId)">Move down</button>
    </div>
    <label>
        Visible
        <input type="checkbox" :value="map.layers[$props.layerId].visible" />
    </label>
    <label>
        Opacity
        <input type="range" min="0" max="1" step="0.01" :value="map.layers[layerId].opacity" />
    </label>
    <button @click="map.removeLayer($props.layerId)">Delete</button>
</template>
