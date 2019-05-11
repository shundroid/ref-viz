<template>
  <section :style="{ width: `${size - margin * 2}px`, height: `${size - margin * 2}px`, margin: `${margin}px` }">
    <span>{{ scopeName }}</span>
    <template v-if="childSize - 20 > 20 && scope">
      <template v-for="(key, index) in keys">
        <Scope
          v-if="typeof key === 'string'"
          :key="index"
          :scope="scope ? scope.scopes[key] : null"
          :scopeName="key"
          :size="childSize"
          :margin="20"
          :location="`${location}.${key}`" />
        <Scope
          v-if="key.variableName"
          :key="index"
          :scope="null"
          :scopeName="key.variableName"
          :size="childSize"
          :margin="20"
          :location="location" />
        <Reference v-if="key.referenceName" :key="index" />
      </template>
    </template>
  </section>
</template>

<script>
import Reference from './Reference'

export default {
  name: 'Scope',
  props: {
    scope: Object,
    scopeName: String,
    size: Number,
    margin: Number,
    location: String
  },
  components: {
    Reference
  },
  computed: {
    scopeKeys() {
      return this.scope ? Object.keys(this.scope.scopes) : []
    },
    itemKeys() {
      return this.scope ? this.scope.items.filter(item => {
        if (item.referenceName) {
          return true
        }
        return this.scopeKeys.indexOf(item.variableName) === -1
      }) : []
    },
    keys() {
      return this.itemKeys.concat(this.scopeKeys)
    },
    columnCount() {
      return Math.ceil(Math.sqrt(this.keys.length))
    },
    childSize() {
      return Math.floor((this.size - this.margin * 2 - 2) / this.columnCount)
    }
  }
}
</script>

<style scoped>
section {
  border: 1px solid black;
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
  flex-direction: column;
  position: relative;
}
span {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
