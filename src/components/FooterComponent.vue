<script setup>
import { inject } from 'vue'

const trackingStarted = inject('trackingStarted');
const cameraOn = inject('cameraOn');
</script>

<template>
  <footer>
    <button 
        @click="trackingStarted = true" 
    >
      Start
    </button>

    <button 
        @click="cameraOn = !cameraOn" 
    >
      On / Off video
    </button>

    <button 
        @click="trackingStarted = false" 
    ><!-- $emit('stop-camera') -->
      Stop
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