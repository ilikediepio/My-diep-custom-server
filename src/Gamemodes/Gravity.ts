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

import GameServer from "../Game";
import ArenaEntity from "../Native/Arena";
import type { GravityMultipliers } from "../Native/Arena";
import Client from "../Client";

import TeamBase from "../Entity/Misc/TeamBase";
import ShapeSpawner from "../Entity/Misc/ShapeSpawner";
import TankBody from "../Entity/Tank/TankBody";
import ATMG from "../Entity/Misc/LessLagAtmg";
import Wall from "../Entity/Misc/BounceWall2";
import DamageZone1 from "../Entity/Misc/DZ/DamageZone1";
import DamageZone2 from "../Entity/Misc/DZ/DamageZone2";
import DamageZone3 from "../Entity/Misc/DZ/DamageZone3";
import DamageZone4 from "../Entity/Misc/DZ/DamageZone4";
import DamageZone5 from "../Entity/Misc/DZ/DamageZone5";
import DamageZone6 from "../Entity/Misc/DZ/DamageZone6";
import DamageZone7 from "../Entity/Misc/DZ/DamageZone7";
import DamageZone8 from "../Entity/Misc/DZ/DamageZone8";
import DamageZone9 from "../Entity/Misc/DZ/DamageZone9";
import DamageZone10 from "../Entity/Misc/DZ/DamageZone10";

import { TeamEntity } from "../Entity/Misc/TeamEntity";
import { Color, ArenaFlags, Tank, ClientBound } from "../Const/Enums";
import ShapeManager from "../Entity/Shape/Manager";
import { tps } from "../config";

const arenaSize = 8400; // 6000 game size, 2400 extra added for atmgs + other misc gameplay elements
const baseSize = 1000;

// Stats for each gravity mode.
type GravityMode = "normal" | "high" | "veryHigh";

const GRAVITY_ACCELERATION_BY_MODE : Record<GravityMode, number> = {
    normal: 2.0,
    high : 2.75,
    veryHigh : 4.0
};

const GRAVITY_DURATION_SECONDS : Record<GravityMode, number> = {
    normal: 90,
    high : 60,
    veryHigh : 60
};

const GRAVITY_NOTIFICATION_COLOR : Record<GravityMode, number> = {
    normal: 0x00FF00,   // Green
    high : 0xFFFF00,     // Yellow
    veryHigh : 0xFF0000  // Red
};

const GRAVITY_MULTIPLIERS = {
    tank: 1.0,
    shape : 1.0,
    bullet : 2.0,
    boss : 0.15,
    dominator : 0.0,
    other : 0.0
} as const;

class ZeroShapeManager extends ShapeManager {
    public constructor(arena: ArenaEntity) {
        super(arena); // Call parent constructor
    }

    protected get wantedShapes() {
        return 0;
    }
} // This closing brace was missing (try and remember next time!)

/**
 * Custom Arena with center base and guardian
 */
export default class GravityArena extends ArenaEntity {
    protected shapes: ShapeManager = new ZeroShapeManager(this);
    /** Blue Team Base */
    public blueTeamBase: TeamBase;
    /** ATMG entity */
    public atmg!: ATMG;
    // Wall Entity and damage zones
    public Wall: Wall;

    //gravity
    public override gravityEnabled = true;
    public override gravityAcceleration = GRAVITY_ACCELERATION_BY_MODE.normal;
    public override gravityMultipliers: GravityMultipliers = GRAVITY_MULTIPLIERS;

    // =========================================================
    // DYNAMIC GRAVITY CYCLE
    // =========================================================

    private gravityMode: GravityMode = "normal";

    /** Number of high-gravity phases, including very-high phases. */
    private highGravityPhases = 0;

    /** Game tick at which the current gravity phase ends. */
    private nextGravityChangeTick = 0;

    /** Whether the cycle has started. */
    private gravityCycleStarted = false;

    /** Prevent duplicate countdown notifications. */
    private gravity10SecondWarningSent = false;
    private gravity5SecondWarningSent = false;


    /** Maps clients to their teams */
    public playerTeamMap: Map<Client, TeamBase> = new Map();

    /**
     * Sends a notification to every connected player.
     */
    private broadcastGravityNotification(
        message: string,
        color : number,
        duration : number
    ) {
        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT(message)
            .u32(color)
            .float(duration)
            .stringNT("")
            .send();
    }

    /**
     * Returns the mode that follows the current mode.
     *
     * Every third increase is Very High gravity.
     */
    private getNextGravityMode() : GravityMode{
        if (this.gravityMode !== "normal") {
            return "normal";
        }

        return (this.highGravityPhases + 1) % 3 === 0
            ? "veryHigh"
            : "high";
    }

        /**
         * Converts a mode into its notification label.
         */
        private getGravityModeLabel(mode: GravityMode) : string{
            switch (mode) {
                case "normal":
                    return "NORMAL";

                case "high":
                    return "HIGH";

                case "veryHigh":
                    return "VERY HIGH";
            }
    }

        /**
         * Updates countdown warnings and switches the gravity mode.
         * This method must run once per server tick.
         */
        private updateGravityCycle(tick: number) {
        if (!this.gravityCycleStarted) {
            return;
        }

        const ticksUntilChange =
            this.nextGravityChangeTick - tick;

        // -----------------------------------------------------
        // Change gravity when the current phase expires.
        // -----------------------------------------------------

        if (ticksUntilChange <= 0) {
            const nextMode = this.getNextGravityMode();

            // Count every increase, including Very High.
            if (this.gravityMode === "normal") {
                this.highGravityPhases++;
            }

            this.gravityMode = nextMode;

            // Immediately update the live physics acceleration.
            this.gravityAcceleration =
                GRAVITY_ACCELERATION_BY_MODE[nextMode];

            // Actual mode changes use the mode-specific colours.
            this.broadcastGravityNotification(
                `Gravity is now ${ this.getGravityModeLabel(nextMode) }!`,
                GRAVITY_NOTIFICATION_COLOR[nextMode],
                10000
            );

            // Begin the next phase.
            this.nextGravityChangeTick =
                tick + GRAVITY_DURATION_SECONDS[nextMode] * tps;

            // Allow both warnings to be sent during the next phase.
            this.gravity10SecondWarningSent = false;
            this.gravity5SecondWarningSent = false;

            return;
        }

        const nextMode = this.getNextGravityMode();
        const nextModeLabel = this.getGravityModeLabel(nextMode);

        // -----------------------------------------------------
        // 10-second warning: grey.
        // -----------------------------------------------------

        if (
            !this.gravity10SecondWarningSent &&
            ticksUntilChange <= 10 * tps
            ) {
            this.broadcastGravityNotification(
                `Gravity will change to ${ nextModeLabel } in 10 seconds!`,
                0x404040,
                5000
            );

            this.gravity10SecondWarningSent = true;
        }

        // -----------------------------------------------------
        // 5-second warning: grey.
        // -----------------------------------------------------

        if (
            !this.gravity5SecondWarningSent &&
            ticksUntilChange <= 5 * tps
            ) {
            this.broadcastGravityNotification(
                `Gravity will change to ${ nextModeLabel } in 5 seconds!`,
                0x404040,
                5000
            );

            this.gravity5SecondWarningSent = true;
        }
    }

    public constructor(game: GameServer) {
        super(game);
        this.shapeScoreRewardMultiplier = 2.0;

        this.gravityMode = "normal";
        this.highGravityPhases = 0;

        this.gravityAcceleration = GRAVITY_ACCELERATION_BY_MODE.normal;

        this.nextGravityChangeTick =
            this.game.tick + GRAVITY_DURATION_SECONDS.normal * tps;

        this.gravity10SecondWarningSent = false;
        this.gravity5SecondWarningSent = false;
        this.gravityCycleStarted = true;

        // Set arena size
        this.updateBounds(arenaSize * 2, arenaSize * 2);

        // Spawn Blue base at top of map
        this.blueTeamBase = new TeamBase(
            game,
            new TeamEntity(this.game, Color.TeamBlue),
            0, -5000,
            baseSize,
            11000
        );

        // Spawn Shape Spawner above team base
        new ShapeSpawner(game, 0, -5750, 12000, 500);

        // ATMGs
        const atmg1 = new ATMG(this.game);
        atmg1.relationsData.values.team = null;
        atmg1.positionData.values.x = 0;
        atmg1.positionData.values.y = 8000;
        this.atmg = atmg1;

        const atmg2 = new ATMG(this.game);
        atmg2.relationsData.values.team = null;
        atmg2.positionData.values.x = 4000;
        atmg2.positionData.values.y = 8000;
        this.atmg = atmg2;

        const atmg3 = new ATMG(this.game);
        atmg3.relationsData.values.team = null;
        atmg3.positionData.values.x = -4000;
        atmg3.positionData.values.y = 8000;
        this.atmg = atmg3;

        const atmg4 = new ATMG(this.game);
        atmg4.relationsData.values.team = null;
        atmg4.positionData.values.x = 8000;
        atmg4.positionData.values.y = 8000;
        this.atmg = atmg4;

        const atmg5 = new ATMG(this.game);
        atmg5.relationsData.values.team = null;
        atmg5.positionData.values.x = -8000;
        atmg5.positionData.values.y = 8000;
        this.atmg = atmg5;


        // walls
        // Walls at y = 7000
        // 800-unit gaps centered at x = -6000, -2000, 2000, 6000

        this.Wall = new Wall(game, -8600, 7000, 400, 400);
        this.Wall = new Wall(game, -8200, 7000, 400, 400);
        this.Wall = new Wall(game, -7800, 7000, 400, 400);
        this.Wall = new Wall(game, -7400, 7000, 400, 400);
        this.Wall = new Wall(game, -7000, 7000, 400, 400);
        this.Wall = new Wall(game, -6600, 7000, 400, 400);

        this.Wall = new Wall(game, -5400, 7000, 400, 400);
        this.Wall = new Wall(game, -5000, 7000, 400, 400);
        this.Wall = new Wall(game, -4600, 7000, 400, 400);
        this.Wall = new Wall(game, -4200, 7000, 400, 400);
        this.Wall = new Wall(game, -3800, 7000, 400, 400);
        this.Wall = new Wall(game, -3400, 7000, 400, 400);
        this.Wall = new Wall(game, -3000, 7000, 400, 400);
        this.Wall = new Wall(game, -2600, 7000, 400, 400);

        this.Wall = new Wall(game, -1400, 7000, 400, 400);
        this.Wall = new Wall(game, -1000, 7000, 400, 400);
        this.Wall = new Wall(game, -600, 7000, 400, 400);
        this.Wall = new Wall(game, -200, 7000, 400, 400);
        this.Wall = new Wall(game, 200, 7000, 400, 400);
        this.Wall = new Wall(game, 600, 7000, 400, 400);
        this.Wall = new Wall(game, 1000, 7000, 400, 400);
        this.Wall = new Wall(game, 1400, 7000, 400, 400);

        this.Wall = new Wall(game, 2600, 7000, 400, 400);
        this.Wall = new Wall(game, 3000, 7000, 400, 400);
        this.Wall = new Wall(game, 3400, 7000, 400, 400);
        this.Wall = new Wall(game, 3800, 7000, 400, 400);
        this.Wall = new Wall(game, 4200, 7000, 400, 400);
        this.Wall = new Wall(game, 4600, 7000, 400, 400);
        this.Wall = new Wall(game, 5000, 7000, 400, 400);
        this.Wall = new Wall(game, 5400, 7000, 400, 400);

        this.Wall = new Wall(game, 6600, 7000, 400, 400);
        this.Wall = new Wall(game, 7000, 7000, 400, 400);
        this.Wall = new Wall(game, 7400, 7000, 400, 400);
        this.Wall = new Wall(game, 7800, 7000, 400, 400);
        this.Wall = new Wall(game, 8200, 7000, 400, 400);
        this.Wall = new Wall(game, 8600, 7000, 400, 400);


this.arenaData.values.flags |= ArenaFlags.cantUseCheats;

    }

    public spawnPlayer(tank: TankBody, client: Client) {
        const xOffset = (Math.random() - 0.5) * 11000;
        const yOffset = (Math.random() - 0.5) * 1000;

        const base = this.blueTeamBase;

        tank.relationsData.values.team = base.relationsData.values.team;
        tank.styleData.values.color = base.styleData.values.color;
        tank.positionData.values.x = base.positionData.values.x + xOffset;
        tank.positionData.values.y = base.positionData.values.y + yOffset;
        tank.setTank(Tank.Tank);

        // message player about current gravity status
        const secondsRemaining = Math.max(
            0,
            Math.ceil((this.nextGravityChangeTick - this.game.tick) / tps)
        );

        client.notify(
            `Current gravity mode : ${ this.getGravityModeLabel(this.gravityMode) }`,
            GRAVITY_NOTIFICATION_COLOR[this.gravityMode],
            8000
        );

        client.notify(
            `Next gravity mode in : ${ secondsRemaining } seconds`,
            0x404040,
            8000
        );

        this.playerTeamMap.set(client, base);
        if (client.camera) {
            client.camera.relationsData.team = tank.relationsData.values.team;
        }
    }
    public override tick(tick: number) {
        // Update gravity and notifications once per server tick.
        this.updateGravityCycle(tick);

        // Preserve all existing arena processing.
        super.tick(tick);
    }
}