<template>
  <svg
    :viewBox="viewBox"
    :style="{
      top: `${y1}px`,
      left: `${x1}px`,
      transform: `rotate(${degree}deg)`,
      width: `${distance}px`
    }">
    <g stroke="black">
      <line x1="0" y1="5.5" :x2="distance - 10" y2="5.5" stroke-width="2" marker-end="url(#mu_mh)" />
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    x1: Number,
    y1: Number,
    x2: Number,
    y2: Number
  },
  computed: {
    width() {
      return Math.abs(this.x1 - this.x2)
    },
    height() {
      return Math.abs(this.y1 - this.y2)
    },
    distance() {
      return Math.sqrt(this.width ** 2 + this.height ** 2)
    },
    viewBox() {
      return `0 0 ${this.distance} 10`
    },
    degree() {
      const plusDeg = (this.x2 - this.x1) < 0 ? 180 : 0
      return Math.atan((this.y2 - this.y1) / (this.x2 - this.x1)) / Math.PI * 180 + plusDeg
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
