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
        <button @click="map.moveLayerUp($props.layerId)">Move up</button>
        <button @click="map.moveLayerDown($props.layerId)">Move down</button>
    </div>
    <!-- <label>
        Visible
        <input
            type="checkbox"
            :value="layer.visible"
            @update:value="layer.visible = $event.value"
        />
    </label>-->
    <label>
        Opacity
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="layer.opacity"
            @input="debounce(() => { layer.opacity = Number(($event.target as HTMLInputElement).value) })"
        />
    </label>
    <button @click="map.removeLayer($props.layerId)">Delete</button>
</template>
