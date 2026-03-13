<script setup>
import FooterComponent from '@/components/FooterComponent.vue'
import HandDetector from '@/components/HandDetector.vue'

import { provide, ref } from 'vue'

// propagate camera info
const cameraStarted = ref(false)
provide('cameraStarted', cameraStarted)

</script>

<template>
  <main>
    <HandDetector></HandDetector>
  </main>
  <FooterComponent></FooterComponent>
</template>