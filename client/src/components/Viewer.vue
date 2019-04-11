<template>
  <div>
    <Scope v-if="scope" :scope="scope" scopeName="root" />
  </div>
</template>

<script>
import axios from 'axios'
import Scope from './Scope'

export default {
  components: {
    Scope
  },
  data() {
    return {
      scope: null
    }
  },
  mounted() {
    axios.get('http://localhost:8081').then(data => {
      this.scope = data.data.scope
    })
  }
}
</script>
