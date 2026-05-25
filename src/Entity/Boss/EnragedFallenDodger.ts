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
import EnragedBoss from "./EnragedBoss";
import Bullet from "../Tank/Projectile/Bullet";

import { Tank, PhysicsFlags } from "../../Const/Enums";
import { AIState } from "../AI";

/**
 * Class which represents the boss "FallenDodger"
 */
export default class FallenDodger extends EnragedBoss {

    public movementSpeed = 2.5;

    private teleportCooldown = 500;
    private readonly TELEPORT_DISTANCE = 150;
    private readonly TELEPORT_TRIGGER_DISTANCE = 300;

    public constructor(game: GameServer) {
        super(game);

        this.nameData.values.name = 'Enraged Fallen Dodger';

        for (const barrelDefinition of TankDefinitions[Tank.Ranger].barrels) {
            const def = Object.assign({}, barrelDefinition, {});
            def.bullet = Object.assign({}, def.bullet, {
                speed: 3,
                health: 30,
                damage: def.bullet.damage * 10
            });
            this.barrels.push(new Barrel(this, def));
        }
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }

    protected moveAroundMap() {
        const x = this.positionData.values.x;
        const y = this.positionData.values.y;

        if (this.ai.state === AIState.idle) {
            super.moveAroundMap();
            this.positionData.angle =
                Math.atan2(this.inputs.movement.y, this.inputs.movement.x);
        } else {
            this.positionData.angle =
                Math.atan2(this.ai.inputs.mouse.y - y, this.ai.inputs.mouse.x - x);
        }
    }

private checkNearbyBullets() {
    const myX = this.positionData.values.x;
    const myY = this.positionData.values.y;

    let closestBullet: Bullet | null = null;
    let closestDistSq = Infinity;

    for (const entity of this.game.entities.inner) {
        if (!entity) continue;
        if (!(entity instanceof Bullet)) continue;

        // Ignore same team
        if (entity.relationsData.values.team === this.relationsData.values.team)
            continue;

        const dx = myX - entity.positionData.values.x;
        const dy = myY - entity.positionData.values.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > this.TELEPORT_TRIGGER_DISTANCE ** 2) continue;

        // Keep closest bullet
        if (distSq < closestDistSq) {
            closestDistSq = distSq;
            closestBullet = entity;
        }
    }

    if (!closestBullet) return;

// Teleport away from bullet, sidestep style
this.tryTeleport(
    myX - closestBullet.positionData.values.x,
    myY - closestBullet.positionData.values.y,
    closestBullet
);
}

private lastTeleportTime = 0; // track last teleport in ms

private tryTeleport(dx: number, dy: number, bullet: Bullet) {
    const now = Date.now();
    const COOLDOWN_MS = 1; // to avoid issues

    // Don't teleport if still cooling down
    if (now - this.lastTeleportTime < COOLDOWN_MS) return;

// Vector from bullet to boss
let toBossX = dx;
let toBossY = dy;

// Normalize
const len = Math.sqrt(toBossX*toBossX + toBossY*toBossY);
if (len === 0) return; // avoid divide by zero
toBossX /= len;
toBossY /= len;

// Get the bullet velocity
const velX = bullet.velocity.x;
const velY = bullet.velocity.y;

// Cross product to determine side (-ve = right, +ve = left)
const cross = velX * toBossY - velY * toBossX;
const SIDE_ANGLE = Math.PI / 4; // 45°

// Determine dodge direction: left or right
const dodgeAngle = Math.atan2(toBossY, toBossX) + (cross > 0 ? SIDE_ANGLE : -SIDE_ANGLE);

// Fixed dodge distance
const dodgeDistance = 150;

// Move the boss
this.positionData.values.x += Math.cos(dodgeAngle) * dodgeDistance;
this.positionData.values.y += Math.sin(dodgeAngle) * dodgeDistance;

// Clamp to arena
//this.positionData.values.x = Math.max(0, Math.min(this.positionData.values.x, this.game.arena.width));
//this.positionData.values.y = Math.max(0, Math.min(this.positionData.values.y, this.game.arena.height));

    // Record last teleport time
    this.lastTeleportTime = now;
}

    public tick(tick: number) {
        super.tick(tick);

        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
        }

        this.checkNearbyBullets();
    }
}