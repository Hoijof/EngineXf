import { gk, sk } from '../consts';
import { Engine, Mouse, PHASE } from '../types';
import { Entity } from './Entity';
import { Component } from './Component';
import { checkCollisions } from './globalCollisions';

let engine: Engine;
let updateCallback = (engine: Engine) => { };

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
        touch: {
            ongoingTouches: [],
            endedTouches: [],
        }
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

    engine.touch.endedTouches = [];
}

export function draw() {
    const { canvas, ctx, fps, width, height, mouse, keyboard } = engine;

    ctx.clearRect(0, 0, width, height);

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

    // Draw fps counter
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.font = '20px Arial';

    // Draw mouse position
    if (gk('DEBUG')) {
        ctx.fillStyle = 'black';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, 800, 150);

        ctx.fillStyle = 'white';
        ctx.fillText(`x: ${mouse.x} y: ${mouse.y} down: ${mouse.down} up: ${mouse.up} pressed: ${mouse.pressed} released: ${mouse.released} wheel: ${mouse.wheel}`, 10, 60);

        ctx.fillText(`Down: ${Array.from(keyboard.down).join(' ')}`, 10, 90);
        ctx.fillText(`Up: ${Array.from(keyboard.up).join(' ')}`, 10, 120);

        ctx.fillText(`width: ${width} height: ${height}`, 100, 30);

        // Draw touch
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 4;

        for (let i = 0; i < engine.touch.ongoingTouches.length; i++) {
            const { x, y } = engine.touch.ongoingTouches[i];

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI, false); // a circle at the start
            ctx.fill();
            ctx.stroke();
        }
    }

    ctx.fillText(fps.toString(), 10, 30);
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
    const { keyboard } = engine;

    if (keyboard.keys.has(key)) {
        keyboard.up.add(key);
        keyboard.down.delete(key);
        keyboard.released.add(key);
    }
}

// #region Touch
function handleStart(evt: TouchEvent) {
    const { ctx } = engine;

    evt.preventDefault();
    console.log('touchstart.');
    const el = document.getElementById('canvas');
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        console.log(`touchstart: ${i}.`);
        engine.touch.ongoingTouches.push(copyTouch(touches[i]));
        const color = colorForTouch(touches[i]);
        console.log(`color of touch with id ${touches[i].identifier} = ${color}`);
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fillStyle = color;
        ctx.fill();
    }
}

function handleMove(evt: TouchEvent) {
    const { ctx, touch: { ongoingTouches } } = engine;

    evt.preventDefault();
    const el = document.getElementById('canvas') as HTMLCanvasElement;
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        const color = colorForTouch(touches[i]);
        const idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            console.log(`continuing touch ${idx}`);
            ctx.beginPath();
            console.log(`ctx.moveTo( ${ongoingTouches[idx].x}, ${ongoingTouches[idx].y} );`);
            ctx.moveTo(ongoingTouches[idx].x, ongoingTouches[idx].y);
            console.log(`ctx.lineTo( ${touches[i].pageX}, ${touches[i].pageY} );`);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.stroke();

            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        } else {
            console.log('can\'t figure out which touch to continue');
        }
    }
}

function handleEnd(evt: TouchEvent) {
    const { ctx, touch: { ongoingTouches, endedTouches } } = engine;

    evt.preventDefault();
    console.log("touchend");
    const el = document.getElementById('canvas');

    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        const color = colorForTouch(touches[i]);
        let idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ctx.lineWidth = 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].x, ongoingTouches[idx].y);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);  // and a square at the end
            ongoingTouches.splice(idx, 1);  // remove it; we're done
            endedTouches.push(copyTouch(touches[i]));
        } else {
            console.log('can\'t figure out which touch to end');
        }
    }
}

function handleCancel(evt: TouchEvent) {
    evt.preventDefault();
    console.log('touchcancel.');
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
        engine.touch.ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
}

function colorForTouch(touch: Touch) {
    let r: any = (touch.identifier + 5) % 16;
    let g: any = Math.floor((touch.identifier + 6) / 3) % 16;
    let b: any = Math.floor((touch.identifier + 4) / 7) % 16;
    r = r.toString(16); // make it a hex digit
    g = g.toString(16); // make it a hex digit
    b = b.toString(16); // make it a hex digit
    const color = `#${r}${g}${b}`;
    return 'white';
}

function copyTouch({ identifier, pageX, pageY }: Touch) {
    return { identifier, x: pageX, y: pageY };
}

function ongoingTouchIndexById(idToFind: number) {
    const { ongoingTouches } = engine.touch;

    for (let i = 0; i < ongoingTouches.length; i++) {
        const id = ongoingTouches[i].identifier;

        if (id === idToFind) {
            return i;
        }
    }
    return -1;    // not found
}
// #endregion

export function addEntity(entity: Entity) {
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

    // #region Setup events
    window.onresize = () => {
        resize(window.innerWidth, window.innerHeight);
    };

    const el = document.getElementById('canvas') as HTMLCanvasElement;
    el.addEventListener('touchstart', handleStart);
    el.addEventListener('touchend', handleEnd);
    el.addEventListener('touchcancel', handleCancel);
    el.addEventListener('touchmove', handleMove);

    console.log('Touch Initialized.');
}

// #endRegion
