import { Component } from "./Component";
import { Transform } from "./Transform";

let lastId = 0;

export class Entity {
    id = -1;
    name = "";
    parent: Entity | null = null;
    children: Entity[] = [];
    components: Component[] = [];
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
