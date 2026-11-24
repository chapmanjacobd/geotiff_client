<script lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { MapEvent } from "ol";
import type OlMapType from "ol/Map";
import type OlTileLayerType from "ol/layer/Tile";
import type View from "ol/View";
import { OlMap as OlMapComponent, OlView } from "vue3-openlayers/map";
import { OlTileLayer } from "vue3-openlayers/layers";
import { OlSourceOSM, OlSourceXYZ } from "vue3-openlayers/sources";
import {
  OlAttributionControl,
  OlContextMenuControl,
  OlFullScreenControl,
  OlOverviewMapControl,
  OlRotateControl,
  OlScaleLineControl,
  OlZoomControl,
} from "vue3-openlayers/controls";
import { useMapStore } from "../store/map";

interface ViewListener {
  view: View;
  handler: () => void;
}

export default {
  components: {
    "ol-map": OlMapComponent,
    "ol-view": OlView,
    "ol-tile-layer": OlTileLayer,
    "ol-source-osm": OlSourceOSM,
    "ol-source-xyz": OlSourceXYZ,
    "ol-attribution-control": OlAttributionControl,
    "ol-context-menu-control": OlContextMenuControl,
    "ol-full-screen-control": OlFullScreenControl,
    "ol-overview-map-control": OlOverviewMapControl,
    "ol-rotate-control": OlRotateControl,
    "ol-scale-line-control": OlScaleLineControl,
    "ol-zoom-control": OlZoomControl,
  },
  setup() {
    const mapdata = useMapStore();

    const center = ref([263249, 6250064]);
    const zoom = ref(11);
    const projection = ref("EPSG:3857");
    const rotation = ref(0);

    // OpenLayers adds defaults unless a controls collection is supplied.
    // The template below declares every control explicitly.
    const mapControls: never[] = [];

    const paneCount = computed(() =>
      mapdata.splitMode === "single" ? 1 : 2
    );
    const renderableLayers = computed(() =>
      mapdata.layers.filter((layer) => Boolean(layer.tileURL))
    );

    const contextMenuItems = ref([
      {
        text: "Center map here",
        classname: "some-style-class",
        callback: (obj: { coordinate: number[] }, map: OlMapType) => {
          map.getView().setCenter(obj.coordinate);
        },
      },
    ]);

    const maps = new Map<number, OlMapType>();
    const viewListeners: ViewListener[] = [];
    const layerPropertiesCache = new Map<string, { layerId: string }>();
    let syncing = false;

    function layerProperties(layerId: string) {
      let properties = layerPropertiesCache.get(layerId);
      if (!properties) {
        properties = { layerId };
        layerPropertiesCache.set(layerId, properties);
      }
      return properties;
    }

    function hasViewListener(map: OlMapType): boolean {
      const view = map.getView();
      return Boolean(view) && viewListeners.some((entry) => entry.view === view);
    }

    function detachViewSync() {
      for (const { view, handler } of viewListeners) {
        view.un("change:center", handler);
        view.un("change:resolution", handler);
        view.un("change:rotation", handler);
      }
      viewListeners.length = 0;
    }

    function syncFrom(source: OlMapType) {
      if (syncing) return;
      const sourceView = source.getView();
      if (!sourceView) return;

      syncing = true;
      try {
        const sourceCenter = sourceView.getCenter();
        const sourceResolution = sourceView.getResolution();
        const sourceRotation = sourceView.getRotation();

        for (const target of maps.values()) {
          if (target === source) continue;
          const targetView = target.getView();
          if (!targetView || targetView === sourceView) continue;

          if (sourceCenter) targetView.setCenter([...sourceCenter]);
          if (sourceResolution !== undefined) {
            targetView.setResolution(sourceResolution);
          }
          targetView.setRotation(sourceRotation);
        }
      } finally {
        syncing = false;
      }
    }

    function attachViewSync() {
      detachViewSync();

      for (const map of maps.values()) {
        const view = map.getView();
        if (!view) continue;

        const handler = () => syncFrom(map);
        view.on("change:center", handler);
        view.on("change:resolution", handler);
        view.on("change:rotation", handler);
        viewListeners.push({ view, handler });
      }

      const first = maps.values().next().value;
      if (first) syncFrom(first);
    }

    function pruneMaps() {
      for (const [index, map] of maps) {
        const target = map.getTargetElement();
        if (!target || !document.body.contains(target)) maps.delete(index);
      }
    }

    // vue3-openlayers updates tile URLs reactively but only applies source
    // attributions when the source is constructed. Update them explicitly so
    // switching basemaps keeps the copyright notice accurate.
    function syncSourceAttributions() {
      for (const map of maps.values()) {
        for (const olLayer of map.getLayers().getArray()) {
          const layerId = olLayer.get("layerId");
          if (layerId === undefined) continue;
          const layer = mapdata.layers.find((item) => item.id === layerId);
          if (!layer || layer.type !== "l-basemap") continue;
          (olLayer as OlTileLayerType)
            .getSource()
            ?.setAttributions(layer.attribution);
        }
      }
    }

    watch(
      () =>
        mapdata.layers.map((layer) =>
          layer.type === "l-basemap" ? layer.attribution : ""
        ),
      () => syncSourceAttributions()
    );

    function registerMap(index: number, map: OlMapType) {
      if (!map || typeof map.getView !== "function") return;
      const isNew = maps.get(index) !== map;
      maps.set(index, map);
      const viewport = map.getViewport();
      if (viewport && !viewport.hasAttribute("tabindex")) {
        viewport.setAttribute("tabindex", "0");
        viewport.setAttribute("aria-label", "Interactive map");
      }
      if (isNew || !hasViewListener(map)) {
        attachViewSync();
        syncSourceAttributions();
      }
    }

    function onMapEvent(index: number, event: MapEvent) {
      registerMap(index, event.target as unknown as OlMapType);
    }

    function resizeMaps() {
      window.dispatchEvent(new Event("resize"));
    }

    onMounted(() => {
      window.setTimeout(() => {
        pruneMaps();
        attachViewSync();
        syncSourceAttributions();
        resizeMaps();
      }, 500);
    });

    watch(
      () => mapdata.splitMode,
      async () => {
        await nextTick();
        window.setTimeout(() => {
          pruneMaps();
          attachViewSync();
          syncSourceAttributions();
          resizeMaps();
        }, 100);
      }
    );

    onBeforeUnmount(() => {
      detachViewSync();
      maps.clear();
    });

    return {
      center,
      projection,
      zoom,
      rotation,
      contextMenuItems,
      mapdata,
      paneCount,
      renderableLayers,
      mapControls,
      layerProperties,
      onMapEvent,
    };
  },
};
</script>

<template>
  <div :class="['map-container', mapdata.splitMode]">
    <ol-map
      v-for="i in paneCount"
      :key="`map-${i}`"
      :controls="mapControls"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      class="map-instance"
      style="height: 100%; width: 100%"
      @loadend="(event) => onMapEvent(i, event)"
      @postrender="(event) => onMapEvent(i, event)"
    >
      <ol-view
        :constrain-resolution="true"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
      />

      <ol-full-screen-control />
      <ol-overview-map-control>
        <ol-tile-layer>
          <ol-source-osm />
        </ol-tile-layer>
      </ol-overview-map-control>

      <ol-scale-line-control />
      <ol-zoom-control />
      <ol-rotate-control />
      <ol-attribution-control />
      <ol-context-menu-control :items="contextMenuItems" />

      <ol-tile-layer
        v-for="(layer, index) in renderableLayers"
        :key="layer.id"
        :z-index="index + 1"
        :properties="layerProperties(layer.id)"
        :opacity="layer.opacity"
        :visible="layer.visible"
      >
        <ol-source-xyz
          :url="layer.tileURL"
          :tile-size="layer.type === 'l-compute' ? mapdata.tileSize : [256, 256]"
          :attributions="layer.attribution"
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

.map-container.single,
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
