<template>
  <svg
    v-if="isActive"
    :viewBox="viewBox"
    :style="{
      top: `${y}px`,
      left: `${x}px`,
      transform: `rotate(${degree}deg)`,
      width: `${distance}px`
    }">
    <g stroke="black">
      <line x1="0" y="5.5" :x2="distance - 10" y2="5.5" stroke-width="2" marker-end="url(#mu_mh)" />
    </g>
  </svg>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    x: Number,
    y: Number,
    // x2: Number,
    // y2: Number,
    reference: Object
  },
  computed: {
    isActive() {
      return typeof this.declarations[this.reference.referenceId] !== 'undefined' && this.declarations[this.reference.referenceId] !== null
    },
    ...mapState(['declarations']),
    width() {
      return Math.abs(this.x - this.xTo)
    },
    height() {
      return Math.abs(this.y - this.yTo)
    },
    distance() {
      return Math.sqrt(this.width ** 2 + this.height ** 2)
    },
    viewBox() {
      return `0 0 ${this.distance} 10`
    },
    degree() {
      const plusDeg = (this.xTo - this.x) < 0 ? 180 : 0
      return Math.atan((this.yTo - this.y) / (this.xTo - this.x)) / Math.PI * 180 + plusDeg
    },
    xTo() {
      if (this.declarations[this.reference.referenceId]) {
        const component = this.declarations[this.reference.referenceId]
        return component.x
      }
      return 0
    },
    yTo() {
      if (this.declarations[this.reference.referenceId]) {
        const component = this.declarations[this.reference.referenceId]
        return component.y
      }
      return 0
    }
  },
  watch: {
    declarations() {
      console.log('hoge')
      if (this.declarations[this.reference.referenceId]) {
        console.log(component)
        // this.x1 = this.declarations[this.referenceId]
      }
    }
  }
}
</script>

<style scoped>
svg {
  position: fixed;
  transform-origin: center left;
}
</style>
