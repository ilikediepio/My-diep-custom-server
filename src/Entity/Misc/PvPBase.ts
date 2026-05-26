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

import { ClientInputs } from "../../Client";
import { tps } from "../../config";
import { Color, Tank, Stat, ColorsHexCode, ClientBound, TeamFlags } from "../../Const/Enums";
import GameServer from "../../Game";
import ArenaEntity from "../../Native/Arena";
import { CameraEntity } from "../../Native/Camera";
import { AI, AIState, Inputs } from "../AI";
import Live from "../Live";
import TankBody from "../Tank/TankBody";
import { TeamEntity } from "./TeamEntity";
import TeamBase from "../../Entity/Misc/TeamBase";
import PvPArena from "../../Gamemodes/PvP";

const POSSESSION_TIMER = tps * 60 * 5;

/**
 * Mothership Entity
 */
export default class Mothership extends TankBody {
    /** The AI that controls how the Mothership aims. */
    public ai: AI;

    /** If the mothership's AI ever gets possessed, this is the tick that the possession started. */
    public possessionStartTick: number = -1;

    public arena: PvPArena;
    public side!: "blue" | "red";

constructor(game: GameServer, arena: PvPArena, team: TeamBase, x: number, y: number, color: Color, side: "blue" | "red") {

    const inputs = new Inputs();
    const camera = new CameraEntity(game);

    camera.setLevel(160);

    super(game, camera, inputs);
    this.arena = arena;

    // assign team
    this.relationsData.values.team = team.relationsData.values.team;

    // base color
    this.styleData.values.color = color;

    // AI
    this.ai = new AI(this, true);
    this.ai.inputs = inputs;
    this.ai.viewRange = 2000;

    // fixed position
    this.positionData.values.x = x;
    this.positionData.values.y = y;

    // tank type
    this.setTank(Tank.DominatorD);

    // custom name
    this.nameData.values.name = side === "blue" ? "Blue Base" : "Red Base";

    this.physicsData.values.absorbtionFactor = 0;
    this.scoreReward = 0;

    camera.cameraData.values.player = this;

    for (let i = Stat.MovementSpeed; i < Stat.HealthRegen; ++i) {
        camera.cameraData.values.statLevels.values[i] = 4;
    }

    camera.cameraData.values.statLevels.values[Stat.HealthRegen] = 0;
    camera.cameraData.values.statLevels.values[Stat.MovementSpeed] = -999; // 0 speed

    const def = (this.definition = Object.assign({}, this.definition));

    // force health
    def.maxHealth = 15008 - 418;
}

public onDeath(killer: Live): void {
    const team = this.relationsData.values.team;

    const killerTeam = killer.relationsData.values.team;

    const killerName =
        killer.relationsData?.values.team instanceof TeamEntity
            ? killer.relationsData.values.team.teamName
            : killer.nameData?.values.name || "an unnamed tank";

    this.game.broadcast()
        .u8(ClientBound.Notification)
        .stringNT(`${killerName} destroyed the ${team instanceof TeamEntity ? team.teamName : "a"} PvP Base!`)
        .u32(killerTeam instanceof TeamEntity ? ColorsHexCode[killerTeam.teamData.values.teamColor] : 0)
        .float(-1)
        .stringNT("")
        .send();

    // CORE WIN LOGIC
    if ((this.arena as any).ended) return;

    if (this.side === "blue") {
        this.arena.endGame("red");
    } else {
        this.arena.endGame("blue");
    }

    super.onDeath(killer);
}

    public delete(): void {
        // No more mothership arrow - seems like in old diep this wasn't the case - we should probably keep though
        if (this.relationsData.values.team?.teamData) this.relationsData.values.team.teamData.flags  &= ~TeamFlags.hasMothership;
        this.ai.inputs.deleted = true;
        super.delete();
    }


    public tick(tick: number) {
        if (!this.barrels.length) return super.tick(tick)

        this.inputs = this.ai.inputs;

        if (this.ai.state === AIState.idle) {
            const angle = this.positionData.values.angle + this.ai.passiveRotation;
            const mag = Math.sqrt((this.inputs.mouse.x - this.positionData.values.x) ** 2 + (this.inputs.mouse.y - this.positionData.values.y) ** 2);
            this.inputs.mouse.set({
                x: this.positionData.values.x + Math.cos(angle) * mag,
                y: this.positionData.values.y + Math.sin(angle) * mag
            });
        } else if (this.ai.state === AIState.possessed && this.possessionStartTick === -1) {
            this.possessionStartTick = tick;
        }
        if (this.possessionStartTick !== -1 && this.ai.state !== AIState.possessed) {
            this.possessionStartTick = -1;
        }

        // after 10 minutes, kick out the person possessing
        if (this.possessionStartTick !== -1) {
            if (this.possessionStartTick !== -1 && this.ai.state !== AIState.possessed) {
                this.possessionStartTick = -1;
            } else if (this.inputs instanceof ClientInputs) {
                if (tick - this.possessionStartTick >= POSSESSION_TIMER) {
                    this.inputs.deleted = true;
                } else if (tick - this.possessionStartTick === Math.floor(POSSESSION_TIMER - 10 * tps)) {
                    this.inputs.client.notify("You only have 10 seconds left in control of the Base", ColorsHexCode[this.styleData.values.color], 5_000, "");
                }
            }
        }

        super.tick(tick);
    }
}