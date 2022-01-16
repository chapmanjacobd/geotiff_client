<script lang='ts'>
import { defineComponent, ref } from 'vue'
import { useMapStore } from '../store/map'

export default defineComponent({
    props: {
        layerId: String
    },
    setup(props) {
        const map = useMapStore()
        const layer = map.layerById(props.layerId)

        function createDebounce() {
            let timeout = null;
            return function (fnc, delayMs = 200) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fnc();
                }, delayMs);
            };
        }

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
    <label>Visible</label>
    <input
        type="checkbox"
        :value="layer.visible"
        @update:value="layer.visible = Boolean(($event.target as HTMLInputElement).value)"
    />
    <label>Opacity</label>
    <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="layer.opacity"
        @update:value="debounce(() => { layer.opacity = Number(($event.target as HTMLInputElement).value) })"
    />

    <button @click="map.removeLayer($props.layerId)">Delete</button>
</template>
