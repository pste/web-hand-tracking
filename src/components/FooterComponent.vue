<script setup>
import { inject } from 'vue'

const cameraStarted = inject('cameraStarted')
</script>

<template>
  <footer>
    <button 
        @click="cameraStarted = true" 
    ><!-- $emit('start-camera') -->
      Start Camera
    </button>
    <button 
        @click="cameraStarted = false" 
    ><!-- $emit('stop-camera') -->
      Stop Camera
    </button>
  </footer>
</template>

<style scoped>
footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  color: white;
  text-align: center;
  z-index: 500;
}
</style>