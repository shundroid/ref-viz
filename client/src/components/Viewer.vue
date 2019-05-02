<template>
  <div :style="{
    top: `${top}px`,
    left: `${left}px`,
    width: `${computedSize}px`,
    height: `${computedSize}px`
   }">
    <Scope v-if="scope" :scope="scope" scopeName="root" :size="computedSize" :margin="0" />
    <Reference />
  </div>
</template>

<script>
import axios from 'axios'
import Scope from './Scope'
import Reference from './Reference'

const zoomAmount = 0.01
const minZoom = 0.01

export default {
  components: {
    Scope,
    Reference
  },
  data() {
    return {
      scope: null,
      size: Math.max(window.innerWidth, window.innerHeight),
      zoom: 1,
      top: 0,
      left: 0
    }
  },
  mounted() {
    axios.get('http://localhost:8081').then(data => {
      this.scope = data.data.scope
    })
    window.addEventListener('resize', () => {
      this.size = Math.max(window.innerWidth, window.innerHeight)
    })
    window.addEventListener('wheel', event => {
      const beforeZoom = this.zoom
      this.zoom = Math.max(this.zoom - event.deltaY * zoomAmount, minZoom)
      this.left += (event.clientX - this.left) / beforeZoom * (beforeZoom - this.zoom)
      this.top += (event.clientY - this.top) / beforeZoom * (beforeZoom - this.zoom)
    })
    window.addEventListener('mousemove', event => {
      if (event.buttons > 0) {
        this.left += event.movementX
        this.top += event.movementY
      }
    })
  },
  computed: {
    computedSize() {
      return this.size * this.zoom
    }
  }
}
</script>

<style scoped>
div {
  position: absolute;
  box-sizing: border-box;
}
div * {
  user-select: none;
}
</style>
