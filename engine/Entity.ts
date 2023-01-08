import { Component } from "./Component";
import { Transform } from "./Transform";

let lastId = 0;

export class Entity {
    id = -1;
    name = "";
    parent: Entity | null = null;
    children: Entity[] = [];
    components: Component[] = [];
    componentMethods: any = {};
    transform = new Transform();
    active = true;
    destroyed = false;
    layer = 0;
    tags : Set<string> = new Set();

    constructor({name = "", transform} : {name?: string, transform?: Partial<Transform>} = {}) {
        this.id = lastId++;
        this.name = name;

        if (transform) {
            this.transform = new Transform(transform);
        }
        
    }

    onCollision(other: Entity) {
        for (const component of this.components) {
            if (component.isActive) {
                component.onCollision(other, this.transform);
            }
        }
    }

    addComponent(component: Component) {
        this.components.push(component);

        component.addListeners(this.componentMethods);
    }

    removeComponent(component: Component) {
        const index = this.components.indexOf(component);

        if (index > -1) {
            this.components.splice(index, 1);
        }
    }

    getComponent<T extends Component>(type: { new(...args: any[]): T; }) : T | null {
        for (const component of this.components) {
            if (component instanceof type) {
                return component as T;
            }
        }

        return null;
    }

}

export function recreateEntity({ id, name, parent, children = [], components = [], transform, active, destroyed, layer, tags }: Entity) {
    const entity = new Entity({name});
    
    entity.id = id;
    entity.parent = parent;
    entity.children = children;
    entity.components = components;
    entity.transform = transform;
    entity.active = active;
    entity.destroyed = destroyed;
    entity.layer = layer;
    entity.tags = new Set(tags);

    return entity;
}
