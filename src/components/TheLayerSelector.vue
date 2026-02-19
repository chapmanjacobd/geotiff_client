<script lang='ts'>
import LCompute from "./LCompute.vue";
import LBasemap from "./LBasemap.vue";
import { defineComponent, ref } from "vue"
import { useMapStore } from "../store/map";

export default defineComponent({
  components: {
    'l-compute': LCompute,
    'l-basemap': LBasemap
  },
  setup() {
    const map = useMapStore()
    const isCollapsed = ref(false)

    const addComponent = function (type) {
      map.addLayer(type)
    }

    const setSplitMode = (mode: 'single' | 'horizontal' | 'vertical') => {
      map.splitMode = mode
    }

    return { addComponent, map, isCollapsed, setSplitMode }
  },
})
</script>

<template>
  <div
    :class="['sidebar', { collapsed: isCollapsed }]"
  >
    <button @click="isCollapsed = !isCollapsed" class="toggle-btn">
      <span v-if="isCollapsed">☰</span>
      <span v-else>×</span>
    </button>

    <div v-if="!isCollapsed" class="sidebar-content">
      <div class="logo-area">
        <a href="https://unli.xyz/">
          <img src="https://unli.xyz/unli.png" alt="UNLI" width="40" height="40" />
        </a>
        <div class="split-controls">
           <button @click="setSplitMode('single')" :class="{active: map.splitMode === 'single'}">S</button>
           <button @click="setSplitMode('horizontal')" :class="{active: map.splitMode === 'horizontal'}">H</button>
           <button @click="setSplitMode('vertical')" :class="{active: map.splitMode === 'vertical'}">V</button>
        </div>
      </div>

      <div class="layers-list">
        <div v-for="layer in [...map.layers].reverse()" :key="layer.id" class="layer-item">
          <component
            :is="layer.type"
            v-bind="{ layerId: layer.id }"
          ></component>
        </div>
      </div>

      <div class="footer-actions">
        <button type="button" @click="addComponent('l-basemap')">+ Basemap</button>
        <button type="button" @click="addComponent('l-compute')">+ Compute</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  z-index: 9999;
  background-color: white;
  height: auto;
  max-height: 90vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  display: flex;
  transition: all 0.3s ease;
  width: 20em;
  left: 10px;
  top: 10px;
  border-radius: 8px;
  overflow: visible;
}

.sidebar.collapsed {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
}

.toggle-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 10000;
}

.sidebar.collapsed .toggle-btn {
  position: relative;
}

.sidebar:not(.collapsed) .toggle-btn {
  left: auto;
  right: -15px;
  top: -15px;
  width: 30px;
  height: 30px;
  background: #f44336;
}

.sidebar-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 1em;
  border-bottom: 1px solid #eee;
}

.split-controls {
  display: flex;
  gap: 2px;
}

.split-controls button {
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
}

.split-controls button.active {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.layers-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5em;
}

.layer-item {
  margin-bottom: 1em;
  border: 1px solid #eee;
  padding: 0.5em;
  border-radius: 4px;
}

.footer-actions {
  padding: 1em;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5em;
}

.footer-actions button {
  flex: 1;
  padding: 0.5em;
  cursor: pointer;
  font-size: 0.8em;
}
</style>
