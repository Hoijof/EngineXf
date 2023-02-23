import { gk, sk } from '../consts';
import { Engine, Mouse, PHASE } from '../types';
import { Entity } from './Entity';
import { Component } from './Component';
import { checkCollisions } from './globalCollisions';
import { PhysicsComponent } from './components/PhysicsComponent';

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
        phantomEntities: new Set<Entity>(),
        staticEntities: new Set<Entity>(),
        dynamicEntities: new Set<Entity>(),
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
            button: -1,
        },
        keyboard: {
            keys: new Set(['w', 'a', 's', 'd', 'r', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', ' ', 'z', 'Shift']),
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
    engine.phantomEntities.forEach(updateByPhase(PHASE.UPDATE));
    engine.staticEntities.forEach(updateByPhase(PHASE.UPDATE));
    engine.dynamicEntities.forEach(updateByPhase(PHASE.UPDATE));
}

export function physicsUpdate() {
    const staticEntities = Array.from(engine.staticEntities);
    const dynamicEntities = Array.from(engine.dynamicEntities);

    checkCollisions(staticEntities, dynamicEntities, engine.width, engine.height);
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
    engine.staticEntities.forEach(updateByPhase(PHASE.DRAW));
    engine.dynamicEntities.forEach(updateByPhase(PHASE.DRAW));

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

function updateByPhase(phase: PHASE) {
    return (entity: Entity) => {
        if (entity.active) {
            entity.update(engine.delta, engine);

            entity.components.forEach((component: Component) => {
                if (component.isActive && component.phase === phase) {
                    component.update(entity.transform, engine);
                }
            });
        }
    }
}

// #region Listeners
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
        if (!keyboard.down.has(key)) {
            keyboard.pressed.add(key);
        }

        keyboard.down.add(key);
        keyboard.up.delete(key);
    }
}


export function addKeyUp(key: string) {
    const { keyboard } = engine;

    if (keyboard.keys.has(key)) {
        if (!keyboard.up.has(key)) {
            keyboard.released.add(key);
        }
        
        keyboard.up.add(key);
        keyboard.down.delete(key);
    }
}
// #endregion
// #region Touch
function handleStart(evt: TouchEvent) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        engine.touch.ongoingTouches.push(copyTouch(touches[i]));
    }
}

function handleMove(evt: TouchEvent) {
    const { touch: { ongoingTouches } } = engine;

    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        const idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        } else {
            console.warn('can\'t figure out which touch to continue');
        }
    }
}

function handleEnd(evt: TouchEvent) {
    const { touch: { ongoingTouches, endedTouches } } = engine;

    evt.preventDefault();

    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
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
    return -1;
}
// #endregion

export function addEntity(entity: Entity) {
    const { phantomEntities, dynamicEntities, staticEntities } = engine;

    if (!entity.getComponent(PhysicsComponent)) {
        phantomEntities.add(entity);
        
        return;
    }
    
    if (entity.componentMethods.isStatic) {
        staticEntities.add(entity);

        return;
    }

    dynamicEntities.add(entity);
}

export function clearEntities() {
    engine.phantomEntities.clear();
    engine.dynamicEntities.clear();
    engine.staticEntities.clear();
}


// #region Setup
function setListeners() {
    document.addEventListener('mousemove', (e) => {
        const canvas = engine.canvas;

        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;

        mouseUpdate({ x, y });
    });

    document.addEventListener('mousedown', (e) => {
        mouseUpdate({down: true, up: false, pressed: true, button: e.button });

        e.preventDefault();
    });

    document.addEventListener('mouseup', (e) => {
        mouseUpdate({down: false, up: true, released: true });

        e.preventDefault();
    });

    document.addEventListener('mousewheel', (e) => {
        mouseUpdate({wheel: (e as any).deltaY });
    });

    document.addEventListener('keyup', (e) => {
        addKeyUp(e.key);

        if (e.key === '`' || e.key === 'z') {
            sk('DEBUG', !gk('DEBUG'));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (gk('DEBUG')) {
            console.log(e.key);
        }
        
        addKeyDown(e.key);
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

    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
}

// #endRegion
