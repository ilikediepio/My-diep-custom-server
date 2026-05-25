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

import GameServer from "../../Game";
import Barrel from "../Tank/Barrel";
import AbstractBoss from "./AbstractBoss";

import { Color, Tank } from "../../Const/Enums";
import { AIState } from "../AI";

import { BarrelDefinition } from "../../Const/TankDefinitions";
import { PI2 } from "../../util";

// The size of Guardian by default
const GUARDIAN_SIZE = 230;

// Corrected array of barrels
const GuardianSpawnerDefinition: BarrelDefinition = {
    angle: 3.14159265359,
    offset: 0,
    size: 170,
    width: 120,
    delay: 0,
    reload: 0.25,
    recoil: 1,
    isTrapezoid: true,
    trapezoidDirection: 0,
    addon: null,
    droneCount: 24,
    canControlDrones: true,
    bullet: {
        type: "drone",
        sizeRatio: 21 / (71.4 / 2),
        health: 12.5,
        damage: 1,
        speed: 1.7,
        scatterRate: 1,
        lifeLength: 6,
        absorbtionFactor: 1
    }
};

/**
 * Class which represents the boss "Guardian"
 */
export default class Guardian extends AbstractBoss {

    private spawners: Barrel[] = [];

    public constructor(game: GameServer) {
        super(game);

        this.nameData.values.name = 'Sentinel';
        this.altName = 'Sentinel of the Hexagons';
        this.styleData.values.color = Color.EnemyCrasher;
        this.relationsData.values.team = this.game.arena;
        this.physicsData.values.size = GUARDIAN_SIZE * Math.SQRT1_2;
        this.physicsData.values.sides = 3;

for (let i = 0; i < 3; ++i) {
    this.spawners.push(new Barrel(this, {
        ...GuardianSpawnerDefinition,
        angle: PI2 * ((i / 3) - 1 / 6),
    }));
}
    }

    public get sizeFactor() {
        return (this.physicsData.values.size / Math.SQRT1_2) / GUARDIAN_SIZE;
    }

    protected moveAroundMap() {
        super.moveAroundMap();
        this.positionData.angle = Math.atan2(this.inputs.movement.y, this.inputs.movement.x);
    }

    public tick(tick: number) {
        super.tick(tick);
    }
}