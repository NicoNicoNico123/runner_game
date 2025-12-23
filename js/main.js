import { GAME_WIDTH, GAME_HEIGHT, STATE, LEVELS, GAME_SPEED_MULTIPLIER } from './constants.js';
import { Player } from './Player.js';
import { Camera } from './Camera.js';
import { particles, createParticles } from './Particle.js';
import { generateLevel } from './LevelGenerator.js';
import { drawBackground, drawGoal } from './Backgrounds.js';
import { drawTraps } from './TrapRenderer.js';
import { saveScore, loadLeaderboard } from './firebase.js';
import { EyeController } from './EyeController.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

const gameContainer = document.getElementById('game-container');
const gameRegion = document.querySelector('.game-region');

// Input State
let inputActive = false;

// Game State
let currentState = STATE.START;
let frameCount = 0;
let lastTime = 0;
let currentLevelIndex = 0;
let levelData = null;
let startTime = 0; // Timestamp when game started
let totalElapsedTime = 0; // Accumulated time for previous attempts/levels

const player = new Player();
const camera = new Camera();
const eyeController = new EyeController(() => {
    if (currentState === STATE.PLAYING) handleInput();
});

// Init Eye Controller (load model)
eyeController.init();

function setBarBackgroundForLevel(levelIndex) {
    const cfg = LEVELS[levelIndex] || LEVELS[0];
    const colors = cfg?.bgColors || ['#000814', '#120b29', '#001e42'];
    document.documentElement.style.setProperty('--bar-bg-a', colors[0] || '#000814');
    document.documentElement.style.setProperty('--bar-bg-b', colors[1] || colors[0] || '#120b29');
    document.documentElement.style.setProperty('--bar-bg-c', colors[2] || colors[1] || colors[0] || '#001e42');
}

function resizeLayout() {
    if (!gameContainer || !gameRegion) return;

    // Measure available space in the top region
    const rect = gameRegion.getBoundingClientRect();
    const availW = Math.max(1, rect.width);
    const availH = Math.max(1, rect.height);

    // Target a square viewport (1:1) that fits the available region.
    // This makes the game appear "zoomed in" in landscape (square fills height, crops sides).
    const EDGE_GUTTER_PX = 0; // increase if you want breathing room around the square
    const size = Math.floor(Math.min(availW, availH) - EDGE_GUTTER_PX);
    const w = Math.max(1, size);
    const h = Math.max(1, size);

    gameContainer.style.width = `${w}px`;
    gameContainer.style.height = `${h}px`;

    // Match the canvas backing store to the displayed size (for crisp rendering).
    // Note: CSS controls the on-screen size (100% of container).
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pxW = Math.max(1, Math.floor(w * dpr));
    const pxH = Math.max(1, Math.floor(h * dpr));
    if (canvas.width !== pxW) canvas.width = pxW;
    if (canvas.height !== pxH) canvas.height = pxH;
    ctx.imageSmoothingEnabled = false;

    fitVisibleOverlays();
}

function fitVisibleOverlays() {
    if (!gameContainer) return;

    const containerRect = gameContainer.getBoundingClientRect();
    const containerW = Math.max(1, containerRect.width);
    const containerH = Math.max(1, containerRect.height);

    const overlayIds = ['start-screen', 'game-over-screen', 'level-complete-screen'];
    for (const id of overlayIds) {
        const el = document.getElementById(id);
        if (!el || el.classList.contains('hidden')) continue;

        const content = el.querySelector('.overlay-content');
        if (!content) continue;

        // Reset first so measurements reflect natural size.
        el.style.setProperty('--overlay-scale', '1');

        // scrollHeight/scrollWidth represent the full content size even if overflow is hidden.
        const contentW = Math.max(1, content.scrollWidth);
        const contentH = Math.max(1, content.scrollHeight);

        // Leave a tiny breathing room to avoid edge clipping.
        const scaleW = (containerW - 24) / contentW;
        const scaleH = (containerH - 24) / contentH;
        const s = Math.max(0.5, Math.min(1, scaleW, scaleH));

        el.style.setProperty('--overlay-scale', String(s));
    }
}

function initLevel() {
    const config = LEVELS[currentLevelIndex];
    setBarBackgroundForLevel(currentLevelIndex);
    
    // Update UI
    document.getElementById('city-name').innerText = `${config.name} - ${config.sub}`;
    document.documentElement.style.setProperty('--neon-primary', config.theme === 'pink' ? '#ff2a6d' : (config.theme === 'blue' ? '#05d9e8' : '#ffd700'));

    // Generate Level
    levelData = generateLevel(config);
    
    // Reset Player
    player.reset(config.speed * GAME_SPEED_MULTIPLIER);
    
    camera.x = 0;
    // Clear particles
    particles.length = 0; 
}

function handleInput() {
    if (currentState === STATE.PLAYING) {
        player.jump(LEVELS[currentLevelIndex].jumpForce);
    }
}

function die() {
    createParticles(player.x, player.y, 30, '#fff');
    createParticles(player.x, player.y, 30, '#f0f');
    currentState = STATE.GAME_OVER;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    // Ensure overlay content scales to fit the (possibly reduced) game area on mobile.
    fitVisibleOverlays();
    // Switch back to contain sizing (non-playing).
    resizeLayout();
}

function levelComplete() {
    currentState = STATE.LEVEL_COMPLETE;
    const nextIdx = currentLevelIndex + 1;
    
    if (nextIdx >= LEVELS.length) {
        // Victory
        document.querySelector('#level-complete-screen h1').innerText = "VAPORWAVE MASTER";
        const finalTime = Date.now() - startTime + totalElapsedTime; // Current run + accumulated
        const formattedTime = formatTime(finalTime);
        document.querySelector('#level-complete-screen h2').innerText = `ALL CITIES CONQUERED\nTIME: ${formattedTime}`;
        
        saveScore(finalTime); // Save to Firebase

        const btn = document.getElementById('next-level-btn');
        btn.innerText = "RESTART SIMULATION";
        btn.onclick = () => location.reload();
    } else {
        document.getElementById('next-city-name').innerText = `NEXT: ${LEVELS[nextIdx].name}`;
    }
    
    document.getElementById('level-complete-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    // Ensure overlay content scales to fit the (possibly reduced) game area on mobile.
    fitVisibleOverlays();
    // Switch back to contain sizing (non-playing).
    resizeLayout();
}

function update(dt) {
    if (currentState !== STATE.PLAYING) return;

    const config = LEVELS[currentLevelIndex];

    // Pass die as callback
    player.update(dt, config.gravity, levelData.platforms, die, frameCount);
    
    // Fall death check
    if (player.y > GAME_HEIGHT) {
        die();
    }
    
    camera.update(player.x);

    // Trap Collisions
    const px = player.x + 5;
    const py = player.y + 5;
    const pw = player.width - 10;
    const ph = player.height - 10;

    for (let i = levelData.traps.length - 1; i >= 0; i--) {
        const t = levelData.traps[i];
        if (t.destroyed) continue;

        if (px < t.x + t.w && px + pw > t.x && py < t.y + t.h && py + ph > t.y) {
            if (player.isIncredible) {
                // Destroy trap
                t.destroyed = true;
                createParticles(t.x + t.w/2, t.y + t.h/2, 15, '#ffff00');
            } else {
                die();
            }
        }
    }

    // Powerup Collisions
    for (let p of levelData.powerups) {
        if (p.active && px < p.x + p.w && px + pw > p.x && py < p.y + p.h && py + ph > p.y) {
            p.active = false;
            player.isIncredible = true;
            player.incredibleTimer = 5.0; // Seconds
            createParticles(player.x, player.y, 20, '#ffffff');
        }
    }

    // Goal Check
    if (player.x > levelData.goalX) {
        levelComplete();
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // Progress Bar
    const progress = Math.min(100, (player.x / levelData.goalX) * 100);
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function drawWorld() {
    const camX = Math.floor(camera.x);

    // Draw Platforms
    ctx.fillStyle = '#0f0f1a';
    ctx.strokeStyle = '#d300c5'; // Neon Purple outline
    ctx.lineWidth = 2;

    levelData.platforms.forEach(p => {
        if (p.x + p.w < camX || p.x > camX + GAME_WIDTH) return;
        
        ctx.fillRect(p.x - camX, p.y, p.w, p.h + 200); // Extend down
        
        // Grid texture on platforms
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p.x - camX, p.y);
        ctx.lineTo(p.x + p.w - camX, p.y);
        ctx.stroke();
        
        // Vertical neon lines
        ctx.strokeStyle = 'rgba(211, 0, 197, 0.3)';
        ctx.beginPath();
        for(let gx = 0; gx < p.w; gx+=20) {
            ctx.moveTo(p.x + gx - camX, p.y);
            ctx.lineTo(p.x + gx - camX, p.y + p.h + 200);
        }
        ctx.stroke();
        ctx.restore();
    });


    // Draw Traps
    const levelName = LEVELS[currentLevelIndex].name;
    drawTraps(ctx, camera, levelData, levelName, frameCount);

    // Draw Powerups
    levelData.powerups.forEach(p => {
        if (!p.active || p.x + p.w < camX || p.x > camX + GAME_WIDTH) return;
        
        const bob = Math.sin(frameCount * 0.1) * 5;
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffff00';
        
        ctx.beginPath();
        ctx.moveTo((p.x - camX) + 10, p.y + bob);
        ctx.lineTo((p.x - camX) + 20, p.y + bob + 20);
        ctx.lineTo((p.x - camX), p.y + bob + 20);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Draw Goal
    drawGoal(ctx, camera, levelData, levelName, GAME_HEIGHT, frameCount);
}

function draw() {
    // Clear in canvas pixel space
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render the 960x540 game world into the (square) canvas using "cover" scaling:
    // fill the square, but bias the crop so the player stays visible (crop mostly on the right).
    const scaleX = canvas.width / GAME_WIDTH;
    const scaleY = canvas.height / GAME_HEIGHT;
    const scale = Math.max(scaleX, scaleY);
    const renderedW = GAME_WIDTH * scale;
    const renderedH = GAME_HEIGHT * scale;

    // Clamp helper (avoid showing outside the rendered world area).
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // Bias horizontal framing so the player (kept near the left quarter by Camera.js)
    // is always on-screen even when the square viewport crops the sides.
    const playerScreenX = (player?.x ?? 0) - (camera?.x ?? 0); // world-space within the 960x540 frame
    const desiredPlayerX = canvas.width * 0.18; // 18% from left edge
    const rawOffsetX = desiredPlayerX - (playerScreenX * scale);

    const minOffsetX = canvas.width - renderedW; // align-right
    const maxOffsetX = 0; // align-left
    const offsetX = clamp(rawOffsetX, minOffsetX, maxOffsetX);

    // Vertical can stay centered (usually no vertical crop in the square case anyway).
    const offsetY = (canvas.height - renderedH) / 2;
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

    // Background
    drawBackground(ctx, camera, currentLevelIndex, GAME_WIDTH, GAME_HEIGHT, frameCount);

    // World (Platforms, Traps)
    if (currentState !== STATE.START) {
        drawWorld();
        
        // Player
        player.draw(ctx, camera.x);
        
        // Particles
        particles.forEach(p => p.draw(ctx, camera.x));
    }
}

function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    // Cap DT to prevent physics explosion on lag
    const safeDt = Math.min(dt, 0.05);

    if (currentState === STATE.PLAYING) {
        update(safeDt);
    }
    
    draw();
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Global actions exposed to UI
function startGame() {
    const selector = document.getElementById('level-select');
    currentLevelIndex = parseInt(selector.value, 10) || 0;
    setBarBackgroundForLevel(currentLevelIndex);
    initLevel();
    currentState = STATE.PLAYING;
    resizeLayout(); // apply height-fit gameplay sizing
    startTime = Date.now();
    totalElapsedTime = 0; // Reset total time on fresh start
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
}

function nextLevel() {
    // Add time spent in this level to total
    // Note: simple implementation - better would be to track effective play time.
    // Here we just capture wall clock time since start of level
    // But wait, we want continuous time.
    // We don't need to touch startTime/totalElapsedTime here if we just keep measuring against original startTime.
    // HOWEVER, retryLevel resets startTime. So we need a robust strategy.
    
    // Strategy: Maintain 'startTime' as the start of the CURRENT run segment.
    // When we complete a level, we add (Date.now() - startTime) to totalElapsedTime.
    // Then reset startTime for next level? 
    // Actually, simpler: Keep startTime as "Session Start".
    // If we retry, we don't reset Session Start? 
    // Requirement: "counting should be start count from insert coin, even Again still count in it"
    // So: totalElapsedTime is 0 at INSERT COIN.
    // startTime is set at INSERT COIN.
    // Retrying a level just continues the clock.
    
    currentLevelIndex++;
    if (currentLevelIndex < LEVELS.length) {
        initLevel();
        currentState = STATE.PLAYING;
        resizeLayout(); // apply height-fit gameplay sizing
        document.getElementById('level-complete-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
    }
}

function retryLevel() {
    initLevel(); // Restart current
    currentState = STATE.PLAYING;
    resizeLayout(); // apply height-fit gameplay sizing
    // Do NOT reset timer. "Even Again still count in it"
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
}

function backToStart() {
    currentState = STATE.START;
    totalElapsedTime = 0; // Reset on back to start
    startTime = 0;
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    fitVisibleOverlays();
    resizeLayout(); // ensure contain sizing for start screen
}

function toggleLeaderboard() {
    const lb = document.getElementById('leaderboard-container');
    if (lb.classList.contains('hidden')) {
        lb.classList.remove('hidden');
        loadLeaderboard();
    } else {
        lb.classList.add('hidden');
    }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${pad(minutes)}:${pad(seconds)}:${pad(millis)}`;
}

function pad(n) {
    return n < 10 ? '0' + n : n;
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (currentState === STATE.PLAYING) handleInput();
        e.preventDefault();
    }
});

// Touch/Mouse
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    handleInput();
}, {passive: false});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('eye-control-btn').addEventListener('click', async () => {
    const btn = document.getElementById('eye-control-btn');
    btn.innerText = "LOADING...";
    btn.disabled = true;
    await eyeController.startCamera();
    btn.innerText = "EYE CONTROL ENABLED";
});
document.getElementById('next-level-btn').addEventListener('click', nextLevel);
document.getElementById('retry-btn').addEventListener('click', retryLevel);
document.getElementById('back-to-start-btn').addEventListener('click', backToStart);
document.getElementById('leaderboard-btn').addEventListener('click', toggleLeaderboard);
document.getElementById('close-leaderboard-btn').addEventListener('click', toggleLeaderboard);

// Secret Level Select Trigger
let incredibleClickCount = 0;
document.getElementById('incredible-trigger').addEventListener('click', () => {
    incredibleClickCount++;
    if (incredibleClickCount === 3) {
        document.querySelector('.level-select-container').classList.remove('hidden');
    }
});

// Start Loop
setBarBackgroundForLevel(0);
resizeLayout();
window.addEventListener('resize', resizeLayout);
window.addEventListener('orientationchange', resizeLayout);
requestAnimationFrame(gameLoop);
