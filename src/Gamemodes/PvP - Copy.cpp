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

import Client from "../Client";
import { Color, ArenaFlags, Tank } from "../Const/Enums";
import TeamBase from "../Entity/Misc/TeamBase";
import { TeamEntity } from "../Entity/Misc/TeamEntity";
import TankBody from "../Entity/Tank/TankBody";
import GameServer from "../Game";
import ArenaEntity from "../Native/Arena";
import BaseGuardian from "../Entity/Misc/BaseGuardian";
import GDominator from "../Entity/Misc/GDominator";
import AcDominator from "../Entity/Misc/AcDominator";
import PvPBase from "../Entity/Misc/PvPBase";

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


const arenaSize = 11150;
const baseSize = 3345;
const baseWidth = 1250;
const domBaseSize = baseSize / 2;
/**
 * Domination Gamemode Arena
 */
export default class PvPArena extends ArenaEntity {
    public blueTeamBase: TeamBase;
    public redTeamBase: TeamBase;

    public Wall: Wall;

    /** Maps clients to their teams */
    public playerTeamMap: Map<Client, TeamBase> = new Map();

    public constructor(game: GameServer) {
        super(game);

        (this as any).isPvP = true;
        this.shapeScoreRewardMultiplier = 10.0;

        this.updateBounds(arenaSize * 2, arenaSize * 2)

        this.arenaData.values.flags |= ArenaFlags.hiddenScores;

    // 2TDM-style base positions
    this.blueTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamBlue), 0, arenaSize - baseWidth / 2, baseWidth, arenaSize * 2);
    this.redTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamRed), 0, -arenaSize + baseWidth / 2, baseWidth, arenaSize * 2);

        
new GDominator(
    this,
    new TeamBase(game, this, arenaSize / 2.5, arenaSize / 2.5, domBaseSize, domBaseSize, false),
    Tank.DominatorG
);

new GDominator(
    this,
    new TeamBase(game, this, arenaSize / -2.5, arenaSize / 2.5, domBaseSize, domBaseSize, false),
    Tank.DominatorG
);

new GDominator(
    this,
    new TeamBase(game, this, arenaSize / -2.5, arenaSize / -2.5, domBaseSize, domBaseSize, false),
    Tank.DominatorG
);

new GDominator(
    this,
    new TeamBase(game, this, arenaSize / 2.5, arenaSize / -2.5, domBaseSize, domBaseSize, false),
    Tank.DominatorG
);

new AcDominator(
    this,
    new TeamBase(game, this, 0, 0, domBaseSize, domBaseSize, false),
    Tank.ArenaCloser
);

// walls

// Left upper vertical
this.Wall = new Wall(game, -1000, -1000, 400, 400);
this.Wall = new Wall(game, -1000, -1400, 400, 400);
this.Wall = new Wall(game, -1000, -1800, 400, 400);
this.Wall = new Wall(game, -1000, -2200, 400, 400);
this.Wall = new Wall(game, -1000, -2600, 400, 400);
this.Wall = new Wall(game, -1000, -3000, 400, 400);
this.Wall = new Wall(game, -1000, -3400, 400, 400);
this.Wall = new Wall(game, -1000, -3800, 400, 400);
this.Wall = new Wall(game, -1000, -4200, 400, 400);
this.Wall = new Wall(game, -1000, -4600, 400, 400);
this.Wall = new Wall(game, -1000, -5000, 400, 400);
this.Wall = new Wall(game, -1000, -5400, 400, 400);
this.Wall = new Wall(game, -1000, -5800, 400, 400);
this.Wall = new Wall(game, -1000, -6200, 400, 400);
this.Wall = new Wall(game, -1000, -6600, 400, 400);
this.Wall = new Wall(game, -1000, -7000, 400, 400);
this.Wall = new Wall(game, -1000, -7400, 400, 400);

// Left upper horizontal
this.Wall = new Wall(game, -1400, -7400, 400, 400);
this.Wall = new Wall(game, -1800, -7400, 400, 400);
this.Wall = new Wall(game, -2200, -7400, 400, 400);
this.Wall = new Wall(game, -2600, -7400, 400, 400);
this.Wall = new Wall(game, -3000, -7400, 400, 400);
this.Wall = new Wall(game, -3400, -7400, 400, 400);

// Left upper outer vertical
this.Wall = new Wall(game, -3800, -7400, 400, 400);
this.Wall = new Wall(game, -3800, -7800, 400, 400);
this.Wall = new Wall(game, -3800, -8200, 400, 400);
this.Wall = new Wall(game, -3800, -8600, 400, 400);
//this.Wall = new Wall(game, -3800, -9000, 400, 400);
//this.Wall = new Wall(game, -3800, -9400, 400, 400);
//this.Wall = new Wall(game, -3800, -9800, 400, 400);

// Right upper vertical
this.Wall = new Wall(game, 1000, -1000, 400, 400);
this.Wall = new Wall(game, 1000, -1400, 400, 400);
this.Wall = new Wall(game, 1000, -1800, 400, 400);
this.Wall = new Wall(game, 1000, -2200, 400, 400);
this.Wall = new Wall(game, 1000, -2600, 400, 400);
this.Wall = new Wall(game, 1000, -3000, 400, 400);
this.Wall = new Wall(game, 1000, -3400, 400, 400);
this.Wall = new Wall(game, 1000, -3800, 400, 400);
this.Wall = new Wall(game, 1000, -4200, 400, 400);
this.Wall = new Wall(game, 1000, -4600, 400, 400);
this.Wall = new Wall(game, 1000, -5000, 400, 400);
this.Wall = new Wall(game, 1000, -5400, 400, 400);
this.Wall = new Wall(game, 1000, -5800, 400, 400);
this.Wall = new Wall(game, 1000, -6200, 400, 400);
this.Wall = new Wall(game, 1000, -6600, 400, 400);
this.Wall = new Wall(game, 1000, -7000, 400, 400);
this.Wall = new Wall(game, 1000, -7400, 400, 400);

// Right upper horizontal
this.Wall = new Wall(game, 1400, -7400, 400, 400);
this.Wall = new Wall(game, 1800, -7400, 400, 400);
this.Wall = new Wall(game, 2200, -7400, 400, 400);
this.Wall = new Wall(game, 2600, -7400, 400, 400);
this.Wall = new Wall(game, 3000, -7400, 400, 400);
this.Wall = new Wall(game, 3400, -7400, 400, 400);
this.Wall = new Wall(game, 3800, -7400, 400, 400);

// Right upper outer vertical
this.Wall = new Wall(game, 3800, -7800, 400, 400);
this.Wall = new Wall(game, 3800, -8200, 400, 400);
this.Wall = new Wall(game, 3800, -8600, 400, 400);
//this.Wall = new Wall(game, 3800, -9000, 400, 400);
//this.Wall = new Wall(game, 3800, -9400, 400, 400);
//this.Wall = new Wall(game, 3800, -9800, 400, 400);

// Right middle structure
this.Wall = new Wall(game, 3800, -7000, 400, 400);
this.Wall = new Wall(game, 3800, -6600, 400, 400);
this.Wall = new Wall(game, 3800, -6200, 400, 400);

this.Wall = new Wall(game, 3400, -6200, 400, 400);
this.Wall = new Wall(game, 3400, -5800, 400, 400);
this.Wall = new Wall(game, 3400, -5400, 400, 400);
this.Wall = new Wall(game, 3400, -5000, 400, 400);
this.Wall = new Wall(game, 3400, -4600, 400, 400);
this.Wall = new Wall(game, 3400, -4200, 400, 400);
this.Wall = new Wall(game, 3400, -3800, 400, 400);
this.Wall = new Wall(game, 3400, -3400, 400, 400);
this.Wall = new Wall(game, 3400, -3000, 400, 400);
this.Wall = new Wall(game, 3400, -2600, 400, 400);
this.Wall = new Wall(game, 3400, -2200, 400, 400);
this.Wall = new Wall(game, 3400, -1800, 400, 400);
this.Wall = new Wall(game, 3400, -1400, 400, 400);
this.Wall = new Wall(game, 3400, -1000, 400, 400);
this.Wall = new Wall(game, 3400, -600, 400, 400);
this.Wall = new Wall(game, 3400, -200, 400, 400);

// others

this.Wall = new Wall(game, -3800, -7000, 400, 400);
this.Wall = new Wall(game, -3800, -6600, 400, 400);
this.Wall = new Wall(game, -3800, -6200, 400, 400);

this.Wall = new Wall(game, -3400, -6200, 400, 400);
this.Wall = new Wall(game, -3400, -5800, 400, 400);
this.Wall = new Wall(game, -3400, -5400, 400, 400);
this.Wall = new Wall(game, -3400, -5000, 400, 400);
this.Wall = new Wall(game, -3400, -4600, 400, 400);
this.Wall = new Wall(game, -3400, -4200, 400, 400);
this.Wall = new Wall(game, -3400, -3800, 400, 400);
this.Wall = new Wall(game, -3400, -3400, 400, 400);
this.Wall = new Wall(game, -3400, -3000, 400, 400);
this.Wall = new Wall(game, -3400, -2600, 400, 400);
this.Wall = new Wall(game, -3400, -2200, 400, 400);
this.Wall = new Wall(game, -3400, -1800, 400, 400);
this.Wall = new Wall(game, -3400, -1400, 400, 400);
this.Wall = new Wall(game, -3400, -1000, 400, 400);
this.Wall = new Wall(game, -3400, -600, 400, 400);
this.Wall = new Wall(game, -3400, -200, 400, 400);


// mirrored on the y axis

// Left upper vertical
this.Wall = new Wall(game, -1000, 1000, 400, 400);
this.Wall = new Wall(game, -1000, 1400, 400, 400);
this.Wall = new Wall(game, -1000, 1800, 400, 400);
this.Wall = new Wall(game, -1000, 2200, 400, 400);
this.Wall = new Wall(game, -1000, 2600, 400, 400);
this.Wall = new Wall(game, -1000, 3000, 400, 400);
this.Wall = new Wall(game, -1000, 3400, 400, 400);
this.Wall = new Wall(game, -1000, 3800, 400, 400);
this.Wall = new Wall(game, -1000, 4200, 400, 400);
this.Wall = new Wall(game, -1000, 4600, 400, 400);
this.Wall = new Wall(game, -1000, 5000, 400, 400);
this.Wall = new Wall(game, -1000, 5400, 400, 400);
this.Wall = new Wall(game, -1000, 5800, 400, 400);
this.Wall = new Wall(game, -1000, 6200, 400, 400);
this.Wall = new Wall(game, -1000, 6600, 400, 400);
this.Wall = new Wall(game, -1000, 7000, 400, 400);
this.Wall = new Wall(game, -1000, 7400, 400, 400);

// Left upper horizontal
this.Wall = new Wall(game, -1400, 7400, 400, 400);
this.Wall = new Wall(game, -1800, 7400, 400, 400);
this.Wall = new Wall(game, -2200, 7400, 400, 400);
this.Wall = new Wall(game, -2600, 7400, 400, 400);
this.Wall = new Wall(game, -3000, 7400, 400, 400);
this.Wall = new Wall(game, -3400, 7400, 400, 400);

// Left upper outer vertical
this.Wall = new Wall(game, -3800, 7400, 400, 400);
this.Wall = new Wall(game, -3800, 7800, 400, 400);
this.Wall = new Wall(game, -3800, 8200, 400, 400);
this.Wall = new Wall(game, -3800, 8600, 400, 400);

// Right upper vertical
this.Wall = new Wall(game, 1000, 1000, 400, 400);
this.Wall = new Wall(game, 1000, 1400, 400, 400);
this.Wall = new Wall(game, 1000, 1800, 400, 400);
this.Wall = new Wall(game, 1000, 2200, 400, 400);
this.Wall = new Wall(game, 1000, 2600, 400, 400);
this.Wall = new Wall(game, 1000, 3000, 400, 400);
this.Wall = new Wall(game, 1000, 3400, 400, 400);
this.Wall = new Wall(game, 1000, 3800, 400, 400);
this.Wall = new Wall(game, 1000, 4200, 400, 400);
this.Wall = new Wall(game, 1000, 4600, 400, 400);
this.Wall = new Wall(game, 1000, 5000, 400, 400);
this.Wall = new Wall(game, 1000, 5400, 400, 400);
this.Wall = new Wall(game, 1000, 5800, 400, 400);
this.Wall = new Wall(game, 1000, 6200, 400, 400);
this.Wall = new Wall(game, 1000, 6600, 400, 400);
this.Wall = new Wall(game, 1000, 7000, 400, 400);
this.Wall = new Wall(game, 1000, 7400, 400, 400);

// Right upper horizontal
this.Wall = new Wall(game, 1400, 7400, 400, 400);
this.Wall = new Wall(game, 1800, 7400, 400, 400);
this.Wall = new Wall(game, 2200, 7400, 400, 400);
this.Wall = new Wall(game, 2600, 7400, 400, 400);
this.Wall = new Wall(game, 3000, 7400, 400, 400);
this.Wall = new Wall(game, 3400, 7400, 400, 400);
this.Wall = new Wall(game, 3800, 7400, 400, 400);

// Right upper outer vertical
this.Wall = new Wall(game, 3800, 7800, 400, 400);
this.Wall = new Wall(game, 3800, 8200, 400, 400);
this.Wall = new Wall(game, 3800, 8600, 400, 400);

// Right middle structure
this.Wall = new Wall(game, 3800, 7000, 400, 400);
this.Wall = new Wall(game, 3800, 6600, 400, 400);
this.Wall = new Wall(game, 3800, 6200, 400, 400);

this.Wall = new Wall(game, 3400, 6200, 400, 400);
this.Wall = new Wall(game, 3400, 5800, 400, 400);
this.Wall = new Wall(game, 3400, 5400, 400, 400);
this.Wall = new Wall(game, 3400, 5000, 400, 400);
this.Wall = new Wall(game, 3400, 4600, 400, 400);
this.Wall = new Wall(game, 3400, 4200, 400, 400);
this.Wall = new Wall(game, 3400, 3800, 400, 400);
this.Wall = new Wall(game, 3400, 3400, 400, 400);
this.Wall = new Wall(game, 3400, 3000, 400, 400);
this.Wall = new Wall(game, 3400, 2600, 400, 400);
this.Wall = new Wall(game, 3400, 2200, 400, 400);
this.Wall = new Wall(game, 3400, 1800, 400, 400);
this.Wall = new Wall(game, 3400, 1400, 400, 400);
this.Wall = new Wall(game, 3400, 1000, 400, 400);
this.Wall = new Wall(game, 3400, 600, 400, 400);
this.Wall = new Wall(game, 3400, 200, 400, 400);

// others

this.Wall = new Wall(game, -3800, 7000, 400, 400);
this.Wall = new Wall(game, -3800, 6600, 400, 400);
this.Wall = new Wall(game, -3800, 6200, 400, 400);

this.Wall = new Wall(game, -3400, 6200, 400, 400);
this.Wall = new Wall(game, -3400, 5800, 400, 400);
this.Wall = new Wall(game, -3400, 5400, 400, 400);
this.Wall = new Wall(game, -3400, 5000, 400, 400);
this.Wall = new Wall(game, -3400, 4600, 400, 400);
this.Wall = new Wall(game, -3400, 4200, 400, 400);
this.Wall = new Wall(game, -3400, 3800, 400, 400);
this.Wall = new Wall(game, -3400, 3400, 400, 400);
this.Wall = new Wall(game, -3400, 3000, 400, 400);
this.Wall = new Wall(game, -3400, 2600, 400, 400);
this.Wall = new Wall(game, -3400, 2200, 400, 400);
this.Wall = new Wall(game, -3400, 1800, 400, 400);
this.Wall = new Wall(game, -3400, 1400, 400, 400);
this.Wall = new Wall(game, -3400, 1000, 400, 400);
this.Wall = new Wall(game, -3400, 600, 400, 400);
this.Wall = new Wall(game, -3400, 200, 400, 400);



// middle walls

this.Wall = new Wall(game, -1000, -600, 400, 400);
this.Wall = new Wall(game, -1000, -200, 400, 400);
this.Wall = new Wall(game, -1000, 200, 400, 400);
this.Wall = new Wall(game, -1000, 600, 400, 400);

this.Wall = new Wall(game, 1000, -600, 400, 400);
this.Wall = new Wall(game, 1000, -200, 400, 400);
this.Wall = new Wall(game, 1000, 200, 400, 400);
this.Wall = new Wall(game, 1000, 600, 400, 400);



// outer walls

// Left outer column (-5400)
this.Wall = new Wall(game, -5400, 6200, 400, 400);
this.Wall = new Wall(game, -5400, 6600, 400, 400);
this.Wall = new Wall(game, -5400, 7000, 400, 400);
this.Wall = new Wall(game, -5400, 7400, 400, 400);
this.Wall = new Wall(game, -5400, 7800, 400, 400);
this.Wall = new Wall(game, -5400, 8200, 400, 400);
this.Wall = new Wall(game, -5400, 8600, 400, 400);

this.Wall = new Wall(game, -5400, -6200, 400, 400);
this.Wall = new Wall(game, -5400, -6600, 400, 400);
this.Wall = new Wall(game, -5400, -7000, 400, 400);
this.Wall = new Wall(game, -5400, -7400, 400, 400);
this.Wall = new Wall(game, -5400, -7800, 400, 400);
this.Wall = new Wall(game, -5400, -8200, 400, 400);
this.Wall = new Wall(game, -5400, -8600, 400, 400);


// Right outer column (-5800) unchanged
this.Wall = new Wall(game, -5800, 6200, 400, 400);
this.Wall = new Wall(game, -5800, 5800, 400, 400);
this.Wall = new Wall(game, -5800, 5400, 400, 400);
this.Wall = new Wall(game, -5800, 5000, 400, 400);
this.Wall = new Wall(game, -5800, 4600, 400, 400);
this.Wall = new Wall(game, -5800, 4200, 400, 400);
this.Wall = new Wall(game, -5800, 3800, 400, 400);
this.Wall = new Wall(game, -5800, 3400, 400, 400);
this.Wall = new Wall(game, -5800, 3000, 400, 400);
this.Wall = new Wall(game, -5800, 2600, 400, 400);
this.Wall = new Wall(game, -5800, 2200, 400, 400);
this.Wall = new Wall(game, -5800, 1800, 400, 400);
this.Wall = new Wall(game, -5800, 1400, 400, 400);
this.Wall = new Wall(game, -5800, 1000, 400, 400);
this.Wall = new Wall(game, -5800, 600, 400, 400);
this.Wall = new Wall(game, -5800, 200, 400, 400);
this.Wall = new Wall(game, -5800, -200, 400, 400);
this.Wall = new Wall(game, -5800, -600, 400, 400);
this.Wall = new Wall(game, -5800, -1000, 400, 400);
this.Wall = new Wall(game, -5800, -1400, 400, 400);
this.Wall = new Wall(game, -5800, -1800, 400, 400);
this.Wall = new Wall(game, -5800, -2200, 400, 400);
this.Wall = new Wall(game, -5800, -2600, 400, 400);
this.Wall = new Wall(game, -5800, -3000, 400, 400);
this.Wall = new Wall(game, -5800, -3400, 400, 400);
this.Wall = new Wall(game, -5800, -3800, 400, 400);
this.Wall = new Wall(game, -5800, -4200, 400, 400);
this.Wall = new Wall(game, -5800, -4600, 400, 400);
this.Wall = new Wall(game, -5800, -5000, 400, 400);
this.Wall = new Wall(game, -5800, -5400, 400, 400);
this.Wall = new Wall(game, -5800, -5800, 400, 400);
this.Wall = new Wall(game, -5800, -6200, 400, 400);


// mirrored

// Mirrored from -5400 to 5400
this.Wall = new Wall(game, 5400, 6200, 400, 400);
this.Wall = new Wall(game, 5400, 6600, 400, 400);
this.Wall = new Wall(game, 5400, 7000, 400, 400);
this.Wall = new Wall(game, 5400, 7400, 400, 400);
this.Wall = new Wall(game, 5400, 7800, 400, 400);
this.Wall = new Wall(game, 5400, 8200, 400, 400);
this.Wall = new Wall(game, 5400, 8600, 400, 400);

this.Wall = new Wall(game, 5400, -6200, 400, 400);
this.Wall = new Wall(game, 5400, -6600, 400, 400);
this.Wall = new Wall(game, 5400, -7000, 400, 400);
this.Wall = new Wall(game, 5400, -7400, 400, 400);
this.Wall = new Wall(game, 5400, -7800, 400, 400);
this.Wall = new Wall(game, 5400, -8200, 400, 400);
this.Wall = new Wall(game, 5400, -8600, 400, 400);


// Mirrored from -5800 to 5800
this.Wall = new Wall(game, 5800, 6200, 400, 400);
this.Wall = new Wall(game, 5800, 5800, 400, 400);
this.Wall = new Wall(game, 5800, 5400, 400, 400);
this.Wall = new Wall(game, 5800, 5000, 400, 400);
this.Wall = new Wall(game, 5800, 4600, 400, 400);
this.Wall = new Wall(game, 5800, 4200, 400, 400);
this.Wall = new Wall(game, 5800, 3800, 400, 400);
this.Wall = new Wall(game, 5800, 3400, 400, 400);
this.Wall = new Wall(game, 5800, 3000, 400, 400);
this.Wall = new Wall(game, 5800, 2600, 400, 400);
this.Wall = new Wall(game, 5800, 2200, 400, 400);
this.Wall = new Wall(game, 5800, 1800, 400, 400);
this.Wall = new Wall(game, 5800, 1400, 400, 400);
this.Wall = new Wall(game, 5800, 1000, 400, 400);
this.Wall = new Wall(game, 5800, 600, 400, 400);
this.Wall = new Wall(game, 5800, 200, 400, 400);
this.Wall = new Wall(game, 5800, -200, 400, 400);
this.Wall = new Wall(game, 5800, -600, 400, 400);
this.Wall = new Wall(game, 5800, -1000, 400, 400);
this.Wall = new Wall(game, 5800, -1400, 400, 400);
this.Wall = new Wall(game, 5800, -1800, 400, 400);
this.Wall = new Wall(game, 5800, -2200, 400, 400);
this.Wall = new Wall(game, 5800, -2600, 400, 400);
this.Wall = new Wall(game, 5800, -3000, 400, 400);
this.Wall = new Wall(game, 5800, -3400, 400, 400);
this.Wall = new Wall(game, 5800, -3800, 400, 400);
this.Wall = new Wall(game, 5800, -4200, 400, 400);
this.Wall = new Wall(game, 5800, -4600, 400, 400);
this.Wall = new Wall(game, 5800, -5000, 400, 400);
this.Wall = new Wall(game, 5800, -5400, 400, 400);
this.Wall = new Wall(game, 5800, -5800, 400, 400);
this.Wall = new Wall(game, 5800, -6200, 400, 400);


// damage zones:

// Top strip
this.Wall = new DamageZone4(game, null, -500, 7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, -700, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, -700, 7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, -500, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, -100, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, -300, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, -300, 7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, -100, 7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 100, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 100, 7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 300, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 500, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 700, 7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 300, 7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 500, 7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 700, 7500, 200, 200, true);

// Bottom strip
this.Wall = new DamageZone4(game, null, -500, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, -700, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, -700, -7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, -500, -7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, -300, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, -300, -7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, -100, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, -100, -7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 100, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 100, -7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 500, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 300, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 300, -7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 500, -7300, 200, 200, true);
this.Wall = new DamageZone4(game, null, 700, -7500, 200, 200, true);
this.Wall = new DamageZone4(game, null, 700, -7300, 200, 200, true);


// others

// Left side damagezone6 (-5500 / -5300 region)
this.Wall = new DamageZone6(game, null, -5500, 8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, 8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, 9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, 9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, 9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, 9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, 9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, 9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, 9700, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, 9700, 200, 200, true);


// Left small DamageZone6 cluster
this.Wall = new DamageZone6(game, null, -5575, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5575, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5525, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5525, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5475, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5475, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5425, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5425, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5375, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5375, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5325, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5325, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5225, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5225, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5275, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5275, 9875, 50, 50, true);


// Right side damagezone6 (5300–5700 region)
this.Wall = new DamageZone6(game, null, 5300, 8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, 8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, 9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, 9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, 9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, 9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, 9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, 9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, 9700, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, 9700, 200, 200, true);


// Right small DamageZone6 cluster
this.Wall = new DamageZone6(game, null, 5275, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5225, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5225, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5275, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5325, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5325, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5375, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5375, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5425, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5425, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5475, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5475, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5525, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5525, 9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5575, 9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5575, 9875, 50, 50, true);



// Left side damagezone6 (-5500 / -5300 region)
this.Wall = new DamageZone6(game, null, -5500, -8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, -8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, -9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, -9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, -9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, -9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, -9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, -9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5500, -9700, 200, 200, true);
this.Wall = new DamageZone6(game, null, -5300, -9700, 200, 200, true);


// Left small DamageZone6 cluster
this.Wall = new DamageZone6(game, null, -5575, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5575, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5525, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5525, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5475, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5475, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5425, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5425, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5375, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5375, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5325, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5325, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5225, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5225, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5275, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, -5275, -9875, 50, 50, true);


// Right side damagezone6 (5300–5700 region)
this.Wall = new DamageZone6(game, null, 5300, -8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, -8900, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, -9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, -9100, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, -9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, -9300, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, -9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, -9500, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5300, -9700, 200, 200, true);
this.Wall = new DamageZone6(game, null, 5500, -9700, 200, 200, true);


// Right small DamageZone6 cluster
this.Wall = new DamageZone6(game, null, 5275, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5225, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5225, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5275, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5325, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5325, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5375, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5375, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5425, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5425, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5475, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5475, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5525, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5525, -9875, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5575, -9825, 50, 50, true);
this.Wall = new DamageZone6(game, null, 5575, -9875, 50, 50, true);


this.arenaData.values.flags |= ArenaFlags.cantUseCheats;

}

public spawnPlayer(tank: TankBody, client: Client) {
    tank.positionData.values.x = 2 * arenaSize * Math.random() - arenaSize;

    const yOffset = (Math.random() - 0.5) * baseWidth;

    const base = this.playerTeamMap.get(client) || [this.blueTeamBase, this.redTeamBase][Math.random() < 0.5 ? 0 : 1];

    tank.relationsData.values.team = base.relationsData.values.team;
    tank.styleData.values.color = base.styleData.values.color;

    tank.positionData.values.x += 0;
    tank.positionData.values.y = base.positionData.values.y + yOffset;

    this.playerTeamMap.set(client, base);

    if (client.camera) {
        client.camera.relationsData.team = tank.relationsData.values.team;
        }
    }
}