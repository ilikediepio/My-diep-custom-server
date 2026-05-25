// SpawnCategoryResolver.ts
import { SpawnCategory } from "./SpawnLimits";
import AbstractShape from "../Entity/Shape/AbstractShape";
import AbstractBoss from "../Entity/Boss/AbstractBoss";
import Terrestrials from "../Entity/Misc/Terrestrials";
import Celestials from "../Entity/Misc/Celestials";
import Eternals from "../Entity/Misc/Eternals";
import Immortals from "../Entity/Misc/Immortals";
import Ball from "../Entity/Misc/Ball";

export function getSpawnCategory(EntityClass: any): SpawnCategory {
    if (EntityClass.prototype instanceof AbstractShape)
        return SpawnCategory.BASIC_SHAPE;

    if (EntityClass.prototype instanceof AbstractBoss)
        return SpawnCategory.BASIC_BOSS;

    if (EntityClass === Terrestrials)
        return SpawnCategory.TERRESTRIAL;

    if (EntityClass === Celestials)
        return SpawnCategory.CELESTIAL;

    if (EntityClass === Eternals)
        return SpawnCategory.ETERNAL;

    if (EntityClass === Immortals)
        return SpawnCategory.IMMORTAL;

    if (EntityClass === Ball)
        return SpawnCategory.BALL;

    return SpawnCategory.DEFAULT;
}