<script>

import { storeToRefs, } from 'pinia'
import { ref, reactive, onMounted, watch } from 'vue'
import { useMapStore } from '../store/map'

export default {
    setup() {
        const mapdata = useMapStore()

        // const center = ref([0, 0])
        // const zoom = ref(2)
        const center = ref([263249, 6250064])
        const zoom = ref(11)
        const projection = ref('EPSG:3857')
        const rotation = ref(0)

        const contextMenuItems = ref([])

        onMounted(() => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 500);
        })

        watch(() => mapdata.splitMode, () => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        })

        contextMenuItems.value = [{
            text: 'Center map here',
            classname: 'some-style-class',
            callback: (obj, map) => {
                map.getView().setCenter(obj.coordinate)
            }
        },

            '-' // this is a separator
        ]


        const logEvent = (event) => {
            console.log(event)
        }

        return {
            center,
            projection,
            zoom,
            rotation,
            contextMenuItems,
            logEvent,
            mapdata
        }
    },
}

</script>

<template>
    <div :class="['map-container', mapdata.splitMode]">
        <ol-map
            v-for="i in (mapdata.splitMode === 'single' ? 1 : 2)"
            :key="`map-${i}-${mapdata.revision}`"
            :loadTilesWhileAnimating="true"
            :loadTilesWhileInteracting="true"
            class="map-instance"
            style="height: 100%; width: 100%"
        >
            <ol-view
                :constrainResolution="true"
                :center="center"
                :rotation="rotation"
                :zoom="zoom"
                :projection="projection"
            />

            <ol-fullscreen-control />
            <ol-overviewmap-control>
                <ol-tile-layer>
                    <ol-source-osm />
                </ol-tile-layer>
            </ol-overviewmap-control>

            <ol-scaleline-control />
            <ol-zoom-control />
            <ol-context-menu :items="contextMenuItems" />

            <ol-tile-layer
                v-for="layer in mapdata.layers"
                :key="`${layer.id}-${layer.tileURL}-${layer.visible}-${layer.opacity}`"
                :opacity="layer.opacity"
                :visible="layer.visible"
            >
                <ol-source-xyz
                    :url="layer.tileURL"
                    :tileSize="layer.tileURL.includes('unli.xyz') ? [512, 512] : [256, 256]"
                    :transition="250"
                />
            </ol-tile-layer>
        </ol-map>
    </div>
</template>

<style scoped>
.map-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
}

.map-container.single {
    flex-direction: row;
}

.map-container.horizontal {
    flex-direction: row;
}

.map-container.vertical {
    flex-direction: column;
}

.map-instance {
    flex: 1;
    height: 100%;
    width: 100%;
    display: block;
    min-height: 100px;
    min-width: 100px;
}

.vertical .map-instance {
    height: 50%;
    width: 100%;
}
</style>
