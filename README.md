# vue-gestures

A mediapipe hand-tracker built on Vue.

## Development

### Project Setup

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

## Mediapipe Setup

# Install Tasks Library
This is the one and only library needed for the project:  
`npm i @mediapipe/tasks-vision`
Google's Mediapipe provide different tasks libraries for different scopes. The "visions" tasks is the one with hand tracking embedded.

# Choose a Model

We use the "hand landmarker" model:  
`https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task`
This model allows to detect 21 per-hand points (every finger has 4 points + wrist). 

# Pose Detection

Every finger is described by 4 points (a,b,c,d) from the palm to the finger's end.  

My first step to detect the pose is to calculate the angle between two vectors built on those points: AB and CD.
This method tells me if the finger is closed or opened. This also works pretty well for the thumb, that behave slightly differently from the other fingers.  
The angle is obtained using the "Cosine Law (Carnot Theorem)".  

I'm also evaluating to real-time rotate the whole scene to always have the hand front-facing the camera, for a better reading. 
