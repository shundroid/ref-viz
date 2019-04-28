<template>
  <div :style="{ width: `${size}px`, height: `${size}px` }">
    <Scope v-if="scope" :scope="scope" scopeName="root" :size="size" :margin="0" />
  </div>
</template>

<script>
import axios from 'axios'
import Scope from './Scope'

export default {
  components: {
    Scope
  },
  data() {
    return {
      scope: null,
      size: Math.max(window.innerWidth, window.innerHeight)
    }
  },
  mounted() {
    axios.get('http://localhost:8081').then(data => {
      this.scope = data.data.scope
    })
    window.addEventListener('resize', () => {
      this.size = Math.max(window.innerWidth, window.innerHeight)
    })
  }
}
</script>

<style scoped>
div {
  box-sizing: border-box;
}
</style>
