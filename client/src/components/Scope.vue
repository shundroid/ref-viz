<template>
  <section>
    {{ scopeName }}
    <div v-if="scope && scope.scopes">
      <Scope v-for="key in declarationKeys" :scope="null" :key="key" :scopeName="key" />
      <Scope v-for="key in keys" :key="key" :scope="scope ? scope.scopes[key] : null" :scopeName="key" />
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
    keys() {
      return this.scope ? Object.keys(this.scope.scopes) : []
    },
    declarationKeys() {
      if (this.scope) {
        return this.scope.items.filter(item => {
          return item.variableName && this.keys.indexOf(item.variableName) === -1
        }).map(item => {
          return item.variableName
        })
      }
      return []
    }
  }
}
</script>

<style scoped>
section {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin: 10px;
}
div {
  display: flex;
  flex-wrap: wrap;
}
</style>
