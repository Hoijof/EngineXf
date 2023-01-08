import { Engine, PHASE } from "../../types";
import { Component } from "../Component";
import { Entity } from "../Entity";
import { Transform } from "../Transform";

export class InteractionComponent extends Component {
    name="InteractionComponent";
    isActive: boolean = true;
    phase : PHASE = PHASE.UPDATE;
    callback: Function;

    constructor (callback: Function) {
        super();

        this.callback = callback;
    }
    update(transform : Transform, engine : Engine) : Transform {
        return transform;
    }

    onCollision(other: Entity, transform: Transform) {
        this.callback(other);
    }

}