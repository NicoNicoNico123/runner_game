import { LEVELS } from './constants.js';

export function drawGoal(ctx, camera, levelData, levelName, GAME_HEIGHT, frameCount) {
    const camX = Math.floor(camera.x);
    const gx = levelData.goalX - camX;
    
    // Don't draw if off screen
    if (gx < -200 || gx > 1500) return;

    if (levelName === "HONG KONG") {
        drawHongKongGoal(ctx, gx, GAME_HEIGHT, frameCount);
    } else if (levelName === "TOKYO") {
        drawTokyoGoal(ctx, gx, GAME_HEIGHT, frameCount);
    } else if (levelName === "PARIS") {
        drawEuropeGoal(ctx, gx, GAME_HEIGHT, frameCount);
    }
}

function drawHongKongGoal(ctx, x, h, frameCount) {
    // Neon Cyber Portal
    ctx.save();
    
    // Glow
    const pulse = Math.sin(frameCount * 0.1) * 10 + 20;
    ctx.shadowBlur = pulse;
    ctx.shadowColor = '#00ffff';
    
    // Pillars
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x, 100, 20, h - 100);
    ctx.fillRect(x + 120, 100, 20, h - 100);
    
    // Top Arch
    ctx.fillRect(x, 80, 140, 20);
    
    // Holographic Field
    ctx.globalAlpha = 0.3;
    const grad = ctx.createLinearGradient(x, 0, x + 140, 0);
    grad.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
    grad.addColorStop(0.5, 'rgba(255, 0, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 255, 255, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 20, 100, 100, h - 100);
    
    // Text
    ctx.globalAlpha = 1.0;
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#ff00ff';
    ctx.fillText("FINISH", x + 20, 200);
    
    ctx.restore();
}

function drawTokyoGoal(ctx, x, h, frameCount) {
    // Torii Gate
    ctx.save();
    
    const vermilion = '#e73225';
    const black = '#111';
    
    // Left Pillar
    ctx.fillStyle = vermilion;
    ctx.fillRect(x, 150, 15, h - 150);
    ctx.fillStyle = black;
    ctx.fillRect(x - 2, h - 10, 19, 10); // Base
    
    // Right Pillar
    ctx.fillStyle = vermilion;
    ctx.fillRect(x + 120, 150, 15, h - 150);
    ctx.fillStyle = black;
    ctx.fillRect(x + 118, h - 10, 19, 10); // Base
    
    // Top Lintel (Kasagi) - Curved
    ctx.fillStyle = vermilion;
    ctx.beginPath();
    ctx.moveTo(x - 20, 110);
    ctx.quadraticCurveTo(x + 67, 100, x + 155, 110);
    ctx.lineTo(x + 155, 130);
    ctx.quadraticCurveTo(x + 67, 120, x - 20, 130);
    ctx.fill();
    
    // Top Black Cap
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.moveTo(x - 20, 110);
    ctx.quadraticCurveTo(x + 67, 100, x + 155, 110);
    ctx.lineTo(x + 155, 115);
    ctx.quadraticCurveTo(x + 67, 105, x - 20, 115);
    ctx.fill();
    
    // Lower Lintel (Nuki)
    ctx.fillStyle = vermilion;
    ctx.fillRect(x, 160, 135, 15);
    
    // Center Plaque
    ctx.fillStyle = black;
    ctx.fillRect(x + 57, 115, 20, 25);
    ctx.fillStyle = '#gold'; // logic error: hex, fix below
    ctx.fillStyle = '#ffd700';
    ctx.font = '15px "Arial"';
    ctx.textAlign = 'center';
    ctx.fillText("ゴール", x + 67, 132); // "Goal" in Katakana
    
    // Particle/Spiritual effect
    if (frameCount % 10 === 0) {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x + 67 + (Math.random()-0.5)*100, 200 + Math.random()*100, 2, 0, Math.PI*2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawEuropeGoal(ctx, x, h, frameCount) {
    // Gothic Archway
    ctx.save();
    
    const stone = '#4a4a4a';
    const darkStone = '#2a2a2a';
    
    // Arch Shape
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x, 150);
    // Pointed Arch
    ctx.quadraticCurveTo(x, 50, x + 75, 50); // Left curve
    ctx.quadraticCurveTo(x + 150, 50, x + 150, 150); // Right curve
    ctx.lineTo(x + 150, h);
    
    // Inner cut (to make it an arch)
    ctx.lineTo(x + 120, h);
    ctx.lineTo(x + 120, 150);
    ctx.quadraticCurveTo(x + 120, 80, x + 75, 80);
    ctx.quadraticCurveTo(x + 30, 80, x + 30, 150);
    ctx.lineTo(x + 30, h);
    ctx.closePath();
    
    ctx.fillStyle = stone;
    ctx.fill();
    ctx.strokeStyle = darkStone;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Magical Portal inside
    const pulse = Math.abs(Math.sin(frameCount * 0.05));
    const portalGrad = ctx.createRadialGradient(x + 75, 200, 10, x + 75, 200, 100);
    portalGrad.addColorStop(0, '#fff');
    portalGrad.addColorStop(0.5, `rgba(255, 215, 0, ${pulse})`); // Gold
    portalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = portalGrad;
    ctx.fillRect(x + 30, 80, 90, h - 80);
    
    ctx.restore();
}

export function drawBackground(ctx, camera, currentLevelIndex, GAME_WIDTH, GAME_HEIGHT, frameCount) {
    const config = LEVELS[currentLevelIndex];
    const levelName = config.name;

    if (levelName === "HONG KONG") {
        drawHongKong(ctx, camera, GAME_WIDTH, GAME_HEIGHT, frameCount);
    } else if (levelName === "TOKYO") {
        drawTokyo(ctx, camera, GAME_WIDTH, GAME_HEIGHT, frameCount, currentLevelIndex, config);
    } else if (levelName === "PARIS") {
        drawEurope(ctx, camera, GAME_WIDTH, GAME_HEIGHT, frameCount, currentLevelIndex, config);
    }
}

function drawHongKong(ctx, camera, w, h, frameCount) {
    // 1. Retro Sky Gradient (Cyan -> Purple -> Pink)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#4aa8b8'); // Desaturated Cyan
    grad.addColorStop(0.5, '#5e3c85'); // Desaturated Purple
    grad.addColorStop(0.8, '#b05a7a'); // Desaturated Pink
    grad.addColorStop(1, '#2a0e36'); // Dark city base
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Big Retro Sun
    ctx.save();
    const sunY = h * 0.4;
    const sunX = w / 2;
    
    // Sun Glow
    ctx.shadowBlur = 50;
    ctx.shadowColor = '#c77dff';
    
    // Sun Gradient
    const sunGrad = ctx.createLinearGradient(0, sunY - 100, 0, sunY + 100);
    sunGrad.addColorStop(0, '#c77dff');
    sunGrad.addColorStop(1, '#ffcd69');
    ctx.fillStyle = sunGrad;
    
    ctx.beginPath();
    ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Sun Cuts
    ctx.fillStyle = '#5e3c85'; 
    for(let i = 0; i < 10; i++) {
        let y = sunY + 20 + i * 14;
        let hLine = i * 1.5 + 3;
        if (y < sunY + 120) {
            ctx.fillRect(sunX - 130, y, 260, hLine);
        }
    }
    ctx.restore();

    // 3. Mountains (Dark Silhouette)
    ctx.fillStyle = '#11051f';
    drawMountainLayer(ctx, camera, 0.05, h * 0.6, w, h);

    // 4. "HONG KONG" Text
    ctx.save();
    ctx.font = '80px "Vibur", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillText("HONG KONG", w / 2, h * 0.4);
    ctx.restore();

    // 5. City Layers (Dense, vertical, neon)
    // Far Buildings
    drawCityLayer(ctx, camera, 0.1, 250, 40, h, w, h, 100, (screenX, y, wid, hei) => {
        ctx.fillStyle = '#210b36';
        ctx.fillRect(screenX, y, wid, hei);
        
        // Random lit windows pattern - using screenX is fine for random seed if deterministic
        // but using worldX is better. Since we only have screenX here, we rely on seedOffset in drawCityLayer
        // actually drawCityLayer now computes based on worldX, but passes screenX to callback
        // We need world coordinates to keep texture stable!
        // Let's fix drawCityLayer to pass worldX as well or handle texture inside
    });

    // Mid Buildings
    drawCityLayer(ctx, camera, 0.3, 150, 60, h, w, h, 200, (screenX, y, wid, hei, worldX) => {
        ctx.fillStyle = '#341256'; 
        ctx.fillRect(screenX, y, wid, hei);
        
        // Neon Signs Vertical
        if (Math.sin(worldX) > 0) {
            ctx.fillStyle = '#c95c7f';
            ctx.shadowColor = '#c95c7f';
            ctx.shadowBlur = 10;
            ctx.fillRect(screenX + 5, y + 20, 10, 60);
            ctx.shadowBlur = 0;
        }
    });

    // 6. Rooftop Foreground
    drawRooftopLayer(ctx, camera, 0.8, h, w, frameCount);
}

function drawRooftopLayer(ctx, camera, speed, h, w, frameCount) {
    const layerX = camera.x * speed;
    const blockWidth = 200;
    
    // Snap to grid
    const startX = Math.floor(layerX / blockWidth) * blockWidth - blockWidth;
    const endX = layerX + w + blockWidth;

    for(let worldX = startX; worldX < endX; worldX += blockWidth) {
        const drawX = worldX - layerX;
        
        // Deterministic height
        const roofH = (Math.sin(worldX) * 50) + 150; 
        const y = h - roofH;

        ctx.fillStyle = '#151525'; // Dark foreground building color
        ctx.fillRect(drawX, y, blockWidth, roofH);
        
        // Add Roof Details
        // 1. Railing / Fence
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawX, y - 10);
        ctx.lineTo(drawX + blockWidth, y - 10);
        for(let i=0; i<=blockWidth; i+=20) {
            ctx.moveTo(drawX + i, y);
            ctx.lineTo(drawX + i, y - 10);
        }
        ctx.stroke();

        // 2. Water Tanks (Silver cylinders)
        if (Math.abs(Math.sin(worldX * 0.5)) > 0.5) {
            ctx.fillStyle = '#889';
            ctx.fillRect(drawX + 20, y - 30, 40, 30); // Tank body
            ctx.fillStyle = '#aad';
            ctx.fillRect(drawX + 20, y - 32, 40, 4); // Lid
        }

        // 3. AC Units (Boxes with fans)
        if (Math.cos(worldX) > 0) {
            ctx.fillStyle = '#667';
            ctx.fillRect(drawX + 100, y + 20, 40, 30);
            ctx.fillStyle = '#223';
            ctx.beginPath();
            ctx.arc(drawX + 120, y + 35, 10, 0, Math.PI*2); // Fan
            ctx.fill();
        }

        // 4. Bamboo Scaffolding (Grid lines)
        if (Math.abs(worldX % 400) < 100) {
            ctx.strokeStyle = '#c2b280';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Verticals
            for(let bx=0; bx<60; bx+=15) {
                ctx.moveTo(drawX + 140 + bx, y - 50);
                ctx.lineTo(drawX + 140 + bx, h);
            }
            // Horizontals
            for(let by=y-50; by<h; by+=20) {
                ctx.moveTo(drawX + 130, by);
                ctx.lineTo(drawX + 200, by);
            }
            ctx.stroke();
        }

        // 5. Neon Sign on roof edge
        if (Math.abs(worldX % 600) < 100) {
            ctx.fillStyle = '#05d9e8';
            ctx.shadowColor = '#05d9e8';
            ctx.shadowBlur = 15;
            ctx.font = '20px "Press Start 2P"';
            ctx.fillText("BAR", drawX + 50, y + 80);
            ctx.shadowBlur = 0;
        }
    }
}

function drawTokyo(ctx, camera, w, h, frameCount, currentLevelIndex, config) {
    // 1. Sky Gradient (Synthwave: Deep Purple -> Pink -> Orange)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2b1055'); // Deep Purple
    grad.addColorStop(0.5, '#7597de'); // Light Blue/Purple mix
    grad.addColorStop(0.8, '#d85d9d'); // Pink
    grad.addColorStop(1, '#eebb88'); // Peach/Orange
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Big Sun (Retro)
    ctx.save();
    const sunX = w * 0.5;
    const sunY = h * 0.55;
    const sunRadius = 180; // Large sun

    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGrad.addColorStop(0, '#ffd700');
    sunGrad.addColorStop(0.5, '#ff6b6b');
    sunGrad.addColorStop(1, '#c71585');
    ctx.fillStyle = sunGrad;

    // Sun Glow
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Sun stripes (transparent cuts)
    for(let i = 0; i < 12; i++) {
        let y = sunY + 20 + i * 14;
        let thick = 2 + i * 1.2;
        if (y < sunY + sunRadius) {
             ctx.fillStyle = 'rgba(43, 16, 85, 0.7)'; // Dark bands matching sky/mountain base
             ctx.fillRect(sunX - sunRadius, y, sunRadius * 2, thick);
        }
    }
    ctx.restore();

    // 3. Mount Fuji (Silhouette)
    const fujiH = 300;
    const fujiW = 900;
    const fujiX = w * 0.5;
    const fujiY = h * 0.75; // Horizon line

    ctx.save();
    ctx.translate(fujiX, fujiY);
    ctx.beginPath();
    // Left slope
    ctx.moveTo(-fujiW/2, fujiH);
    ctx.quadraticCurveTo(-fujiW/8, -fujiH*0.3, 0, -fujiH); // Peak
    ctx.quadraticCurveTo(fujiW/8, -fujiH*0.3, fujiW/2, fujiH); // Right slope
    ctx.fillStyle = '#1a0b2e'; 
    ctx.fill();
    ctx.restore();

    // 4. Water / Horizon
    const waterY = h * 0.75;
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
    waterGrad.addColorStop(0, '#2b1055');
    waterGrad.addColorStop(1, '#000000');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, w, h - waterY);

    // Water reflection
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(sunX - sunRadius, waterY);
    ctx.lineTo(sunX + sunRadius, waterY);
    ctx.lineTo(sunX, h);
    ctx.fill();
    
    // Random sparkles on water
    ctx.fillStyle = '#fff';
    if (frameCount % 5 === 0) {
        for (let i=0; i<5; i++) {
             let rx = Math.random() * w;
             let ry = waterY + Math.random() * (h - waterY);
             ctx.fillRect(rx, ry, 2, 2);
        }
    }
    ctx.restore();

    // 4.5. Rainbow Bridge
    drawBridge(ctx, camera, 0.05, waterY, w);

    // 5. City Layers (Tokyo Skyline)
    
    // Far Layer (Dark Silhouettes)
    drawCityLayer(ctx, camera, 0.1, 150, 40, waterY, w, h, 800, (sx, y, wid, hei) => {
        ctx.fillStyle = '#120621';
        ctx.fillRect(sx, y, wid, hei);
        
        // Occasional Red blinking lights (air safety)
        if (Math.random() > 0.95 && frameCount % 60 < 30) {
            ctx.fillStyle = 'red';
            ctx.fillRect(sx + wid/2, y, 3, 3);
        }
    });

    // Mid Layer (Detailed Neon)
    drawCityLayer(ctx, camera, 0.25, 250, 60, h, w, h, 900, (sx, y, wid, hei, wx) => {
        ctx.fillStyle = '#1f0b36';
        ctx.fillRect(sx, y, wid, hei);
        
        // Windows / Neon Grid
        if (Math.abs(Math.sin(wx * 0.01)) > 0.3) {
             ctx.fillStyle = (Math.floor(wx) % 2 === 0) ? '#00ffff' : '#ff00ff'; // Cyan or Magenta
             for(let row = 0; row < 5; row++) {
                 let winY = y + 20 + row * 20;
                 if (winY < h) {
                     ctx.fillRect(sx + 5, winY, wid - 10, 2);
                 }
             }
        }
        
        // Vertical bright strips
        if (Math.cos(wx * 0.02) > 0.8) {
             ctx.fillStyle = '#ffffff';
             ctx.globalAlpha = 0.5;
             ctx.fillRect(sx + wid/2 - 2, y + 10, 4, hei);
             ctx.globalAlpha = 1.0;
        }
    });
    
    // Foreground / Rooftops
    drawTokyoRooftops(ctx, camera, 0.8, h, w, frameCount);
}

function drawTokyoRooftops(ctx, camera, speed, h, w, frameCount) {
    const layerX = camera.x * speed;
    const blockWidth = 250;
    
    const startX = Math.floor(layerX / blockWidth) * blockWidth - blockWidth;
    const endX = layerX + w + blockWidth;

    for(let worldX = startX; worldX < endX; worldX += blockWidth) {
        const drawX = worldX - layerX;
        // Deterministic height
        const roofH = (Math.sin(worldX) * 60) + 140; 
        const y = h - roofH;

        // Building Body
        ctx.fillStyle = '#1a1a2e'; 
        ctx.fillRect(drawX, y, blockWidth, roofH);
        
        // Top Edge Highlight
        ctx.fillStyle = '#3e3e5e';
        ctx.fillRect(drawX, y, blockWidth, 5);

        // Details
        // 1. Railing
        ctx.strokeStyle = '#4a4a6a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawX, y - 15);
        ctx.lineTo(drawX + blockWidth, y - 15);
        for(let i=0; i<=blockWidth; i+=25) {
             ctx.moveTo(drawX + i, y);
             ctx.lineTo(drawX + i, y - 15);
        }
        ctx.stroke();

        // 2. Neon Sign (Vertical Japanese)
        if (Math.abs(worldX % 500) < 100) {
            ctx.save();
            ctx.fillStyle = '#88b3c8'; // Desaturated Light Blue
            ctx.shadowColor = '#88b3c8';
            ctx.shadowBlur = 10; // Reduced blur for less "neon" intensity
            ctx.font = '20px "Arial"'; 
            ctx.textAlign = 'center';
            ctx.fillText("東京", drawX + 40, y + 40);
            ctx.fillText("夜", drawX + 40, y + 70);
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        
        // 3. Vents / AC
        if (Math.cos(worldX) > 0) {
            ctx.fillStyle = '#333344';
            ctx.fillRect(drawX + 100, y - 25, 40, 25);
            
            // Fan
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(drawX + 120, y - 12, 10, 0, Math.PI*2);
            ctx.fill();
        }
        
        // 4. Plants (Green pixels)
        if (Math.sin(worldX * 0.5) > 0.5) {
             ctx.fillStyle = '#2a5';
             ctx.fillRect(drawX + 180, y - 10, 20, 10);
             ctx.fillRect(drawX + 185, y - 20, 10, 10);
        }
    }
}

function drawEurope(ctx, camera, w, h, frameCount, currentLevelIndex, config) {
    // 1. Sky Gradient (Soft Purple -> Pink)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#5d4fa3'); // Soft Purple
    grad.addColorStop(0.5, '#b76ba3'); // Pinkish
    grad.addColorStop(1, '#f7c59f'); // Peach
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Retro Sun (Right side)
    ctx.save();
    const sunX = w * 0.85;
    const sunY = h * 0.3;
    const sunRadius = 100;

    // Sun Glow
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffd700';
    
    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGrad.addColorStop(0, '#ffff00');
    sunGrad.addColorStop(0.5, '#ffaa00');
    sunGrad.addColorStop(1, '#ff4400');
    ctx.fillStyle = sunGrad;

    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Sun Cuts
    ctx.fillStyle = '#b76ba3'; // Matches sky mid-tone
    for(let i = 0; i < 8; i++) {
        let y = sunY + 20 + i * 12;
        let thick = 2 + i * 1.5;
        if (y < sunY + sunRadius) {
             ctx.fillRect(sunX - sunRadius, y, sunRadius * 2, thick);
        }
    }
    ctx.restore();

    // 3. Landmarks (Eiffel, Notre Dame, Sacre Coeur) - Parallax
    drawParisLandmarks(ctx, camera, 0.05, h * 0.7, w);

    // 4. River Seine (Water behind city)
    const riverY = h * 0.75;
    ctx.fillStyle = '#2c2c54';
    ctx.fillRect(0, riverY, w, h - riverY);
    
    // Boat on River
    drawRiverBoat(ctx, camera, 0.15, riverY + 20, w, frameCount);

    // 5. Haussmann City Layer (Mid-ground)
    drawCityLayer(ctx, camera, 0.2, 100, 120, h, w, h, 300, (sx, y, wid, hei, wx) => {
        // Building Base (Cream Stone)
        ctx.fillStyle = '#e6d7b9';
        ctx.fillRect(sx, y, wid, hei);
        
        // Roof (Slate Blue/Grey)
        ctx.fillStyle = '#4a4e69';
        ctx.beginPath();
        ctx.moveTo(sx - 5, y);
        ctx.lineTo(sx + 10, y - 30); // Mansard roof slope
        ctx.lineTo(sx + wid - 10, y - 30);
        ctx.lineTo(sx + wid + 5, y);
        ctx.fill();
        
        // Chimneys
        ctx.fillStyle = '#cc5500';
        if (wx % 300 < 150) {
            ctx.fillRect(sx + 10, y - 45, 10, 20);
        } else {
            ctx.fillRect(sx + wid - 20, y - 45, 10, 20);
        }

        // Windows
        ctx.fillStyle = '#2c2c54';
        for(let r=0; r<4; r++) {
            let wy = y + 20 + r * 30;
            if (wy < h - 10) {
                // Two windows per floor
                ctx.fillRect(sx + 15, wy, 20, 20);
                ctx.fillRect(sx + wid - 35, wy, 20, 20);
                
                // Balcony railings
                if (r === 1) { // 2nd floor balcony usually continuous
                    ctx.fillStyle = '#222';
                    ctx.fillRect(sx + 10, wy + 15, wid - 20, 5);
                    ctx.fillStyle = '#2c2c54'; // reset
                }
            }
        }
    });

    // 6. Foreground Rooftops
    drawParisRooftops(ctx, camera, 0.8, h, w, frameCount);
}

function drawParisLandmarks(ctx, camera, speed, groundY, w) {
    const layerX = camera.x * speed;
    const repeatW = 2000; // Distance between landmarks
    const startX = Math.floor(layerX / repeatW) * repeatW - repeatW;

    for(let worldX = startX; worldX < layerX + w + repeatW; worldX += repeatW) {
        const drawX = worldX - layerX;

        // 1. Eiffel Tower (Left)
        ctx.fillStyle = '#3e3c55'; // Silhouette color
        const eiffelX = drawX + 200;
        const eiffelH = 350;
        
        ctx.beginPath();
        // Legs
        ctx.moveTo(eiffelX - 60, groundY);
        ctx.quadraticCurveTo(eiffelX, groundY - eiffelH * 0.5, eiffelX, groundY - eiffelH); // Center curve
        ctx.quadraticCurveTo(eiffelX, groundY - eiffelH * 0.5, eiffelX + 60, groundY);
        // Platforms
        ctx.fillRect(eiffelX - 40, groundY - 100, 80, 5);
        ctx.fillRect(eiffelX - 20, groundY - 200, 40, 5);
        ctx.fill();

        // 2. Notre Dame (Center)
        const ndX = drawX + 900;
        const ndW = 180;
        const ndH = 150;
        
        ctx.fillRect(ndX, groundY - ndH, ndW, ndH); // Body
        // Two Towers
        ctx.fillRect(ndX, groundY - ndH - 60, 60, 60);
        ctx.fillRect(ndX + ndW - 60, groundY - ndH - 60, 60, 60);
        // Rose Window
        ctx.fillStyle = '#6b5b95'; // Darker window
        ctx.beginPath();
        ctx.arc(ndX + ndW/2, groundY - ndH + 60, 20, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#3e3c55'; // Reset

        // 3. Sacre Coeur (Right)
        const scX = drawX + 1500;
        // Domes
        ctx.beginPath();
        ctx.arc(scX, groundY - 80, 40, Math.PI, 0); // Main dome
        ctx.arc(scX - 50, groundY - 40, 20, Math.PI, 0); // Left dome
        ctx.arc(scX + 50, groundY - 40, 20, Math.PI, 0); // Right dome
        ctx.rect(scX - 70, groundY - 40, 140, 40); // Base
        ctx.fill();
    }
}

function drawRiverBoat(ctx, camera, speed, waterY, w, frameCount) {
    const layerX = camera.x * speed;
    // Boat moves slowly right to left relative to world, or just sits there
    // Let's make it move with parallax
    const boatGap = 3000;
    const startX = Math.floor(layerX / boatGap) * boatGap - boatGap;

    for(let worldX = startX; worldX < layerX + w + boatGap; worldX += boatGap) {
        const drawX = worldX - layerX + 1000; // Offset
        
        // Boat Body
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(drawX, waterY + 20);
        ctx.lineTo(drawX + 200, waterY + 20);
        ctx.lineTo(drawX + 180, waterY + 50);
        ctx.lineTo(drawX + 20, waterY + 50);
        ctx.fill();
        
        // Cabin / Glass
        ctx.fillStyle = '#88ccff';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(drawX + 30, waterY + 10, 140, 15);
        ctx.globalAlpha = 1.0;
    }
}

function drawParisRooftops(ctx, camera, speed, h, w, frameCount) {
    const layerX = camera.x * speed;
    const blockWidth = 300;
    
    const startX = Math.floor(layerX / blockWidth) * blockWidth - blockWidth;
    const endX = layerX + w + blockWidth;

    for(let worldX = startX; worldX < endX; worldX += blockWidth) {
        const drawX = worldX - layerX;
        // Lower rooftops for foreground view
        const roofH = 120 + Math.sin(worldX) * 30; 
        const y = h - roofH;

        // Roof Surface (Zinc Grey/Blue)
        ctx.fillStyle = '#2a2a35'; 
        ctx.fillRect(drawX, y, blockWidth, roofH);
        
        // Parapet / Balustrade
        ctx.fillStyle = '#3e3e4e';
        ctx.fillRect(drawX, y - 10, blockWidth, 10);
        
        // Railing details
        ctx.fillStyle = '#111';
        for(let i=10; i<blockWidth; i+=30) {
            ctx.fillRect(drawX + i, y - 25, 5, 15); // Posts
            ctx.fillRect(drawX + i, y - 25, 2, 2); // Knobs
        }
        ctx.fillRect(drawX, y - 25, blockWidth, 3); // Top rail

        // --- DECORATIONS ---
        // Randomized by worldX to keep consistent placement
        const seed = Math.abs(Math.floor(worldX / blockWidth));
        const decorType = seed % 10; // 10 variations to dilute neon signs

        // 1. Chimney Pots (Classic Paris) - Most common (30%)
        if (decorType < 3) { 
            drawChimneyCluster(ctx, drawX + 50 + (seed % 3) * 50, y - 10, seed);
        }
        // 2. Dormer Window (Lucarne) - 20%
        else if (decorType === 3 || decorType === 4) { 
             drawDormerWindow(ctx, drawX + 100, y - 10);
        }
        // 3. Cafe / Awning (No Neon) - 10%
        else if (decorType === 5) { 
             // Striped Awning
            ctx.fillStyle = (seed % 2 === 0) ? '#800' : '#004400'; // Red or Green
            ctx.beginPath();
            ctx.moveTo(drawX + 40, y + 40);
            ctx.lineTo(drawX + 200, y + 40);
            ctx.lineTo(drawX + 180, y + 80);
            ctx.lineTo(drawX + 60, y + 80);
            ctx.fill();
            // Text on glass (not neon)
            ctx.fillStyle = '#aaa';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left'; // Reset alignment just in case
            ctx.fillText("CAFÉ", drawX + 100, y + 60);
        }
        // 4. French Flag - 10%
        else if (decorType === 6) { 
            drawFrenchFlag(ctx, drawX + 20, y - 25, frameCount);
        }
        // 5. Gargoyle - 10%
        else if (decorType === 7) { 
             ctx.fillStyle = '#444';
            ctx.beginPath();
            ctx.arc(drawX + 10, y - 35, 10, 0, Math.PI*2);
            ctx.fillRect(drawX, y - 35, 15, 25);
            ctx.fill();
        }
        // 6. Cat (Le Chat Noir style) - 10%
        else if (decorType === 8) { 
             ctx.fillStyle = '#000';
             ctx.beginPath();
             ctx.arc(drawX + 140, y - 35, 8, 0, Math.PI*2); // Head
             ctx.fill();
             ctx.fillRect(drawX + 135, y - 27, 10, 15); // Body seated
        }
        // 7. Rare Neon Sign (Reduced frequency) - 10%
        else if (decorType === 9) { 
             const signText = (seed % 2 === 0) ? "VAPOR" : "TABAC";
             const color = (seed % 2 === 0) ? "#ff00ff" : "#ff4400";
             drawNeonSign(ctx, drawX + 50, y + 40, signText, color);
        }
        
        // Metro Sign (Occasional)
        if (worldX % 1000 < 100) {
             drawMetroSign(ctx, drawX + 220, y);
        }
    }
}

// Helper functions for Paris Decor

function drawChimneyCluster(ctx, x, y, seed) {
    ctx.save();
    const count = (seed % 3) + 2;
    for(let i=0; i<count; i++) {
        // Pot
        ctx.fillStyle = '#cc5500'; // Terracotta
        ctx.fillRect(x + i*15, y - 30, 10, 30);
        // Rim
        ctx.fillStyle = '#aa4400';
        ctx.fillRect(x + i*15 - 2, y - 35, 14, 5);
    }
    ctx.restore();
}

function drawDormerWindow(ctx, x, y) {
    ctx.save();
    // Zinc housing
    ctx.fillStyle = '#4a4e69';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 40);
    ctx.arc(x + 20, y - 40, 20, Math.PI, 0); // Rounded top
    ctx.lineTo(x + 40, y);
    ctx.fill();
    
    // Window pane
    ctx.fillStyle = '#dde';
    ctx.fillRect(x + 10, y - 35, 20, 35);
    // Frame
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y - 35, 20, 35);
    ctx.restore();
}

function drawFrenchFlag(ctx, x, y, frameCount) {
    ctx.save();
    // Pole
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 60);
    ctx.stroke();
    
    // Wave offset
    const wave = Math.sin(frameCount * 0.1) * 2;
    
    // Blue
    ctx.fillStyle = '#0055a4';
    ctx.fillRect(x, y - 60 + wave*0.2, 15, 25);
    // White
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 15, y - 60 + wave*0.5, 15, 25);
    // Red
    ctx.fillStyle = '#ef4135';
    ctx.fillRect(x + 30, y - 60 + wave*0.8, 15, 25);
    
    ctx.restore();
}

function drawNeonSign(ctx, x, y, text, color) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = '16px "Press Start 2P"'; // Retro font
    // Or Vibur if available? Let's stick to available
    ctx.fillText(text, x, y);
    
    // Box border
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const width = ctx.measureText(text).width;
    ctx.strokeRect(x - 10, y - 20, width + 20, 30);
    ctx.restore();
}

function drawMetroSign(ctx, x, y) {
    // Pole
    ctx.fillStyle = '#004400';
    ctx.fillRect(x - 2, y - 60, 4, 60);
    
    // Circle
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.arc(x, y - 60, 15, 0, Math.PI*2);
    ctx.fill();
    
    // "M"
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("M", x, y - 60);
}

// --- Helpers ---

function drawCityLayer(ctx, camera, speed, heightVar, widthVar, yBase, w, h, seedOffset, drawBlock) {
    const layerX = camera.x * speed;
    
    // Snap to grid
    // Ensure we start drawing from just off-screen left to off-screen right
    const startX = Math.floor(layerX / widthVar) * widthVar - widthVar;
    const endX = layerX + w + widthVar;

    for(let worldX = startX; worldX < endX; worldX += widthVar) {
        const screenX = worldX - layerX;
        
        // Deterministic random height
        let noise = Math.abs(Math.sin((worldX + seedOffset) * 0.01));
        let hei = noise * heightVar + 50;
        
        // Call custom drawer or default
        if (drawBlock) {
            drawBlock(screenX, yBase - hei, widthVar, hei, worldX);
        } else {
            ctx.fillRect(screenX, yBase - hei, widthVar, hei);
        }
    }
}

function drawMountainLayer(ctx, camera, speed, yBase, w, h) {
    const layerX = camera.x * speed;
    const width = 100;
    
    const startX = Math.floor(layerX / width) * width - width;
    const endX = layerX + w + width;

    ctx.beginPath();
    ctx.moveTo(0, h);
    // Left edge
    ctx.lineTo(0, h); // Start at bottom-left

    // Draw visible points
    // We need to construct a continuous shape, so we iterate points
    // Start slightly before screen
    for (let worldX = startX; worldX <= endX; worldX += width) {
        let screenX = worldX - layerX;
        let noise = Math.sin(worldX * 0.005 + 1);
        let myY = yBase + noise * 50;
        ctx.lineTo(screenX, myY);
    }
    
    ctx.lineTo(w, h);
    ctx.fill();
}

function drawBridge(ctx, camera, speed, groundY, w) {
    const layerX = camera.x * speed;
    const bridgeW = 2000; // Very wide
    const startX = Math.floor(layerX / bridgeW) * bridgeW - bridgeW;
    
    ctx.save();
    for(let worldX = startX; worldX < layerX + w + bridgeW; worldX += bridgeW) {
        let drawX = worldX - layerX;
        
        // Bridge Color
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        
        // Pylons
        ctx.fillStyle = '#1a1a1a';
        // Two main towers
        ctx.fillRect(drawX + 400, groundY - 200, 40, 200);
        ctx.fillRect(drawX + 1200, groundY - 200, 40, 200);
        
        // Cables (Catenary)
        ctx.beginPath();
        ctx.moveTo(drawX, groundY - 50); // Start low
        ctx.quadraticCurveTo(drawX + 420, groundY - 200, drawX + 420, groundY - 200); // To Tower 1 top
        ctx.quadraticCurveTo(drawX + 800, groundY + 50, drawX + 1220, groundY - 200); // Dip between towers
        ctx.quadraticCurveTo(drawX + 1600, groundY + 50, drawX + 2000, groundY - 50); // End
        ctx.stroke();
        
        // Deck
        ctx.fillStyle = '#111';
        ctx.fillRect(drawX, groundY - 40, bridgeW, 15);
        
        // Lights on cables (Rainbow)
        if (Math.random() > 0.5) { // Flicker
            ctx.fillStyle = `hsl(${Math.abs(worldX % 360)}, 100%, 50%)`;
            ctx.fillRect(drawX + 420, groundY - 200, 5, 5);
            ctx.fillRect(drawX + 1220, groundY - 200, 5, 5);
        }
    }
    ctx.restore();
}
