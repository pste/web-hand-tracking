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

function enableVideo(value) {
    videoActive = value;
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

// scalar product between BA and DC vectors (taken from cosin theorem)
function fingerAngle(points) {
    // isolate point for better reading
    const a = points[0];
    const b = points[1];
    const c = points[2];
    const d = points[3];

    // build vectors
    const AB = {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    }
    const DC = {
        x: d.x - c.x,
        y: d.y - c.y,
        z: d.z - c.z,
    }
    
    // do the math
    const scalarProduct = (AB.x * DC.x) + (AB.y * DC.y) + (AB.z * DC.z);
    const ABlen = Math.sqrt(Math.pow(AB.x, 2) + Math.pow(AB.y, 2) + Math.pow(AB.z, 2));
    const DClen = Math.sqrt(Math.pow(DC.x, 2) + Math.pow(DC.y, 2) + Math.pow(DC.z, 2));
    const cos = scalarProduct / (ABlen * DClen);
    return Math.acos(cos) * 180 / Math.PI; // get the angle (in degrees)
}

// build an "hand" object
function readHand(handedness, landmarks) {
    const treshold = 0.3;
    // init the "hand"
    const thl = landmarks.slice(1,5);
    const inl = landmarks.slice(5,9);
    const mil = landmarks.slice(9,13);
    const ril = landmarks.slice(13,17);
    const pil = landmarks.slice(17,21);
    const hand =  {
        info: handedness[0],
        wrist: {
            landmarks: [],
            color: "#FFFFFF",
        },
        fingers: {
            // [1,2,3,4]
            thumb: {
                angle: fingerAngle(thl), // (1,2,3) different points for the thumb
                landmarks: thl,
                color1: "#ff0d0d",
                color2: "#000000",
            },
            // [5,6,7,8]
            index: {
                angle: fingerAngle(inl), // (0,1,3) base, first and last points
                landmarks: inl,
                color1: "#00FF00",
                color2: "#000000",
            },
            // [9,10,11,12]
            middle: {
                angle: fingerAngle(mil),
                landmarks: mil,
                color1: "#0000ff",
                color2: "#000000",
            },
            // [13,14,15,16]
            ring: {
                angle: fingerAngle(ril),
                landmarks: ril,
                color1:"#FFFF00",
                color2:"#000000",
            },
            // [17,18,19,20]
            pinky: {
                angle: fingerAngle(pil),
                landmarks: pil,
                color1: "#7b00b4",
                color2: "#000000",
            }
        }
    }
    //
    return hand;
}

// draw the hand(s)
function drawHand(drawingUtils, handedness, landmarks) {
    // draw sticky lines
    drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#abffab",
        lineWidth: 5
    });

    // draw all the finger' dots in one shot
    /*drawingUtils.drawLandmarks(landmarks, { 
        color: "#FF0000", 
        lineWidth: 2 
    });*/

    // build hand object
    const hand = readHand(handedness, landmarks);

    // draw wrist
    drawingUtils.drawLandmarks(hand.wrist.landmarks, {
        color: hand.wrist.color,
        radius: 4,
        //lineWidth: 1,
    });

    // draw fingers
    for (let idx in hand.fingers) {
        const finger = hand.fingers[idx];
        const landmarks = finger.landmarks;
        // draw it
        drawingUtils.drawLandmarks(landmarks, {
            color: (finger.angle <= 110) ? finger.color2 : finger.color1,
            radius: 2,
            //lineWidth: 1,
        });
    }
}

// == DETECT ======================================================================== //

// the detector
let handLandmarker = await createHandLandmarker();
let running = false;
let videoActive = true;

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
            if (videoActive) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }

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
                if (videoActive) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }

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
    enableVideo,
}

export default {
    install: (app, options) => {
        app.config.globalProperties.$mediapipe = mediapipe;
        app.provide("mediapipe", mediapipe);
    }
}