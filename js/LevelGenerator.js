import { GAME_HEIGHT, MAP_PATTERNS } from './constants.js';

export function generateLevel(levelConfig) {
    const platforms = [];
    const traps = [];
    const powerups = [];
    let goalX = 0;

    // Base generation parameters
    const tileSize = 40;
    const groundY = GAME_HEIGHT - 60;
    
    // Construct string map
    let mapStr = "................"; // Safe start
    
    // Repeat patterns to make level long enough (~30 seconds)
    const pattern = MAP_PATTERNS[levelConfig.layout];
    const repeats = 15; // Rough length
    
    for(let i=0; i<repeats; i++) {
        mapStr += pattern[i % pattern.length];
    }
    
    // Add finish line
    mapStr += "..........GGGG..........";

    // Parse Map
    for (let col = 0; col < mapStr.length; col++) {
        const char = mapStr[col];
        const x = col * tileSize;

        if (char === '.' || char === 'x' || char === 'X' || char === '*' || char === 'G') {
            // Ground
            platforms.push({ x: x, y: groundY, w: tileSize + 1, h: 60, type: 'ground' });
        }
        
        if (char === 'x') {
            // Small Trap
            traps.push({ x: x + 10, y: groundY - 30, w: 20, h: 30, type: 'small' });
        }

        if (char === 'X') {
            // Tall Trap
            traps.push({ x: x + 5, y: groundY - 70, w: 30, h: 70, type: 'tall' });
        }

        if (char === '*') {
            powerups.push({ x: x + 10, y: groundY - 100, w: 20, h: 20, active: true });
        }

        if (char === 'G') {
            if (goalX === 0) goalX = x; // Mark start of goal
        }
    }

    return { platforms, traps, powerups, goalX, length: mapStr.length * tileSize };
}

