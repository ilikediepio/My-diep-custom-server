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

import { TeamEntity } from "../Entity/Misc/TeamEntity";
import { Color } from "../Const/Enums";

const arenaSize = 11150;
const baseSize = 3345;

/**
 * Teams4 Gamemode Arena
 */
export default class Teams4Arena extends ArenaEntity {
    /** Blue TeamBASEentity */
    public blueTeamBase: TeamBase;
    /** Red TeamBASE entity */
    public redTeamBase: TeamBase;
    /** Green TeamBASE entity */
    public greenTeamBase: TeamBase;
    /** Purple TeamBASE entity */
    public purpleTeamBase: TeamBase;
    /** BaseGuardian entity */
    public BaseGuardian!: BaseGuardian;

    /** Maps clients to their teams */
    public playerTeamMap: Map<Client, TeamBase> = new Map();

    public constructor(game: GameServer) {
        super(game);
        this.updateBounds(arenaSize * 2, arenaSize * 2);
        this.blueTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamBlue), -arenaSize + baseSize / 2,  -arenaSize + baseSize / 2, baseSize, baseSize);
        this.redTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamRed), arenaSize - baseSize / 2, arenaSize - baseSize / 2, baseSize, baseSize);
        this.greenTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamGreen), -arenaSize + baseSize / 2,  arenaSize - baseSize / 2, baseSize, baseSize);
        this.purpleTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamPurple), arenaSize - baseSize / 2, -arenaSize + baseSize / 2, baseSize, baseSize);
// Purple (Top Right)
const guardianPurple = new BaseGuardian(this.game);
guardianPurple.relationsData.values.team = this.purpleTeamBase.relationsData.values.team;
guardianPurple.positionData.values.x = arenaSize - baseSize / 1.2;
guardianPurple.positionData.values.y = -arenaSize + baseSize / 1.2;

// Blue (Top Left)
const guardianBlue = new BaseGuardian(this.game);
guardianBlue.relationsData.values.team = this.blueTeamBase.relationsData.values.team;
guardianBlue.positionData.values.x = -arenaSize + baseSize / 1.2;
guardianBlue.positionData.values.y = -arenaSize + baseSize / 1.2;

// Green (Bottom Left)
const guardianGreen = new BaseGuardian(this.game);
guardianGreen.relationsData.values.team = this.greenTeamBase.relationsData.values.team;
guardianGreen.positionData.values.x = -arenaSize + baseSize / 1.2;
guardianGreen.positionData.values.y = arenaSize - baseSize / 1.2;

// Red (Bottom Right)
const guardianRed = new BaseGuardian(this.game);
guardianRed.relationsData.values.team = this.redTeamBase.relationsData.values.team;
guardianRed.positionData.values.x = arenaSize - baseSize / 1.2;
guardianRed.positionData.values.y = arenaSize - baseSize / 1.2;


    }

    public spawnPlayer(tank: TankBody, client: Client) {
        tank.positionData.values.y = arenaSize * Math.random() - arenaSize;

        const xOffset = (Math.random() - 0.5) * baseSize,
              yOffset = (Math.random() - 0.5) * baseSize;
        
        const base = this.playerTeamMap.get(client) || [this.blueTeamBase, this.redTeamBase, this.greenTeamBase, this.purpleTeamBase][0|Math.random()*4];
        tank.relationsData.values.team = base.relationsData.values.team;
        tank.styleData.values.color = base.styleData.values.color;
        tank.positionData.values.x = base.positionData.values.x + xOffset;
        tank.positionData.values.y = base.positionData.values.y + yOffset;
        this.playerTeamMap.set(client, base);

        if (client.camera) client.camera.relationsData.team = tank.relationsData.values.team;
    }
}