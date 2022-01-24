<script lang='ts'>
import { defineComponent, reactive, ref, watch } from 'vue'
import { createDebounce } from '../data'
import { useMapStore } from '../store/map'

export default defineComponent({
    props: {
        layerId: String
    },
    setup(props) {
        const map = useMapStore()
        const layer = map.layerById(props.layerId)

        return { map, layer, debounce: createDebounce() }
    }
})
</script>

<template>
    <div v-if="map.layers.length > 1">
        <template v-if="map.canMoveLayerUp($props.layerId)">
            <button @click="map.moveLayerUp($props.layerId)">Move up</button>
        </template>
        <template v-if="map.canMoveLayerDown($props.layerId)">
            <button @click="map.moveLayerDown($props.layerId)">Move down</button>
        </template>
    </div>
    <label>Layer Visibility</label>
    <input type="checkbox" :checked="layer.visible" :value="layer.visible" />
    <!-- v-model="layer.visible" -->
    <label>Layer Opacity</label>
    <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="layer.opacity"
        @update:value="debounce(() => { layer.opacity = Number(($event.target as HTMLInputElement).value) })"
    />

    <button @click="map.removeLayer($props.layerId)">Delete layer</button>
</template>
