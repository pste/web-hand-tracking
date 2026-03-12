# vue-gestures

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
### Mediapipe setup

# install tasks library
npm i @mediapipe/tasks-vision
npm i @mediapipe/drawing_utils
npm i @mediapipe/hands

# choose a model

We use the "hand tarcking" model: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task

# create the Task for running inferences

#
Open hand:
0 {x: 0.4714209735393524, y: 0.8926628232002258, z: 7.421979262289824e-7, visibility: 0}
4 {x: 0.7274782657623291, y: 0.5332103967666626, z: -0.09342098981142044, visibility: 0}
8 {x: 0.5430001020431519, y: 0.198880136013031, z: -0.09650929272174835, visibility: 0}
12 {x: 0.41351035237312317, y: 0.17445069551467896, z: -0.09412287920713425, visibility: 0}
16 {x: 0.3197650611400604, y: 0.2502085268497467, z: -0.09314023703336716, visibility: 0}
20 {x: 0.2948334515094757, y: 0.38106706738471985, z: -0.08359459042549133, visibility: 0}
Closed hand:
0 {x: 0.3859446942806244, y: 0.7816582322120667, z: -4.251242273767275e-7, visibility: 0}
4 {x: 0.6335036754608154, y: 0.4575560390949249, z: -0.0797019824385643, visibility: 0}
8 {x: 0.5485544800758362, y: 0.5813535451889038, z: -0.10188647359609604, visibility: 0}
12 {x: 0.4914417862892151, y: 0.5832464694976807, z: -0.1101115345954895, visibility: 0}
16 {x: 0.4335535168647766, y: 0.6022321581840515, z: -0.05421588197350502, visibility: 0}
20 {x: 0.38392165303230286, y: 0.5888024568557739, z: -0.03443519398570061, visibility: 0}