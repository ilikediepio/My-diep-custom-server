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
import NexusGuardian from "../Entity/Misc/NexusGuardian";
import ATMG from "../Entity/Misc/Atmg";
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

import ArrasATMG from "../Entity/Misc/ArrasAtmg"; // temporery

const arenaSize = 5000; // originaly 8000
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
    /** NexusGuardian and ATMG entities */
    public NexusGuardian!: NexusGuardian;
    //public atmg!: ATMG;
    public arrasatmg!: ArrasATMG;
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
            -600, -200, // Center of the map
            baseSize,
            baseSize
        );

        // Spawn Base Guardian at center
        const guardian = new NexusGuardian(this.game);
        guardian.relationsData.values.team = this.blueTeamBase.relationsData.values.team;
        guardian.positionData.values.x = -600;
        guardian.positionData.values.y = -200;
        this.NexusGuardian = guardian;
        // Spawn ATMG near exit (old version, disabled)
        //const atmg = new ATMG(this.game);
        //atmg.relationsData.values.team = null;
        //atmg.positionData.values.x = -3400;
        //atmg.positionData.values.y = -3000;
        //this.atmg = atmg;

        const arrasatmg = new ArrasATMG(this.game);
        arrasatmg.relationsData.values.team = null;
        arrasatmg.positionData.values.x = -3400;
        arrasatmg.positionData.values.y = -3000;
        this.arrasatmg = arrasatmg;



        // Upper central protrusion
        this.Wall = new Wall(game, 600, -3000, 400, 400);
        this.Wall = new Wall(game, 600, -2600, 400, 400);

        // Top horizontal wall — left section
        this.Wall = new Wall(game, -3800, -2200, 400, 400);
        this.Wall = new Wall(game, -3400, -2200, 400, 400);
        this.Wall = new Wall(game, -3000, -2200, 400, 400);
        this.Wall = new Wall(game, -2600, -2200, 400, 400);
        this.Wall = new Wall(game, -2200, -2200, 400, 400);
        this.Wall = new Wall(game, -1800, -2200, 400, 400);
        this.Wall = new Wall(game, -1400, -2200, 400, 400);
        this.Wall = new Wall(game, -1000, -2200, 400, 400);
        this.Wall = new Wall(game, -600, -2200, 400, 400);

        // Top horizontal wall — right section
        this.Wall = new Wall(game, 200, -2200, 400, 400);
        this.Wall = new Wall(game, 600, -2200, 400, 400);
        this.Wall = new Wall(game, 1000, -2200, 400, 400);
        this.Wall = new Wall(game, 1400, -2200, 400, 400);
        this.Wall = new Wall(game, 1800, -2200, 400, 400);
        this.Wall = new Wall(game, 2200, -2200, 400, 400);
        this.Wall = new Wall(game, 2600, -2200, 400, 400);

        // Upper vertical walls
        this.Wall = new Wall(game, -3800, -1800, 400, 400);
        this.Wall = new Wall(game, -1800, -1800, 400, 400);
        this.Wall = new Wall(game, 600, -1800, 400, 400);
        this.Wall = new Wall(game, 2600, -1800, 400, 400);

        // Upper horizontal branches
        this.Wall = new Wall(game, -3800, -1400, 400, 400);
        this.Wall = new Wall(game, -1800, -1400, 400, 400);
        this.Wall = new Wall(game, -1400, -1400, 400, 400);
        this.Wall = new Wall(game, -1000, -1400, 400, 400);
        this.Wall = new Wall(game, -200, -1400, 400, 400);
        this.Wall = new Wall(game, 200, -1400, 400, 400);
        this.Wall = new Wall(game, 600, -1400, 400, 400);
        this.Wall = new Wall(game, 2600, -1400, 400, 400);

        // Upper-middle vertical walls
        this.Wall = new Wall(game, -3800, -1000, 400, 400);
        this.Wall = new Wall(game, -1800, -1000, 400, 400);
        this.Wall = new Wall(game, 600, -1000, 400, 400);
        this.Wall = new Wall(game, 2600, -1000, 400, 400);

        this.Wall = new Wall(game, -3800, -600, 400, 400);
        this.Wall = new Wall(game, -1800, -600, 400, 400);
        this.Wall = new Wall(game, 600, -600, 400, 400);
        this.Wall = new Wall(game, 2600, -600, 400, 400);

        // Central side walls
        this.Wall = new Wall(game, -3800, -200, 400, 400);
        this.Wall = new Wall(game, 2600, -200, 400, 400);

        this.Wall = new Wall(game, -3800, 200, 400, 400);
        this.Wall = new Wall(game, -1800, 200, 400, 400);
        this.Wall = new Wall(game, 600, 200, 400, 400);
        this.Wall = new Wall(game, 2600, 200, 400, 400);

        this.Wall = new Wall(game, -3800, 600, 400, 400);
        this.Wall = new Wall(game, -1800, 600, 400, 400);
        this.Wall = new Wall(game, 600, 600, 400, 400);
        this.Wall = new Wall(game, 2600, 600, 400, 400);

        // Middle horizontal wall — left section
        this.Wall = new Wall(game, -3800, 1000, 400, 400);
        this.Wall = new Wall(game, -3400, 1000, 400, 400);
        this.Wall = new Wall(game, -3000, 1000, 400, 400);
        this.Wall = new Wall(game, -2600, 1000, 400, 400);
        this.Wall = new Wall(game, -2200, 1000, 400, 400);
        this.Wall = new Wall(game, -1800, 1000, 400, 400);
        this.Wall = new Wall(game, -1400, 1000, 400, 400);
        this.Wall = new Wall(game, -1000, 1000, 400, 400);

        // Middle horizontal wall — right section
        this.Wall = new Wall(game, -200, 1000, 400, 400);
        this.Wall = new Wall(game, 200, 1000, 400, 400);
        this.Wall = new Wall(game, 600, 1000, 400, 400);
        this.Wall = new Wall(game, 1000, 1000, 400, 400);
        this.Wall = new Wall(game, 1400, 1000, 400, 400);
        this.Wall = new Wall(game, 1800, 1000, 400, 400);
        this.Wall = new Wall(game, 2200, 1000, 400, 400);
        this.Wall = new Wall(game, 2600, 1000, 400, 400);

        // Lower horizontal extension to the right
        this.Wall = new Wall(game, 3000, 1400, 400, 400);
        this.Wall = new Wall(game, 3400, 1400, 400, 400);

        // Lower vertical walls
        this.Wall = new Wall(game, -3800, 1400, 400, 400);
        this.Wall = new Wall(game, -2200, 1400, 400, 400);
        this.Wall = new Wall(game, 1000, 1400, 400, 400);
        this.Wall = new Wall(game, 2600, 1400, 400, 400);

        this.Wall = new Wall(game, -3800, 1800, 400, 400);
        this.Wall = new Wall(game, -2200, 1800, 400, 400);
        this.Wall = new Wall(game, 1000, 1800, 400, 400);
        this.Wall = new Wall(game, 2600, 1800, 400, 400);

        this.Wall = new Wall(game, -3800, 2200, 400, 400);
        this.Wall = new Wall(game, -2200, 2200, 400, 400);
        this.Wall = new Wall(game, 1000, 2200, 400, 400);
        this.Wall = new Wall(game, 2600, 2200, 400, 400);

        this.Wall = new Wall(game, -3800, 2600, 400, 400);
        this.Wall = new Wall(game, -2200, 2600, 400, 400);
        this.Wall = new Wall(game, 1000, 2600, 400, 400);
        this.Wall = new Wall(game, 2600, 2600, 400, 400);

        // Bottom horizontal wall
        this.Wall = new Wall(game, -3800, 3000, 400, 400);
        this.Wall = new Wall(game, -3400, 3000, 400, 400);
        this.Wall = new Wall(game, -3000, 3000, 400, 400);
        this.Wall = new Wall(game, -2600, 3000, 400, 400);
        this.Wall = new Wall(game, -2200, 3000, 400, 400);
        this.Wall = new Wall(game, -1800, 3000, 400, 400);
        this.Wall = new Wall(game, -1400, 3000, 400, 400);
        this.Wall = new Wall(game, -1000, 3000, 400, 400);
        this.Wall = new Wall(game, -600, 3000, 400, 400);
        this.Wall = new Wall(game, -200, 3000, 400, 400);
        this.Wall = new Wall(game, 200, 3000, 400, 400);
        this.Wall = new Wall(game, 600, 3000, 400, 400);
        this.Wall = new Wall(game, 1000, 3000, 400, 400);
        this.Wall = new Wall(game, 1400, 3000, 400, 400);
        this.Wall = new Wall(game, 1800, 3000, 400, 400);
        this.Wall = new Wall(game, 2200, 3000, 400, 400);
        this.Wall = new Wall(game, 2600, 3000, 400, 400);


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