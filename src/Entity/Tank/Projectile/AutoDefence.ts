/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import Barrel from "../Barrel";
import Drone from "./Drone";

import { InputFlags, PhysicsFlags } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { AIState, Inputs } from "../../AI";
import { BarrelBase } from "../TankBody";
import { CameraEntity } from "../../../Native/Camera";

/**
 * Barrel definition for the factory minion's barrel.
 */
 const MinionBarrelDefinition1: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 100,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition2: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 200,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition3: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 300,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition4: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 400,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition5: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 500,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition6: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 600,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition7: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 700,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition8: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 800,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition9: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 900,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

 const MinionBarrelDefinition10: BarrelDefinition = {
    angle: -1.57079632679,
    offset: 1000,
    size: 0,
    width: 100,
    delay: 0,
    reload: 0,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 2,
        damage: 20,
        speed: 0,
        scatterRate: 0,
        lifeLength: 0,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/**
 * The drone class represents the minion (projectile) entity in diep.
 */
export default class BlasterBullet extends Drone implements BarrelBase {
    /** Size of the focus the minions orbit. */
    public static FOCUS_RADIUS = 500 ** 2;

    //private tickOffset: number;

    /** The minion's barrel */
    private minionBarrel: Barrel;

    /** The camera entity (used as team) of the minion. */
    public cameraEntity: CameraEntity;
    /** The reload time of the minion's barrel. */
    public reloadTime = 1;
    /** The inputs for when to shoot or not. */
    public inputs = new Inputs();

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        const bulletDefinition = barrel.definition.bullet;

        //this.tickOffset = Math.floor(Math.random() * 5);
        this.inputs = this.ai.inputs;
        this.ai.viewRange = 2000;
        this.usePosAngle = false;

        this.physicsData.values.sides = bulletDefinition.sides ?? 1;
        this.physicsData.values.size *= 1.2;
        
        if (this.physicsData.values.flags & PhysicsFlags.noOwnTeamCollision) this.physicsData.values.flags ^= PhysicsFlags.noOwnTeamCollision;
        if (this.physicsData.values.flags & PhysicsFlags.canEscapeArena) this.physicsData.values.flags ^= PhysicsFlags.canEscapeArena;

        this.physicsData.values.flags |= PhysicsFlags.onlySameOwnerCollision;

        this.cameraEntity = tank.cameraEntity;

        this.minionBarrel = new Barrel(this, MinionBarrelDefinition1);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition2);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition3);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition4);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition5);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition6);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition7);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition8);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition9);
        this.minionBarrel = new Barrel(this, MinionBarrelDefinition10);
        this.ai.movementSpeed = this.ai.aimSpeed = this.baseAccel;
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }

    /** This allows for factory to hook in before the entity moves. */
    protected tickMixin(tick: number) {
        this.reloadTime = this.tank.reloadTime;

        const usingAI = !this.canControlDrones || !this.tank.inputs.attemptingShot() && !this.tank.inputs.attemptingRepel();
        const inputs = !usingAI ? this.tank.inputs : this.ai.inputs;

        if (usingAI && this.ai.state === AIState.idle) {
            this.movementAngle = this.positionData.values.angle;
        } else {
            this.inputs.flags |= InputFlags.leftclick;

            //if (tick % 5 !== this.tickOffset) return; // Skip most updates (placed here to fix movemnt bugs)

            const dist = inputs.mouse.distanceToSQ(this.positionData.values);

            if (dist < BlasterBullet.FOCUS_RADIUS / 4) { // Half
                this.movementAngle = this.positionData.values.angle + Math.PI;
            } else if (dist < BlasterBullet.FOCUS_RADIUS) {
                this.movementAngle = this.positionData.values.angle + Math.PI / 2;
            } else this.movementAngle = this.positionData.values.angle;
        }

        super.tickMixin(tick);
    }
}
