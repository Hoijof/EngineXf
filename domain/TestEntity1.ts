import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { Entity } from "../engine/Entity";
import { Transform } from "../engine/Transform";
import { RenderComponent } from './../engine/components/RenderComponent';

export class TestEntity1 extends Entity {

    constructor({name = "TestEntity1", transform = {}, physicsComponent = {}} : {name?: string, transform?: Partial<Transform>, physicsComponent?: Partial<PhysicsComponent>} = {}) {
        super({name, transform: {
            scale: new DOMPoint(10, 10), 
            position: new DOMPoint(100, 100),
            ...transform
        } });

        this.components.push(new PhysicsComponent({
            speed: new DOMPoint(10, 10),
            ...physicsComponent
        } )); 

        this.components.push(new RenderComponent({ color: "red"}));
    }


}