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

import { Color, Stat, Tank } from "../../Const/Enums";
import { CameraEntity } from "../../Native/Camera";
import { AI, AIState, Inputs } from "../AI";

/**
 * Represents the Arena Closers that end the game.
 */
export default class Terrestrial extends TankBody {
    /** Size of a level 0 Arena Closer. */
    public static BASE_SIZE = 175;
    
    /** The AI that controls how the AC moves. */
    public ai: AI;

    public constructor(game: GameServer) {
        const inputs = new Inputs();
        const camera = new CameraEntity(game);

        const setLevel = camera.setLevel;
        camera.setLevel = function(level) {
            setLevel.call(this, 1); // Set the level to always be 1
            this.sizeFactor = (Terrestrial.BASE_SIZE / 50); // Keep size constant
        }
        camera.sizeFactor = (Terrestrial.BASE_SIZE / 50); // Fix sizeFactor at a constant value

        super(game, camera, inputs);

        this.relationsData.values.team = game.arena;

        this.ai = new AI(this);
        this.ai.inputs = inputs;
        this.ai.viewRange = 25000; // Keep AI's view range same as bosses

if (Math.random() < 0.5) {
    this.setTank(Tank.Ares);
    this.nameData.values.name = "Caelus";
    this.styleData.values.color = Color.EnemyPentagon;
} else {
    this.setTank(Tank.Eris);
    this.nameData.values.name = "Vireon";
    this.styleData.values.color = Color.EnemyCrasher;
}

        const def = (this.definition = Object.assign({}, this.definition));
        def.maxHealth = 8000;
        def.speed = 0.75; // Keep speed constant, independent of level

        this.damagePerTick = 20;
        this.healthData.values.health = 8000;

        camera.cameraData.values.player = this;

        // Set the level and score explicitly to 120 and 700000
        camera.cameraData.values.level = 120;
        camera.cameraData.values.score = 700000;

        // Make sure all stats are fixed, unaffected by level scaling
        for (let i = Stat.MovementSpeed; i < Stat.BodyDamage; ++i) {
            camera.cameraData.values.statLevels.values[i] = 7;
        }

        this.ai.aimSpeed = this.barrels[0].bulletAccel * 1.6;
    }

    public tick(tick: number) {
        // Ensure movement speed is constant, independent of the level
        this.ai.movementSpeed = 0.65 * 10;  // Use the fixed speed here

        this.inputs = this.ai.inputs;

        if (this.ai.state === AIState.idle) {
            const angle = this.positionData.values.angle + this.ai.passiveRotation;
            const mag = Math.sqrt((this.inputs.mouse.x - this.positionData.values.x) ** 2 + (this.inputs.mouse.y - this.positionData.values.y) ** 2);
            this.inputs.mouse.set({
                x: this.positionData.values.x + Math.cos(angle) * mag,
                y: this.positionData.values.y + Math.sin(angle) * mag
            });
        }

        super.tick(tick);
    }
}