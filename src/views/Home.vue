<template>
  <div class="home">
    <MapFrame/>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

import MapFrame from "@/views/MapFrame";
export default {
  name: 'Home',
  components: {
      MapFrame,
  }
}
</script>

<style lang="scss">
    .home {
        height: 100%;
    }
</style>
