import { Engine, PHASE } from "./../types";
import { Transform } from "./Transform";

export class Component {
    active: boolean = true;
    phase : PHASE = PHASE.UPDATE;
    
    update(transform : Transform, engine : Engine) : Transform {
        console.warn("You should be overriding this fuction!");

        return transform;
    }
}