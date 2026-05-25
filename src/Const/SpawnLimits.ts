// SpawnLimits.ts
export enum SpawnCategory {
    BASIC_SHAPE = "basic_shape",
    BASIC_BOSS = "basic_boss",
    TERRESTRIAL = "terrestrial",
    CELESTIAL = "celestial",
    ETERNAL = "eternal",
    IMMORTAL = "immortal",
    DEFAULT = "default",
    BALL = "ball"
}

export const SPAWN_LIMITS: Record<SpawnCategory, number> = {
    [SpawnCategory.BASIC_SHAPE]: 1000,
    [SpawnCategory.BASIC_BOSS]: 30,
    [SpawnCategory.TERRESTRIAL]: 15,
    [SpawnCategory.CELESTIAL]: 10,
    [SpawnCategory.ETERNAL]: 5,
    [SpawnCategory.IMMORTAL]: 3,
    [SpawnCategory.DEFAULT]: 50,
    [SpawnCategory.BALL]: 1
};

export const SPAWN_COOLDOWN_MS = 2000;