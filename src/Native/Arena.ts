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
import ShapeManager from "../Entity/Shape/Manager";
import TankBody from "../Entity/Tank/TankBody";
import ArenaCloser from "../Entity/Misc/ArenaCloser";
import ServerCloser from "../Entity/Misc/ServerCloser";
import TrueArenaCloser from "../Entity/Misc/TrueArenaCloser";
import ClientCamera from "./Camera";

import { VectorAbstract } from "../Physics/Vector";
import { ArenaGroup, TeamGroup } from "./FieldGroups";
import { Entity } from "./Entity";
import { Color, ArenaFlags, ValidScoreboardIndex } from "../Const/Enums";
import { PI2, saveToLog } from "../util";
import { TeamGroupEntity } from "../Entity/Misc/TeamEntity";
import Client from "../Client";
import AbstractBoss from "../Entity/Boss/AbstractBoss";
import Guardian from "../Entity/Boss/Guardian";
import Summoner from "../Entity/Boss/Summoner";
import FallenOverlord from "../Entity/Boss/FallenOverlord";
import FallenBooster from "../Entity/Boss/FallenBooster";
import Defender from "../Entity/Boss/Defender";
import { bossSpawningInterval, scoreboardUpdateInterval } from "../config";

export const enum ArenaState {
	OPEN = 0,
	OVER = 1,
	CLOSING = 2,
	CLOSED = 3,
}

export default class ArenaEntity extends Entity implements TeamGroupEntity {
	public arenaData: ArenaGroup = new ArenaGroup(this);
	public teamData: TeamGroup = new TeamGroup(this);
	public width: number;
	public height: number;
	public state: ArenaState = ArenaState.OPEN;

	public shapeScoreRewardMultiplier: number = 1;
	public allowBoss: boolean = true;
	public boss: AbstractBoss | null = null;
	public leader: TankBody | null = null;
	protected shapes = new ShapeManager(this);
	public ARENA_PADDING = 200;

	public constructor(game: GameServer) {
		super(game);

		this.updateBounds((this.width = 22300), (this.height = 22300));

		// Use .values consistently
		this.arenaData.values.topY = -this.height / 2;
		this.arenaData.values.bottomY = this.height / 2;
		this.arenaData.values.leftX = -this.width / 2;
		this.arenaData.values.rightX = this.width / 2;

		this.arenaData.values.flags = ArenaFlags.gameReadyStart;
		this.teamData.values.teamColor = Color.Neutral;
	}

	public findSpawnLocation(): VectorAbstract {
		const pos = {
			x: ~~(Math.random() * this.width - this.width / 2),
			y: ~~(Math.random() * this.height - this.height / 2),
		};

		findSpawn: for (let i = 0; i < 20; ++i) {
			const entities = this.game.entities.collisionManager.retrieve(pos.x, pos.y, 1000, 1000);

			for (let len = entities.length; --len >= 0;) {
				const e = entities[len];
				if (e instanceof TankBody) {
					const dx = e.positionData.values.x - pos.x;
					const dy = e.positionData.values.y - pos.y;
					if (dx * dx + dy * dy < 1_000_000) { // 1000^2
						pos.x = ~~(Math.random() * this.width - this.width / 2);
						pos.y = ~~(Math.random() * this.height - this.height / 2);
						continue findSpawn;
					}
				}
			}

			break;
		}

		return pos;
	}

	protected updateScoreboard(scoreboardPlayers: TankBody[]) {
		// use .values consistently and ensure scoreboardAmount is set on .values (if that's the schema)
		const hidden = (this.arenaData.values.flags & ArenaFlags.hiddenScores) !== 0;
		const scoreboardCount = this.arenaData.values.scoreboardAmount = hidden ? 0 : Math.min(scoreboardPlayers.length, 10);

		if (scoreboardCount > 0) {
			this.arenaData.values.flags |= ArenaFlags.showsLeaderArrow;
			for (let i = 0; i < scoreboardCount; ++i) {
				const player = scoreboardPlayers[i];

				if (player.styleData.values.color === Color.Tank) {
					this.arenaData.values.scoreboardColors[i as ValidScoreboardIndex] = Color.ScoreboardBar;
				} else {
					this.arenaData.values.scoreboardColors[i as ValidScoreboardIndex] = player.styleData.values.color;
				}
				this.arenaData.values.scoreboardNames[i as ValidScoreboardIndex] = player.nameData.values.name;
				this.arenaData.values.scoreboardScores[i as ValidScoreboardIndex] = player.scoreData.values.score;
				// keep _currentTank access as original code did
				this.arenaData.values.scoreboardTanks[i as ValidScoreboardIndex] = (player as any)['_currentTank'];
			}
		} else {
			if ((this.arenaData.values.flags & ArenaFlags.showsLeaderArrow) !== 0) {
				this.arenaData.values.flags ^= ArenaFlags.showsLeaderArrow;
			}
		}
	}

	public updateBounds(arenaWidth: number, arenaHeight: number) {
		this.width = arenaWidth;
		this.height = arenaHeight;

		this.arenaData.values.topY = -arenaHeight / 2;
		this.arenaData.values.bottomY = arenaHeight / 2;
		this.arenaData.values.leftX = -arenaWidth / 2;
		this.arenaData.values.rightX = arenaWidth / 2;
	}

	public spawnPlayer(tank: TankBody, client: Client) {
		const { x, y } = this.findSpawnLocation();
		tank.positionData.values.x = x;
		tank.positionData.values.y = y;
	}

	public close() {
		for (const client of this.game.clients) {
			client.notify("Arena closed: No players can join", 0xFF0000, -1);
		}

		this.state = ArenaState.CLOSING;
		this.arenaData.values.flags |= ArenaFlags.noJoining;

		setTimeout(() => {
			const acCount = Math.floor(Math.sqrt(this.width) / 10);
			const radius = this.width * Math.SQRT1_2 + 500;
			for (let i = 0; i < acCount; ++i) {
				const ac = new TrueArenaCloser(this.game);

				const angle = (i / acCount) * PI2;
				ac.positionData.values.x = Math.cos(angle) * radius;
				ac.positionData.values.y = Math.sin(angle) * radius;
				ac.positionData.values.angle = angle + Math.PI;
			}

			saveToLog("Arena Closing", "Arena running at `" + this.game.gamemode + "` is now closing.", 0xFFE869);
		}, 5000);
	}

	public serverClose() {
		for (const client of this.game.clients) {
			client.notify("This server is now closed. (also the game could be updating!)", 0xFF0000, -1);
		}

		this.state = ArenaState.CLOSING;
		this.arenaData.values.flags |= ArenaFlags.noJoining;

		setTimeout(() => {
			const acCount = Math.floor(Math.sqrt(this.width) / 10);
			const radius = this.width * Math.SQRT1_2 + 500;
			for (let i = 0; i < acCount; ++i) {
				const sc = new ServerCloser(this.game);

				const angle = (i / acCount) * PI2;
				sc.positionData.values.x = Math.cos(angle) * radius;
				sc.positionData.values.y = Math.sin(angle) * radius;
				sc.positionData.values.angle = angle + Math.PI;
			}

			saveToLog("Server Closing", "Arena running at `" + this.game.gamemode + "` is now closing.", 0xFFE869);
		}, 5000);
	}

	public event1() {
		for (const client of this.game.clients) {
			client.notify("The event has started! if you die or leave, you will not be able to join!", 0x0000FF, -1);
		}

		// close and make no players be able to join
		this.state = ArenaState.CLOSING;
		this.arenaData.values.flags |= ArenaFlags.noJoining;

		setTimeout(() => {
			// No spawn logic here (intentionally no closers)
			saveToLog("An event has started", "at: `" + this.game.gamemode + "`no more players can join this arena.", 0xFFE869);
		}, 5000);
	}

	public event2() {
		for (const client of this.game.clients) {
			client.notify("The event has started! if you leave, you will not be able to join!", 0x0000FF, -1);
		}

		// don't close, just make no players be able to join
		this.arenaData.values.flags |= ArenaFlags.noJoining;

		setTimeout(() => {
			// No spawn logic here (intentionally no closers)
			saveToLog("An event has started", "at: `" + this.game.gamemode + "`no more players can join this arena.", 0xFFE869);
		}, 5000);
	}

	protected spawnBoss() {
		const bosses = [Guardian, Summoner, FallenOverlord, FallenBooster, Defender];
		const TBoss = bosses[Math.floor(Math.random() * bosses.length)];
		this.boss = new TBoss(this.game);
	}

	public tick(tick: number) {
		this.shapes.tick();

		if (this.allowBoss && this.game.tick >= 1 && (this.game.tick % bossSpawningInterval) === 0 && !this.boss) {
			this.spawnBoss();
		}

		if (this.state === ArenaState.CLOSED) return;

		const players: TankBody[] = [];

		for (let id = 0; id <= this.game.entities.lastId; ++id) {
			const entity = this.game.entities.inner[id];

			if (Entity.exists(entity) && entity instanceof TankBody && entity.cameraEntity instanceof ClientCamera && entity.cameraEntity.cameraData.values.player === entity) {
				players.push(entity);
			}
		}

		// Sort players and set leader AFTER collection
		players.sort((p1, p2) => p2.scoreData.values.score - p1.scoreData.values.score);
		this.leader = players.length > 0 ? players[0] : null;
		if (this.leader && ((this.arenaData.values.flags & ArenaFlags.showsLeaderArrow) !== 0)) {
			this.arenaData.values.leaderX = this.leader.positionData.values.x;
			this.arenaData.values.leaderY = this.leader.positionData.values.y;
		}

		if ((this.game.tick % scoreboardUpdateInterval) === 0) this.updateScoreboard(players);

		if (players.length === 0 && this.state === ArenaState.CLOSING) {
			this.state = ArenaState.CLOSED;

			setTimeout(() => {
				this.game.end();
			}, 10000);
			return;
		}
	}

}