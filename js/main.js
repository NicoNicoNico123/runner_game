import { GAME_WIDTH, GAME_HEIGHT, STATE, LEVELS } from './constants.js';
import { Player } from './Player.js';
import { Camera } from './Camera.js';
import { particles, createParticles } from './Particle.js';
import { generateLevel } from './LevelGenerator.js';

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
        document.querySelector('#level-complete-screen h2').innerText = "ALL CITIES CONQUERED";
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

function drawCityLayer(speed, heightVar, widthVar) {
    const offset = -(camera.x * speed) % 2000;
    const yBase = GAME_HEIGHT;
    
    ctx.beginPath();
    ctx.moveTo(offset - 100, yBase);
    
    // Pseudo-random city blocks based on Math.sin to be deterministic without storage
    for(let x = -100; x < GAME_WIDTH + 200; x+= widthVar) {
        let h = Math.abs(Math.sin(x + currentLevelIndex)) * heightVar + 50;
        ctx.lineTo(x + offset, yBase - h);
        ctx.lineTo(x + widthVar + offset, yBase - h);
    }
    
    ctx.lineTo(GAME_WIDTH + offset + 200, yBase);
    ctx.fill();
}

function drawBackground() {
    const config = LEVELS[currentLevelIndex];
    
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0, config.bgColors[0]);
    grad.addColorStop(0.5, config.bgColors[1]);
    grad.addColorStop(1, config.bgColors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Retro Sun
    const sunY = 150;
    ctx.fillStyle = `rgba(255, 42, 109, 0.2)`; 
    ctx.beginPath();
    ctx.arc(GAME_WIDTH / 2, sunY + (camera.x * 0.05) % 10, 100, 0, Math.PI * 2);
    ctx.fill();

    // Parallax City Layers
    // Far (Silhouettes)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    drawCityLayer(0.1, 100, 50);

    // Mid
    ctx.fillStyle = 'rgba(20, 10, 30, 0.8)';
    drawCityLayer(0.3, 150, 100);

    // Near
    ctx.fillStyle = 'rgba(5, 5, 10, 0.9)';
    drawCityLayer(0.6, 200, 150);
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
    levelData.traps.forEach(t => {
        if (t.destroyed || t.x + t.w < camX || t.x > camX + GAME_WIDTH) return;

        // Glitch effect for traps
        const jitter = Math.random() * 2;
        
        if (t.type === 'small') {
            // Garbage/Crates/Barrier
            ctx.fillStyle = '#ff2a6d'; // Pink danger
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff2a6d';
            ctx.fillRect(t.x - camX + jitter, t.y, t.w, t.h);
            
            // X icon
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.fillText("X", t.x - camX + 5, t.y + 20);
        } else {
            // Poles/Statues
            ctx.fillStyle = '#05d9e8'; // Blue danger
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#05d9e8';
            ctx.fillRect(t.x - camX + jitter, t.y, t.w, t.h);
        }
        ctx.shadowBlur = 0;
    });

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
    const gx = levelData.goalX - camX;
    if (gx < GAME_WIDTH) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(gx, 0, 100, GAME_HEIGHT);
        
        // Portal effect
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 5;
        ctx.strokeRect(gx, 100, 100, 300);
        
        ctx.font = '20px "Press Start 2P"';
        ctx.fillStyle = '#fff';
        ctx.fillText("GOAL", gx + 15, 250);
    }
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Background
    drawBackground();

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
    currentLevelIndex = 0;
    initLevel();
    currentState = STATE.PLAYING;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
}

function nextLevel() {
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
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
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

// Start Loop
requestAnimationFrame(gameLoop);

