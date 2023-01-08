import { Entity } from "./Entity";

export function checkCollisions(entities: Entity[], width: number, height: number) {
    for (let i = 0; i < entities.length; i++) {
        // Check for edge collisions
        entities[i].componentMethods.checkEdgeCollisions(entities[i].transform, {width, height});

        for (let j = i + 1; j < entities.length; j++) {
            if (isIntersecting(entities[i], entities[j])) {                
                entities[i].onCollision(entities[j]);
                entities[j].onCollision(entities[i]);
            }            
        }
    }
}

function isIntersecting(entity1: Entity, entity2: Entity) {
    const { position: pos1, scale: scale1 } = entity1.transform;
    const { position: pos2, scale: scale2 } = entity2.transform;

    const x1 = pos1.x;
    const y1 = pos1.y;
    const w1 = scale1.x;
    const h1 = scale1.y;

    const x2 = pos2.x;
    const y2 = pos2.y;
    const w2 = scale2.x;
    const h2 = scale2.y;

    const shape1 = entity1.componentMethods.getRenderShape();
    const shape2 = entity2.componentMethods.getRenderShape();

    if (shape1 === 'rect' && shape2 === 'rect') {
        return rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2);
    } else if (shape1 === 'circle' && shape2 === 'circle') {
        return circleIntersect(x1, y1, w1, x2, y2, w2);
    } else {
        return circleIntersect(x1, y1, w1, x2, y2, w2);
    }
}

function rectIntersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){
        return false;
    }
    return true;
}

function circleIntersect(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {

    // Calculate the distance between the two circles
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);

    // When the distance is smaller or equal to the sum
    // of the two radius, the circles touch or overlap
    return squareDistance <= ((r1 + r2) * (r1 + r2))
}