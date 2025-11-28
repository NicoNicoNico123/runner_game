import { GAME_WIDTH } from './constants.js';

export function drawTraps(ctx, camera, levelData, levelName, frameCount) {
    const camX = Math.floor(camera.x);

    levelData.traps.forEach(t => {
        if (t.destroyed || t.x + t.w < camX || t.x > camX + GAME_WIDTH) return;

        // Jitter effect for glitchy look
        const jitter = Math.random() * 2;
        const drawX = t.x - camX + jitter;
        const drawY = t.y;

        ctx.save();

        if (levelName === "HONG KONG") {
            drawHongKongTrap(ctx, t, drawX, drawY, frameCount);
        } 
        else if (levelName === "TOKYO") {
            drawTokyoTrap(ctx, t, drawX, drawY, frameCount);
        }
        else if (levelName === "EUROPE") {
            drawEuropeTrap(ctx, t, drawX, drawY, frameCount);
        } else {
            drawDefaultTrap(ctx, t, drawX, drawY, frameCount);
        }

        ctx.restore();
    });
}

function drawHongKongTrap(ctx, t, drawX, drawY, frameCount) {
    const isFlash = Math.floor(frameCount / 10) % 2 === 0;
    const redMain = isFlash ? '#ff4444' : '#990000';
    const redDark = '#550000';

    if (t.type === 'tall') {
        // Red Bamboo Scaffolding
        ctx.strokeStyle = redMain;
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Vertical poles
        ctx.moveTo(drawX + 5, drawY + t.h); ctx.lineTo(drawX + 5, drawY);
        ctx.moveTo(drawX + t.w - 5, drawY + t.h); ctx.lineTo(drawX + t.w - 5, drawY);
        // Cross bars
        for(let y = 0; y < t.h; y+=15) {
            ctx.moveTo(drawX, drawY + y); ctx.lineTo(drawX + t.w, drawY + y - 5);
        }
        ctx.stroke();
        
        // Hazard Light
        ctx.fillStyle = isFlash ? '#fff' : '#ff0000';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.fillRect(drawX - 5, drawY + 10, 10, 30);
    } else {
        // Randomly pick AC Unit or Water Tank based on static world position
        if ((Math.floor(t.x) % 200) < 100) {
             // AC Unit - Red
            ctx.fillStyle = redMain;
            ctx.fillRect(drawX, drawY, t.w, t.h);
            
            // Fan details
            ctx.fillStyle = redDark;
            ctx.beginPath();
            ctx.arc(drawX + t.w/2, drawY + t.h/2, 8, 0, Math.PI*2);
            ctx.fill();
            
            // Drip (Blood/Red liquid?)
            if (frameCount % 60 < 30) {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(drawX + t.w/2, drawY + t.h, 2, 10);
            }
        } else {
            // Water Tank - Red
            ctx.fillStyle = isFlash ? '#ff6666' : '#cc0000';
            ctx.beginPath();
            ctx.ellipse(drawX + t.w/2, drawY, t.w/2, 5, 0, 0, Math.PI * 2);
            ctx.rect(drawX, drawY, t.w, t.h);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(drawX + t.w - 5, drawY, 5, t.h);
            
            ctx.fillStyle = redDark;
            ctx.fillRect(drawX + 5, drawY + 10, 2, 15);
        }
    }
}

function drawTokyoTrap(ctx, t, drawX, drawY, frameCount) {
    const isFlash = Math.floor(frameCount / 10) % 2 === 0;
    const redMain = isFlash ? '#ff2222' : '#880000';

    if (t.type === 'tall') {
        // Red Railway Signal
        ctx.fillStyle = '#440000';
        ctx.fillRect(drawX + 10, drawY, 10, t.h);
        
        // Signal Box
        ctx.fillStyle = redMain;
        ctx.fillRect(drawX, drawY, 30, 40);
        
        // Lights
        const blink = Math.floor(frameCount / 15) % 2;
        ctx.fillStyle = blink ? '#ffaaaa' : '#550000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = blink ? 20 : 0;
        ctx.beginPath();
        ctx.arc(drawX + 15, drawY + 20, 8, 0, Math.PI*2);
        ctx.fill();
    } else {
        // Red Vending Machine
        ctx.fillStyle = redMain;
        ctx.fillRect(drawX, drawY, t.w, t.h);
        
        // Display
        ctx.fillStyle = '#ffaaaa';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0000';
        ctx.fillRect(drawX + 4, drawY + 4, t.w - 8, t.h/2);
        
        ctx.fillStyle = '#330000';
        ctx.shadowBlur = 0;
        ctx.fillRect(drawX + 4, drawY + t.h - 10, t.w - 8, 6);
    }
}

function drawEuropeTrap(ctx, t, drawX, drawY, frameCount) {
    const isFlash = Math.floor(frameCount / 10) % 2 === 0;
    const redMain = isFlash ? '#dd3333' : '#771111';

    if (t.type === 'tall') {
        // Red Brick Chimney
        ctx.fillStyle = redMain;
        ctx.fillRect(drawX, drawY, t.w, t.h);
        
        // Brick details
        ctx.fillStyle = '#550000';
        for(let y=0; y<t.h; y+=10) {
            ctx.fillRect(drawX + (y%20?0:10), drawY + y, 10, 4);
        }
        
        // Smoke
        ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
        const smokeOff = Math.sin(frameCount * 0.1 + t.x) * 5;
        ctx.beginPath();
        ctx.arc(drawX + t.w/2 + smokeOff, drawY - 10, 8, 0, Math.PI*2);
        ctx.fill();
    } else {
        // Red Hot Iron Fence
        ctx.fillStyle = isFlash ? '#ff5500' : '#661100';
        ctx.beginPath();
        ctx.moveTo(drawX, drawY + t.h);
        ctx.lineTo(drawX + t.w/2, drawY); 
        ctx.lineTo(drawX + t.w, drawY + t.h);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(drawX + t.w/2, drawY, 3, 0, Math.PI*2);
        ctx.fill();
    }
}

function drawDefaultTrap(ctx, t, drawX, drawY, frameCount) {
    const isFlash = Math.floor(frameCount / 10) % 2 === 0;
    const redMain = isFlash ? '#ff0000' : '#990000';
    
    ctx.fillStyle = redMain;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    ctx.fillRect(drawX, drawY, t.w, t.h);
    
    if (t.type === 'small') {
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText("X", drawX + 5, drawY + 20);
    }
}
