import { Engine, PHASE } from "../../types";
import { Component } from "../Component";
import { Transform } from '../Transform';

export class RenderComponent extends Component {
    shape = "circle";
    phase = PHASE.DRAW;
    color = "white";

    constructor({shape = "circle", color = "white"} : {shape?: "circle" | "rect", color?: string} = {}) {
        super();
        this.shape = shape;
    }

    update(transform : Transform, engine: Engine) : Transform{
        const ctx = engine.canvas.getContext("2d");
                
        if (ctx) {
            ctx.save();
            ctx.translate(transform.position.x, transform.position.y);
            ctx.rotate(transform.rotation);
            ctx.scale(transform.scale.x, transform.scale.y);

            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;

            if (this.shape === "circle") {
                ctx.beginPath();
                ctx.arc(0, 0, 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else if (this.shape === "rect") {
                ctx.fillRect(-1 / 2, -1 / 2, 1, 1);
                ctx.strokeRect(-1 / 2, -1 / 2, 1, 1);
            }

            ctx.restore();
        }
        
        return transform;
    }

}