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

import GameServer from "../../../Game";

import {
HealthFlags,
PhysicsFlags,
StyleFlags,
AdminFlags,
Color,
Tank
} from "../../../Const/Enums";

import { TeamGroupEntity } from "../TeamEntity";
import LivingEntity from "../../Live";
import TankBody from "../../Tank/TankBody";

/**
 * Zone that changes a player's tank when they enter it.
 */
 export default class TankSetter extends LivingEntity {

     // Change this to whatever tank the player should become.
     private targetTank: Tank;
     private playersInside = new Set<TankBody>();

     public constructor(
         game: GameServer,
         team : TeamGroupEntity | null,
         x : number,
         y : number,
         width : number,
         height : number,
         painful : boolean = true,
         targetTank : Tank
     ) {
         super(game);

         this.targetTank = targetTank;

         this.relationsData.values.team = team;

         this.positionData.values.x = x;
         this.positionData.values.y = y;

         this.physicsData.values.width = width;
         this.physicsData.values.size = height;
         this.physicsData.values.sides = 2;

         this.physicsData.values.flags |=
             PhysicsFlags.showsOnMap;

         this.physicsData.values.pushFactor = 0;
         this.physicsData.values.absorbtionFactor = 0;

         this.damagePerTick = 0;

         if (!painful) {
             this.physicsData.values.pushFactor = 0;
             this.damagePerTick = 0;
         }

         this.flags.adminFlags |= AdminFlags.immuneToKillCommand;

         this.damageReduction = 0;

         this.styleData.values.opacity = 0; // invisible
         this.styleData.values.borderWidth = 0;
         this.styleData.values.color = Color.White;
         this.styleData.values.flags |=
             StyleFlags.renderFirst | StyleFlags.hasNoDmgIndicator;

         this.healthData.flags |= HealthFlags.hiddenHealthbar;
         this.healthData.health = this.healthData.values.maxHealth = 0xABCFF;
     }

     public tick(tick: number) {
         const halfWidth = this.physicsData.values.width / 2;
         const halfHeight = this.physicsData.values.size / 2;

         const x = this.positionData.values.x;
         const y = this.positionData.values.y;

         // Players that are inside the zone this tick.
         const currentPlayersInside = new Set<TankBody>();

         for (const client of this.game.clients) {
             const player = client.camera ?.cameraData.values.player;

             if (!(player instanceof TankBody)) continue;
             if (!player.positionData) continue;

             const playerX = player.positionData.values.x;
             const playerY = player.positionData.values.y;

             // Check whether the player's centre is inside the zone.
             if (Math.abs(playerX - x) > halfWidth) continue;
             if (Math.abs(playerY - y) > halfHeight) continue;

             currentPlayersInside.add(player);

             // Only trigger when the player has just entered.
             if (!this.playersInside.has(player)) {
                 player.setTank(this.targetTank);
             }
         }

         // Replace the previous inside-list.
         // This means players that leave the zone are no longer considered inside,
         // so entering again will trigger the tank change again.
         this.playersInside = currentPlayersInside;

         this.lastDamageTick = tick;
     }
 }