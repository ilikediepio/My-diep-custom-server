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

import ArenaEntity from "../../Native/Arena";
import GameServer from "../../Game";

import CrystalisedSquare from "./CrystalisedSquare";
import Hexagon from "./Hexagon";
import Crasher from "./Crasher";
import MegaCrasher from "./MegaCrasher";
import Pentagon from "./Pentagon";
import Triangle from "./Triangle";
import Square from "./Square";
import AbstractShape from "./AbstractShape";
import { removeFast } from "../../util";

/**
 * Used to balance out shape count in the arena, as well
 * as determines where each type of shape spawns around the arena.
 */
export default class ShapeManager {
    /** Current game server */
    protected game: GameServer;

    /** Arena whose shapes are being managed */
    protected arena: ArenaEntity;

    /** Stores all shapes */
    protected shapes: AbstractShape[] = [];

    public constructor(arena: ArenaEntity) {
        this.arena = arena;
        this.game = arena.game;
    }

    /**
     * Spawns a shape in a random location on the map.
     * Determines shape type by the random position chosen.
     */
protected spawnShape(): AbstractShape {
    let shape: AbstractShape;
    const { x, y } = this.arena.findSpawnLocation();
    const rightX = this.arena.arenaData.values.rightX;
    const leftX = this.arena.arenaData.values.leftX;

    if (Math.max(x, y) < rightX / 10 && Math.min(x, y) > leftX / 10) {
        // Pentagon + Hexagon + CrystalisedSquare Nest
        const rand = Math.random();
        if (rand < 0.06) {
            shape = new Pentagon(this.game);
        } else if (rand < 0.09) {
            shape = new Hexagon(this.game);
        } else if (rand < 0.17) {
            shape = new CrystalisedSquare(this.game);
        } else {
            shape = new Square(this.game);
        }
    } else if (Math.max(x, y) < rightX / 5 && Math.min(x, y) > leftX / 5) {
        // Crasher Zone
        const isBig = Math.random() < 0.2;
        const isMega = Math.random() < 0.0025;
        if (isMega) {
            shape = new MegaCrasher(this.game, true); // Always big
        } else {
            shape = new Crasher(this.game, isBig);
        }
    } else {
        // Fields of Shapes
        const rand = Math.random();
        if (rand < 0.005) {
            shape = new CrystalisedSquare(this.game);
        } else if (rand < 0.02) {
            shape = new Hexagon(this.game);
        } else if (rand < 0.04) {
            shape = new Pentagon(this.game);
        } else if (rand < 0.20) {
            shape = new Triangle(this.game);
        } else {
            shape = new Square(this.game);
        }
    }

    // Common setup for all shapes
    shape.positionData.values.x = x;
    shape.positionData.values.y = y;
    shape.relationsData.values.owner = shape.relationsData.values.team = this.arena;
    shape.scoreReward *= this.arena.shapeScoreRewardMultiplier;

    return shape;
}

    /** Kills all shapes in the arena */
    public killAll(): void {
        for (let i = 0; i < this.shapes.length; ++i) {
            this.shapes[i]?.delete();
        }
    }

    protected get wantedShapes(): number {
        return (this.game.arena as any).isPvP ? 200 : 1000;
    }

    public tick(): void {
        for (let i = this.wantedShapes; i-- > 0;) {
            const shape = this.shapes[i];
            if (!shape || shape.hash === 0) {
                this.shapes[i] = this.spawnShape();
            }
        }
    }
}