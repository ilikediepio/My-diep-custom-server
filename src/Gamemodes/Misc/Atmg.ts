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
import ArenaEntity from "../../Native/Arena";

import ShapeManager from "../../Entity/Shape/Manager";
import { NameFlags, Tank } from "../../Const/Enums";
import TeamBase from "../../Entity/Misc/TeamBase";
import { SandboxShapeManager } from "../Sandbox";
import Atmg from "../../Entity/Misc/Atmg";

/**
 * Atmg Gamemode Arena
 */
export default class AtmgArena extends ArenaEntity {
    /** Limits shape count to floor(12.5 * player count) */
	protected shapes: ShapeManager = new SandboxShapeManager(this);

    public constructor(game: GameServer) {
        super(game);

		this.updateBounds(5000, 5000);

        const atmgEntity = new Atmg(game);
        atmgEntity.nameData.flags &= ~NameFlags.hiddenName;
    }

    public tick(tick: number) {
		const arenaSize = Math.floor(25 * Math.sqrt(Math.max(this.game.clients.size, 1))) * 100;
		if (this.width !== arenaSize || this.height !== arenaSize) this.updateBounds(arenaSize, arenaSize);

        super.tick(tick);
    }
}