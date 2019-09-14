import Vue from 'vue'

export default {
  state: {
    declarations: {}
  },
  mutations: {
    addDeclaration(state, declarationComponent) {
      Vue.set(state.declarations, declarationComponent.scopeId, declarationComponent)
      // state.declarations[declarationComponent.scopeId] = declarationComponent
    },
    removeDeclaration(state, declarationComponent) {
      if (state.declarations[declarationComponent.scopeId]) {
        Vue.set(state.declarations, declarationComponent.scopeId, null)
        // delete state.declarations[declarationComponent.scopeId]
      }
    }
  }
}
