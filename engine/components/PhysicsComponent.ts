import { gk } from "../../consts";
import { Engine } from "../../types";
import { Component } from "../Component";
import { Entity } from "../Entity";
import { Transform } from '../Transform';

export class PhysicsComponent extends Component {
    name="PhysicsComponent";

    speed = new DOMPoint(0, 0);
    maxSpeed = 0;
    acceleration = new DOMPoint(0, 0);
    isStatic = false;
    mass = 1;
    friction = 0;
    bounce = 1;

    deltaP = 0;

    constructor({speed = new DOMPoint(0, 0), maxSpeed= 0, acceleration = new DOMPoint(0, 0), isStatic=false, mass = 1, gravity = 0, friction = 0, bounce = 1} : {speed?: DOMPoint, maxSpeed?: number, acceleration?: DOMPoint, isStatic?: boolean, mass?: number, gravity?: number, friction?: number, bounce?: number} = {}) {
        super();
        this.speed = speed;
        this.maxSpeed = maxSpeed;
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
        if (this.isStatic) {
            return;
        }

        this.speed.x += this.acceleration.x * delta;
        this.speed.y += this.acceleration.y * delta;

        this.applyFriction();

        if (this.maxSpeed > 0) {
            const speed = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
            if (speed > this.maxSpeed) {
                this.speed.x *= this.maxSpeed / speed;
                this.speed.y *= this.maxSpeed / speed;
            }
        }

        // check if the speed is too low to be considered
        if (Math.abs(this.speed.x) < 10) {
            this.speed.x = 0;
        }
        if (Math.abs(this.speed.y) < 10) {
            this.speed.y = 0;
        }

        transform.position.x += this.speed.x * delta;
        transform.position.y += this.speed.y * delta;
    }

    applyFriction() {
        let vx = this.speed.x * this.friction; 
        let vy = this.speed.y * this.friction; 

        this.speed.x -= vx; 
        this.speed.y -= vy; 
  } 
  

    onCollision(other: Entity, transform: Transform): void {
        const otherPC = other.getComponent(PhysicsComponent);

        if (!otherPC) {
            return;
        }

        const vCollision = {x: other.transform.position.x - transform.position.x, y: other.transform.position.y - transform.position.y};
        const distance = Math.sqrt((other.transform.position.x-transform.position.x)*(other.transform.position.x-transform.position.x) + (other.transform.position.y-transform.position.y)*(other.transform.position.y-transform.position.y));
        const vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};

        const vRelativeVelocity = {x: this.speed.x - otherPC?.speed.x, y: this.speed.y - otherPC?.speed.y};
        const speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

        if (speed < 0) {
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
        const {position: {x, y}, scale: {x: scaleX}} = transform;

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

    setSpeed(speed: DOMPoint) {
        this.speed = speed;
    }

    addSpeed(speed: DOMPoint) {
        this.speed.x += speed.x;
        this.speed.y += speed.y;
    }

    setAcceleration(acceleration: DOMPoint) {
        this.acceleration = acceleration;
    }

    addListeners(componentMethods?: any): void {
        if (componentMethods) {
            componentMethods.checkEdgeCollisions = this.checkEdgeCollisions.bind(this);
            componentMethods.isStatic = this.isStatic;
            componentMethods.setSpeed = this.setSpeed.bind(this);
            componentMethods.addSpeed = this.addSpeed.bind(this);
            componentMethods.getSpeed = () => this.speed;
            componentMethods.setAcceleration = this.setAcceleration.bind(this);
            componentMethods.getAcceleration = () => this.acceleration;
            componentMethods.setMaxSpeed = (maxSpeed: number) => this.maxSpeed = maxSpeed;
        }
    }
}