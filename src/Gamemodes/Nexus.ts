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
import Client from "../Client";

import TeamBase from "../Entity/Misc/TeamBase";
import TankBody from "../Entity/Tank/TankBody";
import BaseGuardian from "../Entity/Misc/BaseGuardian";
import ATMG from "../Entity/Misc/Atmg2";
import Wall from "../Entity/Misc/MazeWall";
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
import { Color, ArenaFlags, Tank } from "../Const/Enums";

import ShapeManager from "../Entity/Shape/Manager";

const arenaSize = 8000; // 8000
const baseSize = 2000;

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
export default class NexusArena extends ArenaEntity {
    protected shapes: ShapeManager = new ZeroShapeManager(this);
    /** Blue Team Base */
    public blueTeamBase: TeamBase;
    /** BaseGuardian and ATMG entities */
    public BaseGuardian!: BaseGuardian;
    public atmg!: ATMG;
    // Wall Entity and damage zones
    public Wall: Wall;

    /** Maps clients to their teams */
    public playerTeamMap: Map<Client, TeamBase> = new Map();

    public constructor(game: GameServer) {
        super(game);

        // Set arena size
        this.updateBounds(arenaSize * 2, arenaSize * 2);

        // Spawn Blue base at center (0, 0)
        this.blueTeamBase = new TeamBase(
            game,
            new TeamEntity(this.game, Color.TeamBlue),
            0, 0, // Center of the map
            baseSize,
            baseSize
        );

        // Spawn Base Guardian at center
        const guardian = new BaseGuardian(this.game);
        guardian.relationsData.values.team = this.blueTeamBase.relationsData.values.team;
        guardian.positionData.values.x = 0;
        guardian.positionData.values.y = 0;
        this.BaseGuardian = guardian;
        // Spawn ATMG near exit
        const atmg = new ATMG(this.game);
        atmg.relationsData.values.team = null;
        atmg.positionData.values.x = -3000;
        atmg.positionData.values.y = -5800;
        this.atmg = atmg;

//        delete 3 walls closest to these locations: [15:40:09] deleted an object near -2975 3375
//[15:40:24] deleted an object near -175 -5025
//[15:40:28] deleted an object near -575 -4975

    // Spawns all walls
    // --- Outer / large structure ---
// Inner walls / connectors only
this.Wall = new Wall(game, -3800, -4600, 400, 400);
this.Wall = new Wall(game, -3800, -4200, 400, 400);
this.Wall = new Wall(game, -3800, -3800, 400, 400);
this.Wall = new Wall(game, -3800, -3400, 400, 400);

this.Wall = new Wall(game, -3400, -3400, 400, 400);
this.Wall = new Wall(game, -3000, -3400, 400, 400);
this.Wall = new Wall(game, -2600, -3400, 400, 400);
this.Wall = new Wall(game, -2200, -3400, 400, 400);
this.Wall = new Wall(game, -1800, -3400, 400, 400);
this.Wall = new Wall(game, -1400, -3400, 400, 400);
this.Wall = new Wall(game, -1000, -3400, 400, 400);
this.Wall = new Wall(game, -600, -3400, 400, 400);
this.Wall = new Wall(game, -200, -3400, 400, 400);
this.Wall = new Wall(game, 200, -3400, 400, 400);
this.Wall = new Wall(game, 1400, -3400, 400, 400);
this.Wall = new Wall(game, 1800, -3400, 400, 400);
this.Wall = new Wall(game, 2200, -3400, 400, 400);
this.Wall = new Wall(game, 2600, -3400, 400, 400);

this.Wall = new Wall(game, 2200, -3800, 400, 400);
this.Wall = new Wall(game, 2200, -4200, 400, 400);
this.Wall = new Wall(game, 2200, -4600, 400, 400);

this.Wall = new Wall(game, -3400, 3400, 400, 400);
this.Wall = new Wall(game, -2600, 3000, 400, 400);
this.Wall = new Wall(game, -2200, 3000, 400, 400);
this.Wall = new Wall(game, -1800, 3000, 400, 400);
this.Wall = new Wall(game, -1400, 3000, 400, 400);
this.Wall = new Wall(game, -1000, 3000, 400, 400);
this.Wall = new Wall(game, -600, 3000, 400, 400);
this.Wall = new Wall(game, 600, 3000, 400, 400);
this.Wall = new Wall(game, 1000, 3000, 400, 400);
this.Wall = new Wall(game, 1400, 3000, 400, 400);
this.Wall = new Wall(game, 1800, 3000, 400, 400);
this.Wall = new Wall(game, 2200, 3000, 400, 400);
this.Wall = new Wall(game, 2600, 3000, 400, 400);
this.Wall = new Wall(game, 3000, 3000, 400, 400);
this.Wall = new Wall(game, 3400, 3000, 400, 400);
this.Wall = new Wall(game, 3800, 3000, 400, 400);
this.Wall = new Wall(game, 4200, 3000, 400, 400);
this.Wall = new Wall(game, 4600, 3000, 400, 400);
this.Wall = new Wall(game, 5000, 3000, 400, 400);
this.Wall = new Wall(game, 5400, 3000, 400, 400);

this.Wall = new Wall(game, 3400, 3400, 400, 400);
this.Wall = new Wall(game, 3400, 3800, 400, 400);
this.Wall = new Wall(game, 3400, 4200, 400, 400);
this.Wall = new Wall(game, 3400, 4600, 400, 400);
this.Wall = new Wall(game, 3400, 5800, 400, 400);
this.Wall = new Wall(game, 3400, 6200, 400, 400);

// Example smaller horizontal connectors
this.Wall = new Wall(game, -1400, -1400, 400, 400);
this.Wall = new Wall(game, -1000, -1400, 400, 400);
this.Wall = new Wall(game, -600, -1400, 400, 400);
this.Wall = new Wall(game, 600, -1400, 400, 400);
this.Wall = new Wall(game, 1000, -1400, 400, 400);
this.Wall = new Wall(game, 1400, -1400, 400, 400);

this.Wall = new Wall(game, -1400, -1000, 400, 400);
this.Wall = new Wall(game, -1400, -600, 400, 400);
this.Wall = new Wall(game, -1400, -200, 400, 400);
this.Wall = new Wall(game, -1400, 200, 400, 400);
this.Wall = new Wall(game, -1400, 600, 400, 400);
this.Wall = new Wall(game, -1400, 1000, 400, 400);
this.Wall = new Wall(game, -1400, 1400, 400, 400);

this.Wall = new Wall(game, 1400, -1000, 400, 400);
this.Wall = new Wall(game, 1400, -600, 400, 400);
this.Wall = new Wall(game, 1400, -200, 400, 400);
this.Wall = new Wall(game, 1400, 200, 400, 400);
this.Wall = new Wall(game, 1400, 600, 400, 400);
this.Wall = new Wall(game, 1400, 1000, 400, 400);
this.Wall = new Wall(game, 1400, 1400, 400, 400);

this.Wall = new Wall(game, -600, 1800, 400, 400);
this.Wall = new Wall(game, -600, 2200, 400, 400);
this.Wall = new Wall(game, -600, 2600, 400, 400);
this.Wall = new Wall(game, -600, 3000, 400, 400);
this.Wall = new Wall(game, 600, 1800, 400, 400);
this.Wall = new Wall(game, 600, 2200, 400, 400);
this.Wall = new Wall(game, 600, 2600, 400, 400);
this.Wall = new Wall(game, 600, 3000, 400, 400);

// Inner walls / connectors only
this.Wall = new Wall(game, -3800, -5000, 400, 400);
this.Wall = new Wall(game, -3400, -5000, 400, 400);
this.Wall = new Wall(game, -3000, -5000, 400, 400);
this.Wall = new Wall(game, -2600, -5000, 400, 400);
this.Wall = new Wall(game, -2200, -5000, 400, 400);
this.Wall = new Wall(game, -1800, -5000, 400, 400);
this.Wall = new Wall(game, -1400, -5000, 400, 400);
this.Wall = new Wall(game, -1000, -5000, 400, 400);
this.Wall = new Wall(game, 200, -5000, 400, 400);
this.Wall = new Wall(game, 600, -5000, 400, 400);
this.Wall = new Wall(game, 1000, -5000, 400, 400);
this.Wall = new Wall(game, 1400, -5000, 400, 400);
this.Wall = new Wall(game, 1800, -5000, 400, 400);
this.Wall = new Wall(game, 2200, -5000, 400, 400);

// Horizontal cluster top left
this.Wall = new Wall(game, -3400, -3400, 400, 400);
this.Wall = new Wall(game, -3000, -3400, 400, 400);
this.Wall = new Wall(game, -2600, -3400, 400, 400);
this.Wall = new Wall(game, -2200, -3400, 400, 400);
this.Wall = new Wall(game, -1800, -3400, 400, 400);
this.Wall = new Wall(game, -1400, -3400, 400, 400);
this.Wall = new Wall(game, -1000, -3400, 400, 400);
this.Wall = new Wall(game, -600, -3400, 400, 400);
this.Wall = new Wall(game, -200, -3400, 400, 400);
this.Wall = new Wall(game, 200, -3400, 400, 400);
this.Wall = new Wall(game, 1400, -3400, 400, 400);
this.Wall = new Wall(game, 1800, -3400, 400, 400);
this.Wall = new Wall(game, 2200, -3400, 400, 400);
this.Wall = new Wall(game, 2600, -3400, 400, 400);
this.Wall = new Wall(game, 3000, -3400, 400, 400);
this.Wall = new Wall(game, 3400, -3400, 400, 400);
this.Wall = new Wall(game, 3800, -3400, 400, 400);
this.Wall = new Wall(game, 4200, -3400, 400, 400);
this.Wall = new Wall(game, 4600, -3400, 400, 400);
this.Wall = new Wall(game, 5000, -3400, 400, 400);
this.Wall = new Wall(game, 5400, -3400, 400, 400);
this.Wall = new Wall(game, 5800, -3400, 400, 400);
this.Wall = new Wall(game, 6200, -3400, 400, 400);
this.Wall = new Wall(game, 6600, -3400, 400, 400);

// Vertical right cluster
this.Wall = new Wall(game, 6600, -3000, 400, 400);
this.Wall = new Wall(game, 6600, -2600, 400, 400);
this.Wall = new Wall(game, 6600, -2200, 400, 400);

// Horizontal cluster bottom left
this.Wall = new Wall(game, -3400, 3000, 400, 400);
this.Wall = new Wall(game, -3000, 3000, 400, 400);
this.Wall = new Wall(game, -2600, 3000, 400, 400);
this.Wall = new Wall(game, -2200, 3000, 400, 400);
this.Wall = new Wall(game, -1800, 3000, 400, 400);
this.Wall = new Wall(game, -1400, 3000, 400, 400);
this.Wall = new Wall(game, -1000, 3000, 400, 400);
this.Wall = new Wall(game, -600, 3000, 400, 400);
this.Wall = new Wall(game, 600, 3000, 400, 400);
this.Wall = new Wall(game, 1000, 3000, 400, 400);
this.Wall = new Wall(game, 1400, 3000, 400, 400);
this.Wall = new Wall(game, 1800, 3000, 400, 400);
this.Wall = new Wall(game, 2200, 3000, 400, 400);
this.Wall = new Wall(game, 2600, 3000, 400, 400);
this.Wall = new Wall(game, 3000, 3000, 400, 400);
this.Wall = new Wall(game, 3400, 3000, 400, 400);
this.Wall = new Wall(game, 3800, 3000, 400, 400);
this.Wall = new Wall(game, 4200, 3000, 400, 400);
this.Wall = new Wall(game, 4600, 3000, 400, 400);
this.Wall = new Wall(game, 5000, 3000, 400, 400);
this.Wall = new Wall(game, 5400, 3000, 400, 400);

// Vertical cluster mid-right
this.Wall = new Wall(game, -3400, 3800, 400, 400);
this.Wall = new Wall(game, -3400, 4200, 400, 400);
this.Wall = new Wall(game, -3400, 4600, 400, 400);
this.Wall = new Wall(game, -3400, 5000, 400, 400);
this.Wall = new Wall(game, -3400, 5400, 400, 400);
this.Wall = new Wall(game, 3400, 3400, 400, 400);
this.Wall = new Wall(game, 3400, 3800, 400, 400);
this.Wall = new Wall(game, 3400, 4200, 400, 400);
this.Wall = new Wall(game, 3400, 4600, 400, 400);
this.Wall = new Wall(game, 3400, 5800, 400, 400);
this.Wall = new Wall(game, 3400, 6200, 400, 400);

// Left horizontal connectors near center
this.Wall = new Wall(game, -600, 1400, 400, 400);
this.Wall = new Wall(game, -1000, 1400, 400, 400);
this.Wall = new Wall(game, -600, 1800, 400, 400);
this.Wall = new Wall(game, -600, 2200, 400, 400);
this.Wall = new Wall(game, -600, 2600, 400, 400);

// Right horizontal connectors near center
this.Wall = new Wall(game, 600, 1400, 400, 400);
this.Wall = new Wall(game, 1000, 1400, 400, 400);
this.Wall = new Wall(game, 600, 1800, 400, 400);
this.Wall = new Wall(game, 600, 2200, 400, 400);
this.Wall = new Wall(game, 600, 2600, 400, 400);

this.Wall = new Wall(game, 600, 1400, 400, 400);
this.Wall = new Wall(game, -600, 1400, 400, 400);
this.Wall = new Wall(game, -1000, 1400, 400, 400);

this.Wall = new Wall(game, 3000, -3400, 400, 400);
this.Wall = new Wall(game, 3400, -3400, 400, 400);
this.Wall = new Wall(game, 3800, -3400, 400, 400);
this.Wall = new Wall(game, 4200, -3400, 400, 400);
this.Wall = new Wall(game, 4600, -3400, 400, 400);
this.Wall = new Wall(game, 5000, -3400, 400, 400);
this.Wall = new Wall(game, 5400, -3400, 400, 400);
this.Wall = new Wall(game, 5800, -3400, 400, 400);
this.Wall = new Wall(game, 6200, -3400, 400, 400);
this.Wall = new Wall(game, 6600, -3400, 400, 400);
this.Wall = new Wall(game, 6600, -3000, 400, 400);
this.Wall = new Wall(game, 6600, -2600, 400, 400);
this.Wall = new Wall(game, 6600, -2200, 400, 400);

this.Wall = new Wall(game, -3800, -5000, 400, 400);
this.Wall = new Wall(game, -3400, -5000, 400, 400);
this.Wall = new Wall(game, -3000, -5000, 400, 400);
this.Wall = new Wall(game, -2600, -5000, 400, 400);
this.Wall = new Wall(game, -2200, -5000, 400, 400);
this.Wall = new Wall(game, -1800, -5000, 400, 400);
this.Wall = new Wall(game, -1400, -5000, 400, 400);
this.Wall = new Wall(game, -1000, -5000, 400, 400);
this.Wall = new Wall(game, 200, -5000, 400, 400);
this.Wall = new Wall(game, 600, -5000, 400, 400);
this.Wall = new Wall(game, 1000, -5000, 400, 400);
this.Wall = new Wall(game, 1400, -5000, 400, 400);
this.Wall = new Wall(game, 1800, -5000, 400, 400);
this.Wall = new Wall(game, 2200, -5000, 400, 400);

this.Wall = new Wall(game, -6600, -3400, 400, 400);
this.Wall = new Wall(game, -6200, -3400, 400, 400);
this.Wall = new Wall(game, -5800, -3400, 400, 400);
this.Wall = new Wall(game, -5400, -3400, 400, 400);
this.Wall = new Wall(game, -5000, -3400, 400, 400);
this.Wall = new Wall(game, -4600, -3400, 400, 400);
this.Wall = new Wall(game, -4200, -3400, 400, 400);

this.Wall = new Wall(game, -3400, 3000, 400, 400);
this.Wall = new Wall(game, -3000, 3000, 400, 400);

this.Wall = new Wall(game, -3400, 3800, 400, 400);
this.Wall = new Wall(game, -3400, 4200, 400, 400);

this.Wall = new Wall(game, 1400, -3000, 400, 400);
this.Wall = new Wall(game, 1400, -2600, 400, 400);
this.Wall = new Wall(game, 1400, -2200, 400, 400);
this.Wall = new Wall(game, 1400, -1800, 400, 400);

this.Wall = new Wall(game, -6200, -1400, 400, 400);
this.Wall = new Wall(game, -5800, -1400, 400, 400);
this.Wall = new Wall(game, -5400, -1400, 400, 400);
this.Wall = new Wall(game, -5000, -1400, 400, 400);
this.Wall = new Wall(game, -4600, -1400, 400, 400);
this.Wall = new Wall(game, -4200, -1400, 400, 400);
this.Wall = new Wall(game, -3800, -1400, 400, 400);
this.Wall = new Wall(game, -3400, -1400, 400, 400);
this.Wall = new Wall(game, -3000, -1400, 400, 400);
this.Wall = new Wall(game, -2600, -1400, 400, 400);
this.Wall = new Wall(game, -2200, -1400, 400, 400);
this.Wall = new Wall(game, -1800, -1400, 400, 400);

this.Wall = new Wall(game, -3400, 4600, 400, 400);
this.Wall = new Wall(game, -3400, 5000, 400, 400);
this.Wall = new Wall(game, -3400, 5400, 400, 400);

// --- Giant perimeter (condensed but complete) ---
for (let y = -3000; y <= 6600; y += 400)
    this.Wall = new Wall(game, -6600, y, 400, 400);

for (let x = -6200; x <= 6600; x += 400)
    this.Wall = new Wall(game, x, 6600, 400, 400);

for (let y = 6200; y >= -1800; y -= 400)
    this.Wall = new Wall(game, 6600, y, 400, 400);

    // damage zones
this.Wall = new DamageZone6(game, null, 5700, 2900, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5900, 2900, 200, 200, true);
this.Wall = new DamageZone6(game, null, 6100, 2900, 200, 200, true);
this.Wall = new DamageZone6(game, null, 6300, 2900, 200, 200, true);

this.Wall = new DamageZone6(game, null, 5700, 3100, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5900, 3100, 200, 200, true);
this.Wall = new DamageZone6(game, null, 6100, 3100, 200, 200, true);
this.Wall = new DamageZone6(game, null, 6300, 3100, 200, 200, true);

this.Wall = new DamageZone1(game, null, 3300, 4900, 200, 200, true);
this.Wall = new DamageZone1(game, null, 3500, 4900, 200, 200, true);
this.Wall = new DamageZone1(game, null, 3300, 5500, 200, 200, true);
this.Wall = new DamageZone1(game, null, 3500, 5500, 200, 200, true);

this.Wall = new DamageZone10(game, null, 3300, 5100, 200, 200, false);
this.Wall = new DamageZone10(game, null, 3500, 5100, 200, 200, false);
this.Wall = new DamageZone10(game, null, 3300, 5300, 200, 200, false);
this.Wall = new DamageZone10(game, null, 3500, 5300, 200, 200, false);

this.arenaData.values.flags |= ArenaFlags.cantUseCheats;

    }

    public spawnPlayer(tank: TankBody, client: Client) {
        const xOffset = (Math.random() - 0.5) * baseSize;
        const yOffset = (Math.random() - 0.5) * baseSize;

        const base = this.blueTeamBase;

        tank.relationsData.values.team = base.relationsData.values.team;
        tank.styleData.values.color = base.styleData.values.color;
        tank.positionData.values.x = base.positionData.values.x + xOffset;
        tank.positionData.values.y = base.positionData.values.y + yOffset;
        tank.setTank(Tank.Tank);

        this.playerTeamMap.set(client, base);
        if (client.camera) {
            client.camera.relationsData.team = tank.relationsData.values.team;
        }
    }
}