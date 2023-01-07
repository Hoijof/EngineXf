export class Transform {

    position = new DOMPoint(0, 0);
    rotation = 0;
    scale = new DOMPoint(1, 1);
    pivot = new DOMPoint(0, 0);

    constructor({position = new DOMPoint(0,0), rotation = 0, scale = new DOMPoint(1, 1), pivot = new DOMPoint(0,0)} : {position?: DOMPoint, rotation?: number, scale?: DOMPoint, pivot?: DOMPoint} = {}) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.pivot = pivot;
    }


    clone() {
        return new Transform({position: this.position, rotation: this.rotation, scale: this.scale, pivot: this.pivot});
    }

    copy(transform: Transform) {
        this.position = transform.position;
        this.rotation = transform.rotation;
        this.scale = transform.scale;
        this.pivot = transform.pivot;
    }

    getMatrix() {
        const matrix = new DOMMatrix();

        matrix.translateSelf(this.position.x, this.position.y);
        matrix.rotateSelf(this.rotation);
        matrix.scaleSelf(this.scale.x, this.scale.y);
        matrix.translateSelf(this.pivot.x, this.pivot.y);

        return matrix;
    }
    
}