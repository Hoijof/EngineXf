import { InteractionComponent } from "../engine/components/InteractionComponent";
import { RenderComponent } from "../engine/components/RenderComponent";
import { Entity } from "../engine/Entity";
import { PhysicsComponent } from '../engine/components/PhysicsComponent';
import { Transform } from "../engine/Transform";

export class SolidEntity extends Entity {
    constructor({name = "SolidEntity", transform = {}, physicsComponent = {}} : {name?: string, transform?: Partial<Transform>, physicsComponent?: Partial<PhysicsComponent>} = {}) {
        super({name, transform: {
            scale: new DOMPoint(10, 10), 
            position: new DOMPoint(100, 100),
            ...transform
        } });

        this.addComponent(new PhysicsComponent({isStatic: true}));

        this.addComponent(new RenderComponent({ color: "random", shape: "circle"}));

        this.addComponent(new InteractionComponent((other: Entity) => {
            console.log("SOLID ENTITY collided with", other);
        }));
    }
}