export interface Engine {
    lastFrameTime: number;
    deltaTime: number;
    time: number;
    fps: number;
    fpsCounter: number;
    fpsTime: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    mouse: Mouse;
    keyboard: Keyboard;
}

export interface Mouse {
    x: number;
    y: number;
    down: boolean;
    up: boolean;
    pressed: boolean;
    released: boolean;
    wheel: number;
}

export interface Keyboard {
    keys: Set
    down: Set
    up: Set
    pressed: Set
    released: Set
}

