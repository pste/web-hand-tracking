<script setup>
import CameraView from './views/CameraView.vue';
</script>

<template>
  <CameraView></CameraView>
</template>

<style scoped>
  html, body, main, section{
    height: 100%;
    width: 100%;
  }
  
  html{
    position: fixed;
  }
  
  body{
    font-family: 'Lato', sans-serif;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
  }
  </style>
