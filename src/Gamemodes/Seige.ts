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
import ArenaEntity, { ArenaState } from "../Native/Arena";
import Client from "../Client";

import TeamBase from "../Entity/Misc/TeamBase";
import TankBody from "../Entity/Tank/TankBody";
import SeigeGuardian from "../Entity/Misc/SeigeGuardian";
import Wall from "../Entity/Misc/MazeWall";
import Dominator from "../Entity/Misc/Dominator";

import { TeamEntity } from "../Entity/Misc/TeamEntity";
import { Entity } from "../Native/Entity";
import { Color, ClientBound, Tank, ArenaFlags } from "../Const/Enums";

import ShapeManager from "../Entity/Shape/Manager";

import Defender from "../Entity/Boss/Defender";
import Summoner from "../Entity/Boss/Summoner";
import Guardian from "../Entity/Boss/Guardian";

import SuperDefender from "../Entity/Boss/SuperDefender";
import SuperSummoner from "../Entity/Boss/SuperSummoner";
import SuperGuardian from "../Entity/Boss/SuperGuardian";

import Terrestrial from "../Entity/Misc/Terrestrials";
import Celestial from "../Entity/Misc/Celestials";
import Eternal from "../Entity/Misc/Eternals";
import Immortal from "../Entity/Misc/Immortals";


const arenaSize = 6000;
const baseSize = 2000;

class ZeroShapeManager extends ShapeManager {
    public constructor(arena: ArenaEntity) {
        super(arena);
    }

    protected get wantedShapes() {
        return 0;
    }
}

export default class SeigeArena extends ArenaEntity {
    protected shapes: ShapeManager = new ZeroShapeManager(this);

    public blueTeamBase: TeamBase;
    public SeigeGuardian!: SeigeGuardian;
    public Wall: Wall;

    public playerTeamMap: Map<Client, TeamBase> = new Map();

    private waveNumber: number = 1;
    private bossPowerCap: number = 0;
    private activeBosses: Set<Entity> = new Set();
    private guardians: SeigeGuardian[] = [];

    public constructor(game: GameServer) {
        super(game);

        game.arena = this;
        this.updateBounds(arenaSize * 2, arenaSize * 2);

        // Spawn Blue base at center
        this.blueTeamBase = new TeamBase(
            game,
            new TeamEntity(this.game, Color.TeamBlue),
            0, 0,
            baseSize,
            baseSize
        );

        // Spawn Base Guardian at center
        const guardian = new SeigeGuardian(this.game);
        guardian.relationsData.values.team = this.blueTeamBase.relationsData.values.team;
        guardian.positionData.values.x = 0;
        guardian.positionData.values.y = 0;
        this.SeigeGuardian = guardian;
        this.guardians.push(guardian);

        // Spawn Walls
        this.Wall = new Wall(this.game, 1000, 1000, 500, 500);
        this.Wall = new Wall(this.game, 1000, -1000, 500, 500);
        this.Wall = new Wall(this.game, -1000, 1000, 500, 500);
        this.Wall = new Wall(this.game, -1000, -1000, 500, 500);

        new Dominator(this, new TeamBase(game, this, arenaSize / 2.5, arenaSize / 2.5, 1500, 1500, false));
        new Dominator(this, new TeamBase(game, this, arenaSize / -2.5, arenaSize / 2.5, 1500, 1500, false));
        new Dominator(this, new TeamBase(game, this, arenaSize / -2.5, arenaSize / -2.5, 1500, 1500, false));
        new Dominator(this, new TeamBase(game, this, arenaSize / 2.5, arenaSize / -2.5, 1500, 1500, false));

        this.arenaData.values.flags |= ArenaFlags.cantUseCheats;

        // Initial boss wave
        this.spawnWave();
    }

public findSpawnLocation() {
    const margin = 1000; // keep bosses away from the very edge
    const halfSize = arenaSize - margin;

    const x = (Math.random() * 2 - 1) * halfSize;
    const y = (Math.random() * 2 - 1) * halfSize;

    return { x, y };
}

    public spawnPlayer(tank: TankBody, client: Client) {
        const xOffset = (Math.random() - 0.5) * baseSize;
        const yOffset = (Math.random() - 0.5) * baseSize;
        tank.setTank(Tank.SeigeTanks);

        const base = this.blueTeamBase;

        tank.relationsData.values.team = base.relationsData.values.team;
        tank.styleData.values.color = base.styleData.values.color;
        tank.positionData.values.x = base.positionData.values.x + xOffset;
        tank.positionData.values.y = base.positionData.values.y + yOffset;

        this.playerTeamMap.set(client, base);
        if (client.camera) {
            client.camera.relationsData.team = tank.relationsData.values.team;
        }
    }

    private waveCooldown: number = 0;
    private pendingWave: boolean = false;
    private bossSpawnQueue: (() => void)[] = [];

    private bossSpawnTimer: number = 0;
    private bossSpawnDelay: number = 0.2; // spawn 5 bosses a second

    private spawnWave(): void {
        console.log(`Wave ${this.waveNumber} incoming!`);

        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT(`Wave ${this.waveNumber} is incoming!`)
            .u32(0x00aaFF)
            .float(10000)
            .stringNT("")
            .send();

        // Calculate power cap
        this.bossPowerCap = Math.min(
            Math.floor((this.waveNumber - 1) / 10 + 1) * this.waveNumber,
            400
        );

        let powerCap = this.bossPowerCap;
        let count1Cost = 0;
        let highTierUsed = 0;
        const highTierBudget = Math.floor(powerCap / 2);

        const oneCostOptions = [
            { create: () => new Defender(this.game), cost: 1 },
            { create: () => new Guardian(this.game), cost: 1 },
            { create: () => new Summoner(this.game), cost: 1 }
        ];

        const superOptions = [
            { create: () => new SuperDefender(this.game), cost: 2 },
            { create: () => new SuperGuardian(this.game), cost: 2 },
            { create: () => new SuperSummoner(this.game), cost: 2 }
        ];

        const bossTiers = [
            { wave: 30, cost: 20, type: "eternal" },
            { wave: 20, cost: 8, type: "celestial" },
            { wave: 10, cost: 4, type: "terrestrial" },
            { wave: 5,  cost: 2, type: "super" },
            { wave: 1,  cost: 1, type: "normal" }
        ];

        const wave = this.waveNumber;

        while (powerCap > 0) {
            const available = bossTiers.filter(b =>
                b.wave <= wave &&
                b.cost <= powerCap &&
                (b.cost >= 4 ? (highTierUsed + b.cost <= highTierBudget) : true)
            );

            if (available.length === 0) break;

            const selected = available[Math.floor(Math.random() * available.length)];
            let bossEntity: Entity | null = null;

            switch (selected.type) {
                case "eternal":
                    bossEntity = new Eternal(this.game);
                    break;
                case "celestial":
                    bossEntity = new Celestial(this.game);
                    break;
                case "terrestrial":
                    bossEntity = new Terrestrial(this.game);
                    break;
                case "super":
                    bossEntity = superOptions[Math.floor(Math.random() * superOptions.length)].create();
                    break;
                case "normal":
                    if (wave < 30 && count1Cost >= 10) continue;
                    bossEntity = oneCostOptions[Math.floor(Math.random() * oneCostOptions.length)].create();
                    count1Cost++;
                    break;
            }

            if (!bossEntity) continue;

            const spawn = this.findSpawnLocation();
            if (bossEntity.positionData) {
                bossEntity.positionData.values.x = spawn.x;
                bossEntity.positionData.values.y = spawn.y;
            }

this.bossSpawnQueue.push(() => {
    if (bossEntity && bossEntity.positionData) {
        const spawn = this.findSpawnLocation();
        const offsetX = (Math.random() - 0.5) * 750;
        const offsetY = (Math.random() - 0.5) * 750;

        bossEntity.positionData.values.x = spawn.x + offsetX;
        bossEntity.positionData.values.y = spawn.y + offsetY;

        this.activeBosses.add(bossEntity);
    }
});

            powerCap -= selected.cost;
            if (selected.cost >= 4) highTierUsed += selected.cost;
        }
    }

public tick(delta: number): void {

if (this.guardians.length <= 0) {
    if (this.state === ArenaState.OPEN) {
        this.state = ArenaState.OVER;

        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT("The Base has fallen!")
            .u32(0xFF0000)
            .float(5000)
            .stringNT("")
            .send();

        setTimeout(() => {
            this.close();
        }, 5000);
    }
}

if (this.game.tick > 2000) {
    this.close();
}

    super.tick(delta);

    for (const boss of this.activeBosses) {
        if (boss.healthData && boss.healthData.values.health <= 0) {
            this.activeBosses.delete(boss);
        }
    }

    // Handle cooldown
    if (this.waveCooldown > 0) {
        this.waveCooldown -= delta;
        if (this.waveCooldown <= 0 && this.pendingWave) {
            this.spawnWave();
            this.pendingWave = false;
        }
    }

// Spread boss spawns over time (aprox 5 per second)
if (this.bossSpawnQueue.length > 0) {
    this.bossSpawnTimer -= delta;
    if (this.bossSpawnTimer <= 0) {
        const spawnFn = this.bossSpawnQueue.shift();
        if (spawnFn) spawnFn();
        this.bossSpawnTimer = this.bossSpawnDelay;
    }
}

    this.checkWaveComplete();
    }

    private checkWaveComplete(): void {
    if (this.activeBosses.size === 0 && !this.pendingWave) {
        this.waveNumber++;
        this.waveCooldown = 200000; // 2 seconds (I think)
        this.pendingWave = true;

        this.game.broadcast()
            .u8(ClientBound.Notification)
            .stringNT(`Wave ${this.waveNumber} begins in a few seconds!`)
            .u32(0x00aaFF)
            .float(5000)
            .stringNT("")
            .send();
    }
  }
}