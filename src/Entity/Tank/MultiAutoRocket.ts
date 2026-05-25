import ObjectEntity from "../Object";
import Barrel from "./Barrel";
import MultiAutoBase from "./MultiAutoBase";

import { BarrelBase } from "./TankBody";
import { Color, InputFlags, PositionFlags, NameFlags, PhysicsFlags, StyleFlags } from "../../Const/Enums";
import { BarrelDefinition } from "../../Const/TankDefinitions";
import { AI, AIState, Inputs } from "../AI";
import LivingEntity from "../Live";
import { NameGroup } from "../../Native/FieldGroups";
import { CameraEntity } from "../../Native/Camera";

export const MultiAutoRocketDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 45,
    width: 35 * 0.7,
    delay: 0.01,
    reload: 8,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "rocket",
        health: 6,
        damage: 3,
        speed: 1.5,
        scatterRate: 0.25,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 0.5
    }
};

export default class MultiAutoRocket extends MultiAutoBase {
    public nameData: NameGroup = new NameGroup(this);
    public turret: Barrel;
    public ai: AI;
    public inputs: Inputs;
    public cameraEntity: CameraEntity;
    public influencedByOwnerInputs: boolean = false;
    public reloadTime = 15;
    public baseSize: number;

    public constructor(owner: BarrelBase, turretDefinition: BarrelDefinition = MultiAutoRocketDefinition, baseSize: number = 20) {
        super(owner);

        this.cameraEntity = owner.cameraEntity;
        this.ai = new AI(this);
        this.ai.doAimPrediction = true;
        this.inputs = this.ai.inputs;

        this.owner = owner;
        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;

        this.physicsData.values.sides = 1;
        this.baseSize = baseSize;
        this.physicsData.values.size = this.baseSize * this.sizeFactor;

        this.styleData.values.color = Color.Barrel;
        this.styleData.values.flags |= StyleFlags.showsAboveParent;

        this.positionData.values.flags |= PositionFlags.absoluteRotation;

        this.nameData.values.name = "Mounted Rocket Launcher";
        this.nameData.values.flags |= NameFlags.hiddenName;

        this.turret = new Barrel(this, turretDefinition);
        this.turret.physicsData.values.flags |= PhysicsFlags.doChildrenCollision;
    }

    public get sizeFactor() {
        return this.owner.sizeFactor;
    }

    public onKill(killedEntity: LivingEntity) {
        if (!(this.owner instanceof LivingEntity)) return;
        this.owner.onKill(killedEntity);
    }

    public tick(tick: number) {
        if (this.inputs !== this.ai.inputs) this.inputs = this.ai.inputs;

        this.relationsData.values.team = this.owner.relationsData.values.team;

        if (this.ai.state === AIState.hasTarget) this.ai.passiveRotation = Math.random() < .5 ? AI.PASSIVE_ROTATION : -AI.PASSIVE_ROTATION;

        this.physicsData.size = this.baseSize * this.sizeFactor;

        this.ai.aimSpeed = this.turret.bulletAccel;
        this.ai.movementSpeed = 0;

        this.reloadTime = this.owner.reloadTime;

        let useAI = !(this.influencedByOwnerInputs && (this.owner.inputs.attemptingRepel() || this.owner.inputs.attemptingShot()));
        if (!useAI) {
            const { x, y } = this.getWorldPosition();
            let flip = this.owner.inputs.attemptingRepel() ? -1 : 1;
            const deltaPos = { x: (this.owner.inputs.mouse.x - x) * flip, y: (this.owner.inputs.mouse.y - y) * flip };

            if (this.ai.targetFilter({ x: x + deltaPos.x, y: y + deltaPos.y }) === false) useAI = true;
            else {
                this.inputs.flags |= InputFlags.leftclick;
                this.positionData.angle = Math.atan2(deltaPos.y, deltaPos.x);
                this.ai.state = AIState.hasTarget;
            }
        }
        if (useAI) {
            if (this.ai.state === AIState.idle) {
                this.positionData.angle += this.ai.passiveRotation;
                this.turret.attemptingShot = false;
            } else {
                const { x, y } = this.getWorldPosition();
                this.positionData.angle = Math.atan2(this.ai.inputs.mouse.y - y, this.ai.inputs.mouse.x - x);
            }
        }
    }

    public static createMultiAutoRockets(owner: BarrelBase, count: number): MultiAutoRocket[] {
    const turrets: MultiAutoRocket[] = [];
    const radius = owner.sizeFactor * 250; // Adjust how far turrets appear from tank

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;

        const turret = new MultiAutoRocket(owner);

        // Position offset from the tank's center
        turret.positionData.values.x = owner.positionData.values.x + Math.cos(angle) * radius;
        turret.positionData.values.y = owner.positionData.values.y + Math.sin(angle) * radius;

        // Optional: rotate each turret to face outward
        turret.positionData.angle = angle;

        turrets.push(turret);
    }

    return turrets;
  }
}