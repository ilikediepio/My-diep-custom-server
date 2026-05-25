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
import ObjectEntity from "../Entity/Object";
import BlackHole from "../Entity/Misc/BlackHole";

import Pentagon from "../Entity/Shape/Pentagon";
import Hexagon from "../Entity/Shape/Hexagon";

import { ArenaFlags, AdminFlags, PhysicsFlags, Color } from "../Const/Enums";
import { NameGroup } from "../Native/FieldGroups";
import AbstractShape from "../Entity/Shape/AbstractShape";
import ShapeManager from "../Entity/Shape/Manager";

/**
 * Manage shape count
 */
export class SandboxShapeManager extends ShapeManager {
    protected get wantedShapes() {
        let i = 0;
        for (const client of this.game.clients) {
            if (client.camera) i += 1;
        }
        return Math.floor(i * 12.5);
    }
}

/**
 * Black Hole Gamemode Arena
 */
export default class BlackHoleArena extends ArenaEntity {
    private gravityInitialized: boolean = false;
    protected shapes: ShapeManager = new SandboxShapeManager(this);

public constructor(game: GameServer) {
    super(game);

    this.updateBounds(5000, 5000);

    console.log("BlackHoleArena constructor called");
    console.log("this.physicsData:", this.physicsData);

    if (!this.gravityInitialized && this.physicsData) {
        this.physicsData.values.flags |= PhysicsFlags.enableGravity;
        console.log("Gravity flag set on arena");
        this.gravityInitialized = true;
    }

    const blackHoleEntity = new BlackHole(this.game);
}

    public tick(tick: number) {
        const arenaSize = Math.floor(25 * Math.sqrt(Math.max(this.game.clients.size, 1))) * 100;
        if (this.width !== arenaSize || this.height !== arenaSize) this.updateBounds(arenaSize, arenaSize);

        super.tick(tick);
    }
}