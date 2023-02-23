import { InteractionComponent } from "../engine/components/InteractionComponent";
import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { Entity } from "../engine/Entity";
import { Transform } from "../engine/Transform";
import { Engine } from "../types";
import { RenderComponent } from '../engine/components/RenderComponent';

import { gk } from '../consts';


export class PlayerEntity extends Entity {

    speed = new DOMPoint(0,0);
    isSprinting = false;

    constructor({name = "Player",} : {name?: string, transform?: Partial<Transform>, physicsComponent?: Partial<PhysicsComponent>} = {}) {
        const { WIDTH, HEIGTH, MAX_SPEED } : any = gk('PLAYER');

        super({name, transform: {
            scale: new DOMPoint(10, 10), 
            position: new DOMPoint(WIDTH, HEIGTH)
        } });

        this.addComponent(new PhysicsComponent({
            speed: this.speed,
            maxSpeed: MAX_SPEED,
            friction: 0.3
        })); 

        this.addComponent(new RenderComponent({ color: "white", shape: "circle"}));

        this.addComponent(new InteractionComponent((other: Entity) => {
            console.log("Player collided with", other);
        }));
    }

    update(delta: number, engine: Engine) {
        const { keyboard: { pressed, released } } = engine;
        const { getAcceleration, setAcceleration, setMaxSpeed } = this.componentMethods;
        const { ACCELERATION, MAX_SPEED } : any = gk('PLAYER');
        
        const currentAcceleration = getAcceleration();
        // Move up 
        if (pressed.has('w')) {
            setAcceleration(new DOMPoint(currentAcceleration.x, -ACCELERATION));
        }
        if (released.has('w')) {
            setAcceleration(new DOMPoint(currentAcceleration.x, 0));
        }
    
        // Move down
        if (pressed.has('s')) {
            setAcceleration(new DOMPoint(currentAcceleration.x, ACCELERATION));
        }
        if (released.has('s')) {
            setAcceleration(new DOMPoint(currentAcceleration.x, 0));
        }
    
        // Move left
        if (pressed.has('a')) {
            setAcceleration(new DOMPoint(-ACCELERATION, currentAcceleration.y));
        }
        if (released.has('a')) {
            setAcceleration(new DOMPoint(0, currentAcceleration.y));
        }
    
        // Move right
        if (pressed.has('d')) {
            setAcceleration(new DOMPoint(ACCELERATION, currentAcceleration.y));
        }
        if (released.has('d')) {
            setAcceleration(new DOMPoint(0, currentAcceleration.y));
        }
    
        // Accelerate movement
        if (pressed.has('Shift')){
            this.isSprinting = true;

            setMaxSpeed(MAX_SPEED * 1.5);
        }
        if (released.has('Shift')) {
            this.isSprinting = false;

            setMaxSpeed(MAX_SPEED);
        }
    }
    
}