<template>
  <div class="home" style="height: 500px">
    <GoogleMap
            :zoom="17"
            :center="{lat: 36.773981, lng: 140.725157}"
            :height="600"/>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

import GoogleMap from "@/views/GoogleMap";
export default {
  name: 'Home',
  components: {
    GoogleMap
    // HelloWorld
  }
}
</script>
