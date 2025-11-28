export class Particle {
    constructor(x, y, color, speed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.life = 1.0;
        this.size = Math.random() * 4 + 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.03;
        this.size *= 0.95;
    }
    draw(ctx, camX) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camX, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

export const particles = [];

export function createParticles(x, y, count, color) {
    for(let i=0; i<count; i++) {
        particles.push(new Particle(x, y, color, 8));
    }
}

