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
    Simplified Aura (clean port)
    Removed external/unknown dependencies
*/

import GameServer from "../../Game";
import ObjectEntity from "../Object";
import LivingEntity from "../Live";

import { Color } from "../../Const/Enums";

import TankBody from "../Tank/TankBody";
import AbstractShape from "../Shape/AbstractShape";
import AbstractBoss from "../Boss/AbstractBoss";

export default class Aura extends ObjectEntity {
    public owner: LivingEntity;
    public size: number;

public constructor(game: GameServer, owner: LivingEntity, size: number) {
    super(game);

    // HARD CHECK (prevents cryptic crashes)
    if (!owner) {
        throw new Error("Aura requires a valid owner (LivingEntity).");
    }

    this.owner = owner;
    this.size = size;

    // Visuals
    this.styleData.color = Color.EnemyTriangle;
    this.styleData.opacity = owner.styleData.opacity * 0.5;

    // Position
    this.positionData.values.x = owner.positionData.values.x;
    this.positionData.values.y = owner.positionData.values.y;

    // Physics
    this.physicsData.values.size = owner.physicsData.size * size;
    this.physicsData.values.sides = 1;
    this.physicsData.pushFactor = 0;
    this.physicsData.absorbtionFactor = 0;

    // Relations
    this.relationsData.owner = owner;
    this.relationsData.values.owner = owner;
    this.relationsData.team = owner.relationsData.team;
}

    public tick(tick: number) {
        super.tick(tick);

    // If owner dies, remove aura
    //if (!this.owner || this.owner.isDead?.()) {
    //    this.destroy();
    //    return;
    //}

        // Follow owner
        this.positionData.values.x = this.owner.positionData.values.x;
        this.positionData.values.y = this.owner.positionData.values.y;

        // Match size + opacity
        this.styleData.opacity = this.owner.styleData.opacity * 0.5;
        this.physicsData.size = this.owner.physicsData.size * this.size;

        const collidedEntities = this.findCollisions();

        for (let i = 0; i < collidedEntities.length; i++) {
            const entity = collidedEntities[i];

            // Only affect living things
            if (!(entity instanceof LivingEntity)) continue;

            // Only target specific types
            if (
                entity instanceof TankBody ||
                entity instanceof AbstractShape ||
                entity instanceof AbstractBoss
            ) {
                // Ignore same team
                if (entity.relationsData.values.team === this.relationsData.values.team) continue;

                // Destroy enemy
                entity.destroy();
            }
        }
    }
}