import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm';

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

        const cameraPanel = document.getElementById('camera-panel');
        const preview = document.getElementById('cameraPreview');
        if (!preview) {
            console.error("cameraPreview element not found");
            alert("Camera preview element missing from page.");
            return;
        }

        // If already running, just ensure the panel is visible.
        if (this.running && this.video && this.video.srcObject) {
            if (cameraPanel) {
                cameraPanel.classList.remove('hidden');
                cameraPanel.setAttribute('aria-hidden', 'false');
            }
            return;
        }

        // Use the visible preview video element so mobile users can see the camera feed.
        this.video = preview;
        this.video.muted = true;
        this.video.playsInline = true;

        try {
            let stream;
            try {
                // Prefer front/selfie camera (works best for eye control).
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: 'user' },
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });
            } catch (constraintErr) {
                // Many desktop/laptop webcams don't support facingMode constraints.
                console.warn("getUserMedia constraints rejected, falling back to video:true", constraintErr);
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            }

            this.video.srcObject = stream;

            if (cameraPanel) {
                cameraPanel.classList.remove('hidden');
                cameraPanel.setAttribute('aria-hidden', 'false');
            }

            // Let the game rescale to the reduced top region immediately.
            window.dispatchEvent(new Event('resize'));

            // Start playback and prediction. Some browsers won't reliably fire `loadeddata`
            // for srcObject streams, so don't depend on it.
            try {
                await this.video.play();
            } catch (playErr) {
                console.warn("video.play() was blocked or failed:", playErr);
                // On some browsers, user interaction is required; the click that called
                // startCamera() should satisfy that, but if not, the preview may remain paused.
            }

            this.lastVideoTime = -1;
            this.running = true;
            this.predict();
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
            this.video.srcObject = null;
        }

        const cameraPanel = document.getElementById('camera-panel');
        if (cameraPanel) {
            cameraPanel.classList.add('hidden');
            cameraPanel.setAttribute('aria-hidden', 'true');
        }

        // Let the game rescale to the expanded top region immediately.
        window.dispatchEvent(new Event('resize'));

        this.video = null;
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

