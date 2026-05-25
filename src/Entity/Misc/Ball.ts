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
import ObjectEntity from "../../Entity/Object";

import { Color, PhysicsFlags } from "../../Const/Enums";
import { NameGroup } from "../../Native/FieldGroups";

export default class Ball extends ObjectEntity {

    constructor(game: GameServer) {
        super(game);

        this.nameData = new NameGroup(this);
        this.nameData.values.name = "Football";

        this.physicsData.values.sides = 1;
        this.styleData.values.color = Color.White;
        this.physicsData.values.size = 150;
        this.physicsData.values.absorbtionFactor = 0.25;

        this.physicsData.values.flags |=
            PhysicsFlags.isBase |
            PhysicsFlags.noOwnTeamCollision;

        this.relationsData.values.team = this;
    }
}