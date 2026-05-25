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
import ObjectEntity from "../Object";
import AutoTurret from "./AutoTurret";
import MultiAutoTurret from "./MultiAutoTurret";
import BMultiAutoTurret from "./BMultiAutoTurret";
import MultiAutoRocket from "./MultiAutoRocket";
import BMultiAutoRocket from "./BMultiAutoRocket";
import DestroyerTurret from "./DestroyerMachineGun";
import ShotgunTurret from "./ShotgunTurret";
import MachineGun from "./MachineGun";
import MultiAutoBase from "./MultiAutoBase";

import { Color, PositionFlags, PhysicsFlags, StyleFlags } from "../../Const/Enums";
import { BarrelBase } from "./TankBody";
import { addonId, BarrelDefinition } from "../../Const/TankDefinitions";
import { AI, AIState, Inputs } from "../AI";
import LivingEntity from "../Live";
import { normalizeAngle, PI2 } from "../../util";
import { CameraEntity } from "../../Native/Camera";

/**
 * Abstract class to represent an addon in game.
 * 
 * Addons are entities added on to a tank during its creation. There are two types:
 * pre addons, and post addons. Pre addons are built before the barrels are built - for example
 * a dominator's base is a pre addon. A post addon is an addon built after the barrels are
 * built - for example the pronounciation of Ranger's barrel is a post addon.
 * 
 * Read [addons.md on diepindepth](https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md) 
 * for more details and examples.
 */
//class MultiAutoBase extends ObjectEntity {
//    protected owner: BarrelBase;
//}

//class MultiAutoTurret extends MultiAutoBase {}
//class MultiAutoRocket extends MultiAutoBase {}
//class BMultiAutoRocket extends MultiAutoBase {}

export class Addon {
    /** The current game server */
    protected game: GameServer;
    /** Helps the class determine size ratio as well as who is the owner */
    protected owner: BarrelBase;

    public constructor(owner: BarrelBase) {
        this.owner = owner;
        this.game = owner.game;
    }

    /**
     * `createGuard` method creates a smasher-like guard shape. 
     * Read (addons.md on diepindepth)[https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md]
     * for more details and examples.
     */
    protected createGuard(sides: number, sizeRatio: number, offsetAngle: number, radiansPerTick: number): GuardObject {
        return new GuardObject(this.game, this.owner, sides, sizeRatio, offsetAngle, radiansPerTick);
    }

    /**
     * `createAutoTurrets` method builds `count` auto turrets around the current
     * tank's body. 
     */
    protected createAutoTurrets(count: number) {
        const rotPerTick = AI.PASSIVE_ROTATION;
        const MAX_ANGLE_RANGE = PI2 / 4; // keep within 90º each side

        const rotator = this.createGuard(1, .1, 0, rotPerTick) as GuardObject & { turrets: AutoTurret[] };
        rotator.turrets = [];

        const ROT_OFFSET = 0.8;

        if (rotator.styleData.values.flags & StyleFlags.isVisible) rotator.styleData.values.flags ^= StyleFlags.isVisible;

        for (let i = 0; i < count; ++i) {
            const base = new AutoTurret(rotator, AutoTurretMiniDefinition);
            base.influencedByOwnerInputs = true;

            const angle = base.ai.inputs.mouse.angle = PI2 * (i / count);
            base.ai.passiveRotation = rotPerTick;
            base.ai.targetFilter = (targetPos) => {
                const pos = base.getWorldPosition();
                const angleToTarget = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
                
                const deltaAngle = normalizeAngle(angleToTarget - ((angle + rotator.positionData.values.angle)));

                return deltaAngle < MAX_ANGLE_RANGE || deltaAngle > (PI2 - MAX_ANGLE_RANGE);
            }

const radius = rotator.physicsData.values.size;
base.positionData.values.y = radius * Math.sin(angle);
base.positionData.values.x = radius * Math.cos(angle);

            if (base.styleData.values.flags & StyleFlags.showsAboveParent) base.styleData.values.flags ^= StyleFlags.showsAboveParent;
            base.physicsData.values.flags |= PositionFlags.absoluteRotation;

            const tickBase = base.tick;
            base.tick = (tick: number) => {
                base.positionData.y = this.owner.physicsData.values.size * Math.sin(angle) * ROT_OFFSET;
                base.positionData.x = this.owner.physicsData.values.size * Math.cos(angle) * ROT_OFFSET;

                tickBase.call(base, tick);

                if (base.ai.state === AIState.idle) base.positionData.angle = angle + rotator.positionData.values.angle;
            }

            rotator.turrets.push(base);
        }

        return rotator;
    }
}


const AutoTurretMiniDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 55,
    width: 42 * 0.7,
    delay: 0.01,
    reload: 1,
    recoil: 0.3,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 0.4,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const AutoTurretMegaDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 55,
    width: 42 * 1.2,
    delay: 0.01,
    reload: 0.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 1,
        damage: 1.5,
        speed: 1.5,
        scatterRate: 0,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 0.1
    }
};

/**
 * A smasher-like guard object.
 * Read (addons.md on diepindepth)[https://github.com/ABCxFF/diepindepth/blob/main/extras/addons.md]
 * for more details and examples.
 */
export class GuardObject extends ObjectEntity implements BarrelBase {
    /***** From BarrelBase *****/
    public inputs: Inputs;
    public cameraEntity: CameraEntity;
    public reloadTime: number;

    /** Helps the class determine size ratio as well as who is the owner */
    protected owner: BarrelBase;
    /** To store the size ratio (in compared to the owner) */
    public sizeRatio: number;
    /** Radians per tick, how many radians the guard will rotate in a tick */
    public radiansPerTick: number;

    public constructor(game: GameServer, owner: BarrelBase, sides: number, sizeRatio: number, offsetAngle: number, radiansPerTick: number) {
        super(game);

        this.owner = owner;
        this.inputs = owner.inputs;
        this.cameraEntity = owner.cameraEntity;
        // It's weird, but it's how it works
        sizeRatio *= Math.SQRT1_2
        this.sizeRatio = sizeRatio;
        this.radiansPerTick = radiansPerTick;

        this.setParent(owner);
        this.relationsData.values.owner = owner;
        this.relationsData.values.team = owner.relationsData.values.team;

        this.styleData.values.color = Color.Border;
        this.positionData.values.flags |= PositionFlags.absoluteRotation;
        this.positionData.values.angle = offsetAngle;
        this.physicsData.values.sides = sides;
        this.reloadTime = owner.reloadTime;
        this.physicsData.values.size = owner.physicsData.values.size * sizeRatio;
    }

    /**
     * Size factor, used for calculation of the turret and base size.
     */
    get sizeFactor() {
        return this.owner.sizeFactor;
    }

    /**
     * Called (if ever) similarly to LivingEntity.onKill
     * Spreads onKill to owner
     */
    public onKill(killedEntity: LivingEntity) {
        if (!(this.owner instanceof LivingEntity)) return;
        this.owner.onKill(killedEntity);
    }

    public tick(tick: number): void {
        this.reloadTime = this.owner.reloadTime;
        this.physicsData.size = this.sizeRatio * this.owner.physicsData.values.size;
        this.positionData.angle += this.radiansPerTick;
        // It won't ever do any collisions, so no need to tick the object
        // super.tick(tick);
    }
}

export class SquareShiny extends ObjectEntity {
    public constructor(owner: BarrelBase) {
        super(owner.game);

        this.setParent(owner);
        this.relationsData.values.team = owner.relationsData.values.team;

        this.physicsData.values.sides = 4;
        this.physicsData.values.size = 300;

        this.styleData.values.color = Color.Barrel;
    }
}

/** Spikes addon. */
class SpikeAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(3, 1.3, 0, 0.17);
        this.createGuard(3, 1.3, Math.PI / 3, 0.17);
        this.createGuard(3, 1.3, Math.PI / 6, 0.17);
        this.createGuard(3, 1.3, Math.PI / 2, 0.17);
    }
}
/** Dominator's Base addon. */
class DomBaseAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.24, 0, 0);
    }
}
/** Smasher addon. */
class SmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
    }
}
/** Landmine addon. */
class LandmineAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
        this.createGuard(6, 1.15, 0, .05);
    }
}
/** The thing underneath Rocketeer and Twister addon. */
class LauncherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const launcher = new ObjectEntity(this.game);
        const sizeRatio = 65.5 * Math.SQRT2 / 50;
        const widthRatio = 33.6 / 50;
        const size = this.owner.physicsData.values.size;

        launcher.setParent(this.owner);
        launcher.relationsData.values.owner = this.owner;
        launcher.relationsData.values.team = this.owner.relationsData.values.team;

        launcher.physicsData.values.size = sizeRatio * size;
        launcher.physicsData.values.width = widthRatio * size;
        launcher.positionData.values.x = launcher.physicsData.values.size / 2;

        launcher.styleData.values.color = Color.Barrel;
        launcher.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        launcher.physicsData.values.sides = 2;

        launcher.tick = () => {
            const size = this.owner.physicsData.values.size;

            launcher.physicsData.size = sizeRatio * size;
            launcher.physicsData.width = widthRatio * size;
            launcher.positionData.x = launcher.physicsData.values.size / 2;
        }
    }
}
/** Centered Auto Turret addon. */
class AutoTurretAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new AutoTurret(owner);
    }
}
/** Centered Machine Gun addon. */
class MachineGunAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new MachineGun(owner);
    }
}
/** Centered Multi Auto Turret addon. */
class MultiAutoTurretAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new MultiAutoTurret(owner);
    }
}
/** Centered Square addon. */
class ShinyAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new SquareShiny(owner);
    }
}
/** Centered Multi Auto Turret addon. */
class DestroyerTurretAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new DestroyerTurret(owner);
    }
}
/** 3 Multi Auto Rockets */
class MultiAutoRocket3Addon extends Addon {
    public turrets: MultiAutoRocket[];

    public constructor(owner: BarrelBase) {
        super(owner);

        // Create 3 turrets
        this.turrets = MultiAutoRocket.createMultiAutoRockets(owner, 3);

        // Add turrets to game and parent them to owner
        //this.turrets.forEach(turret => {
            //owner.game.addEntity(turret);
            //turret.setParent(owner);
        //});
    }
}
/** 5 Multi Auto Rockets */
class MultiAutoRocket5Addon extends Addon {
    public turrets: MultiAutoRocket[];

    public constructor(owner: BarrelBase) {
        super(owner);

        // Create 5 turrets
        this.turrets = MultiAutoRocket.createMultiAutoRockets(owner, 5);

        // Add turrets to game and parent them to owner
        //this.turrets.forEach(turret => {
            //owner.game.addEntity(turret);
            //turret.setParent(owner);
        //});
    }
}
/** 3 Auto Turrets */
class MultiAutoTurrets3Addon extends Addon {
    public turrets: MultiAutoTurret[];

    public constructor(owner: BarrelBase) {
        super(owner);

        // Create 3 turrets
        this.turrets = MultiAutoTurret.createMultiAutoTurrets(owner, 3);

        // Add turrets to game and parent them to owner
        //this.turrets.forEach(turret => {
            //owner.game.addEntity(turret);
            //turret.setParent(owner);
        //});
    }
}
/** 5 Auto Turrets */
class MultiAutoTurrets5Addon extends Addon {
    public turrets: MultiAutoTurret[];

    public constructor(owner: BarrelBase) {
        super(owner);

        // Create 5 turrets
        this.turrets = MultiAutoTurret.createMultiAutoTurrets(owner, 5);

        // Add turrets to game and parent them to owner
        //this.turrets.forEach(turret => {
            //owner.game.addEntity(turret);
            //turret.setParent(owner);
        //});
    }
}
/**Defender addon. */
class DefenderAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new AutoTurret(owner);  // left barrel offset
        new AutoTurret(owner);  // right barrel offset
        new AutoTurret(owner);  // down barrel offset
    }
}
/**MiniShottgun addon. */
class MiniShotgunAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
    }
}
/**Shottgun addon. */
class ShotgunAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
    }
}
/** Smasher + Centered Auto Turret addon. */
class AutoSmasherAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
        new AutoTurret(owner);
    }
}
/** Smasher + Centered Auto Turret addon. */
class AutoSmashersrevengeAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(6, 1.15, 0, .1);
        new AutoTurret(owner);
        new AutoTurret(owner);
        new AutoTurret(owner);
        new AutoTurret(owner);
        this.createAutoTurrets(4);
    }
}
/** 5 Auto Turrets */
class Auto5Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(5);
    }
}
/** 3 Auto Turrets */
class Auto3Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(3);
    }
}
/** 2 Auto Turrets */
class GunShipAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(2);
    }
}
/** The thing above ranger's barrel. */
class PronouncedAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 50 / 50;
        const widthRatio = 42 / 50;
        const offsetRatio = 40 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;

        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** The thing above Gunner + Destroyer Dominator's barrel. */
class PronouncedDomAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const pronounce = new ObjectEntity(this.game);
        const sizeRatio = 22 / 50;
        const widthRatio = 35 / 50;
        const offsetRatio = 50 / 50;
        const size = this.owner.physicsData.values.size;

        pronounce.setParent(this.owner);
        pronounce.relationsData.values.owner = this.owner;
        pronounce.relationsData.values.team = this.owner.relationsData.values.team

        pronounce.physicsData.values.size = sizeRatio * size;
        pronounce.physicsData.values.width = widthRatio * size;
        pronounce.positionData.values.x = offsetRatio * size;
        pronounce.positionData.values.angle = Math.PI;
        
        pronounce.styleData.values.color = Color.Barrel;
        pronounce.physicsData.values.flags |= PhysicsFlags.isTrapezoid;
        pronounce.physicsData.values.sides = 2;

        pronounce.tick = () => {
            const size = this.owner.physicsData.values.size;

            pronounce.physicsData.size = sizeRatio * size;
            pronounce.physicsData.width = widthRatio * size;
            pronounce.positionData.x = offsetRatio * size;
        }
    }
}
/** Weird spike addon. Based on the arrasio Original. */
class WeirdSpikeAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(3, 1.5, 0, 0.17);
        this.createGuard(3, 1.5, 0, -0.16);
    }
}
/** 2 Auto Turrets */
class Auto2Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(2);
    }
}
/** 20 Auto Turrets */
class Auto20Addon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createAutoTurrets(20);
    }
}

/** Centered Auto Rocket addon. */
class AutoRocketAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        const base = new AutoTurret(owner, {
            angle: 0,
            offset: 0,
            size: 40,
            width: 26.25,
            delay: 0,
            reload: 2,
            recoil: 0.75,
            isTrapezoid: true,
            trapezoidDirection: 3.141592653589793,
            addon: null,
            bullet: {
                type: "rocket",
                sizeRatio: 1,
                health: 2.5,
                damage: 0.5,
                speed: 0.3,
                scatterRate: 1,
                lifeLength: 0.75,
                absorbtionFactor: 0.1
            }
        });

        new LauncherAddon(base);

        base.turret.styleData.zIndex += 2;
    }
}
/** SPIESK addon. */
class SpieskAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(4, 1.3, 0, 0.17);
        this.createGuard(4, 1.3, Math.PI / 6, 0.17);
        this.createGuard(4, 1.3, 2 * Math.PI / 6, 0.17);
    }
}

/** DevAddon. */
class DevAddon extends Addon {
    public constructor(owner: BarrelBase) {
        super(owner);

        this.createGuard(9, 1.55, 0, .075);
        new AutoTurret(owner);
    }
}
/** Kronos addon */
class KronosAddon extends Addon {
    public turrets: MultiAutoBase[];

    public constructor(owner: BarrelBase) {
        super(owner);

        const rockets = BMultiAutoRocket.createBMultiAutoRockets(owner, 6);
        const turrets = MultiAutoTurret.createMultiAutoTurrets(owner, 12);

        this.turrets = [
            ...rockets,
            ...turrets
        ];

        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new MachineGun(owner);
    }
}
/** Ragnarock addon */
class RagnarockAddon extends Addon {
    public turrets: MultiAutoBase[];

    public constructor(owner: BarrelBase) {
        super(owner);

        const rockets = BMultiAutoRocket.createBMultiAutoRockets(owner, 12);
        const turrets = MultiAutoTurret.createMultiAutoTurrets(owner, 6);

        this.turrets = [
            ...rockets,
            ...turrets
        ];

        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new ShotgunTurret(owner);
        new MachineGun(owner);
    }
}
//imortal addon 1
class ChrAddon extends Addon {
    public turrets: ObjectEntity[]; // Or use a shared base class

    public constructor(owner: BarrelBase) {
        super(owner);

        // create all turrets
        this.turrets = BMultiAutoRocket.createBMultiAutoRockets(owner, 7);
        new DestroyerTurret(owner);
    }
}

/**
 * All addons in the game by their ID.
 */
export const AddonById: Record<addonId, typeof Addon | null> = {
    spike: SpikeAddon,
    dombase: DomBaseAddon,
    launcher: LauncherAddon,
    dompronounced: PronouncedDomAddon,
    auto5: Auto5Addon,
    auto3: Auto3Addon,
    autosmasher: AutoSmasherAddon,
    pronounced: PronouncedAddon,
    smasher: SmasherAddon,
    landmine: LandmineAddon,
    autoturret: AutoTurretAddon,
    defender: DefenderAddon,
    multiautoturret: MultiAutoTurretAddon,
    multiautorocket3: MultiAutoRocket3Addon,
    multiautorocket5: MultiAutoRocket5Addon,
    destroyerturret: DestroyerTurretAddon,
    minishotgun: MiniShotgunAddon,
    shotgun: ShotgunAddon,
    machinegun: MachineGunAddon,
    kronos: KronosAddon,
    ragnarock: RagnarockAddon,
    gunship: GunShipAddon,
    chr: ChrAddon,
    autosmashersrevenge: AutoSmashersrevengeAddon,
    // not part of diep
    weirdspike: WeirdSpikeAddon,
    auto7: Auto20Addon,
    autorocket: AutoRocketAddon,
    spiesk: SpieskAddon,
    auto2: DevAddon,
    shiny: ShinyAddon,
}