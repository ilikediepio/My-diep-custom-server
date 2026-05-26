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

import * as util from "../../util";

import Bullet from "./Projectile/Bullet";
import SuperBullet from "./Projectile/SuperBullet";
import BlasterBullet from "./Projectile/BlasterBullet";
import Trap from "./Projectile/Trap";
import Drone from "./Projectile/Drone";
import Rocket from "./Projectile/Rocket";
import Skimmer from "./Projectile/Skimmer";
import Minion from "./Projectile/Minion";
import BossMinion from "./Projectile/BossMinion";
import DestroyerMinion from "./Projectile/DestroyerMinion";
import MultiMinion from "./Projectile/MultiMinion";
import MultiMultiMinion from "./Projectile/MultiMultiMinion";
import PDrone from "./Projectile/PDrone";
import ObjectEntity from "../Object";
import AutoDrone from "./Projectile/AutoDrone";
import STrap from "./Projectile/STrap";
import ForceField from "./Projectile/ForceField"
import TankBody, { BarrelBase } from "./TankBody";
import AutoDefence from "./Projectile/AutoDefence";
import Missile from "./Projectile/Missile";
import WorldEnder1 from "./Projectile/WorldEnder1";
import WorldEnder2 from "./Projectile/WorldEnder2";
import Supernova from "./Projectile/Supernova";
import TwinMinion from "./Projectile/TwinMinion";
import InvisBullet from "./Projectile/InvisBullet";
import EraserBullet from "./Projectile/EraserBullet";
import FactorialBullet from "./Projectile/Factorial";
import CracshotBullet from "./Projectile/Cracshot";

import BulletRed from "./Projectile/ColorBullets/Bullet - Red";
import BulletOrange from "./Projectile/ColorBullets/Bullet - Orange";
import BulletYellow from "./Projectile/ColorBullets/Bullet - Yellow";
import BulletGreen from "./Projectile/ColorBullets/Bullet - Green";
import BulletBlue from "./Projectile/ColorBullets/Bullet - Blue";
import BulletIndigo from "./Projectile/ColorBullets/Bullet - Indigo";
import BulletViolet from "./Projectile/ColorBullets/Bullet - Violet";

import Lblue from "./Projectile/ColorBullets/Bullet - Lblue";
import Lgreen from "./Projectile/ColorBullets/Bullet - Lgreen";
import Lred from "./Projectile/ColorBullets/Bullet - Lred";
import Lpurple from "./Projectile/ColorBullets/Bullet - LPurple";
import Lamber from "./Projectile/ColorBullets/Bullet - Lamber";
import Lwhite from "./Projectile/ColorBullets/Bullet - Lwhite";
import Lblack from "./Projectile/ColorBullets/Bullet - Lblack";
import Lorange from "./Projectile/ColorBullets/Bullet - Lorange";
import Lcyan from "./Projectile/ColorBullets/Bullet - Lcyan";
import Lpink from "./Projectile/ColorBullets/Bullet - Lpink";
import Lindigo from "./Projectile/ColorBullets/Bullet - Lindigo";
import Lbronse from "./Projectile/ColorBullets/Bullet - Lbronse";
import Lsilver from "./Projectile/ColorBullets/Bullet - Lsilver";
import Lgold from "./Projectile/ColorBullets/Bullet - Lgold";

import { Color, PositionFlags, PhysicsFlags, BarrelFlags, Stat, Tank } from "../../Const/Enums";
import { BarrelGroup } from "../../Native/FieldGroups";
import { BarrelDefinition, TankDefinition } from "../../Const/TankDefinitions";
import { DevTank } from "../../Const/DevTankDefinitions";
import Flame from "./Projectile/Flame";
import MazeWall from "../Misc/MazeWall";
import CrocSkimmer from "./Projectile/CrocSkimmer";
import { BarrelAddon, BarrelAddonById } from "./BarrelAddons";
import { Swarm } from "./Projectile/Swarm";
import NecromancerSquare from "./Projectile/NecromancerSquare";

import DamageZone1 from "../Misc/DZ/DamageZone1";
import DamageZone2 from "../Misc/DZ/DamageZone2";
import DamageZone3 from "../Misc/DZ/DamageZone3";
import DamageZone4 from "../Misc/DZ/DamageZone4";
import DamageZone5 from "../Misc/DZ/DamageZone5";
import DamageZone6 from "../Misc/DZ/DamageZone6";
import DamageZone7 from "../Misc/DZ/DamageZone7";
import DamageZone8 from "../Misc/DZ/DamageZone8";
import DamageZone9 from "../Misc/DZ/DamageZone9";
import DamageZone10 from "../Misc/DZ/DamageZone10";
import DamageZoneFFA from "../Misc/DZ/DamageZoneFFA";

import Square from "../Shape/Square";
import Triangle from "../Shape/Triangle";
import Pentagon from "../Shape/Pentagon";
import Hexagon from "../Shape/Hexagon";
import AlphaPentagon from "../Shape/AlphaPentagon";
import AlphaHexagon from "../Shape/AlphaHexagon";
import CrystalisedSquare from "../Shape/CrystalisedSquare";
import GoldHexagon from "../Shape/GoldHexagon";
import Crasher from "../Shape/Crasher";
import XPSquare from "../Shape/Level45Giver";
// for shiny set false to true here: const shape = new Shape(this.game, false);

/**
 * Class that determines when barrels can shoot, and when they can't.
 */
export class ShootCycle {
    /** The barrel this cycle is keeping track of. */
    private barrelEntity: Barrel;
    /** The current position in the cycle. */
    private pos: number;
    /** The last known reload time of the barrel. */
    private reloadTime: number;

    public constructor(barrel: Barrel) {
        this.barrelEntity = barrel;
        this.barrelEntity.barrelData.reloadTime = this.barrelEntity.tank.reloadTime * this.barrelEntity.definition.reload;
        this.reloadTime = this.pos = barrel.barrelData.values.reloadTime;
    }

    public tick() {
        const reloadTime = this.barrelEntity.tank.reloadTime * this.barrelEntity.definition.reload;
        if (reloadTime !== this.reloadTime) {
            this.pos *= reloadTime / this.reloadTime;
            this.reloadTime = reloadTime;
        }

        const alwaysShoot = (this.barrelEntity.definition.forceFire) || (this.barrelEntity.definition.bullet.type === 'drone') || (this.barrelEntity.definition.bullet.type === 'minion') || (this.barrelEntity.definition.bullet.type === 'bossminion');

        if (this.pos >= reloadTime) {
            // When its not shooting dont shoot, unless its a drone
            if (!this.barrelEntity.attemptingShot && !alwaysShoot) {
                this.pos = reloadTime;
                return;
            }
            // When it runs out of drones, dont shoot
            if (typeof this.barrelEntity.definition.droneCount === 'number' && this.barrelEntity.droneCount >= this.barrelEntity.definition.droneCount) {
                this.pos = reloadTime;
                return;
            }
        }

        if (this.pos >= reloadTime * (1 + this.barrelEntity.definition.delay)) {
            this.barrelEntity.barrelData.reloadTime = reloadTime;
            this.barrelEntity.shoot();
            this.pos = reloadTime * this.barrelEntity.definition.delay;
        }

        this.pos += 1;
    }
}

/**
 * The barrel class containing all barrel related data.
 * - Converts barrel definitions to diep objects
 * - Will contain shooting logic (or interact with it)
 */
export default class Barrel extends ObjectEntity {
    /** The raw data defining the barrel. */
    public definition: BarrelDefinition;
    /** The owner / tank / parent of the barrel.  */
    public tank: BarrelBase;
    /** The cycle at which the barrel can shoot. */
    public shootCycle: ShootCycle;
    /** Whether or not the barrel is cycling the shoot cycle. */
    public attemptingShot = false;
    /** Bullet base accel. Used for AI and bullet speed determination. */
    public bulletAccel = 20;
    /** Number of drones that this barrel shot that are still alive. */
    public droneCount = 0;

    /** The barrel's addons */
    public addons: BarrelAddon[] = [];

    /** Always existant barrel field group, present on all barrels. */
    public barrelData: BarrelGroup = new BarrelGroup(this);

    public constructor(owner: BarrelBase, barrelDefinition: BarrelDefinition) {
        super(owner.game);

        this.tank = owner;
        this.definition = barrelDefinition;

        // Begin Loading Definition
        this.styleData.values.color = this.definition.color ?? Color.Barrel;
        this.physicsData.values.sides = 2;
        if (barrelDefinition.isTrapezoid) this.physicsData.values.flags |= PhysicsFlags.isTrapezoid;

        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;

        const sizeFactor = this.tank.sizeFactor;
        const size = this.physicsData.values.size = this.definition.size * sizeFactor;

        this.physicsData.values.width = this.definition.width * sizeFactor;
        this.positionData.values.angle = this.definition.angle + (this.definition.trapezoidDirection);
        this.positionData.values.x = Math.cos(this.definition.angle) * (size / 2 + (this.definition.distance || 0)) - Math.sin(this.definition.angle) * this.definition.offset * sizeFactor;
        this.positionData.values.y = Math.sin(this.definition.angle) * (size / 2 + (this.definition.distance || 0)) + Math.cos(this.definition.angle) * this.definition.offset * sizeFactor;

        // addons are below barrel, use StyleFlags.aboveParent to go above parent
        if (barrelDefinition.addon) {
            const AddonConstructor = BarrelAddonById[barrelDefinition.addon];
            if (AddonConstructor) this.addons.push(new AddonConstructor(this));
        }

        this.barrelData.values.trapezoidDirection = barrelDefinition.trapezoidDirection;
        this.shootCycle = new ShootCycle(this);

        this.bulletAccel = (20 + (owner.cameraEntity.cameraData?.values.statLevels.values[Stat.BulletSpeed] || 0) * 3) * barrelDefinition.bullet.speed;
    }

    /** Shoots a bullet from the barrel. */
    public shoot() {
        this.barrelData.flags ^= BarrelFlags.hasShot;

        const scatterAngle = (Math.PI / 180) * this.definition.bullet.scatterRate * (Math.random() - .5) * 10;
        let angle = this.definition.angle + scatterAngle + this.tank.positionData.values.angle;

        // Map angles unto
        // let e: Entity | null | undefined = this;
        // while (!((e?.position?.flags || 0) & MotionFlags.absoluteRotation) && (e = e.relations?.values.parent) instanceof ObjectEntity) angle += e.position.values.angle;

        this.rootParent.addAcceleration(angle + Math.PI, this.definition.recoil * 2);

        let tankDefinition: TankDefinition | null = null;

        if (this.rootParent instanceof TankBody) tankDefinition = this.rootParent.definition;


        switch (this.definition.bullet.type) {
            case "skimmer":
                new Skimmer(this, this.tank, tankDefinition, angle, this.tank.inputs.attemptingRepel() ? -Skimmer.BASE_ROTATION : Skimmer.BASE_ROTATION);
                break;
            case "rocket":
                new Rocket(this, this.tank, tankDefinition, angle);
                break;
            case 'missile':
                new Missile(this, this.tank, tankDefinition, angle);
                break;
case 'bullet': {
    const bullet = new Bullet(this, this.tank, tankDefinition, angle);

    if (
        tankDefinition &&
        (tankDefinition.id === Tank.ArenaCloser || tankDefinition.id === DevTank.Squirrel || tankDefinition.id === Tank.DominatorG || tankDefinition.id === Tank.DominatorD || tankDefinition.id === Tank.DominatorT)
    ) {
        bullet.positionData.flags |= PositionFlags.canMoveThroughWalls;
    }

    // Disable wall phasing for ATMG
    if (tankDefinition?.id === Tank.Atmg) {
        bullet.positionData.flags &= ~PositionFlags.canMoveThroughWalls;
    }

    break;
}
            case 'trap':
                new Trap(this, this.tank, tankDefinition, angle);
                break;
            case 'strap':
                new STrap(this, this.tank, tankDefinition, angle);
                break;
            case 'drone':
                new Drone(this, this.tank, tankDefinition, angle);
                break;
            case 'pdrone':
                new PDrone(this, this.tank, tankDefinition, angle);
                break;
            case 'autodrone':
                new AutoDrone(this, this.tank, tankDefinition, angle, this.tank.inputs.attemptingRepel() ? -Skimmer.BASE_ROTATION : Skimmer.BASE_ROTATION);
                break;
            case 'necrodrone':
                new NecromancerSquare(this, this.tank, tankDefinition, angle);
                break;
            case 'swarm':
                new Swarm(this, this.tank, tankDefinition, angle);
                break;
            case 'minion':
                new Minion(this, this.tank, tankDefinition, angle);
                break;
            case 'bossminion':
                new BossMinion(this, this.tank, tankDefinition, angle);
                break;
            case 'destroyerminion':
                new DestroyerMinion(this, this.tank, tankDefinition, angle);
                break;
            case 'multiminion':
                new MultiMinion(this, this.tank, tankDefinition, angle);
                break;
            case 'multimultiminion':
                new MultiMultiMinion(this, this.tank, tankDefinition, angle);
                break;
            case 'twinminion':
                new TwinMinion(this, this.tank, tankDefinition, angle);
                break;
            case 'worldender1':
                new WorldEnder1(this, this.tank, tankDefinition, angle);
                break;
            case 'worldender2':
                new WorldEnder2(this, this.tank, tankDefinition, angle);
                break;
            case 'flame':
                new Flame(this, this.tank, tankDefinition, angle);
                break;
            case 'forcefield':
                new ForceField(this, this.tank, tankDefinition, angle);
                break;
            case 'superbullet':
                new SuperBullet(this, this.tank, tankDefinition, angle);
                break;
            case 'invisbullet':
                new InvisBullet(this, this.tank, tankDefinition, angle);
                break;
            case 'blasterbullet':
                new BlasterBullet(this, this.tank, tankDefinition, angle);
                break;
            case 'autodefence':
                new AutoDefence(this, this.tank, tankDefinition, angle);
                break;
            case 'wall': {
                let w = new MazeWall(this.game, Math.round(this.tank.inputs.mouse.x / 50) * 50, Math.round(this.tank.inputs.mouse.y / 50) * 50, 250, 250);
                setTimeout(() => {
                    w.destroy();
                }, 10 * 1000);
                break;
            }
            case "croc": 
                new CrocSkimmer(this, this.tank, tankDefinition, angle);
                break;
            case "bulletred":
                new BulletRed(this, this.tank, tankDefinition, angle);
                break;
            case "bulletorange":
                new BulletOrange(this, this.tank, tankDefinition, angle);
                break;
            case "bulletyellow":
                new BulletYellow(this, this.tank, tankDefinition, angle);
                break;
            case "bulletgreen":
                new BulletGreen(this, this.tank, tankDefinition, angle);
                break;
            case "bulletblue":
                new BulletBlue(this, this.tank, tankDefinition, angle);
                break;
            case "bulletindigo":
                new BulletIndigo(this, this.tank, tankDefinition, angle);
                break;
            case "bulletviolet":
                new BulletViolet(this, this.tank, tankDefinition, angle);
                break;
            case 'supernova':
                new Supernova(this, this.tank, tankDefinition, angle);
                break;
            case "lblue":
                new Lblue(this, this.tank, tankDefinition, angle);
                break;
            case "lgreen":
                new Lgreen(this, this.tank, tankDefinition, angle);
                break;
            case "lred":
                new Lred(this, this.tank, tankDefinition, angle);
                break;
            case "lpurple":
                new Lpurple(this, this.tank, tankDefinition, angle);
                break;
            case "lamber":
                new Lamber(this, this.tank, tankDefinition, angle);
                break;
            case "lwhite":
                new Lwhite(this, this.tank, tankDefinition, angle);
                break;
            case "lblack":
                new Lblack(this, this.tank, tankDefinition, angle);
                break;
            case "lorange":
                new Lorange(this, this.tank, tankDefinition, angle);
                break;
            case "lcyan":
                new Lcyan(this, this.tank, tankDefinition, angle);
                break;
            case "lpink":
                new Lpink(this, this.tank, tankDefinition, angle);
                break;
            case "lindigo":
                new Lindigo(this, this.tank, tankDefinition, angle);
                break;
            case "lbronse":
                new Lbronse(this, this.tank, tankDefinition, angle);
                break;
            case "lsilver":
                new Lsilver(this, this.tank, tankDefinition, angle);
                break;
            case "lgold":
                new Lgold(this, this.tank, tankDefinition, angle);
                break;
            case "factorial":
                new FactorialBullet(this, this.tank, tankDefinition, angle);
                break;
            case "cracshot":
                new CracshotBullet(this, this.tank, tankDefinition, angle);
                break;
case 'square': {
    const square = new Square(this.game, false);

    const offset = this.physicsData.values.size + 20;

    square.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    square.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'triangle': {
    const triangle = new Triangle(this.game, false);

    const offset = this.physicsData.values.size + 20;

    triangle.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    triangle.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'pentagon': {
    const pentagon = new Pentagon(this.game, false);

    const offset = this.physicsData.values.size + 20;

    pentagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    pentagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'hexagon': {
    const hexagon = new Hexagon(this.game, false);

    const offset = this.physicsData.values.size + 20;

    hexagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    hexagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'alphapentagon': {
    const alphaPentagon = new AlphaPentagon(this.game, false);

    const offset = this.physicsData.values.size + 20;

    alphaPentagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    alphaPentagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'alphahexagon': {
    const alphaHexagon = new AlphaHexagon(this.game, false);

    const offset = this.physicsData.values.size + 20;

    alphaHexagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    alphaHexagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'shinysquare': {
    const square = new Square(this.game, true);

    const offset = this.physicsData.values.size + 20;

    square.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    square.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'shinytriangle': {
    const triangle = new Triangle(this.game, true);

    const offset = this.physicsData.values.size + 20;

    triangle.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    triangle.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'shinypentagon': {
    const pentagon = new Pentagon(this.game, false, true);

    const offset = this.physicsData.values.size + 20;

    pentagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    pentagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'shinyhexagon': {
    const hexagon = new Hexagon(this.game, false, true);

    const offset = this.physicsData.values.size + 20;

    hexagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    hexagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'shinyalphapentagon': {
    const alphaPentagon = new AlphaPentagon(this.game, true);

    const offset = this.physicsData.values.size + 20;

    alphaPentagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    alphaPentagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'shinyalphahexagon': {
    const alphaHexagon = new AlphaHexagon(this.game, true);

    const offset = this.physicsData.values.size + 20;

    alphaHexagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    alphaHexagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'crystalisedsquare': {
    const crystalisedSquare = new CrystalisedSquare(this.game, false);

    const offset = this.physicsData.values.size + 20;

    crystalisedSquare.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    crystalisedSquare.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'goldhexagon': {
    const goldhexagon = new GoldHexagon(this.game, false);

    const offset = this.physicsData.values.size + 20;

    goldhexagon.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    goldhexagon.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'crasher': {
    const crasher = new Crasher(this.game, false);

    const offset = this.physicsData.values.size + 20;

    crasher.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    crasher.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'shinycrasher': {
    const crasher = new Crasher(this.game, true);

    const offset = this.physicsData.values.size + 20;

    crasher.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    crasher.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
case 'xpsquare': {
    const crasher = new XPSquare(this.game, false);

    const offset = this.physicsData.values.size - 400;

    crasher.positionData.values.x =
        this.tank.positionData.values.x + Math.cos(angle) * offset;

    crasher.positionData.values.y =
        this.tank.positionData.values.y + Math.sin(angle) * offset;

    break;
}
            case "eraser":
                new EraserBullet(this, this.tank, tankDefinition, angle);
                    util.log('deleted an object near ' + (Math.round(this.tank.inputs.mouse.x / 100) * 100 + 50) + ' ' + (Math.round(this.tank.inputs.mouse.y / 100) * 100 + 50));
                break;
            case 'permawall1': {
                let w = new MazeWall(this.game, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50); // last 2 numbers set size, make smaller or larger based on needs (1 = 50x50 2 = 100x100 3 = 200x200 4 = 400x400 5 = 800x800. offset =  half size of block)
                    util.log('spawned mazewall 50x50 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
                break;
            }
            case 'permawall2': {
                let w = new MazeWall(this.game, Math.round(this.tank.inputs.mouse.x / 100) * 100 + 50, Math.round(this.tank.inputs.mouse.y / 100) * 100 + 50, 100, 100);
                    util.log('spawned mazewall 100x100 at ' + (Math.round(this.tank.inputs.mouse.x / 100) * 100 + 50) + ' ' + (Math.round(this.tank.inputs.mouse.y / 100) * 100 + 50));
                break;
            }
            case 'permawall3': {
                let w = new MazeWall(this.game, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200);
                    util.log('spawned mazewall 200x200 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
                break;
            }
            case 'permawall4': {
                let w = new MazeWall(this.game, Math.round(this.tank.inputs.mouse.x / 400) * 400 + 200, Math.round(this.tank.inputs.mouse.y / 400) * 400 + 200, 400, 400);
                    util.log('spawned mazewall 400x400 at ' + (Math.round(this.tank.inputs.mouse.x / 400) * 400 + 200) + ' ' + (Math.round(this.tank.inputs.mouse.y / 400) * 400 + 200));
                break;
            }
            case 'permawall5': {
                let w = new MazeWall(this.game, Math.round(this.tank.inputs.mouse.x / 800) * 800 + 400, Math.round(this.tank.inputs.mouse.y / 800) * 800 + 400, 800, 800);
                    util.log('spawned mazewall 800x800 at ' + (Math.round(this.tank.inputs.mouse.x / 800) * 800 + 400) + ' ' + (Math.round(this.tank.inputs.mouse.y / 800) * 800 + 400));
                break;
            }

case 'damagezone1': {
    let w = new DamageZone1(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned damagezone1 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone2': {
    let w = new DamageZone2(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned DamageZone2 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone3': {
    let w = new DamageZone3(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned damagezone3 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone4': {
    let w = new DamageZone4(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned damagezone4 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone5': {
    let w = new DamageZone5(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned damagezone5 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone6': {
    let w = new DamageZone6(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned damagezone6 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone7': {
    let w = new DamageZone7(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned damagezone7 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone8': {
    let w = new DamageZone8(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
        util.log('spawned damagezone8 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone9': {
    let w = new DamageZone9(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
    util.log('spawned damagezone9 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezone10': {
    let w = new DamageZone10(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
    util.log('spawned damagezone10 at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}

case 'damagezonefake': {
    let w = new DamageZone10(this.game, null, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, false);
                util.log('spawned damagezonefake at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}
case 'damagezoneffa': {
    let w = new DamageZoneFFA(this.game, Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100, Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100, 200, 200, true);
                util.log('spawned damagezonefake at ' + (Math.round(this.tank.inputs.mouse.x / 200) * 200 + 100) + ' ' + (Math.round(this.tank.inputs.mouse.y / 200) * 200 + 100));
    break;
}
case 'smalldamagezone1': {
    let w = new DamageZone1(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
                util.log('spawned smalldamagezone1 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone2': {
    let w = new DamageZone2(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
                util.log('spawned smalldamagezone2 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone3': {
    let w = new DamageZone3(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
                util.log('spawned smalldamagezone3 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone4': {
    let w = new DamageZone4(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
                util.log('spawned smalldamagezone4 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone5': {
    let w = new DamageZone5(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
                util.log('spawned smalldamagezone5 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone6': {
    let w = new DamageZone6(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
            util.log('spawned smalldamagezone6 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone7': {
    let w = new DamageZone7(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
            util.log('spawned smalldamagezone7 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone8': {
    let w = new DamageZone8(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
            util.log('spawned smalldamagezone8 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone9': {
    let w = new DamageZone9(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
            util.log('spawned smalldamagezone9 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezone10': {
    let w = new DamageZone10(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
        util.log('spawned smalldamagezone10 at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}

case 'smalldamagezonefake': {
    let w = new DamageZone10(this.game, null, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, false);
        util.log('spawned smalldamagezonefake at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}
case 'smalldamagezoneffa': {
    let w = new DamageZoneFFA(this.game, Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25, Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25, 50, 50, true);
        util.log('spawned smalldamagezoneffa at ' + (Math.round(this.tank.inputs.mouse.x / 50) * 50 + 25) + ' ' + (Math.round(this.tank.inputs.mouse.y / 50) * 50 + 25));
    break;
}
            default:
                util.log('Ignoring attempt to spawn projectile of type ' + this.definition.bullet.type);
                break;
        }

    }

    /** Resizes the barrel; when the tank gets bigger, the barrel must as well. */
    protected resize() {
        const sizeFactor = this.tank.sizeFactor;
        const size = this.physicsData.size = this.definition.size * sizeFactor;

        this.physicsData.width = this.definition.width * sizeFactor;
        this.positionData.angle = this.definition.angle + (this.definition.trapezoidDirection);
        this.positionData.x = Math.cos(this.definition.angle) * (size / 2 + (this.definition.distance || 0)) - Math.sin(this.definition.angle) * this.definition.offset * sizeFactor;
        this.positionData.y = Math.sin(this.definition.angle) * (size / 2 + (this.definition.distance || 0)) + Math.cos(this.definition.angle) * this.definition.offset * sizeFactor;

        // Updates bullet accel too
        this.bulletAccel = (20 + (this.tank.cameraEntity.cameraData?.values.statLevels.values[Stat.BulletSpeed] || 0) * 3) * this.definition.bullet.speed;
    }

    public tick(tick: number) {
        this.resize();

        this.relationsData.values.team = this.tank.relationsData.values.team;

        if (!this.tank.rootParent.deletionAnimation){
            this.attemptingShot = this.tank.inputs.attemptingShot();
            this.shootCycle.tick();
        }

        super.tick(tick);
    }
}
