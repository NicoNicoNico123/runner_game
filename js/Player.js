import { createParticles } from './Particle.js';
import { GAME_HEIGHT } from './constants.js';

export class Player {
    constructor() {
        this.width = 30;
        this.height = 48;
        this.x = 100;
        this.y = 300;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.color = '#00ffff'; // Blue hair base
        this.trail = [];
        
        // Incredible Mode
        this.isIncredible = false;
        this.incredibleTimer = 0;
        this.animFrame = 0;
    }

    reset(speed) {
        this.x = 100;
        this.y = 300;
        this.vx = speed;
        this.vy = 0;
        this.isGrounded = false;
        this.isIncredible = false;
        this.trail = [];
    }

    jump(force) {
        if (this.isGrounded) {
            this.vy = force;
            this.isGrounded = false;
            // Spawn jump dust
            createParticles(this.x + this.width/2, this.y + this.height, 10, '#fff');
        }
    }

    update(dt, gravity, platforms, onDeath, frameCount) {
        // Incredible Timer
        if (this.isIncredible) {
            this.incredibleTimer -= dt;
            if (this.incredibleTimer <= 0) {
                this.isIncredible = false;
            }
        }

        // Physics
        this.vy += gravity;
        this.y += this.vy;
        this.x += this.vx;

        this.isGrounded = false;

        // Collision: Platforms
        // Simple AABB for top collision only (landing)
        // We only collide if we are falling (vy > 0) and were previously above the platform
        const bottom = this.y + this.height;
        const prevBottom = (this.y - this.vy) + this.height;

        // Floor / Pit check
        // Check map specific platforms first
        let onPlatform = false;
        
        for (let p of platforms) {
            if (this.x + this.width > p.x && this.x < p.x + p.w) {
                // Horizontal overlap
                // Check vertical landing
                if (bottom >= p.y && prevBottom <= p.y + 10 && this.vy >= 0) {
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                    onPlatform = true;
                }
            }
        }

        // Death by pit
        if (this.y > GAME_HEIGHT + 100) {
            onDeath();
        }

        // Trail effect
        if (frameCount % 3 === 0) {
            this.trail.push({x: this.x, y: this.y, alpha: 0.8});
            if (this.trail.length > 8) this.trail.shift();
        }

        this.animFrame++;
    }

    draw(ctx, camX) {
        // Draw Trail
        this.trail.forEach(t => {
            t.alpha -= 0.05;
            if (t.alpha < 0) t.alpha = 0;
            ctx.fillStyle = this.isIncredible 
                ? `rgba(255, 255, 0, ${t.alpha})` 
                : `rgba(0, 255, 255, ${t.alpha * 0.5})`;
            ctx.fillRect(t.x - camX, t.y, this.width, this.height);
        });

        const drawX = this.x - camX;
        const drawY = this.y;

        // Visual Glitch if Incredible
        let offsetX = 0;
        if (this.isIncredible) {
            offsetX = (Math.random() - 0.5) * 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'yellow';
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'cyan';
        }

        // Pixel Art Construction (The Blue-Haired Girl)
        ctx.save();
        ctx.translate(drawX + offsetX, drawY);

        // Body color
        const skin = '#ffccaa';
        const hair = this.isIncredible ? '#ffffaa' : '#00ffff';
        const clothes = '#ff2a6d';

        // 1. Legs (Animated)
        const runCycle = Math.floor(this.animFrame / 5) % 4;
        
        ctx.fillStyle = '#111'; // Tights
        if (this.isGrounded) {
             // Run animation
             if (runCycle === 0) { ctx.fillRect(5, 30, 8, 18); ctx.fillRect(17, 30, 8, 18); }
             else if (runCycle === 1) { ctx.fillRect(5, 28, 8, 15); ctx.fillRect(17, 32, 8, 16); }
             else if (runCycle === 2) { ctx.fillRect(5, 30, 8, 18); ctx.fillRect(17, 30, 8, 18); }
             else { ctx.fillRect(5, 32, 8, 16); ctx.fillRect(17, 28, 8, 15); }
        } else {
            // Jump pose
            ctx.fillRect(4, 28, 8, 14); // Back leg tucked
            ctx.fillRect(18, 32, 8, 16); // Front leg extended
        }

        // 2. Torso
        ctx.fillStyle = clothes;
        ctx.fillRect(5, 16, 20, 16);
        
        // 3. Head
        ctx.fillStyle = skin;
        ctx.fillRect(6, 0, 18, 16);

        // 4. Hair (Big blue vaporwave hair)
        ctx.fillStyle = hair;
        ctx.fillRect(4, -4, 22, 8); // Top
        ctx.fillRect(2, 0, 6, 18); // Left side
        ctx.fillRect(24, 0, 6, 18); // Right side
        // Ponytail trail
        if (this.vy > 0) ctx.fillRect(8, -8, 8, 6); // Up when falling
        else ctx.fillRect(8, -2, 8, 6); 

        // 5. Eye (Side profile ish)
        ctx.fillStyle = '#000';
        ctx.fillRect(20, 6, 2, 4);

        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

