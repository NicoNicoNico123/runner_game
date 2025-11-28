import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class EyeController {
    constructor(onJump) {
        this.onJump = onJump;
        this.faceLandmarker = null;
        this.video = null;
        this.lastVideoTime = -1;
        this.running = false;
        this.loaded = false;
        this.blinkThreshold = 0.5; // Threshold for blink detection
        this.isBlinking = false;
    }

    async init() {
        try {
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 1
            });
            this.loaded = true;
            console.log("FaceLandmarker loaded");
        } catch (e) {
            console.error("Failed to load FaceLandmarker:", e);
        }
    }

    async startCamera() {
        if (!this.loaded) {
            console.warn("FaceLandmarker not loaded yet");
            return;
        }

        // Create hidden video element
        this.video = document.createElement('video');
        this.video.style.display = 'none';
        document.body.appendChild(this.video);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            this.video.addEventListener("loadeddata", () => {
                this.running = true;
                this.predict();
            });
            this.video.play();
        } catch (e) {
            console.error("Error accessing webcam:", e);
            alert("Could not access webcam. Please ensure you have a camera connected and have granted permission.");
        }
    }

    stop() {
        this.running = false;
        if (this.video && this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.remove();
            this.video = null;
        }
    }

    async predict() {
        if (!this.running || !this.video) return;

        let nowInMs = Date.now();
        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            const results = this.faceLandmarker.detectForVideo(this.video, nowInMs);

            if (results.faceBlendshapes && results.faceBlendshapes.length > 0 && results.faceBlendshapes[0].categories) {
                const categories = results.faceBlendshapes[0].categories;
                
                // Find blink scores
                const blinkLeft = categories.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;
                const blinkRight = categories.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0;

                // Check if BOTH eyes are closed (or maybe just one is enough? let's require both for "close eyes" gesture, or one for easier trigger)
                // User asked for "Eyes close", implying both.
                const isEyesClosed = (blinkLeft > this.blinkThreshold && blinkRight > this.blinkThreshold);

                if (isEyesClosed && !this.isBlinking) {
                    this.isBlinking = true;
                    this.onJump();
                } else if (!isEyesClosed) {
                    this.isBlinking = false;
                }
            }
        }

        if (this.running) {
            window.requestAnimationFrame(() => this.predict());
        }
    }
}

