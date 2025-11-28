import { GAME_WIDTH, GAME_HEIGHT, STATE, LEVELS } from './constants.js';
import { Player } from './Player.js';
import { Camera } from './Camera.js';
import { particles, createParticles } from './Particle.js';
import { generateLevel } from './LevelGenerator.js';
import { drawBackground, drawGoal } from './Backgrounds.js';
import { drawTraps } from './TrapRenderer.js';
import { saveScore, loadLeaderboard } from './firebase.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

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

function initLevel() {
    const config = LEVELS[currentLevelIndex];
    
    // Update UI
    document.getElementById('city-name').innerText = `${config.name} - ${config.sub}`;
    document.documentElement.style.setProperty('--neon-primary', config.theme === 'pink' ? '#ff2a6d' : (config.theme === 'blue' ? '#05d9e8' : '#ffd700'));

    // Generate Level
    levelData = generateLevel(config);
    
    // Reset Player
    player.reset(config.speed);
    
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
    // Clear
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

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
    initLevel();
    currentState = STATE.PLAYING;
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
        document.getElementById('level-complete-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
    }
}

function retryLevel() {
    initLevel(); // Restart current
    currentState = STATE.PLAYING;
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
requestAnimationFrame(gameLoop);
