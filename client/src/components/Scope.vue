<template>
  <section :style="{
      width: `${size - margin * 2}px`,
      height: `${size - margin * 2}px`,
      top: `${y}px`,
      left: `${x}px`
    }">
    <span>{{ scopeName }}</span>
    <template v-if="childSize - 20 > 20 && scope !== null">
      <template v-for="(item, index) in scopes">
        <Scope
          v-if="item.scopeName"
          :key="index"
          :scope="item"
          :scopeName="item.scopeName"
          :x="x + margin + childSize * (index % columnCount)"
          :y="y + margin * 2 + childSize * Math.floor(index / columnCount)"
          :size="childSize"
          :margin="10"
          :scopeId="item.scopeId"
          :location="`${location}.${key}`" />
        <Scope
          v-if="item.variableName"
          :key="index"
          :scope="null"
          :scopeName="item.variableName"
          :x="x + margin + childSize * (index % columnCount)"
          :y="y + margin * 2 + childSize * Math.floor(index / columnCount)"
          :size="childSize"
          :margin="10"
          :scopeId="item.declarationId"
          :location="location" />
      </template>
    </template>
    <template v-if="scope !== null">
      <Reference v-for="(item, index) in references" :key="index" :reference="item" :x="x" :y="y" />
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
  components: {
    Reference
  },
  computed: {
    scopes() {
      return this.scope.items.filter(item => {
        return item.scopeName || item.variableName
      })
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
      return Math.floor((this.size - this.margin * 2 - 2) / this.columnCount)
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
    console.log(this.scopeId)
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
  position: fixed;
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
