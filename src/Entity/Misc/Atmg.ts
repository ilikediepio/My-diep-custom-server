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
import TankBody from "../Tank/TankBody";

import { Color, PhysicsFlags, PositionFlags, AdminFlags, Stat, Tank, EntityTags } from "../../Const/Enums";
import { CameraEntity } from "../../Native/Camera";
import { AI, AIState, Inputs } from "../AI";

/**
 * Represents the ATMG from Arras.io
 */
export default class Atmg extends TankBody {
    /** Size of a default ATMG. */
    public static BASE_SIZE = 175;
    
    /** The AI that controls how the AC moves. */
    public ai: AI;

    public constructor(game: GameServer) {
        const inputs = new Inputs();
        const camera = new CameraEntity(game);

        const setLevel = camera.setLevel;
        camera.setLevel = function(level) {
            setLevel.call(this, 1); // Set the level to always be 1
            this.sizeFactor = (Atmg.BASE_SIZE / 50); // Keep size constant
        }
        camera.sizeFactor = (Atmg.BASE_SIZE / 50); // Fix sizeFactor at a constant value

        super(game, camera, inputs);
        this.entityTags |= EntityTags.isDominator;

        this.ai = new AI(this);
        this.ai.inputs = inputs;
        this.ai.viewRange = 6000;

        // Only target entities with a clear line of sight.
        this.ai.targetFilter = targetPos => this.canReachTarget(targetPos);

        this.setTank(Tank.Atmg);
        //this.ai.onlyTargetPlayers = true;
        this.flags.adminFlags |= AdminFlags.immuneToKillCommand;

        const def = (this.definition = Object.assign({}, this.definition));
        def.maxHealth = 1000000;
        def.speed = 0; // Keep speed constant, independent of level

        this.damagePerTick = 50000;

        this.nameData.values.name = "Atmg";
        this.styleData.values.color = Color.TeamRed;
        this.physicsData.values.flags |= PhysicsFlags.fixedSize;
        camera.cameraData.values.player = this;

        // Set the level and score explicitly to 1 and 0
        camera.cameraData.values.level = 1;
        camera.cameraData.values.score = 0;

        // Make sure all stats are fixed, unaffected by level scaling
        for (let i = Stat.MovementSpeed; i < Stat.BodyDamage; ++i) {
            camera.cameraData.values.statLevels.values[i] = 0;
        }

        this.ai.aimSpeed = this.barrels[0].bulletAccel * 1.6;
        //this.setInvulnerability(true);
    }

    /**
     * Checks whether there is a clear line of sight to a target.
     * Solid rectangular walls block the line between the ATMG and target.
     */
    private canReachTarget(targetPos: { x: number; y: number }) : boolean{
        const start = this.positionData.values;

        const dx = targetPos.x - start.x;
        const dy = targetPos.y - start.y;

        const entities = this.game.entities.collisionManager.retrieve(
            (start.x + targetPos.x) / 2,
            (start.y + targetPos.y) / 2,
            Math.abs(dx) / 2 + 1,
            Math.abs(dy) / 2 + 1
        );

        for (const entity of entities) {
            if (!entity || entity.hash === 0) continue;

            const physics = entity.physicsData ?.values;

            if (!physics) continue;
            if (!(physics.flags & PhysicsFlags.isSolidWall)) continue;
            if (physics.sides !== 2) continue;

            const wallPos = entity.positionData ?.values;

            if (!wallPos) continue;

            // Transform the line into the wall's local coordinates.
            const cos = Math.cos(wallPos.angle);
            const sin = Math.sin(wallPos.angle);

            const offsetX = start.x - wallPos.x;
            const offsetY = start.y - wallPos.y;

            const localStartX = offsetX * cos + offsetY * sin;
            const localStartY = -offsetX * sin + offsetY * cos;

            const localDx = dx * cos + dy * sin;
            const localDy = -dx * sin + dy * cos;

            const halfWidth = physics.size / 2;
            const halfHeight = physics.width / 2;

            // Find the segment's intersection with the rectangle.
            let tMin = 0;
            let tMax = 1;

            if (Math.abs(localDx) < 1e-9) {
                if (
                    localStartX < -halfWidth ||
                    localStartX > halfWidth
                ) {
                    continue;
                }
            }
     else {
      const t1 = (-halfWidth - localStartX) / localDx;
      const t2 = (halfWidth - localStartX) / localDx;

      tMin = Math.max(tMin, Math.min(t1, t2));
      tMax = Math.min(tMax, Math.max(t1, t2));

      if (tMin > tMax) continue;
  }

  if (Math.abs(localDy) < 1e-9) {
      if (
          localStartY < -halfHeight ||
          localStartY > halfHeight
      ) {
          continue;
      }
  }
else {
 const t1 = (-halfHeight - localStartY) / localDy;
 const t2 = (halfHeight - localStartY) / localDy;

 tMin = Math.max(tMin, Math.min(t1, t2));
 tMax = Math.min(tMax, Math.max(t1, t2));

 if (tMin > tMax) continue;
}

  // The target is obstructed by a solid wall.
  return false;
}

return true;
    }

    public tick(tick: number) {
        // Immediately stop targeting players who are no longer reachable.
        if (
            this.ai.target &&
            !this.canReachTarget(this.ai.target.positionData.values)
            ) {
            this.ai.target = null;
            this.ai.inputs.flags = 0;
        }

        // Ensure movement speed is constant, independent of the level
        this.ai.movementSpeed = 0.75 * 10;

        this.inputs = this.ai.inputs;

        if (this.ai.state === AIState.idle) {
            const angle = this.positionData.values.angle + this.ai.passiveRotation;
            const mag = Math.sqrt(
                (this.inputs.mouse.x - this.positionData.values.x) **2 +
                (this.inputs.mouse.y - this.positionData.values.y) **2
            );

            this.inputs.mouse.set({
                x: this.positionData.values.x + Math.cos(angle) * mag,
                y : this.positionData.values.y + Math.sin(angle) * mag
                });
        }

        super.tick(tick);
    }
}