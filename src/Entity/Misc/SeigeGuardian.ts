/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

  program is free software: you can redistribute it and/or modify
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

import { Color, AdminFlags, Stat, Tank, ClientBound } from "../../Const/Enums";
import { CameraEntity } from "../../Native/Camera";
import ArenaEntity, { ArenaState } from "../../Native/Arena";
import { AI, AIState, Inputs } from "../AI";

/**
 * Represents the Base Guardian's body.
 */
export default class SeigeGuardian extends TankBody {
    /** Size of a level 0 Base Guardian. */
    public static BASE_SIZE = 175;

    /** The AI that controls how the guardian moves. */
    public ai: AI;

    /** Prevents the arena from trying to close more than once. */
    private arenaCloseHandled = false;

    public constructor(game: GameServer) {
        const inputs = new Inputs();
        const camera = new CameraEntity(game);

        const setLevel = camera.setLevel;
        camera.setLevel = function(level) {
            setLevel.call(this, level);
            this.sizeFactor = SeigeGuardian.BASE_SIZE / 50;
        };
        camera.sizeFactor = SeigeGuardian.BASE_SIZE / 50;

        super(game, camera, inputs);

        this.relationsData.values.team = game.arena;

        this.ai = new AI(this);
        this.ai.inputs = inputs;
        this.ai.viewRange = 10000;
        this.ai.doAimPrediction = true;

        this.flags.adminFlags |= AdminFlags.immuneToKillCommand;

        this.setTank(Tank.SeigeGuardian);

        const def = (this.definition = Object.assign({}, this.definition));
        def.maxHealth = 25000;
        def.speed = 0;

        this.healthData.values.maxHealth = 25000;
        this.healthData.values.health = 25000;

        this.damagePerTick = 40;

        this.nameData.values.name = "Base";
        this.styleData.values.color = Color.Blue;
        camera.cameraData.values.player = this;

        for (let i = Stat.MovementSpeed; i < Stat.BodyDamage; ++i) {
            camera.cameraData.values.statLevels.values[i] = 7;
        }

        this.ai.aimSpeed = this.barrels[0].bulletAccel * 1.6;
    }

    private handleArenaDefeat() {
        if (this.arenaCloseHandled) return;
        this.arenaCloseHandled = true;

        const arena = this.game.arena as ArenaEntity;
        if (arena.state !== ArenaState.OPEN) return;

        arena.state = ArenaState.OVER;

        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT("The Base has fallen!")
            .u32(0xFF0000)
            .float(5000)
            .stringNT("")
            .send();

        setTimeout(() => {
            arena.close();
        }, 5000);
    }

    public applyPhysics() {
        super.applyPhysics();

        if (this.healthData.values.health <= 0) {
            this.handleArenaDefeat();
        }
    }

    public tick(tick: number) {
        this.ai.movementSpeed = this.cameraEntity.cameraData.values.movementSpeed * 6;
        this.inputs = this.ai.inputs;

        if (this.ai.state === AIState.idle) {
            const angle = this.positionData.values.angle + this.ai.passiveRotation;
            const mag = Math.sqrt(
                (this.inputs.mouse.x - this.positionData.values.x) ** 2 +
                (this.inputs.mouse.y - this.positionData.values.y) ** 2
            );

            this.inputs.mouse.set({
                x: this.positionData.values.x + Math.cos(angle) * mag,
                y: this.positionData.values.y + Math.sin(angle) * mag
            });
        }

        super.tick(tick);
    }
}