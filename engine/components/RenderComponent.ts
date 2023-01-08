import { gk } from "../../consts";
import { Engine, PHASE } from "../../types";
import { getRandomInt } from "../../utils";
import { Component } from "../Component";
import { Transform } from '../Transform';

const COLORS = ['white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown', 'grey'];
export class RenderComponent extends Component {
    name = "RenderComponent";
    shape = "circle";
    phase = PHASE.DRAW;
    color = 'white';

    constructor({shape = "circle", color = "random"} : {shape?: "circle" | "rect", color?: string} = {}) {
        super();
        this.shape = shape;

        if (color === "random") {
            this.color = COLORS[getRandomInt(0, COLORS.length - 1)];
        } else {
            this.color = color;
        }
    }

    update(transform : Transform, engine: Engine) : Transform{
        const ctx = engine.canvas.getContext("2d");
                
        if (ctx) {
            ctx.save();
            ctx.translate(transform.position.x, transform.position.y);
            ctx.rotate(transform.rotation);
            // ctx.scale(transform.scale.x, transform.scale.y);

            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;

            if (this.shape === "circle") {
                ctx.beginPath();
                ctx.arc(0, 0, transform.scale.x, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else if (this.shape === "rect") {
                ctx.fillRect(-transform.scale.x / 2, -transform.scale.y / 2, transform.scale.x, transform.scale.y);
                ctx.strokeRect(-transform.scale.x / 2, -transform.scale.y / 2, transform.scale.x, transform.scale.y);
            }

            if (gk('DEBUG')) {
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'yellow';

                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -transform.scale.x);
                ctx.stroke();
            }

            ctx.restore();
        }
        
        return transform;
    }

    addListeners(componentMethods?: any): void {
        componentMethods.getRenderShape = () => this.shape;
        componentMethods.getRenderColor = () => this.color;
    }

}
