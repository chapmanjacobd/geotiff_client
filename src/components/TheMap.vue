<script>

import { ref } from 'vue'
import { appState } from '../store'

export default {
    setup() {
        let layers = appState.layers

        const center = ref([0, 0])
        const projection = ref('EPSG:3857')
        const zoom = ref(2)
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
            layers
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

        <ol-tile-layer v-for="layer in layers" :key="layer.tileURL">
            <ol-source-xyz crossorigin="anonymous" :url="layer.tileURL" />
        </ol-tile-layer>
    </ol-map>
</template>
