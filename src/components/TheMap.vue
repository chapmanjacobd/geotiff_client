<script>

import { storeToRefs, } from 'pinia'
import { ref, reactive } from 'vue'
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
        const vectorsource = ref(null)
        const view = ref(null)

        contextMenuItems.value = [{
            text: 'Center map here',
            classname: 'some-style-class', // add some CSS rules
            callback: (val) => {
                view.value.setCenter(val.coordinate)

            } // `center` is your callback function
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
            vectorsource,
            view,
            logEvent,
            mapdata
        }
    },
}

</script>

<template>
    <ol-map
        ref="map"
        :loadTilesWhileAnimating="true"
        :loadTilesWhileInteracting="true"
        style="height:1000px;width:1200px;position:absolute;right:0;top:0"
    >
        <ol-view
            ref="view"
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
            :key="layer.id"
            :opacity="layer.opacity"
            :visible="layer.visible"
        >
            <ol-source-xyz
                crossorigin="anonymous"
                :url="layer.tileURL"
                :tileSize="layer.tileURL.includes('unli.xyz') ? [512, 512] : [256, 256]"
                :transition="250"
            />
        </ol-tile-layer>
    </ol-map>
</template>
