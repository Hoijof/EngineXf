import { gk, sk } from '../consts';
import {Engine, Mouse, PHASE} from '../types';
import { Entity } from './Entity';
import { Component } from './Component';
import { checkCollisions } from './globalCollisions';

let engine: Engine;
let updateCallback = (engine: Engine) => {};

export function init(canvas: HTMLCanvasElement, uc: (engine: Engine) => void) {
    engine = {
        lastFrameTime: 0,
        deltaTime: 0,
        delta: 0,
        time: 0,
        fps: 0,
        fpsCounter: 0,
        fpsTime: 0,
        entities: new Set<Entity>(),
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
            keys: new Set(['w', 'a', 's', 'd', 'r', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', ' ', 'z']),
            down: new Set(),
            up: new Set(),
            pressed: new Set(),
            released: new Set(),
        },
    };

    resize(window.innerWidth, window.innerHeight);

    setListeners();

    updateCallback = uc;
}
export function get() {
    return engine;
}

export function step() {
    setup();
    update();
    updateCallback(engine);
    physicsUpdate();
    draw();
    cleanup();
}

export function setup() {
    const now = performance.now();

    // Engine metrics
    engine.deltaTime = now - engine.lastFrameTime;
    engine.delta = engine.deltaTime / 1000;
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
    engine.entities.forEach(entity => {
        if (entity.active) {
            entity.components.forEach((component: Component) => {
                if (component.isActive && component.phase === PHASE.UPDATE) {
                    component.update(entity.transform, engine);
                }
            });
        }
    });
}

export function physicsUpdate() {
    const entities = Array.from(engine.entities);

    checkCollisions(entities, engine.width, engine.height);
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
    const { canvas, ctx, fps, width, height, mouse, keyboard } = engine;

    ctx.clearRect(0, 0, width, height);
    
    // Draw fps counter
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(fps.toString(), 10, 30);

    // Draw mouse position
    if (gk('DEBUG')) {
        // ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(`x: ${mouse.x} y: ${mouse.y} down: ${mouse.down} up: ${mouse.up} pressed: ${mouse.pressed} released: ${mouse.released} wheel: ${mouse.wheel}`, 10, 60);

        ctx.fillText(`Down: ${Array.from(keyboard.down).join(' ')}`, 10, 90);
        ctx.fillText(`Up: ${Array.from(keyboard.up).join(' ')}`, 10, 120);

        ctx.fillText(`width: ${width} height: ${height}`, 100, 30);       
    }

    // Draw Entities
    engine.entities.forEach(entity => {
        if (entity.active) {
            entity.components.forEach((component: Component) => {
                if (component.isActive && component.phase === PHASE.DRAW) {
                    component.update(entity.transform, engine);
                }
            });
        }
    });

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

export function addEntity(entity : Entity) {
    engine.entities.add(entity);
}

export function clearEntities() {
    engine.entities.clear();
}


// #region Event Listeners
function setListeners() {
    document.addEventListener('keyup', ({ key }) => {
        if (key === '`' || key === 'z') {
            sk('DEBUG', !gk('DEBUG'));
        }
    });
}

// #endRegion
