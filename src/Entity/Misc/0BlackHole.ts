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

/*
    Simplified BlackHole (clean port)
    Removed unsupported systems, kept core gravity + visuals
*/

import GameServer from "../../Game";
import ObjectEntity from "../Object";
import * as util from "../../util";

import { PhysicsFlags, Color, StyleFlags, PositionFlags } from "../../Const/Enums";
import LivingEntity from "../Live";
import TankBody from "../Tank/TankBody";
import AbstractShape from "../Shape/AbstractShape";
import AbstractBoss from "../Boss/AbstractBoss";

export default class BlackHole extends ObjectEntity {
    public lifetime: number;
    public sizeMultiplier: number;
    public pulseDir: number;

    public constructor(game: GameServer) {
        super(game);

        const { x, y } = this.game.arena.findSpawnLocation();
        this.positionData.values.x = x;
        this.positionData.values.y = y;

        // Core properties
        this.physicsData.values.size = 180;
        this.physicsData.values.sides = 1;
        this.physicsData.pushFactor = -0.6; // inward pull
        this.physicsData.values.absorbtionFactor = 0;

        this.positionData.values.flags |= PositionFlags.absoluteRotation;
        this.physicsData.flags |= PhysicsFlags.showsOnMap;

        this.styleData.zIndex = 2;
        this.styleData.values.color = Color.kMaxColors;
        this.styleData.flags |= StyleFlags.hasNoDmgIndicator;

        this.lifetime = 2000;

        // simple pulsing effect
        this.sizeMultiplier = 1;
        this.pulseDir = 1;

        // simple visual "ring"
        const ring = new ObjectEntity(game);
        ring.setParent(this);
        ring.styleData.values.color = Color.White;
        ring.styleData.flags |= StyleFlags.isStar;

        const baseTick = ring.tick;
        ring.tick = (tick: number) => {
            ring.physicsData.size = this.physicsData.size * this.sizeMultiplier;
            ring.positionData.angle += 0.1;
            baseTick.call(ring, tick);
        };
    }

    public tick(tick: number) {
        super.tick(tick);

        // Pulse size (visual)
        this.sizeMultiplier += 0.01 * this.pulseDir;
        if (this.sizeMultiplier > 1.5) this.pulseDir = -1;
        if (this.sizeMultiplier < 0.7) this.pulseDir = 1;

        this.physicsData.size = 180 * this.sizeMultiplier;

        this.lifetime--;
        if (this.lifetime <= 0) {
            this.destroy();
            return;
        }

        const entities = this.findCollisions();

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];

            if (!(entity instanceof LivingEntity)) continue;

            // Ignore bases
            if (entity.physicsData.values.flags & PhysicsFlags.isBase) continue;

            // Ignore owned objects (like drones)
            if (
                entity.relationsData.values.owner &&
                entity.relationsData.values.owner instanceof ObjectEntity
            ) continue;

            let dx = this.positionData.values.x - entity.positionData.values.x;
            let dy = this.positionData.values.y - entity.positionData.values.y;

            let angle =
                dx === 0 && dy === 0
                    ? Math.random() * util.PI2
                    : Math.atan2(dy, dx);

            // Pull strength varies by type
            let strength = -2;

            if (entity instanceof TankBody) {
                strength = -1.5; // tanks resist slightly more
            }

            if (entity instanceof AbstractShape || entity instanceof AbstractBoss) {
                strength = -2.5; // shapes/bosses pulled harder
            }

            entity.addAcceleration(angle, strength);
        }
    }

    public destroy(animate = true) {
        super.destroy(animate);

        // Final burst push (reverse pull)
        this.physicsData.pushFactor = 2;

        const entities = this.findCollisions();

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];

            if (!(entity instanceof LivingEntity)) continue;

            let dx = entity.positionData.values.x - this.positionData.values.x;
            let dy = entity.positionData.values.y - this.positionData.values.y;

            let angle =
                dx === 0 && dy === 0
                    ? Math.random() * util.PI2
                    : Math.atan2(dy, dx);

            // Push everything outward
            entity.addAcceleration(angle, 4);
        }
    }
}