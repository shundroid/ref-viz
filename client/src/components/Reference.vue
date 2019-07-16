<template>
  <svg
    v-if="isActive"
    :viewBox="viewBox"
    :style="{
      top: `${from.y * 100}%`,
      left: `${from.x * 100}%`,
      transform: `rotate(${degree}deg)`,
      width: `${distance * 100}%`
    }">
    <g stroke="black">
      <line x1="0" y1="5.5" :x2="(distance * 100) - 10" y2="5.5" stroke-width="2" marker-end="url(#mu_mh)" />
    </g>
  </svg>
</template>

<script>
import { mapState } from 'vuex'
import { toGlobalPos, toLocalPos } from '../convertPos'

export default {
  props: {
    reference: Object
  },
  computed: {
    isActive() {
      return typeof this.declarations[this.reference.referenceId] !== 'undefined' && this.declarations[this.reference.referenceId] !== null
    },
    ...mapState(['declarations']),
    width() {
      return Math.abs(this.from.x - this.to.x)
    },
    height() {
      return Math.abs(this.from.y - this.to.y)
    },
    distance() {
      return Math.sqrt(this.width ** 2 + this.height ** 2)
    },
    viewBox() {
      return `0 0 ${this.distance * 100} 10`
    },
    degree() {
      const plusDeg = (this.to.x - this.from.x) < 0 ? 180 : 0
      return Math.atan((this.to.y - this.from.y) / (this.to.x - this.from.x)) / Math.PI * 180 + plusDeg
    },
    to() {
      if (this.declarations[this.reference.referenceId]) {
        const component = this.declarations[this.reference.referenceId]
        const globalPos = toGlobalPos(component.$parent, { x: component.x, y: component.y })
        const localPos = toLocalPos(this.$parent, globalPos)
        return localPos
      }
      return { x: 0, y: 0 }
    },
    from() {
      return { x: 0, y: 0 }
    }
  }
}
</script>

<style scoped>
svg {
  position: absolute;
  transform-origin: center left;
}
</style>
