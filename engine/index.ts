import { generateKey } from 'crypto';
import { gk, sk } from '../consts';
import {Engine, Mouse} from '../types';

let engine: Engine;

export function init(canvas: HTMLCanvasElement) {
    engine = {
        lastFrameTime: 0,
        deltaTime: 0,
        time: 0,
        fps: 0,
        fpsCounter: 0,
        fpsTime: 0,
        canvas: canvas,
        ctx: canvas.getContext('2d') as CanvasRenderingContext2D,
        width: 0,
        height: 0,
        mouse: {
            x: 0,
            y: 0,
            down: false,
            up: false,
            pressed: false,
            released: false,
            wheel: 0,
        },
        keyboard: {
            keys: new Set(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']),
            down: new Set(),
            up: new Set(),
            pressed: new Set(),
            released: new Set(),
        },
    };

    resize(window.innerWidth, window.innerHeight);

    setListeners();
}
export function get() {
    return engine;
}

export function step() {
    setup();
    update();
    physicsUpdate();
    draw();
    cleanup();
}

export function setup() {
    const now = performance.now();

    // Engine metrics
    engine.deltaTime = now - engine.lastFrameTime;
    engine.lastFrameTime = now;
    engine.time += engine.deltaTime;
    engine.fpsTime += engine.deltaTime;
    engine.fpsCounter++;

    if (engine.fpsTime >= 1000) {
        engine.fps = engine.fpsCounter;
        engine.fpsCounter = 0;
        engine.fpsTime = 0;
    }
}


export function update() {

}

export function physicsUpdate() {

}

export function cleanup() {
    // reset states
    engine.mouse.pressed = false;
    engine.mouse.released = false;
    engine.mouse.wheel = 0;

    engine.keyboard.pressed.clear();
    engine.keyboard.released.clear();
}

export function draw() {
    const { width, height, mouse, keyboard } = engine;

    engine.ctx.clearRect(0, 0, width, height);
    
    // Draw fps counter
    engine.ctx.fillStyle = 'white';
    engine.ctx.font = '20px Arial';
    engine.ctx.fillText(engine.fps.toString(), 10, 30);

    // Draw mouse position
    if (gk('DEBUG')) {
        engine.ctx.fillText(`x: ${mouse.x} y: ${mouse.y} down: ${mouse.down} up: ${mouse.up} pressed: ${mouse.pressed} released: ${mouse.released} wheel: ${mouse.wheel}`, 10, 60);
        engine.ctx.fillText(`Debug: ${gk('DEBUG')}`, 300, 30);

        engine.ctx.fillText(`Down: ${Array.from(keyboard.down).join(' ')}`, 10, 90);
        engine.ctx.fillText(`Up: ${Array.from(keyboard.up).join(' ')}`, 10, 120);
    }
}




export function resize(width: number, height: number) {
    engine.width = width;
    engine.height = height;

    engine.canvas.width = width;
    engine.canvas.height = height;
}

export function mouseUpdate(mouseChanges: Partial<Mouse>) {
    engine.mouse = {
        ...engine.mouse,
        ...mouseChanges,
    };
}

export function addKeyDown(key: string) {
    const { keyboard } = engine;

    if (keyboard.keys.has(key)) {
        keyboard.down.add(key);
        keyboard.up.delete(key);
        keyboard.pressed.add(key);
    }
}


export function addKeyUp(key: string) {
    const {keyboard} = engine;

    if (keyboard.keys.has(key)) {
        keyboard.up.add(key);
        keyboard.down.delete(key);
        keyboard.released.add(key);
    }
}


// #region Event Listeners
function setListeners() {
    document.addEventListener('keyup', ({ key }) => {
        if (key === 'F10') {
            console.log('swap');
            sk('DEBUG', !gk('DEBUG'));
        }
    });
}

// #endregion
