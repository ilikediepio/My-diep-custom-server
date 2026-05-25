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
import TankBody from "../Tank/TankBody";
import { TeamEntity } from "./TeamEntity";
import blueTeamBase from "./TeamBase";

import { Color, PhysicsFlags, PositionFlags, Stat, Tank } from "../../Const/Enums";
import { CameraEntity } from "../../Native/Camera";
import { AI, AIState, Inputs, } from "../AI";
import { Entity } from "../../Native/Entity";

/**
 * Represents the bots that are on the shape team and stronger than normal bots.
 */
export default class Bot extends TankBody {
    /** Size of a level 45 player. */
    public static BASE_SIZE = 110;
    
    /** The AI that controls how the bot moves. */
    public ai: AI;

    private ORBIT_RADIUS: number = 1500;
    private ORBIT_SPEED: number = 0.04;
    private orbitAngle: number = 0;

    // NEW: source of truth for tank behavior
    private tankTypeIndex: number = 0;

    public constructor(game: GameServer) {
        const inputs = new Inputs();
        const camera = new CameraEntity(game);

        const setLevel = camera.setLevel;
        camera.setLevel = function(level) {
            setLevel.call(this, 1);
            this.sizeFactor = (Bot.BASE_SIZE / 50);
        };

        camera.sizeFactor = (Bot.BASE_SIZE / 50);

        super(game, camera, inputs);

        this.relationsData.values.team = game.arena;

        this.ai = new AI(this, true);
        this.ai.inputs = inputs;
        this.ai.viewRange = 6000;

        const randomTankIndex = Math.floor(Math.random() * 11) + 1;

        // ? store tank index for logic
        this.tankTypeIndex = randomTankIndex;

        if (randomTankIndex === 1) this.setTank(Tank.Tank);
        else if (randomTankIndex === 2) this.setTank(Tank.Twin);
        else if (randomTankIndex === 3) this.setTank(Tank.Triplet);
        else if (randomTankIndex === 4) this.setTank(Tank.Gunner);
        else if (randomTankIndex === 5) this.setTank(Tank.Overseer);
        else if (randomTankIndex === 6) this.setTank(Tank.Overlord);
        else if (randomTankIndex === 7) this.setTank(Tank.Ranger);
        else if (randomTankIndex === 8) this.setTank(Tank.PentaShot);
        else if (randomTankIndex === 9) this.setTank(Tank.SpreadShot);
        else if (randomTankIndex === 10) this.setTank(Tank.Spike);
        else if (randomTankIndex === 11) this.setTank(Tank.Destroyer);
        else this.setTank(Tank.Basic);

        const def = (this.definition = Object.assign({}, this.definition));
        def.maxHealth = 240;
        def.speed = 0.75;

        this.damagePerTick = 72;

        this.nameData.values.name = "Super Bot";
        this.styleData.values.color = Color.TeamBlue;
        camera.cameraData.values.player = this;

        camera.cameraData.values.level = 60;
        camera.cameraData.values.score = 60000;

        if (this.tankTypeIndex === 10) {
            this.definition.maxHealth = 204;
            this.damagePerTick = 102;
        }

        for (let i = Stat.MovementSpeed; i < Stat.BodyDamage; ++i) {
            camera.cameraData.values.statLevels.values[i] = 14;
        }

        if (this.barrels.length > 0 && this.barrels[0]) {
            this.ai.aimSpeed = this.barrels[0].bulletAccel * 1.6;
        } else {
            this.ai.aimSpeed = 1.6;
        }
    }

    public tick(tick: number) {
        this.inputs = this.ai.inputs;

        const target = this.ai.findTarget(tick);

        if (!target) {
            this.ai.movementSpeed = 10;
            return super.tick(tick);
        }

        const isSpike = this.tankTypeIndex === 10;

        // =========================
        // SPIKE (NO ORBIT + DOUBLE DAMAGE)
        // =========================
        if (isSpike) {
            const dx = target.positionData.values.x - this.positionData.values.x;
            const dy = target.positionData.values.y - this.positionData.values.y;

            const len = Math.sqrt(dx * dx + dy * dy) || 1;

            this.inputs.movement.set({
                x: dx / len,
                y: dy / len
            });

            this.inputs.mouse.set({
                x: target.positionData.values.x,
                y: target.positionData.values.y
            });

            return super.tick(tick);
        }

        // =========================
        // NORMAL ORBIT
        // =========================

        const dx = this.positionData.values.x - target.positionData.values.x;
        const dy = this.positionData.values.y - target.positionData.values.y;

        const angleToTarget = Math.atan2(dy, dx);
        this.orbitAngle = angleToTarget + Math.PI / 2;

        const desiredX =
            target.positionData.values.x +
            this.ORBIT_RADIUS * Math.cos(this.orbitAngle);

        const desiredY =
            target.positionData.values.y +
            this.ORBIT_RADIUS * Math.sin(this.orbitAngle);

        const moveX = desiredX - this.positionData.values.x;
        const moveY = desiredY - this.positionData.values.y;

        const len = Math.sqrt(moveX * moveX + moveY * moveY) || 1;

        this.inputs.movement.set({
            x: moveX / len,
            y: moveY / len
        });

        // =========================
        // AIM CONTROL
        // =========================

        const noPrediction =
            this.tankTypeIndex === 5 || // Overseer
            this.tankTypeIndex === 6;   // Overlord

        if (!noPrediction) {
            this.inputs.mouse.set({
                x: target.positionData.values.x,
                y: target.positionData.values.y
            });
        }

        return super.tick(tick);
    }
}