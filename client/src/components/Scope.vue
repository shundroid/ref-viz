<template>
  <section :style="{
      width: `${(size - margin * 2) * 100}%`,
      height: `${(size - margin * 2) * 100}%`,
      top: `${(y + margin) * 100}%`,
      left: `${(x + margin) * 100}%`
    }">
    <span>{{ scopeName }}</span>
    <template v-if="scope !== null">
      <template v-for="(item, index) in scopes">
        <Scope
          v-if="item.name"
          :key="index"
          :scope="item"
          :scopeName="item.name"
          :x="childSize * (index % columnCount)"
          :y="childSize * Math.floor(index / columnCount)"
          :size="childSize"
          :margin="childMargin"
          :scopeId="item.id"
          :location="`${location}.${key}`" />
      </template>
    </template>
    <template v-if="scope !== null">
      <Reference v-for="(item, index) in references" :key="index" :reference="item" />
    </template>
  </section>
</template>

<script>
import { mapMutations } from 'vuex'
import Reference from './Reference'

export default {
  name: 'Scope',
  props: {
    scope: Object,
    scopeName: String,
    x: Number,
    y: Number,
    size: Number,
    margin: Number,
    location: String,
    scopeId: Number
  },
  data() {
    return {
      childMargin: 0.05
    }
  },
  components: {
    Reference
  },
  computed: {
    scopes() {
      return this.scope.items.filter(item => item.isDeclaration && item.options.type !== 'import')
    },
    references() {
      return this.scope.items.filter(item => item.referenceName && item.referenceId !== null)
    },
    columnCount() {
      if (this.scope === null) {
        return 0
      }
      return Math.ceil(Math.sqrt(this.scopes.length))
    },
    childSize() {
      return 1 / this.columnCount
    }
  },
  methods: {
    ...mapMutations(['addDeclaration', 'removeDeclaration'])
  },
  mounted() {
    if (this.scopeId) {
      this.addDeclaration(this)
    }
  },
  beforeDestroy() {
    if (this.scopeId) {
      this.removeDeclaration(this)
    }
  }
}
</script>

<style scoped>
section {
  border: 1px solid black;
  /* display: flex;
  flex-wrap: wrap; */
  box-sizing: border-box;
  /* flex-direction: column; */
  position: absolute;
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
