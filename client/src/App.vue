<template>
  <div id="app">
    <Viewer />
  </div>
</template>

<script>
import Viewer from './components/Viewer.vue'

export default {
  name: 'app',
  components: {
    Viewer
  }
}
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
