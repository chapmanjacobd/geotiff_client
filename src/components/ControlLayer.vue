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

        watch(() => layer?.visible, () => map.forceUpdate())
        watch(() => layer?.opacity, () => map.forceUpdate())

        return { map, layer, debounce: createDebounce() }
    }
})
</script>

<template>
    <div style="display: flex; flex-direction: column; gap: 0.5em; margin-top: 0.5em; padding-top: 0.5em; border-top: 1px dashed #eee;">
        <div v-if="map.layers.length > 1" style="display: flex; gap: 0.5em;">
            <button v-if="map.canMoveLayerUp($props.layerId)" @click="map.moveLayerUp($props.layerId)" style="flex: 1; padding: 0.3em;">Move up</button>
            <button v-if="map.canMoveLayerDown($props.layerId)" @click="map.moveLayerDown($props.layerId)" style="flex: 1; padding: 0.3em;">Move down</button>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5em;">
            <input type="checkbox" v-model="layer.visible" :id="'vis-' + layer.id" />
            <label :for="'vis-' + layer.id" style="font-size: 0.9em;">Visible</label>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.1em;">
            <label style="font-size: 0.8em; color: #666;">Opacity: {{ Math.round(layer.opacity * 100) }}%</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="layer.opacity"
                style="width: 100%;"
            />
        </div>

        <button @click="map.removeLayer($props.layerId)" style="margin-top: 0.5em; padding: 0.4em; background-color: #fee; border: 1px solid #fcc; color: #933; cursor: pointer;">Delete layer</button>
    </div>
</template>
