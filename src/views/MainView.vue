<script setup>
import FooterComponent from '@/components/FooterComponent.vue'
import HandDetector from '@/components/HandDetector.vue'

import { provide, ref } from 'vue'

// propagate camera info
const cameraOn = ref(true)
const trackingStarted = ref(false)
provide('cameraOn', cameraOn)
provide('trackingStarted', trackingStarted)

</script>

<template>
  <main>
    <HandDetector></HandDetector>
  </main>
  <FooterComponent></FooterComponent>
</template>