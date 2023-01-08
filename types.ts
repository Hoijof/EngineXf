import { Entity } from "./engine/Entity";

export interface Engine {
    lastFrameTime: number;
    deltaTime: number;
    delta: number;
    time: number;
    fps: number;
    fpsCounter: number;
    fpsTime: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    phantomEntities: Set<Entity>;
    dynamicEntities: Set<Entity>;
    staticEntities: Set<Entity>;
    width: number;
    height: number;
    mouse: Mouse;
    keyboard: Keyboard;
    touch: Touch;
}

export interface Touch {
    ongoingTouches: any[];
    endedTouches: any[];
}

export interface Mouse {
    x: number;
    y: number;
    down: boolean;
    up: boolean;
    pressed: boolean;
    released: boolean;
    wheel: number;
    button: number;
}

export interface Keyboard {
    keys: Set<string>
    down: Set<string>
    up: Set<string>
    pressed: Set<string>
    released: Set<string>
}

export enum PHASE {
    SETUP,
    UPDATE,
    DRAW,
    CLEANUP
}