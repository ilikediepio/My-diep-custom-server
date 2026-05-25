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
import LivingEntity from "../Live";

import { Color, PhysicsFlags, PositionFlags, AdminFlags, Stat, Tank, ClientBound } from "../../Const/Enums";
import { CameraEntity } from "../../Native/Camera";
import { AI, AIState, Inputs } from "../AI";
import ArenaEntity, { ArenaState } from "../../Native/Arena";

/**
 * Represents the BaseGaurian's body.
 */
export default class SeigeGuardian extends TankBody {
    /** Size of a level 0 Arena Closer. */
    public static BASE_SIZE = 175;
    
    /** The AI that controls how the AC moves. */
    public ai: AI;

    // for seige gamemode
    private deathHandled = false;

public destroy(animate = true) {

    // Prevent duplicate arena closes
    if (this.hash === 0) return;

    const arena = this.game.arena as ArenaEntity;

    if (arena.state === ArenaState.OPEN) {

        arena.state = ArenaState.OVER;

        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT("The Base has fallen!")
            .u32(0xFF0000)
            .float(5000)
            .stringNT("")
            .send();

setTimeout(() => {
    this.game.broadcast()
        .u8(ClientBound.Notification)
        .stringNT("Arena closing...")
        .u32(0xFF0000)
        .float(3000)
        .stringNT("")
        .send();

    process.exit(0);
}, 5000);
    }
    console.log("SEIGE GUARDIAN DESTROY");

    super.destroy(animate);
}

    public constructor(game: GameServer) {
        const inputs = new Inputs();
        const camera = new CameraEntity(game);

        const setLevel = camera.setLevel;
        camera.setLevel = function(level) {
            setLevel.call(this, level);
            // Prevent size growth by not modifying sizeFactor based on level
            this.sizeFactor = (SeigeGuardian.BASE_SIZE / 50);
        }
        camera.sizeFactor = (SeigeGuardian.BASE_SIZE / 50);

        super(game, camera, inputs);

        this.relationsData.values.team = game.arena;

        this.ai = new AI(this);
        this.ai.inputs = inputs;
        this.ai.viewRange = 10000; // inf range for seige mode
        this.ai.doAimPrediction = true;
        this.flags.adminFlags |= AdminFlags.immuneToKillCommand;

        this.setTank(Tank.SeigeGuardian);

        const def = (this.definition = Object.assign({}, this.definition));
        def.maxHealth = 25000;
        this.healthData.values.maxHealth = 25000;
        this.healthData.values.health = 25000;
        def.speed = 0;

        this.damagePerTick = 40;

        this.nameData.values.name = "Base";
        this.styleData.values.color = Color.Blue;
        camera.cameraData.values.player = this;

        for (let i = Stat.MovementSpeed; i < Stat.BodyDamage; ++i) camera.cameraData.values.statLevels.values[i] = 7;

        this.ai.aimSpeed = this.barrels[0].bulletAccel * 1.6;

    }

    public tick(tick: number) {
        this.ai.movementSpeed = this.cameraEntity.cameraData.values.movementSpeed * 6;
        console.log(this.healthData.values.health);

        this.inputs = this.ai.inputs;

        if (
    !this.deathHandled &&
    this.healthData.values.health <= 0
) {
    this.deathHandled = true;

    const arena = this.game.arena as ArenaEntity;

    if (arena.state === ArenaState.OPEN) {
        arena.state = ArenaState.OVER;

        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT("The Base has fallen!")
            .u32(0xFF0000)
            .float(5000)
            .stringNT("")
            .send();

setTimeout(() => {
    this.game.broadcast()
        .u8(ClientBound.Notification)
        .stringNT("Arena closing...")
        .u32(0xFF0000)
        .float(3000)
        .stringNT("")
        .send();

    process.exit(0);
}, 5000);
    }
}

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