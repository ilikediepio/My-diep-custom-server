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

import { TeamEntity } from "../Entity/Misc/TeamEntity";
import { Color } from "../Const/Enums";
import BaseGuardian from "../Entity/Misc/BaseGuardian";

const arenaSize = 11150;
const baseWidth = 2007;

export default class Teams2Arena extends ArenaEntity {
    public blueTeamBase: TeamBase;
    public redTeamBase: TeamBase;

    public playerTeamMap: Map<Client, TeamBase> = new Map();
    
    public constructor(game: GameServer) {
        super(game);
        this.updateBounds(arenaSize * 2, arenaSize * 2);
        this.blueTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamBlue), -arenaSize + baseWidth / 2, 0, arenaSize * 2, baseWidth);
        this.redTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamRed), arenaSize - baseWidth / 2, 0, arenaSize * 2, baseWidth);

        const guardianCount = 4;
        const spacing = (arenaSize * 2) / (guardianCount + 1);
        const xBlue = -arenaSize + baseWidth / 1.2;
        const xRed = arenaSize - baseWidth / 1.2;

        // Middle-spread guardians
        for (let i = 1; i <= guardianCount; i++) {
            const y = -arenaSize + spacing * i;

            const blueGuardian = new BaseGuardian(this.game);
            blueGuardian.relationsData.values.team = this.blueTeamBase.relationsData.values.team;
            blueGuardian.positionData.values.x = xBlue;
            blueGuardian.positionData.values.y = y;

            const redGuardian = new BaseGuardian(this.game);
            redGuardian.relationsData.values.team = this.redTeamBase.relationsData.values.team;
            redGuardian.positionData.values.x = xRed;
            redGuardian.positionData.values.y = y;
        }

        // Top and bottom guardians for each base
        const topY = arenaSize - baseWidth / 2;
        const bottomY = -arenaSize + baseWidth / 2;

        const blueTop = new BaseGuardian(this.game);
        blueTop.relationsData.values.team = this.blueTeamBase.relationsData.values.team;
        blueTop.positionData.values.x = xBlue;
        blueTop.positionData.values.y = topY;

        const blueBottom = new BaseGuardian(this.game);
        blueBottom.relationsData.values.team = this.blueTeamBase.relationsData.values.team;
        blueBottom.positionData.values.x = xBlue;
        blueBottom.positionData.values.y = bottomY;

        const redTop = new BaseGuardian(this.game);
        redTop.relationsData.values.team = this.redTeamBase.relationsData.values.team;
        redTop.positionData.values.x = xRed;
        redTop.positionData.values.y = topY;

        const redBottom = new BaseGuardian(this.game);
        redBottom.relationsData.values.team = this.redTeamBase.relationsData.values.team;
        redBottom.positionData.values.x = xRed;
        redBottom.positionData.values.y = bottomY;
    }

    public spawnPlayer(tank: TankBody, client: Client) {
        tank.positionData.values.y = 2 * arenaSize * Math.random() - arenaSize;

        const xOffset = (Math.random() - 0.5) * baseWidth;

        const base = this.playerTeamMap.get(client) || [this.blueTeamBase, this.redTeamBase][Math.random() < 0.5 ? 0 : 1];
        tank.relationsData.values.team = base.relationsData.values.team;
        tank.styleData.values.color = base.styleData.values.color;
        tank.positionData.values.x = base.positionData.values.x + xOffset;
        this.playerTeamMap.set(client, base);

        if (client.camera) client.camera.relationsData.team = tank.relationsData.values.team;
    }
}
