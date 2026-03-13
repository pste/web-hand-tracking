import { DrawingUtils, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// == INIT ======================================================================== //

// https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/index#models
const modelPath = "hand_landmarker.task";
//const modelPath = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const taskVisionPath = undefined; /* if empty it uses the host's root folder */
//const taskVisionPath = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

// init model
const vision = await FilesetResolver.forVisionTasks( taskVisionPath );

// create the landmarker obj
async function createHandLandmarker() {
    return await HandLandmarker.createFromOptions( vision, {
        baseOptions: {
            modelAssetPath: modelPath,
            delegate: "GPU"
        },
        runningMode: "video",
        numHands: 2
    })
}

// == UTILS ======================================================================== //

// utility to get distance from 2 points
function distance(p1, p2) {
    return Math.sqrt(
        Math.pow( (p2.x-p1.x), 2) + 
        Math.pow( (p2.y-p1.y), 2)
    )
}

// check if the point sequence is an arc for some coordinates (x,y,z)
// similar to the derivative function concept (check if changes slopeness)
function checkArc(points) {
    let incrX = false; // starts as decreasing
    let incrY = false; // starts as decreasing
    let incrZ = false; // starts as decreasing
    for (let i=1; i<points.length; i++) {
        // init (special case)
        if (i===1) {
            incrX = (points[i].x >= points[i-1].x);
            incrY = (points[i].y >= points[i-1].y);
            incrZ = (points[i].z >= points[i-1].z);
        }
        else {
            // slope change test 
            if (incrX && points[i].x < points[i-1].x) return true;    // was increasing, now decrease! 
            if (!incrX && points[i].x >= points[i-1].x) return true;  // was decreasing, now increase! 
            if (incrY && points[i].y < points[i-1].y) return true;    // was increasing, now decrease! 
            if (!incrY && points[i].y >= points[i-1].y) return true;  // was decreasing, now increase! 
            if (incrZ && points[i].z < points[i-1].z) return true;    // was increasing, now decrease! 
            if (!incrZ && points[i].z >= points[i-1].z) return true;  // was decreasing, now increase! 
        }
    }
    return false;
}

// build an "hand" object
function readHand(handedness, landmarks) {
    const treshold = 0.3;
    const hand =  {
        info: handedness[0],
        wrist: {
            landmarks: [],
            color: "#FFFFFF",
        },
        fingers: {
            thumb: {
                closed: false, // checkArc(landmarks.slice(1,4)), // distance(landmarks[1], landmarks[4]) <= treshold,
                distance: distance(landmarks[1], landmarks[4]),
                landmarks: [],
                color1: "#ff0d0d",
                color2: "#000000",
            },
            index: {
                closed: false, // checkArc(landmarks.slice(5,8)), // distance(landmarks[5], landmarks[8]) <= treshold,
                distance: distance(landmarks[5], landmarks[8]),
                landmarks: [],
                color1: "#00FF00",
                color2: "#000000",
            },
            middle: {
                closed: false, // checkArc(landmarks.slice(9,12)), // distance(landmarks[9], landmarks[12]) <= treshold,
                distance: distance(landmarks[9], landmarks[12]),
                landmarks: [],
                color1: "#0000ff",
                color2: "#000000",
            },
            ring: {
                closed: false, // checkArc(landmarks.slice(13,16)), // distance(landmarks[13], landmarks[16]) <= treshold,
                distance: distance(landmarks[13], landmarks[16]),
                landmarks: [],
                color1:"#FFFF00",
                color2:"#000000",
            },
            pinky: {
                closed: false, // checkArc(landmarks.slice(17,20)), // distance(landmarks[17], landmarks[20]) <= treshold,
                distance: distance(landmarks[17], landmarks[20]),
                landmarks: [],
                color1: "#7b00b4",
                color2: "#000000",
            }
        }
    }
    //
    landmarks.forEach((landmark, index) => {
        if (index === 0) hand.wrist.landmarks.push(landmark); 
        if (index >= 1 && index <= 4) hand.fingers.thumb.landmarks.push(landmark); 
        if (index >= 5 && index <= 8) hand.fingers.index.landmarks.push(landmark); 
        if (index >= 9 && index <= 12) hand.fingers.middle.landmarks.push(landmark); 
        if (index >= 13 && index <= 16) hand.fingers.ring.landmarks.push(landmark); 
        if (index >= 17 && index <= 20) hand.fingers.pinky.landmarks.push(landmark); 
    })
    return hand;
}

// draw the hand(s)
function drawHand(drawingUtils, handedness, landmarks) {
    // draw sticky lines
    drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#abffab",
        lineWidth: 5
    });

    // punti dita tutti rossi
    /*drawingUtils.drawLandmarks(landmarks, { 
        color: "#FF0000", 
        lineWidth: 2 
    });*/

    const hand = readHand(handedness, landmarks);
    // console.log(`${JSON.stringify(hand)} found`)
    // draw wrist
    drawingUtils.drawLandmarks(hand.wrist.landmarks, {
        color: hand.wrist.color,
        radius: 4,
        lineWidth: 1,
    });
    // draw fingers
    for (let idx in hand.fingers) {
        const finger = hand.fingers[idx];
        const landmarks = finger.landmarks;
        // draw it
        drawingUtils.drawLandmarks(landmarks, {
            color: (finger.closed)?finger.color2:finger.color1,
            radius: 4,
            lineWidth: 1,
        });
    }

    /*landmarks.forEach((landmark, index) => {
        let color = "#000000";
        let size = 2;
        // color chooser
        if (index === 0) color = "#FFFFFF"; // Polso (Bianco)
        if (index >= 1 && index <= 4) color = "#ff3f3f"; // Pollice (Rosso)
        if (index >= 5 && index <= 8) color = "#00FF00"; // Indice (Verde)
        if (index >= 9 && index <= 12) color = "#2525ff"; // Medio (Blu)
        if (index >= 13 && index <= 16) color = "#FFFF00"; // Anulare (Giallo)
        if (index >= 17 && index <= 20) color = "#8320b1"; // Mignolo (Viola)
        // size chooser
        if ((index === 0) || 
            (index === 4) || 
            (index === 8) || 
            (index === 12) || 
            (index === 16) || 
            (index === 20)) {
                size = 4;
                console.log(index, landmark);
        }
        // draw it
        drawingUtils.drawLandmarks([landmark], {
            color: color,
            radius: size,
            lineWidth: 1,
        });
    });*/
}

// == DETECT ======================================================================== //

// the detector
let handLandmarker = await createHandLandmarker();
let running = false;

// detect from video
async function startDetection(video, canvas) {
    console.log("detection started");
    let lastTimestamp = -1;
    running = true;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const drawingUtils = new DrawingUtils(ctx);

    function frameLoop(timestamp) {
        if (running) {
            // draw the camera input (before detection to speedup continuous drawing)
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // detect 
            let results = undefined;
            /*if (video.currentTime !== lastTimestamp) { // analyze every frame
                results = handLandmarker.detectForVideo(video, video.currentTime);
                lastTimestamp = video.currentTime;
            }*/
            if (timestamp - lastTimestamp >= 33) { // detect every 33ms to unload CPU/GPU (it's about 30 FPS = 1000msec/30fps) 
                results = handLandmarker.detectForVideo(video, timestamp);
                lastTimestamp = timestamp;
            }
            
            // draw the sticky connections
            if (results && results?.landmarks) {
                // clear and redraw photo before the drawings
                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // iterate hands to draw them
                const landmarks = results.landmarks;
                const handedness = results.handedness;
                for (let i=0; i<handedness.length; i++) {
                    const hand = handedness[i];
                    const lm = landmarks[i];
                    drawHand(drawingUtils, hand, lm);
                }
                //
                ctx.restore();
            }

            // trigger another loop
            requestAnimationFrame(frameLoop);
        }
    }
    frameLoop();
}

//
async function stopDetection() {
    console.log("detection stopped");
    running = false;

    if (handLandmarker) {
        handLandmarker.close();
        handLandmarker = await createHandLandmarker(); // reinit the landmarker obj
    }
}

// == PLUGIN ======================================================================== //

// the exported "pseudo" mediapipe object
const mediapipe = {
    startDetection,
    stopDetection,
}

export default {
    install: (app, options) => {
        app.config.globalProperties.$mediapipe = mediapipe;
        app.provide("mediapipe", mediapipe);
    }
}