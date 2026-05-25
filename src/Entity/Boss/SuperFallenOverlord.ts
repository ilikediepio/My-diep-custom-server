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
import Barrel from "../Tank/Barrel";
import TankDefinitions from "../../Const/TankDefinitions";
import AbstractBoss from "./AbstractBoss";

import { Tank } from "../../Const/Enums";
import { AIState } from "../AI";

/**
 * Class which represents the boss "FallenOverlord"
 */
export default class SuperFallenOverlord extends AbstractBoss {
    public constructor(game: GameServer) {
        super(game);

        this.nameData.values.name = 'Fallen Emperor';

        for (const barrelDefinition of TankDefinitions[Tank.Overlord].barrels) {

            const def = Object.assign({}, barrelDefinition, { droneCount: 10, reload: 0.15 });
            def.bullet = Object.assign({}, def.bullet, { sizeRatio: 1, speed: 1.5, damage: 1, health: 15 });
            this.barrels.push(new Barrel(this, def));
        }
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }

    public tick(tick: number) {
        super.tick(tick);

        if (this.ai.state !== AIState.possessed) {
            this.positionData.angle += this.ai.passiveRotation;
        }
    }
}
