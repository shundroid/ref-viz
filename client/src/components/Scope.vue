<template>
  <section>
    {{ scopeName }}
    <div v-if="scope && scope.scopes">
      <template v-for="key in keys">
        <Scope v-if="key !== 'br'" :key="key" :scope="scope ? scope.scopes[key] : null" :scopeName="key" />
        <br v-if="key === 'br'" :key="key">
      </template>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Scope',
  props: {
    scope: Object,
    scopeName: String
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
      return Math.floor(Math.sqrt(this.keys.length))
    },
    renderKeys() {
      const result = this.key.slice(0)
      for (let i = 1; i * this.columnCount < this.keys.length; i++) {
        result.splice(i * this.columnCount + i - 1, 0, 'br')
      }
      return result
    }
  }
}
</script>

<style scoped>
section {
  border: 1px solid black;
  padding: 10px;
  margin: 10px;
}
div {
  display: flex;
  flex-wrap: wrap;
}
</style>
