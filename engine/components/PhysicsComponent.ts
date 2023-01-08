import { Engine } from "../../types";
import { Component } from "../Component";
import { Entity } from "../Entity";
import { Transform } from '../Transform';

export class PhysicsComponent extends Component {
    name="PhysicsComponent";

    speed = new DOMPoint(0, 0);
    acceleration = new DOMPoint(0, 0);
    isStatic = false;
    mass = 1;
    friction = 0;
    bounce = 1;

    constructor({speed = new DOMPoint(0, 0), acceleration = new DOMPoint(0, 0), isStatic=false, mass = 1, gravity = 0, friction = 0, bounce = 1} : {speed?: DOMPoint, acceleration?: DOMPoint, isStatic?: boolean, mass?: number, gravity?: number, friction?: number, bounce?: number} = {}) {
        super();
        this.speed = speed;
        this.acceleration = acceleration;
        this.isStatic = isStatic;
        this.mass = mass;
        this.friction = friction;
        this.bounce = bounce;
    }
    
    update(transform : Transform, {delta}: Engine) : Transform{
        this.updateMovement(transform, delta);

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

    onCollision(other: Entity, transform: Transform): void {
        const otherPC = other.getComponent(PhysicsComponent);
;
        if (!otherPC) {
            return;
        }

        let vCollision = {x: other.transform.position.x - transform.position.x, y: other.transform.position.y - transform.position.y};
        let distance = Math.sqrt((other.transform.position.x-transform.position.x)*(other.transform.position.x-transform.position.x) + (other.transform.position.y-transform.position.y)*(other.transform.position.y-transform.position.y));
        let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};

        let vRelativeVelocity = {x: this.speed.x - otherPC?.speed.x, y: this.speed.y - otherPC?.speed.y};
        let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

        if (speed < 0 || this.isStatic) {
            return;
        }

        this.speed.x -= (speed * vCollisionNorm.x);
        this.speed.y -= (speed * vCollisionNorm.y);
        otherPC.speed.x += (speed * vCollisionNorm.x);
        otherPC.speed.y += (speed * vCollisionNorm.y);
    }

    checkEdgeCollisions(transform: Transform, {width, height}: {width: number, height: number}) {
        if (this.isStatic) {
            return;
        }

        this.checkCircleEdgeCollisions(transform, {width, height});        
    }

    checkCircleEdgeCollisions(transform: Transform, {width, height}: {width: number, height: number}) {
        const {position: {x, y}, scale: {x: scaleX, y: scaleY}} = transform;

        if (x + scaleX > width) {
            this.speed.x *= -this.bounce;
            transform.position.x = width - scaleX;
        }
        else if (x - scaleX < 0) {
            this.speed.x *= -this.bounce;
            transform.position.x = 0 + scaleX;
        }

        if (y + scaleX > height) {
            this.speed.y *= -this.bounce;
            transform.position.y = height - scaleX;
        }
        else if (y - scaleX < 0) {
            this.speed.y *= -this.bounce;
            transform.position.y = 0 + scaleX;
        }
    }

    addListeners(componentMethods?: any): void {
        if (componentMethods) {
            componentMethods.checkEdgeCollisions = this.checkEdgeCollisions.bind(this);
        }
    }
}