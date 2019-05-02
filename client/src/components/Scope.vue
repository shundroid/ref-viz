<template>
  <section :style="{ width: `${size - margin * 2}px`, height: `${size - margin * 2}px`, margin: `${margin}px` }">
    <span>{{ scopeName }}</span>
    <template v-if="childSize > 20 && scope && scope.scopes">
      <Scope v-for="key in keys" :key="key" :scope="scope ? scope.scopes[key] : null" :scopeName="key" :size="childSize" :margin="20" />
    </template>
  </section>
</template>

<script>
export default {
  name: 'Scope',
  props: {
    scope: Object,
    scopeName: String,
    size: Number,
    margin: Number
  },
  computed: {
    scopeKeys() {
      return this.scope ? Object.keys(this.scope.scopes) : []
    },
    declarationKeys() {
      if (this.scope) {
        return this.scope.items.filter(item => {
          return item.variableName && this.scopeKeys.indexOf(item.variableName) === -1
        }).map(item => {
          return item.variableName
        })
      }
      return []
    },
    keys() {
      return this.scopeKeys.concat(this.declarationKeys)
    },
    columnCount() {
      return Math.ceil(Math.sqrt(this.keys.length))
    },
    childSize() {
      return (this.size - this.margin * 2 - 2) / this.columnCount
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
