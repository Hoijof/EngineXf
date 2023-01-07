import { Engine } from "../../types";
import { Component } from "../Component";
import { Transform } from '../Transform';

export class PhysicsComponent extends Component {
    speed = new DOMPoint(0, 0);
    acceleration = new DOMPoint(0, 0);
    mass = 1;
    friction = 0;
    bounce = 0;

    constructor({speed = new DOMPoint(0, 0), acceleration = new DOMPoint(0, 0), mass = 1, gravity = 0, friction = 0, bounce = 0} : {speed?: DOMPoint, acceleration?: DOMPoint, mass?: number, gravity?: number, friction?: number, bounce?: number} = {}) {
        super();
        this.speed = speed;
        this.acceleration = acceleration;
        this.mass = mass;
        this.friction = friction;
        this.bounce = bounce;
    }
    
    update(transform : Transform, {delta}: Engine) : Transform{
        this.updateMovement(transform, delta);
        this.updateCollisions(transform, delta);

        return transform;
    }

    updateMovement(transform : Transform, delta: number) {
        this.speed.x += this.acceleration.x * delta;
        this.speed.y += this.acceleration.y * delta;

        this.speed.x *= 1 - this.friction * delta;
        this.speed.y *= 1 - this.friction * delta;

        transform.position.x += this.speed.x * delta;
        transform.position.y += this.speed.y * delta;
    }

    updateCollisions(transform : Transform, delta: number) {
        // TODO
    }
}