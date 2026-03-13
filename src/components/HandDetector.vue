<script setup>
import { ref, watch, inject, onMounted } from 'vue'

const mediapipe = inject('mediapipe');
const cameraStarted = inject('cameraStarted');

const stream = ref(null); // a MediaStream HTML5 object
const videoRef = ref(null);
const canvasRef = ref(null);

// button events watcher
watch(cameraStarted, (val) => {
    if (val) startCamera();
    else stopCamera();
})

// start recording (detection happens on video data)
async function startCamera() {
  // enable webcam
  stream.value = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'environment' // 'user'
    }
  });
  
  // hook the stream to the video html object
  videoRef.value.srcObject = stream.value;
}

// stop recording, detection and drawing
function stopCamera() {
  // stop detection
  mediapipe.stopDetection();

  // stop camera reading
  const mediastream = stream.value;
  if (mediastream) {
    let track = mediastream.getTracks()[0]; // if only one media track
    track.stop();
  }

  // clear state
  stream.value = null;
  videoRef.value.srcObject = null;

  // clear canvas
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// read image and track hands
function trackHands() {
  // start the detection (read from video, draw on canvas)
  const video = videoRef.value;
  const canvas = canvasRef.value;
  
  // trigger mediapipe
  mediapipe.startDetection(video, canvas);
}

// init
onMounted(() => {
  videoRef.value.onloadeddata = (evt) => { trackHands(); };
})
</script>

<template>
    <!-- reading video -->
    <video 
          ref="videoRef" 
          autoplay 
          muted 
          playsinline
          class="videoplayer"
    ></video>
    <!-- darwing hands -->
    <canvas 
          ref="canvasRef" 
          class="videoframes"
    ></canvas>
</template>

<style scoped>
.videoplayer {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0.01;
  pointer-events: none;
}

.videoframes {
  transform: scale(-1,1); /* reflect image */

  display: block;
  margin-right: auto; 
  margin-left: auto; 
  margin-top: 10px; 
  top: 0px;
  left: 0;
  width: 90vh; /* not a typo: we want a square */
  height: 90vh;
}
</style>