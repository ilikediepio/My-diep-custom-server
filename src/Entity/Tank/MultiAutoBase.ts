import ObjectEntity from "../Object";
import { BarrelBase } from "./TankBody";

export default class MultiAutoBase extends ObjectEntity {
    protected owner!: BarrelBase;

    constructor(owner: BarrelBase) {
        super(owner.game);
        this.owner = owner;
    }

    protected getOwner(): BarrelBase {
        return this.owner;
    }
}