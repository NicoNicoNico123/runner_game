export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    update(playerX) {
        // Keep player on left 1/4 of screen
        this.x = playerX - 150;
        if(this.x < 0) this.x = 0;
    }
}

