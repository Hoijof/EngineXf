import { Engine, PHASE } from "./../types";
import { Transform } from "./Transform";
import { Entity } from './Entity';

export class Component {
    name="Component";
    isActive: boolean = true;
    phase : PHASE = PHASE.UPDATE;
    
    update(transform : Transform, engine : Engine) : Transform {
        console.warn("You should be overriding this fuction!");

        return transform;
    }

    onCollision(other: Entity, transform: Transform) {
        // console.log("onCollision", this, other);
    }

    addListeners(componentMethods: any = {}) {
        
    }
}