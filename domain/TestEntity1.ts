import { PhysicsComponent } from "../engine/components/PhysicsComponent";
import { Entity } from "../engine/Entity";
import { RenderComponent } from './../engine/components/RenderComponent';

export class TestEntity1 extends Entity {

    constructor(name: string) {
        super({name, transform: {scale: new DOMPoint(10, 10), position: new DOMPoint(100, 100)}});

        this.components.push(new PhysicsComponent({speed: new DOMPoint(10, 10)}));
        this.components.push(new RenderComponent({ color: "red"}));
    }


}