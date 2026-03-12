<script setup>
</script>

<template>
  <header>
    <button 
        @click="$emit('start-camera')" 
    >
      Start Camera
    </button>
    <button 
        @click="$emit('stop-camera')" 
    >
      Stop Camera
    </button>
  </header>
</template>