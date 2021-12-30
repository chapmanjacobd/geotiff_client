<script>

import {
    ref,
    inject,
    onMounted
} from 'vue'

export default {
    setup() {
        const center = ref([34, 39.13])
        const projection = ref('EPSG:4326')
        const zoom = ref(6)
        const rotation = ref(0)

        const format = inject('ol-format')

        const geoJson = new format.GeoJSON()

        const selectConditions = inject('ol-selectconditions')

        const selectCondition = selectConditions.pointerMove

        const selectedCityName = ref('')
        const selectedCityPosition = ref([])

        const extent = inject('ol-extent')

        const Feature = inject('ol-feature')
        const Geom = inject('ol-geom')

        const contextMenuItems = ref([])
        const vectorsource = ref(null)
        const view = ref(null)

        const drawEnable = ref(false)
        const drawType = ref("Point")

        const changeDrawType = (active, draw) => {
            drawEnable.value = active
            drawType.value = draw
        }

        contextMenuItems.value = [{
            text: 'Center map here',
            classname: 'some-style-class', // add some CSS rules
            callback: (val) => {
                view.value.setCenter(val.coordinate)

            } // `center` is your callback function
        },

            '-' // this is a separator
        ]

        const featureSelected = (event) => {
            if (event.selected.length == 1) {

                selectedCityPosition.value = extent.getCenter(event.selected[0].getGeometry().extent_)
                selectedCityName.value = event.selected[0].values_.name
            } else {
                selectedCityName.value = ''
            }

        }

        const overrideStyleFunction = (feature, style) => {

            let clusteredFeatures = feature.get('features')
            let size = clusteredFeatures.length

            let color = size > 20 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0"
            var radius = Math.max(8, Math.min(size, 20))
            let dash = 2 * Math.PI * radius / 6
            let calculatedDash = [0, dash, dash, dash, dash, dash, dash]

            style.getImage().getStroke().setLineDash(dash)
            style.getImage().getStroke().setColor("rgba(" + color + ",0.5)")
            style.getImage().getStroke().setLineDash(calculatedDash)
            style.getImage().getFill().setColor("rgba(" + color + ",1)")

            style.getImage().setRadius(radius)

            style.getText().setText(size.toString())

        }

        const selectInteactionFilter = (feature) => {
            return feature.values_.name != undefined
        }

        const getRandomInRange = (from, to, fixed) => {
            return (Math.random() * (to - from) + from).toFixed(fixed) * 1

        }

        const drawstart = (event) => {
            console.log(event)

        }

        const drawend = (event) => {
            console.log(event)
        }

        const modifystart = (event) => {
            console.log(event)

        }

        const modifyend = (event) => {
            console.log(event)
        }

        const videoStopped = (event) => {
            console.log(event)
        }

        const swipeControl = ref(null)
        const jawgLayer = ref(null)
        const osmLayer = ref(null)
        const layerList = ref([])
        const path = ref([
            [
                25.6064453125,
                44.73302734375001
            ],
            [
                27.759765625,
                44.75500000000001
            ],
            [
                28.287109375,
                43.32677734375001
            ],
            [
                30.55029296875,
                46.40294921875001
            ],
            [
                31.69287109375,
                43.04113281250001
            ]

        ])
        const animationPath = ref(null)

        onMounted(() => {

            layerList.value.push(jawgLayer.value.tileLayer)
            layerList.value.push(osmLayer.value.tileLayer)
            console.log(layerList.value)
            console.log(animationPath.value)
        })


        return {
            center,
            projection,
            zoom,
            rotation,
            geoJson,
            featureSelected,
            selectCondition,
            selectedCityName,
            selectedCityPosition,
            overrideStyleFunction,
            getRandomInRange,
            contextMenuItems,
            vectorsource,
            view,
            selectInteactionFilter,
            drawstart,
            drawend,
            modifystart,
            modifyend,
            videoStopped,
            drawEnable,
            drawType,
            layerList,
            jawgLayer,
            swipeControl,
            osmLayer,
            changeDrawType,
            path,
            animationPath,
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

        <ol-swipe-control ref="swipeControl" v-if="layerList.length > 0" :layerList="layerList" />

        <ol-tile-layer ref="osmLayer" title="OSM">
            <ol-source-osm />
        </ol-tile-layer>

        <ol-tile-layer ref="jawgLayer" title="JAWG">
            <ol-source-xyz
                crossorigin="anonymous"
                url="https://c.tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?access-token=87PWIbRaZAGNmYDjlYsLkeTVJpQeCfl2Y61mcHopxXqSdxXExoTLEv7dwqBwSWuJ"
            />
        </ol-tile-layer>

        <ol-mouseposition-control />
        <ol-fullscreen-control />
        <ol-overviewmap-control>
            <ol-tile-layer>
                <ol-source-osm />
            </ol-tile-layer>
        </ol-overviewmap-control>

        <ol-scaleline-control />
        <ol-zoom-control />
        <ol-context-menu :items="contextMenuItems" />

        <ol-interaction-select
            @select="featureSelected"
            :condition="selectCondition"
            :filter="selectInteactionFilter"
            v-if="!drawEnable"
        >
            <ol-style>
                <ol-style-stroke color="green" :width="10"></ol-style-stroke>
                <ol-style-fill color="rgba(255,255,255,0.5)"></ol-style-fill>
            </ol-style>
        </ol-interaction-select>

        <ol-overlay :position="selectedCityPosition" v-if="selectedCityName != '' && !drawEnable">
            <template v-slot="slotProps">
                <div class="overlay-content">{{ selectedCityName }} {{ slotProps }}</div>
            </template>
        </ol-overlay>
    </ol-map>
</template>
