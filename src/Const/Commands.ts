import Client from "../Client";
import { AccessLevel, maxPlayerLevel } from "../config";
import AbstractBoss from "../Entity/Boss/AbstractBoss";
import Defender from "../Entity/Boss/Defender";
import SuperDefender from "../Entity/Boss/SuperDefender";
import FallenBooster from "../Entity/Boss/FallenBooster";
import FallenOverlord from "../Entity/Boss/FallenOverlord";
import Guardian from "../Entity/Boss/Guardian";
import SuperGuardian from "../Entity/Boss/SuperGuardian";
import Summoner from "../Entity/Boss/Summoner";
import LivingEntity from "../Entity/Live";
import ArenaCloser from "../Entity/Misc/ArenaCloser";
import FallenAC from "../Entity/Misc/Boss/FallenAC";
import ArenaCloserTurret from "../Entity/Misc/ArenaCloserTurret";
import ArassArenaCloser from "../Entity/Misc/ArassIoArenaCloser";
import NGMArenaCloser from "../Entity/Misc/NGMArenaCloser";
import FallenSpike from "../Entity/Misc/Boss/FallenSpike";
import Dominator from "../Entity/Misc/Dominator";
import ObjectEntity from "../Entity/Object";
import AbstractShape from "../Entity/Shape/AbstractShape";
import Crasher from "../Entity/Shape/Crasher";
import ShinyCrasher from "../Entity/Shape/ShinyCrasher";
import FallenCrasher from "../Entity/Boss/FallenCrasher";
import Pentagon from "../Entity/Shape/Pentagon";
import ShinyPentagon from "../Entity/Shape/ShinyPentagon";
import Square from "../Entity/Shape/Square";
import ShinySquare from "../Entity/Shape/ShinySquare";
import Triangle from "../Entity/Shape/Triangle";
import ShinyTriangle from "../Entity/Shape/ShinyTriangle";
import AlphaPentagon from "../Entity/Shape/AlphaPentagon";
import ShinyAlphaPentagon from "../Entity/Shape/ShinyAlphaPentagon";
import AutoTurret from "../Entity/Tank/AutoTurret";
import Bullet from "../Entity/Tank/Projectile/Bullet";
import TankBody from "../Entity/Tank/TankBody";
import { Entity, EntityStateFlags } from "../Native/Entity";
import { saveToVLog } from "../util";
import { CameraFlags, Stat, StatCount, StyleFlags, AdminFlags, Tank, ClientBound } from "./Enums";
import ClientCamera from "../Native/Camera";
import { getTankByName, getTankById } from "./TankDefinitions";
import FallenMegaTrapper from "../Entity/Misc/Boss/FallenMegaTrapper";
import SuperSummoner from "../Entity/Boss/SuperSummoner";
import ShinyArenaCloser from "../Entity/Misc/ShinyArenaCloser";
import Mothership from "../Entity/Misc/Mothership";
import Hexagon from "../Entity/Shape/Hexagon";
import ShinyHexagon from "../Entity/Shape/ShinyHexagon";
import GoldenHexagon from "../Entity/Shape/GoldHexagon";
import AlphaHexagon from "../Entity/Shape/AlphaHexagon";
import ShinyAlphaHexagon from "../Entity/Shape/ShinyAlphaHexagon";
import CrystalisedSquare from "../Entity/Shape/CrystalisedSquare";
import XPSquare from "../Entity/Shape/Level45Giver";
import Atmg from "../Entity/Misc/Atmg";
import Terrestrials from "../Entity/Misc/Terrestrials";
import Celestials from "../Entity/Misc/Celestials";
import Eternals from "../Entity/Misc/Eternals";
import Immortals from "../Entity/Misc/Immortals";
import Bot from "../Entity/Misc/Bot";
import SuperBot from "../Entity/Misc/SuperBot";
import FfaCloser from "../Entity/Misc/FfaCloser";
import ServerCloser from "../Entity/Misc/ServerCloser";
import BlackHole from "../Entity/Misc/BlackHole"
import SuperFallenBooster from "../Entity/Boss/SuperFallenBooster";
import SuperFallenOverlord from "../Entity/Boss/SuperFallenOverlord";
import UltraSmasher from "../Entity/Boss/UltraSmasher";
import Warden from "../Entity/Boss/Warden";
import ImmortalOctagon from "../Entity/Boss/ImmortalOctagon";
import Blaster from "../Entity/Boss/Blaster";
import Protector from "../Entity/Boss/Protector";
import ChaosBoss from "../Entity/Boss/ChaosBoss";
import GameServer from "../Game";
import ShinySummoner from "../Entity/Boss/ShinySummoner";
import ShinyGuardian from "../Entity/Boss/ShinyGuardian";
import ShinyDefender from "../Entity/Boss/ShinyDefender";
import ShinyFallenBooster from "../Entity/Boss/ShinyFallenBooster";
import ShinyFallenOverlord from "../Entity/Boss/ShinyFallenOverlord";
import ImmortalSnail from "../Entity/Misc/ImmortalSnail";
import Ball from "../Entity/Misc/Ball";
import DestroyerOfPlayers from "../Entity/Misc/DestroyerOfPlayers";
import FallenDodger from "../Entity/Boss/FallenDodger";
import EnragedFallenDodger from "../Entity/Boss/EnragedFallenDodger";
import xAura from "../Entity/Misc/0Aura";
import xBlackHole from "../Entity/Misc/0BlackHole";
import Wall from "../Entity/Misc/MazeWall";
import BounceWall from "../Entity/Misc/BounceWall";

import { SpawnCategory, SPAWN_LIMITS } from "./SpawnLimits";
import { getSpawnCategory } from "./SpawnCategoryResolver";
import { bannedClients } from "../index";


const RELATIVE_POS_REGEX = new RegExp(/~(-?\d+)?/);
const spawnCooldowns = new WeakMap<Client, Map<SpawnCategory, number>>();
const SPAWN_COOLDOWN_MS = 2000; // 2 second cooldown per category per player

// Tracks how many entities a player has spawned across servers (or per server)
const globalSpawnTracker = new Map<string, { count: number; lastTimestamp: number }>();

const MAX_SPAWN_PER_MINUTE = 30;      // max allowed spawns in the tracking window
const SPAWN_TRACK_WINDOW_MS = 60000;  // 1 minute window

function canSpawn(client: Client, category: SpawnCategory, count: number = 1): boolean {
    const now = Date.now();

    // --- Local server cooldowns (your existing logic) ---
    let catMap = spawnCooldowns.get(client);
    if (!catMap) {
        catMap = new Map();
        spawnCooldowns.set(client, catMap);
    }
const last = catMap.get(category) ?? 0;
if (now - last < SPAWN_COOLDOWN_MS) return false;
catMap.set(category, now);

    // --- Global spawn tracking ---
    const key = client.toString();  // Unique ID + name for logging
    const data = globalSpawnTracker.get(key) ?? { count: 0, lastTimestamp: now };

    if (now - data.lastTimestamp > SPAWN_TRACK_WINDOW_MS) {
        // Reset window
        globalSpawnTracker.set(key, { count, lastTimestamp: now });
    } else {
        const newCount = data.count + count;
        globalSpawnTracker.set(key, { count: newCount, lastTimestamp: data.lastTimestamp });
        if (newCount > MAX_SPAWN_PER_MINUTE) {
            console.warn(`[SPAWN ALERT] ${key} might be trying to overload the server: ${newCount} spawns in 1 min`);
            return false;
        }
    }

    return true;
}
function findClientsByName(game: GameServer, name: string): Client[] {
    const matches: Client[] = [];

    for (const c of game.clients) {
        const raw = c.toString();
        const match = raw.match(/name="([^"]+)"/);
        if (match && match[1] === name) {
            matches.push(c);
        }
    }

    return matches;
}

function listSuspiciousSpawners(): string[] {
    const now = Date.now();
    const flagged: string[] = [];

    globalSpawnTracker.forEach((data, key) => {
        if (now - data.lastTimestamp <= SPAWN_TRACK_WINDOW_MS && data.count > MAX_SPAWN_PER_MINUTE) {
            flagged.push(`${key} -> spawned ${data.count} entities in the last minute`);
        }
    });

    return flagged;
} // debug

function countCategory(game: GameServer, EntityClass: any): number {
    let count = 0;

    for (let id = 0; id <= game.entities.lastId; id++) {
        const e = game.entities.inner[id];
        if (!Entity.exists(e)) continue;

        if (e.constructor === EntityClass) {
            count++;
        }
    }

    return count;
}

export const enum CommandID {
    gameSetTank = "game_set_tank",
    gameSetLevel = "game_set_level",
    gameSetScore = "game_set_score",
    gameSetStat = "game_set_stat",
    gameSetStatMax = "game_set_stat_max",
    br = "br",
    dbr = "dbr",
    gameAddUpgradePoints = "game_add_upgrade_points",
    gameTP = "game_tp",
    gameTPPlayer = "game_tp_player",
    gameClaim = "game_claim",
    gameGodmode = "game_godmode",
    gameKnock = "game_knock",
    gamePass = "game_pass",
    adminSummon = "admin_summon",
    superAdminSummon = "super_admin_summon",
    adminKillAll = "admin_kill_all",
    superAdminKillAll = "super_admin_kill_all",
    adminKillEntity = "admin_kill_entity",
    adminCloseArena = "admin_close_arena",
    adminStartEvent1 = "admin_start_event1",
    adminStartEvent2 = "admin_start_event2",
    superAdminCloseServer = "super_admin_close_server",
    adminPromote = "admin_promote",
    adminDemote = "admin_demote",
    adminUDAll = "admin_UD_all",
    adminUnUDAll = "admin_unUD_all",
    adminDev = "admin_dev",
    adminInvis = "admin_invis",
    chatToggle = "chat_toggle",
    max = "max",
    shinyClaim = "shiny_claim",
    adminShinyAll = "admin_shiny_all",
    gameChangeTeam = "game_change_team",
    adminKillPlayer = "admin_kill_player",
    gameSetTankPlayer = "game_set_tank_player",
    gameSetLevelPlayer = "game_set_level_player",
    gameSetStatPlayer = "game_set_stat_player",
    maxPlayer = "max_player",
    adminDemotePlayer = "admin_demote_player",
    adminPromotePlayer = "admin_promote_player",
    adminShinyPlayer = "admin_shiny_player",
    gameChangeTeamPlayer = "game_change_team_player",
    eventClaim = "event_claim",
    spectate = "spectate",
    whisper = "whisper",
    gameSetTankAll = "game_set_tank_all",
    adminWhois = "admin_whois",
    adminPlayerlist = "admin_playerlist",
    adminBanlist = "admin_banlist",
    adminKick = "admin_kick",
    fastKick = "fast_kick",
}

export interface CommandDefinition {
    id: CommandID,
    usage?: string,
    description?: string,
    permissionLevel: AccessLevel,
    isCheat: boolean
}

export interface CommandCallback {
    (client: Client, ...args: string[]): string | void 
}

export const commandDefinitions = {
    game_set_tank: {
        id: CommandID.gameSetTank,
        usage: "[tank]",
        description: "Changes your tank to the given class",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    game_set_level: {
        id: CommandID.gameSetLevel,
        usage: "[level]",
        description: "Changes your level to the given whole number",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    admin_promote: {
        id: CommandID.adminPromote,
        usage: "[access level]",
        description: "Changes the access level by 1",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_demote: {
        id: CommandID.adminDemote,
        usage: "[access level]",
        description: "Changes the access level by -1",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_UD_all: {
        id: CommandID.adminUDAll,
        usage: "[access level]",
        description: "Sets the access level to -1",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_unUD_all: {
        id: CommandID.adminUnUDAll,
        usage: "[access level]",
        description: "Sets the access level to 2 (default)",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_dev: {
        id: CommandID.adminDev,
        usage: "[access level]",
        description: "Sets the access level to 3 (dev)",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_invis: {
        id: CommandID.adminInvis,
        usage: "[toggle on/off]",
        description: "Makes the player totaly invis",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    game_set_score: {
        id: CommandID.gameSetScore,
        usage: "[score]",
        description: "Changes your score to the given whole number",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    game_set_stat: {
        id: CommandID.gameSetStat,
        usage: "[stat num] [points]",
        description: "Set the value of one of your statuses. Values can be greater than the capacity. you can't do negatives and anything above 1,000,000,000 is capped back to 1 bill",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    game_set_stat_max: {
        id: CommandID.gameSetStatMax,
        usage: "[stat num] [max]",
        description: "Set the max value of one of your statuses. [stat num] is equivalent to the number that appears in the UI",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    br: {
        id: CommandID.br,
        usage: "[message]",
        description: "Broadcasts a message to the whole server",
        permissionLevel: AccessLevel.PublicAccess,
        isCheat: false,
        execute(client: Client, game: GameServer, ...args: string[]) {
        const message = args.join(" ").trim();
        if (!message) return;
        },
    },
    whisper: {
        id: CommandID.whisper,
        usage: "[player name] [message]",
        description: "Broadcasts a message to the selected player",
        permissionLevel: AccessLevel.PublicAccess,
        isCheat: false,
        execute(client: Client, game: GameServer, ...args: string[]) {
        const message = args.join(" ").trim();
        if (!message) return;
        },
    },
    dbr: {
        id: CommandID.dbr,
        usage: "[message]",
        description: "Broadcasts a message to the whole server, only the dev can use it",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false,
        execute(client: Client, game: GameServer, ...args: string[]) {
        const message = args.join(" ").trim();
        if (!message) return;
        },
    },
    chat_toggle: {
        id: CommandID.chatToggle,
        usage: "[enable/disable chat]",
        description: "alows regular mesages to be sent or not",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    game_add_upgrade_points: {
        id: CommandID.gameAddUpgradePoints,
        usage: "[points]",
        description: "Add upgrade points",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    max: {
        id: CommandID.max,
        usage: "[value]",
        description: "Sets all stats to the number provided or defaults to 20",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    game_tp: {
        id: CommandID.gameTP,
        usage: "[x] [y]",
        description: "Teleports you to the given position",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    game_tp_player: {
        id: CommandID.gameTPPlayer,
        usage: "[player name] [x] [y]",
        description: "Teleports another player to the given position",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    game_claim: {
        id: CommandID.gameClaim,
        usage: "[entityName]",
        description: "Attempts claiming an entity of the given type",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: false
    },
    game_godmode: {
        id: CommandID.gameGodmode,
        usage: "[?value]",
        description: "Set the godemode. Toggles if [value] is not specified. also, you can still die to kill all",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    game_pass: {
        id: CommandID.gamePass,
        usage: "[?value]",
        description: "Disables collision for players. Toggles if [value] is not specified.",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    game_knock: {
        id: CommandID.gameKnock,
        usage: "[?value]",
        description: "Disables knockback for players. Toggles if [value] is not specified.",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: true
    },
    admin_summon: {
        id: CommandID.adminSummon,
        usage: "[entityName] [?count] [?x] [?y]",
        description: "Spawns entities at a certain location",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: false
    },
    super_admin_summon: {
        id: CommandID.superAdminSummon,
        usage: "[entityName] [?count] [?x] [?y]",
        description: "Spawns entities at a certain location",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_kill_all: {
        id: CommandID.adminKillAll,
        description: "Kills all entities in the arena apart from a few",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: false
    },
        super_admin_kill_all: {
        id: CommandID.superAdminKillAll,
        description: "Kills all entities in the arena",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_kill_entity: {
        id: CommandID.adminKillEntity,
        usage: "[entityName]",
        description: "Kills all entities of the given type (might include self)  apart from a few",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_close_arena: {
        id: CommandID.adminCloseArena,
        description: "Closes the current arena",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_start_event1: {
        id: CommandID.adminStartEvent1,
        description: "starts an event, players can not respawn",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_start_event2: {
        id: CommandID.adminStartEvent2,
        description: "starts an event, players can respawn",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    super_admin_close_server: {
        id: CommandID.superAdminCloseServer,
        description: "Closes the current server",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    shiny_claim: {
        id: CommandID.shinyClaim,
        usage: "[password]",
        description: "Attempts to set your tank to shiny or shiny+, needs a password",
        permissionLevel: AccessLevel.BetaAccess,
        isCheat: false
    },
    admin_shiny_all: {
        id: CommandID.adminShinyAll,
        description: "Sets everyones tank to shiny",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    game_change_team: {
        id: CommandID.gameChangeTeam,
        description: "Changes your team to shape team",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    admin_kill_player: {
        id: CommandID.adminKillPlayer,
        usage: "[player name]",
        description: "Kills a certain player",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    game_set_tank_player: {
        id: CommandID.gameSetTankPlayer,
        usage: "[player name] [tank]",
        description: "Changes another player's tank to the given class",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    game_set_tank_all: {
        id: CommandID.gameSetTankAll,
        usage: "[tank]",
        description: "Changes every player's tank to the given class",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    game_set_level_player: {
        id: CommandID.gameSetLevelPlayer,
        usage: "[player name] [level]",
        description: "Changes another player's level to the given whole number",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    game_set_stat_player: {
        id: CommandID.gameSetStatPlayer,
        usage: "[player name] [stat num] [points]",
        description: "Set the value of another player's statuses. Values can be greater than the capacity. you can't do negatives and anything above 1,000,000,000 is capped back to 1 bill",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    max_player: {
        id: CommandID.maxPlayer,
        usage: "[name] [value]",
        description: "Sets all stats of another player to the number provided or defaults to 20",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    admin_demote_player: {
        id: CommandID.adminDemotePlayer,
        usage: "[player name]",
        description: "Changes the access level by -1",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    admin_promote_player: {
        id: CommandID.adminPromotePlayer,
        usage: "[player name]",
        description: "Changes the access level by 1",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    admin_shiny_player: {
        id: CommandID.adminShinyPlayer,
        usage: "[player name]",
        description: "Sets someone's tank to shiny",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    game_change_team_player: {
        id: CommandID.gameChangeTeamPlayer,
        description: "Changes someone's team to shape team",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: true
    },
    event_claim: {
        id: CommandID.eventClaim,
        usage: "[password]",
        description: "sets your rank to level 1",
        permissionLevel: AccessLevel.NoAccess,
        isCheat: true
    },
    spectate: {
        id: CommandID.spectate,
        description: "sets your tank to spectator, though you need level 1 to use this",
        permissionLevel: AccessLevel.kReserved,
        isCheat: true
    },
    admin_whois: {
        id: CommandID.adminWhois,
        usage: "[Player name]",
        description: "shows the IP of a player",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_playerlist: {
        id: CommandID.adminPlayerlist,
        usage: "[]",
        description: "shows the IP of all players in the console",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_banlist: {
        id: CommandID.adminBanlist,
        usage: "[]",
        description: "shows the IP of all players who have been banned in the console",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    admin_kick: {
        id: CommandID.adminKick,
        usage: "[player IP]",
        description: "Kicks a player from the game",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },
    fast_kick: {
        id: CommandID.fastKick,
        usage: "[player name]",
        description: "Quickly kicks a player from the game",
        permissionLevel: AccessLevel.FullAccess,
        isCheat: false
    },

} as Record<CommandID, CommandDefinition>

export const commandCallbacks = {
    game_set_tank: (client: Client, tankNameArg: string) => {
        const tankDef = getTankByName(tankNameArg);
        const player = client.camera?.cameraData.player;
        if (!tankDef || !Entity.exists(player) || !(player instanceof TankBody)) return;
        if (tankDef.flags.devOnly && client.accessLevel !== AccessLevel.FullAccess) return;
        player.setTank(tankDef.id);
    },
    game_set_level: (client: Client, levelArg: string) => {
        const level = parseInt(levelArg);
        const player = client.camera?.cameraData.player;
        if (isNaN(level) || !Entity.exists(player) || !(player instanceof TankBody)) return;
        const finalLevel = client.accessLevel == AccessLevel.BetaAccess ? level : Math.min(maxPlayerLevel, level);
        client.camera?.setLevel(finalLevel);
    },
    game_set_score: (client: Client, scoreArg: string) => {
        const score = parseInt(scoreArg);
        const camera = client.camera?.cameraData;
        const player = client.camera?.cameraData.player;
        if (isNaN(score) || score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER || !Entity.exists(player) || !(player instanceof TankBody) || !camera) return;
        camera.score = score;
    },
br: (client: Client, ...args: string[]) => {
    if (!client.chatToggled) return;

    // ======= Cooldown check =======
    const now = Date.now();
    const cooldown = 3000;
    const lastChatTime = (client as any).lastChatTime ?? 0;
    if (now - lastChatTime < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastChatTime)) / 1000);
        client.notify(
            `Please wait ${remaining}s before sending another message.`,
            0xFF0000,
            2000
        );
        return;
    }
    (client as any).lastChatTime = now;

    // ======= Build message =======
    const message = args.join(" ").trim();
    if (!message) return;

    let hadBadWord = false;
    let suspiciousCount = (client as any).suspiciousCount ?? 0;

    // =========================
    // Chat filter
    // =========================
    const badWords = ["arse", "arsehead", "arsehole", "ass", "asshole", "bastard", "bitch", "bollocks", "brotherfucker", "bugger", "bullshit", "brotherfucker", "childfucker", "child-fucker", "cock", "cocksucker", "cock-sucker", "crap", "cunt", "dammit", "damned", "dick", "dick-head", "dickhead", "dumb-ass", "dumbass", "dyke", "faggot", "fag", "father-fucker", "fatherfucker", "fuck", "fucked", "fucker", "fucking", "goddammit", "goddamn", "goddamned", "goddamnit", "godsdamn", "horseshit", "jack-ass", "jackass", "kike", "mother-fucker", "motherfucker", "nigga", "nigra", "nigger", "pigfucker", "piss", "prick", "pussy", "shit", "shite", "sisterfuck", "sister-fuck", "sisterfucker", "sister-fucker", "slut", "spastic", "tranny", "twat", "wanker", "fanny", "fkuk", "fkuc", "fukc", "fock", "fok"]; // please cover up if ever showing code!

    const leetMap: Record<string, string> = {
        "!":"i","1":"i","(": "i",")":"i","[":"i","]":"i","/":"i","\\":"i",
        "3":"e","4":"a","@":"a","$":"s","5":"s","7":"t","+":"t","0":"o","*":"o"
    };

    const normalizeWord = (word: string): string => {
        let normalized = "";
        for (const char of word.toLowerCase()) {
            normalized += leetMap[char] ?? char;
        }
        normalized = normalized.replace(/[^a-z0-9]/g, "");
        normalized = normalized.replace(/(.)\1+/g, "$1"); // collapse repeated letters
        return normalized;
    };

    // Suspicion / typo checks
    const isSwappedLetters = (word: string, bad: string): boolean => {
        if (word.length !== bad.length) return false;
        const diff: number[] = [];
        for (let i = 0; i < word.length; i++) if (word[i] !== bad[i]) diff.push(i);
        if (diff.length !== 2) return false;
        const [a, b] = diff;
        return word[a] === bad[b] && word[b] === bad[a];
    };

    const isOneLetterMissing = (word: string, bad: string): boolean => {
        if (Math.abs(word.length - bad.length) !== 1) return false;
        let i = 0, j = 0, differences = 0;
        while (i < word.length && j < bad.length) {
            if (word[i] !== bad[j]) {
                differences++;
                if (differences > 1) return false;
                if (word.length > bad.length) i++; else j++;
            } else { i++; j++; }
        }
        return true;
    };

    const isOneLetterReplaced = (word: string, bad: string): boolean => {
        if (word.length !== bad.length) return false;
        let differences = 0;
        for (let i = 0; i < word.length; i++) {
            if (word[i] !== bad[i]) differences++;
            if (differences > 1) return false;
        }
        return differences === 1;
    };

    const rawWords = message.split(/\s+/);

            // ======= Whitelist certain words =======
const whitelist = ["fork", "asa", "shirt", "bench", "ash", "deck", "cork", "ok", "this"];

for (const rawWord of rawWords) {
    const word = normalizeWord(rawWord);
    if (!word) continue;

    // ======= Skip whitelisted words entirely =======
        // Skip everything for whitelist
    if (whitelist.includes(word)) continue;

    for (const bad of badWords) {
        const badNorm = normalizeWord(bad);

        // Exact match ? MUTE
        if (word === badNorm) {
            hadBadWord = true;
            break;
        }

        // Suspicion checks
        let susChecks = 0;
        if (word.length > 2 && isSwappedLetters(word, badNorm)) susChecks++;
        if (isOneLetterMissing(word, badNorm)) susChecks++;
        if (isOneLetterReplaced(word, badNorm)) susChecks++;

        if (susChecks === 1 && word.length < badNorm.length) {
            hadBadWord = true;
            break;
        } else if (susChecks > 0) {
            suspiciousCount++;
            console.log(`? Suspicious word from ${client.toString()}: "${rawWord}" (close to "${bad}")`);
            client.notify(`? Warning: Suspicious language detected (${suspiciousCount}/3)`, 0xFFA500, 3000);
        }
    }

    if (hadBadWord) break;
}
    (client as any).suspiciousCount = suspiciousCount;

    // ======= Enforcement =======
    if (hadBadWord) {
        client.accessLevel = AccessLevel.NoAccess;
        console.log(`Client ${client.toString()} used a blocked word and has been muted.`);
        return;
    }

    if (suspiciousCount >= 3) {
        client.accessLevel = AccessLevel.NoAccess;
        console.log(`Client ${client.toString()} muted after 3 suspicious words.`);
        client.notify("You have been muted for repeated suspicious language.", 0xFF0000, 4000);
        return;
    }

    // ======= Send broadcast =======
    const raw = client.toString();
    const match = raw.match(/name="([^"]+)"/);
    const senderName = match?.[1] ?? "Player";

    const base = 2000;
    const max = 10000;
    const growth = 2500;
    const lengthFactor = Math.log2(message.length + 1);
    const duration = Math.min(max, Math.max(base, base + growth * lengthFactor));

    client.game?.broadcast()
        .u8(ClientBound.Notification)
        .stringNT(`${senderName}: ${message}`)
        .u32(0x404040)
        .float(duration)
        .stringNT("")
        .send();

    console.log(`${client.toString()} broadcasted: ${message}`);
},
dbr: (client: Client, ...args: string[]) => {
    // ======= Build message =======
    const message = args.join(" ").trim();
    if (!message) return;

    // ======= Get sender name =======
    const raw = client.toString();
    const match = raw.match(/name="([^"]+)"/);
    const senderName = match?.[1] ?? "Developer";

    // ======= Duration scaling (same as br) =======
    const base = 2000;
    const max = 10000;
    const growth = 2500;
    const lengthFactor = Math.log2(message.length + 1);
    const duration = Math.min(max, Math.max(base, base + growth * lengthFactor));

    // ======= Send broadcast (BLUE) =======
    client.game?.broadcast()
        .u8(ClientBound.Notification)
        .stringNT(`[DEV] ${senderName}: ${message}`)
        .u32(0x3399FF)
        .float(duration)
        .stringNT("")
        .send();

    console.log(`[DEV BROADCAST] ${client.toString()}: ${message}`);
},
whisper: (client: Client, targetName: string, ...args: string[]) => {
    if (!client.chatToggled) return;

    // ======= Cooldown check =======
    const now = Date.now();
    const cooldown = 3000; // 3 seconds

    const isOneLetterMissing = (word: string, bad: string): boolean => {
    if (Math.abs(word.length - bad.length) !== 1) return false;

    let i = 0;
    let j = 0;
    let differences = 0;

    while (i < word.length && j < bad.length) {
        if (word[i] !== bad[j]) {
            differences++;
            if (differences > 1) return false;

            if (word.length > bad.length) i++;
            else j++;
        } else {
            i++;
            j++;
        }
    }

    return true;
};
    if ((client as any).lastChatTime && now - (client as any).lastChatTime < cooldown) {
        const remaining = Math.ceil((cooldown - (now - (client as any).lastChatTime)) / 1000);
        client.notify(`Please wait ${remaining}s before sending another message.`, 0xFF0000, 2000);
        return;
    }

    // Update the timestamp
    (client as any).lastChatTime = now;

    // ======= Build message =======
    let message = args.join(" ").trim();
    if (!message || !/[a-zA-Z0-9\W]/.test(message)) return;

    // =========================
    // Chat filter: replace bad words
    // =========================
    const badWords = ["arse", "arsehead", "arsehole", "ass", "asshole", "bastard", "bitch", "bollocks", "brotherfucker", "bugger", "bullshit", "brotherfucker", "childfucker", "child-fucker", "cock", "cocksucker", "cock-sucker", "crap", "cunt", "dammit", "damned", "dick", "dick-head", "dickhead", "dumb-ass", "dumbass", "dyke", "faggot", "fag", "father-fucker", "fatherfucker", "fuck", "fucked", "fucker", "fucking", "goddammit", "goddamn", "goddamned", "goddamnit", "godsdamn", "horseshit", "jack-ass", "jackass", "kike", "mother-fucker", "motherfucker", "nigga", "nigra", "nigger", "pigfucker", "piss", "prick", "pussy", "shit", "shite", "sisterfuck", "sister-fuck", "sisterfucker", "sister-fucker", "slut", "spastic", "tranny", "twat", "wanker", "fanny"]; // <-- your list here
// Defined leet replacements
const leetMap: Record<string, string> = {
    "!": "i",
    "1": "i",
    "(": "i",
    ")": "i",
    "[": "i",
    "]": "i",
    "/": "i",
    "\\": "i",
    "3": "e",
    "4": "a",
    "@": "a",
    "$": "s",
    "5": "s",
    "7": "t",
    "+": "t",
    "0": "o",
    "*": "o"
};

    function normalizeMessage(msg: string): string {
        let normalized = "";
        for (const char of msg) {
            const lower = char.toLowerCase();
            normalized += leetMap[lower] || lower;
        }
        return normalized;
    }

    let hadBadWord = false;
    let suspicious = false;

message = message.replace(/[\w!@#$%^&*()\\[\]\/+]+/g, (word) => {
    const normalizedWord = normalizeMessage(word);
    for (const bad of badWords) {
        const normalizedBad = normalizeMessage(bad);
        if (normalizedWord.includes(normalizedBad)) {
            hadBadWord = true;
            return "# (player said a bad word)";
        }
        if (isOneLetterMissing(normalizedWord, normalizedBad)) { // here
            suspicious = true;
        }
    }
    return word;
});

    if (hadBadWord) {
        client.accessLevel = AccessLevel.NoAccess;
        console.log(`Client ${client.toString()} used a bad word and has been muted.`);
        return;
    }

    // ======= Find targets =======
    const game = client.game;
    if (!game) return;

    const getName = (c: Client) => {
        const raw = c.toString();
        const match = raw.match(/name="([^"]+)"/);
        return match ? match[1] : "";
    };

    const targets: Client[] = [];
    for (const c of game.clients) {
        if (getName(c) === targetName) targets.push(c);
    }
    if (targets.length === 0) return;

    const raw = client.toString();
    const match = raw.match(/name="([^"]+)"/);
    const senderName = match ? match[1] : "Player";

    const base = 2000, max = 10000, growth = 2500;
    const lengthFactor = Math.log2(message.length + 1);
    const duration = Math.min(max, Math.max(base, base + growth * lengthFactor));

    // ======= Send to targets =======
    for (const target of targets) {
        target.notify(`${senderName} whispers: ${message}`, 0x404040, duration);
    }

    // ======= Show confirmation to sender =======
    client.notify(`You whispered to ${targetName}: ${message}`, 0x404040, duration);
    console.log(`${client.toString()} whispered to ${targetName}: ${message}`);
},
game_set_stat: (client: Client, statIdArg: string, statPointsArg: string) => {
    const statId = StatCount - parseInt(statIdArg);
    let statPoints = parseInt(statPointsArg);
    const camera = client.camera?.cameraData;
    const player = client.camera?.cameraData.player;

    if (
        statId < 0 ||
        statId >= StatCount ||
        isNaN(statId) ||
        isNaN(statPoints) ||
        !Entity.exists(player) ||
        !(player instanceof TankBody) ||
        !camera
    ) return;

    // Clamp statPoints between 0 and 1,000,000,000
    statPoints = Math.max(0, Math.min(1000000000, statPoints));
    camera.statLevels[statId as Stat] = statPoints;
},
    game_set_stat_max: (client: Client, statIdArg: string, statMaxArg: string) => {
        const statId = StatCount - parseInt(statIdArg);
        const statMax = parseInt(statMaxArg);
        const camera = client.camera?.cameraData;
        const player = client.camera?.cameraData.player;
        if (statId < 0 || statId >= StatCount || isNaN(statId) || isNaN(statMax) || !Entity.exists(player) || !(player instanceof TankBody) || !camera) return;
        const clampedStatMax = Math.max(statMax, 0);
        camera.statLimits[statId as Stat] = clampedStatMax;
        camera.statLevels[statId as Stat] = Math.min(camera.statLevels[statId as Stat], clampedStatMax);
},
    game_add_upgrade_points: (client: Client, pointsArg: string) => {
        const points = parseInt(pointsArg);
        const camera = client.camera?.cameraData;
        const player = client.camera?.cameraData.player;
        if (isNaN(points) || points > Number.MAX_SAFE_INTEGER || points < Number.MIN_SAFE_INTEGER || !Entity.exists(player) || !(player instanceof TankBody) || !camera) return;
        camera.statsAvailable += points;
    },
max: (client: Client, slotsArg?: string) => {
    const camera = client.camera?.cameraData;
    const player = client.camera?.cameraData.player;

    if (
        !Entity.exists(player) ||
        !(player instanceof TankBody) ||
        !camera
    ) return;

    // Parse argument or default to 20
    let slots = slotsArg ? parseInt(slotsArg, 10) : 20;
    if (isNaN(slots)) return;

    // Absolute safety clamp (same style as your other commands)
    slots = Math.max(0, Math.min(1000000000, slots));

    // UI slot cap (visual only)
    const slotLimit = Math.min(slots, 20);

    for (let statId = 0; statId < 8; statId++) {

        let limit = slotLimit; // visual bars (max 20)
        let level = slots;     // actual stat power

        // Bullet Speed hard cap
        if (statId === Stat.BulletSpeed) {
            level = Math.min(level, 50);
        }

        // Movement Speed hard cap
        if (statId === Stat.MovementSpeed) {
            level = Math.min(level, 30);
        }

        // Final safety clamp (but DO NOT clamp to limit)
        level = Math.max(0, Math.min(1000000000, level));

        camera.statLimits[statId as Stat] = limit;
        camera.statLevels[statId as Stat] = level;
    }
},
admin_promote: (client: Client) => {
    const game = client.game;
    if (!game) return; // safety check

    for (const client of game.clients) {
    switch (client.accessLevel) {
        case AccessLevel.NoAccess:
            client.accessLevel = AccessLevel.NoAccess; // for unUD command
            break;
        case AccessLevel.PublicAccess:
            client.accessLevel = AccessLevel.kReserved;
            break;
        case AccessLevel.kReserved:
            client.accessLevel = AccessLevel.BetaAccess;
            break;
        case AccessLevel.BetaAccess:
            client.accessLevel = AccessLevel.FullAccess;
            break;
        case AccessLevel.FullAccess:
            break; // already max
        }
    }
  console.log(`A player has been Promoted!`);

  client.game?.broadcast()
    .u8(ClientBound.Notification)
    .stringNT(`You have been Promoted!`)
    .u32(0x008000)
    .float(10000)
    .stringNT("")
    .send();
},
admin_demote: (client: Client) => {
    const game = client.game;
    if (!game) return; // safety check

    for (const client of game.clients) {
    switch (client.accessLevel) {
        case AccessLevel.NoAccess:
            client.accessLevel = AccessLevel.NoAccess; // already -1
            break;
        case AccessLevel.PublicAccess:
            client.accessLevel = AccessLevel.PublicAccess; // for UD command
            break;
        case AccessLevel.kReserved:
            client.accessLevel = AccessLevel.PublicAccess;
            break;
        case AccessLevel.BetaAccess:
            client.accessLevel = AccessLevel.kReserved;
            break;
        case AccessLevel.FullAccess:
            client.accessLevel = AccessLevel.BetaAccess;
            break;
        }
    }
  console.log(`A player has been demoted!`);

  client.game?.broadcast()
    .u8(ClientBound.Notification)
    .stringNT(`You have been demoted!`)
    .u32(0xFF0000)
    .float(10000)
    .stringNT("")
    .send();
},
admin_UD_all: (client: Client) => {
    const game = client.game;
    if (!game) return; // safety check

    for (const client of game.clients) {
    switch (client.accessLevel) {
        case AccessLevel.NoAccess:
            client.accessLevel = AccessLevel.NoAccess;
            break;
        case AccessLevel.PublicAccess:
            client.accessLevel = AccessLevel.NoAccess;
            break;
        case AccessLevel.kReserved:
            client.accessLevel = AccessLevel.NoAccess;
            break;
        case AccessLevel.BetaAccess:
            client.accessLevel = AccessLevel.NoAccess;
            break;
        case AccessLevel.FullAccess:
            break; // can't mass demote the dev
        }
    }
  console.log(`everyone has been set to -1!`);

  client.game?.broadcast()
    .u8(ClientBound.Notification)
    .stringNT(`everyone has been set to access -1!`)
    .u32(0xFF0000)
    .float(10000)
    .stringNT("")
    .send();
},

admin_unUD_all: (client: Client) => {
    const game = client.game;
    if (!game) return; // safety check

    for (const client of game.clients) {
    switch (client.accessLevel) {
        case AccessLevel.NoAccess:
            client.accessLevel = AccessLevel.PublicAccess; // only unUD
            break;
        case AccessLevel.PublicAccess:
            break;
        case AccessLevel.kReserved:
            break;
        case AccessLevel.BetaAccess:
            break;
        case AccessLevel.FullAccess:
            break;
        }
    }
  console.log(`everyone's AccessLevel has been reset!`);

  client.game?.broadcast()
    .u8(ClientBound.Notification)
    .stringNT(`everyone's AccessLevel has been reset!`)
    .u32(0x008000)
    .float(10000)
    .stringNT("")
    .send();
},
admin_dev: (client: Client) => {
    const game = client.game;
    if (!game) return; // safety check

    for (const client of game.clients) {
    switch (client.accessLevel) {
        case AccessLevel.NoAccess:
            client.accessLevel = AccessLevel.PublicAccess;
            break;
        case AccessLevel.PublicAccess:
            client.accessLevel = AccessLevel.FullAccess;
            break;
        case AccessLevel.kReserved:
            client.accessLevel = AccessLevel.FullAccess;
            break;
        case AccessLevel.BetaAccess:
            client.accessLevel = AccessLevel.FullAccess;
            break;
        case AccessLevel.FullAccess:
            break; // already max
        }
    }
  console.log(`everyone is now a dev!`);

  client.game?.broadcast()
    .u8(ClientBound.Notification)
    .stringNT(`You are now a developer!`)
    .u32(0x008000)
    .float(10000)
    .stringNT("")
    .send();
},
    game_tp: (client: Client, xArg: string, yArg: string) => {
        const player = client.camera?.cameraData.player;
        if (!Entity.exists(player) || !(player instanceof ObjectEntity)) return;
const x = xArg.match(RELATIVE_POS_REGEX)
    ? player.positionData.x + parseInt(xArg.slice(1) || "0", 10)
    : parseInt(xArg, 10);

const y = yArg.match(RELATIVE_POS_REGEX)
    ? player.positionData.y + parseInt(yArg.slice(1) || "0", 10)
    : parseInt(yArg, 10);

if (isNaN(x) || isNaN(y)) return;
player.positionData.x = x;
player.positionData.y = y;
        player.setVelocity(0, 0);
        player.entityState |= EntityStateFlags.needsCreate | EntityStateFlags.needsDelete;
    },
game_tp_player: (
    client: Client,
    targetName: string,
    xArg: string,
    yArg: string
) => {
    const game = client.game;
    if (!game) return;

    const getName = (c: Client): string => {
        const raw = c.toString();
        const match = raw.match(/name="([^"]+)"/);
        return match ? match[1] : "";
    };

    // Collect all matching players
    const targets: Client[] = [];
    for (const c of game.clients) {
        if (getName(c) === targetName) {
            targets.push(c);
        }
    }

    if (targets.length === 0) return;

    for (const target of targets) {
        const player = target.camera?.cameraData.player;

        if (!Entity.exists(player) || !(player instanceof ObjectEntity)) {
            continue; // don't stop other targets
        }

        const baseX = player.positionData.x;
        const baseY = player.positionData.y;

        const x = xArg.match(RELATIVE_POS_REGEX)
            ? baseX + parseInt(xArg.slice(1) || "0", 10)
            : parseInt(xArg, 10);

        const y = yArg.match(RELATIVE_POS_REGEX)
            ? baseY + parseInt(yArg.slice(1) || "0", 10)
            : parseInt(yArg, 10);

        if (isNaN(x) || isNaN(y)) {
            continue;
        }

        player.positionData.x = x;
        player.positionData.y = y;
        player.setVelocity(0, 0);

        player.entityState |=
            EntityStateFlags.needsCreate |
            EntityStateFlags.needsDelete;

        console.log(
            `${targetName} was teleported to (${x}, ${y}) by ${client.toString()}`
        );
    }
},
    game_claim: (client: Client, entityArg: string) => {
        const TEntity = new Map([
          ["ArenaCloser", ArenaCloser],
          ["Dominator", Dominator],
          ["Shape", AbstractShape],
          ["Boss", AbstractBoss],
          ["AutoTurret", AutoTurret]
        ] as [string, typeof ObjectEntity][]).get(entityArg)

        if (!TEntity || !client.camera?.game.entities.AIs.length) return;

        const AIs = Array.from(client.camera.game.entities.AIs);
        for (let i = 0; i < AIs.length; ++i) {
            if (!(AIs[i].owner instanceof TEntity)) continue;
            client.possess(AIs[i]);
            return;
        }
    },
    game_godmode: (client: Client, activeArg?: string) => {
        const player = client.camera?.cameraData.player;
        if (!Entity.exists(player) || !(player instanceof TankBody)) return;

        switch (activeArg) {
            case "on":
                player.setInvulnerability(true);
                break;
            case "off":
                player.setInvulnerability(false);
                break;
            default:
                player.setInvulnerability(!player.isInvulnerable);
                break;
        }

        const godmodeState = player.isInvulnerable ? "ON" : "OFF";
        return `God mode: ${godmodeState}`;
    },
    game_pass: (client: Client, activeArg?: string) => {
    const player = client.camera?.cameraData.player;
    if (!Entity.exists(player) || !(player instanceof TankBody)) return;

    if (typeof player.PassThroughBullets !== 'boolean') {
        player.PassThroughBullets = false;
    }

    switch (activeArg) {
        case "on":
            player.PassThroughBullets = true;
            break;
        case "off":
            player.PassThroughBullets = false;
            break;
        default:
            // Toggle safely
            player.PassThroughBullets = !player.PassThroughBullets;
            break;
    }

    const passState = player.PassThroughBullets ? "ON" : "OFF";
    return `Pass Through Objects: ${passState}`;
},

game_knock: (client: Client, activeArg?: string) => {
    const player = client.camera?.cameraData.player;
    if (!Entity.exists(player) || !(player instanceof TankBody)) return;

    if (typeof player.NoKnockback !== 'boolean') {
        player.NoKnockback = false;
    }

    switch (activeArg) {
        case "on":
            player.NoKnockback = true;
            break;
        case "off":
            player.NoKnockback = false;
            break;
        default:
            // Toggle safely
            player.NoKnockback = !player.NoKnockback;
            break;
    }

    const passState = player.NoKnockback ? "ON" : "OFF";
    return `Disabled Knockback: ${passState}`;
},

chat_toggle: (client: Client) => {
  const game = client.game;
  if (!game) return; // safety check

  for (const client of game.clients) {
    // Initialize chatToggled if undefined
    if (typeof client.chatToggled !== 'boolean') {
      client.chatToggled = false;
    }

    // Toggle chatToggled boolean
    client.chatToggled = !client.chatToggled;
  }
    console.log(`can chat has been set to: ${client.chatToggled}`);

  client.game?.broadcast()
    .u8(ClientBound.Notification)
    .stringNT(`can chat has been set to: ${client.chatToggled}`)
    .u32(0xFF8C00)
    .float(10000)
    .stringNT("")
    .send();
},

admin_whois: (client: Client, ...args: string[]) => {
    const game = client.game;
    if (!game) return;

    const targetName = args.join(" ").trim().toLowerCase();
    if (!targetName) return;

    for (const c of game.clients) {
        const match = c.toString().match(/name="([^"]+)"/);
        const name = match?.[1]?.trim().toLowerCase();

        console.log("WHOIS CHECK:", name);

        if (name === targetName) {
            const ip = c.ws?.getUserData().ipAddress;

            client.notify(`IP of ${match?.[1]}: ${ip}`, 0x000000, 5000);
            console.log(`${match?.[1]} IP: ${ip}`);
            return;
        }
    }

    client.notify("Player not found");
},

admin_playerlist: (client: Client) => {
    const game = client.game;
    if (!game) return;

    for (const c of game.clients) {
        const name = c.camera?.cameraData?.player?.nameData?.values.name || "Unnamed";
        const ip = c.ws?.getUserData().ipAddress;

        console.log(`${name} | ${ip}`);
    }

    client.notify("Player list printed to console");
},

admin_banlist: (client: Client) => {
    const now = Date.now();

    if (bannedClients.size === 0) {
        client.notify("No banned IPs.");
        return;
    }

    console.log("=== Ban List ===");

    for (const [ip, expiresAt] of bannedClients.entries()) {
        const remainingMs = expiresAt - now;

        if (remainingMs <= 0) continue;

        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

        console.log(`${ip} - ${hours}h ${minutes}m remaining`);
    }

    client.notify("Ban list printed to console");
},

admin_kick: (client: Client, ...args: string[]) => {
    const game = client.game;
    if (!game) return;

    const ip = args[0];
    if (!ip) {
        console.log("Usage: [player IP]");
        return;
    }

    let kickedCount = 0;
    const kickedNames: string[] = [];

    for (const c of game.clients) {
        const clientIP = c.ws?.getUserData?.().ipAddress;

        if (clientIP === ip) {
            if (c.accessLevel === AccessLevel.FullAccess) continue;

            try {
                const raw = c.toString();
                const match = raw.match(/name="([^"]+)"/);
                const name = match?.[1] ?? "Unknown";

                kickedNames.push(name);

                c.ws?.end?.(1000, "Kicked");
                c.ws?.close?.();

                kickedCount++;
            } catch (err) {
                console.log("Kick error:", err);
            }
        }
    }

    console.log(`Kicked ${kickedCount} client(s) with IP ${ip}`);

    const message =
        kickedNames.length === 1
            ? `${kickedNames[0]} has been kicked!`
            : kickedNames.length > 1
                ? `${kickedNames.join(", ")} have been kicked!`
                : "No players were kicked.";

    game.broadcast()
        .u8(ClientBound.Notification)
        .stringNT(message)
        .u32(0xFF8800)
        .float(4000)
        .stringNT("")
        .send();
},

fast_kick: (client: Client, ...args: string[]) => {
    const game = client.game;
    if (!game) return;

    const targetName = args.join(" ").trim();
    if (!targetName) {
        console.log("Usage: [player name]");
        return;
    }

    let kickedName: string | null = null;
    let kickedIP: string | null = null;

    for (const c of game.clients) {
        // Extract name (same method you used before)
        const raw = c.toString();
        const match = raw.match(/name="([^"]+)"/);
        const name = match?.[1] ?? "Unknown";

        if (name === targetName) {
            if (c.accessLevel === AccessLevel.FullAccess) continue;

            try {
                kickedName = name;
                kickedIP = c.ws?.getUserData?.().ipAddress ?? "Unknown";

                c.ws?.end?.(1000, "Kicked");
                c.ws?.close?.();

                break; // kick one player
            } catch (err) {
                console.log("Fast kick error:", err);
            }
        }
    }

    // ===== Console log (with IP) =====
    if (kickedName) {
        console.log(`Fast kicked ${kickedName} (IP: ${kickedIP})`);
    } else {
        console.log(`No player found with name "${targetName}"`);
    }

    // ===== Broadcast (name ONLY) =====
    const message = kickedName
        ? `${kickedName} has been kicked!`
        : `Player "${targetName}" not found.`;

    game.broadcast()
        .u8(ClientBound.Notification)
        .stringNT(message)
        .u32(0xFF8800)
        .float(4000)
        .stringNT("")
        .send();
},

    admin_summon: (client: Client, entityArg: string, countArg?: string, xArg?: string, yArg?: string) => {
        const count = countArg ? parseInt(countArg) : 1;
        let x = parseInt(xArg || "0", 10);
        let y = parseInt(yArg || "0", 10);

        const player = client.camera?.cameraData.player;
        if (Entity.exists(player) && player instanceof ObjectEntity) {
            if (xArg && xArg.match(RELATIVE_POS_REGEX)) {
                x = player.positionData.x + parseInt(xArg.slice(1) || "0", 10);
            }
            if (yArg && yArg.match(RELATIVE_POS_REGEX)) {
                y = player.positionData.y + parseInt(yArg.slice(1) || "0", 10);
            }
        }

const game = client.camera?.game;

const entityMap = new Map<string, new (...args: any[]) => ObjectEntity>([
    ["def", Defender],
    ["sdf", SuperDefender],
    ["sum", Summoner],
    ["gu", Guardian],
    ["sgu", SuperGuardian],
    ["fo", FallenOverlord],
    ["fb", FallenBooster],
    ["sfo", SuperFallenOverlord],
    ["sfb", SuperFallenBooster],
    ["fac", FallenAC],
    ["fs", FallenSpike],
    ["fmt", FallenMegaTrapper],
    ["ssum", SuperSummoner],
    ["dom", Square], // currently bugged and crashes
    ["ac", ArenaCloser],
    ["act", ArenaCloserTurret],
    ["ngc", NGMArenaCloser],
    ["cr", Crasher],
    ["pen", Pentagon],
    ["sq", Square],
    ["tri", Triangle],
    ["sac", ShinyArenaCloser],
    ["aac", ArassArenaCloser],
    ["mot", Mothership],
    ["csq", CrystalisedSquare],
    ["hex", Hexagon],
    ["ghex", GoldenHexagon],
    ["at", Atmg],
    ["ter", Terrestrials],
    ["cel", Celestials],
    ["ete", Eternals],
    ["imo", Immortals],
    ["bot", Bot],
    ["sbot", SuperBot],
    ["ffc", FfaCloser],
    ["war", Warden],
    ["ult", UltraSmasher],
    ["io", ImmortalOctagon],
    ["bl", Blaster],
    ["pro", Protector],
    ["ch", ChaosBoss],
    ["shsum", ShinySummoner],
    ["shgu", ShinyGuardian],
    ["shdf", ShinyDefender],
    ["shfo", ShinyFallenOverlord],
    ["shfb", ShinyFallenBooster],
    ["ssq", ShinySquare],
    ["stri", ShinyTriangle],
    ["spen", ShinyPentagon],
    ["shex", ShinyHexagon],
    ["apen", AlphaPentagon],
    ["ahex", AlphaHexagon],
    ["sapen", ShinyAlphaPentagon],
    ["sahex", ShinyAlphaHexagon],
    ["scr", ShinyCrasher],
    ["ball", Ball],
    ["fcr", FallenCrasher],
    ["l45", XPSquare],
    ["fd", FallenDodger],
    ["efd", EnragedFallenDodger], // herere
    ["xau", xAura],
//    ["wl", Wall], very bugged
//    ["bwl", BounceWall], very bugged
]);

const TEntity = entityMap.get(entityArg);

if (isNaN(count) || count < 0 || !game || !TEntity) return;

const category = getSpawnCategory(TEntity);
const limit = SPAWN_LIMITS[category];
const existing = countCategory(game, TEntity);

if (existing + count > limit) {
    client.notify(
        `${client.toString()} spawn denied: ${existing}/${limit} already exist.`,
        0xFF5555,
        3000
    );
    return;
}

// Cooldown (stops macros)
if (!canSpawn(client, category)) {
    client.notify("Spawn cooldown active.", 0xFF5555, 2000);
    return;
}

// Limit check (stops crashes)
if (existing + count > limit) {
    client.notify(
        `Spawn denied: ${existing}/${limit} already exist.`,
        0xFF5555,
        4000
    );
    return;
}

// Safe spawn
for (let i = 0; i < count; ++i) {
    const ent = new TEntity(game);
    if (!isNaN(x) && !isNaN(y)) {
        ent.positionData.x = x;
        ent.positionData.y = y;
    }
}
    },

    super_admin_summon: (client: Client, entityArg: string, countArg?: string, xArg?: string, yArg?: string) => {
        const count = countArg ? parseInt(countArg) : 1;
        let x = parseInt(xArg || "0", 10);
        let y = parseInt(yArg || "0", 10);

        const player = client.camera?.cameraData.player;
        if (Entity.exists(player) && player instanceof ObjectEntity) {
            if (xArg && xArg.match(RELATIVE_POS_REGEX)) {
                x = player.positionData.x + parseInt(xArg.slice(1) || "0", 10);
            }
            if (yArg && yArg.match(RELATIVE_POS_REGEX)) {
                y = player.positionData.y + parseInt(yArg.slice(1) || "0", 10);
            }
        }

const game = client.camera?.game;

const entityMap = new Map<string, new (...args: any[]) => ObjectEntity>([
    ["ser", ServerCloser],
    ["bh", BlackHole],
    ["xbh", xBlackHole],
    ["ims", ImmortalSnail],
    ["xau", xAura],
    ["dop", DestroyerOfPlayers]
]);

const TEntity = entityMap.get(entityArg);

if (isNaN(count) || count <= 0 || !game || !TEntity) return;

for (let i = 0; i < count; ++i) {

    let ent: ObjectEntity | null = null;

    // Special entity: Aura (needs owner)
    if (TEntity === xAura) {
        const player = client.camera?.cameraData.player;

        if (!player || !(player instanceof LivingEntity)) {
            client.notify("xAura requires a valid player.", 0xFF5555, 2000);
            continue;
        }

        ent = new xAura(game, player, 4);
    }

    // Default entities
    else {
        ent = new TEntity(game);
    }

    // Apply spawn position safely
    if (ent) {
        if (!isNaN(x) && !isNaN(y)) {
            ent.positionData.x = x;
            ent.positionData.y = y;
        }
    }
}
    },

admin_kill_all: (client: Client) => {
    const game = client.camera?.game;
    if (!game) return;

    for (let id = 0; id <= game.entities.lastId; ++id) {
        const entity = game.entities.inner[id];
        if (
            Entity.exists(entity) &&
            entity instanceof LivingEntity &&
            entity !== client.camera?.cameraData.player &&
            !(entity.flags?.adminFlags & AdminFlags.immuneToKillCommand)
        ) {
            entity.healthData.health = 0;
        }
    }
  console.log(`${client.toString()} used kill All!`);
},
    admin_close_arena: (client: Client) => {
        client?.camera?.game.arena.close();
    },
admin_invis: (client: Client, activeArg?: string) => {
    const player = client.camera?.cameraData.player;
    if (!Entity.exists(player) || !(player instanceof TankBody)) return;

    switch (activeArg) {
        case "on":
            player.setInvisibility(true);
            break;
        case "off":
            player.setInvisibility(false);
            break;
        default:
            player.setInvisibility(!player.invisible);
            break;
    }

    return `Invisibility: ${player.invisible ? "ON" : "OFF"}`;
},
admin_start_event1: (caller: Client) => {
    caller?.camera?.game.arena.event1();

    const game = caller.game;
    if (!game) return; // safety check

for (const client of game.clients) {
    if (client.accessLevel !== AccessLevel.FullAccess) {
        client.accessLevel = AccessLevel.PublicAccess;

        const tank = client.camera?.cameraData?.player;
        if (tank && tank instanceof TankBody) {
            tank.setTank(Tank.Basic);

            client.camera?.setLevel(45); // safe, won’t crash if null

            client.notify("Your tank has been reset to a level 45 Basic for the event.", 0x00AAFF, 5000);
        }
    }
}
},
admin_start_event2: (caller: Client) => {
    caller?.camera?.game.arena.event2();

    const game = caller.game;
    if (!game) return; // safety check

for (const client of game.clients) {
    if (client.accessLevel !== AccessLevel.FullAccess) {
        client.accessLevel = AccessLevel.PublicAccess;

        const tank = client.camera?.cameraData?.player;
        if (tank && tank instanceof TankBody) {
            tank.setTank(Tank.Basic);

            client.camera?.setLevel(45); // safe, won’t crash if null

            client.notify("Your tank has been reset to a level 45 Basic for the event.", 0x00AAFF, 5000);
        }
    }
}
},
shiny_claim: (caller: Client, password?: string) => {
    if (!caller) return;

    const tank = caller.camera?.cameraData?.player;
    if (!tank || !(tank instanceof TankBody)) {
        caller.notify("Something went wrong.", 0xD30000, 4000);
        return;
    }

    // Check password and apply the correct tank
    if (password === "1234") {
        tank.setTank(Tank.Shiny);
        caller.notify("You have claimed the Shiny tank!", 0x3BB143, 4000);
    } else if (password === "4321") {
        tank.setTank(Tank.ShinyPlus);
        caller.notify("You have claimed the Shiny+ tank!", 0x3BB143, 4000);
    } else {
        caller.notify("Invalid password.", 0xD30000, 4000);
    }
},
admin_shiny_all: (caller: Client) => {
    const game = caller.game;
    if (!game) return; // safety check

    for (const client of game.clients) {
        const tank = client.camera?.cameraData?.player;
        if (tank && tank instanceof TankBody) {
            tank.setTank(Tank.Shiny);
            client.notify("Your tank has been set to Shiny!", 0xFFD700, 5000);
        }
    }
},
    super_admin_close_server: (client: Client) => {
        client?.camera?.game.arena.serverClose();
    },
admin_kill_entity: (client: Client, entityArg: string) => {
    const TEntity = new Map([
        ["ArenaCloser", ArenaCloser],
        ["Dominator", Dominator],
        ["Bullet", Bullet],
        ["Tank", TankBody],
        ["Shape", AbstractShape],
        ["Boss", AbstractBoss]
    ] as [string, typeof LivingEntity][]).get(entityArg);

    const game = client.camera?.game;
    if (!TEntity || !game) return;

    for (let id = 0; id <= game.entities.lastId; ++id) {
        const entity = game.entities.inner[id];
        if (
            Entity.exists(entity) &&
            entity instanceof TEntity &&
            (!(entity as LivingEntity).flags?.adminFlags || 
            !((entity as LivingEntity).flags.adminFlags & AdminFlags.immuneToKillCommand))
        ) {
            entity.healthData.health = 0;
        }
     }
  },
      super_admin_kill_all: (client: Client) => {
        const game = client.camera?.game;
        if(!game) return;
        for (let id = 0; id <= game.entities.lastId; ++id) {
            const entity = game.entities.inner[id];
            if (Entity.exists(entity) && entity instanceof LivingEntity && entity !== client.camera?.cameraData.player) entity.healthData.health = 0;
        }
    },
    game_change_team: (client: Client) => {
    const player = client.camera?.cameraData.player;
    if (!Entity.exists(player) || !(player instanceof ObjectEntity)) return;

    player.relationsData.values.team = null;
    player.setVelocity(0, 0);
    player.entityState |= EntityStateFlags.needsCreate | EntityStateFlags.needsDelete;

    console.log(`${client.toString()} is now neutral`);

client.notify("You are now neutral! (shapes team)", 0xFFA500, 5000);
},
admin_kill_player: (client: Client, targetName: string) => {
    const game = client.game;
    if (!game) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        const player = target.camera?.cameraData.player;

        if (
            Entity.exists(player) &&
            player instanceof LivingEntity &&
            !(player.flags?.adminFlags & AdminFlags.immuneToKillCommand)
        ) {
            player.healthData.health = 0;
            console.log(`${client.toString()} killed ${target.toString()}`);
        }
    }
},
game_set_tank_player: (client: Client, targetName: string, tankNameArg: string) => {
    const game = client.game;
    if (!game) return;

    const tankDef = getTankByName(tankNameArg);
    if (!tankDef) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        const player = target.camera?.cameraData.player;
        if (Entity.exists(player) && player instanceof TankBody) {
            player.setTank(tankDef.id);
        }
    }
},
game_set_tank_all: (client: Client, tankNameArg: string) => {
    const game = client.game;
    if (!game) return; // safety check

    // Find the tank definition by name
    const tankDef = getTankByName(tankNameArg);
    if (!tankDef) {
        console.log(`Tank not found: ${tankNameArg}`);
        return;
    }

    console.log("Tank definition found:", tankDef);

    for (const targetClient of game.clients) {
        const player = targetClient.camera?.cameraData.player;
        if (!Entity.exists(player)) continue;
        if (!(player instanceof TankBody)) continue;

        player.setTank(tankDef.id);
    }

    console.log(`All players set to tank: ${tankNameArg}`);

    game.broadcast()
        .u8(ClientBound.Notification)
        .stringNT(`Everyone's tank has been set to ${tankNameArg}.`)
        .u32(0x008000)
        .float(5000)
        .stringNT("")
        .send();
},
game_set_level_player: (client: Client, targetName: string, levelArg: string) => {
    const game = client.game;
    if (!game) return;

    const level = parseInt(levelArg);
    if (isNaN(level)) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        const player = target.camera?.cameraData.player;
        if (!Entity.exists(player) || !(player instanceof TankBody)) continue;

        const finalLevel =
            target.accessLevel === AccessLevel.BetaAccess
                ? level
                : Math.min(maxPlayerLevel, level);

        target.camera?.setLevel(finalLevel);
    }
},
game_set_stat_player: (client: Client, targetName: string, statIdArg: string, statPointsArg: string) => {
    const game = client.game;
    if (!game) return;

    const statId = StatCount - parseInt(statIdArg);
    if (statId < 0 || statId >= StatCount || isNaN(statId)) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        let statPoints = parseInt(statPointsArg);

        const camera = target.camera?.cameraData;
        const player = camera?.player;

        if (
            isNaN(statPoints) ||
            !Entity.exists(player) ||
            !(player instanceof TankBody) ||
            !camera
        ) continue;

        statPoints = Math.max(0, Math.min(1000000000, statPoints));
        camera.statLevels[statId as Stat] = statPoints;
    }
},
max_player: (client: Client, targetName: string, slotsArg?: string) => {
    const game = client.game;
    if (!game) return;

    let slots = slotsArg ? parseInt(slotsArg, 10) : 20;
    if (isNaN(slots) || slots <= 0) return;

    const slotLimit = Math.min(slots, 20);

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        const camera = target.camera?.cameraData;
        const player = camera?.player;

        if (!Entity.exists(player) || !(player instanceof TankBody) || !camera)
            continue;

        for (let statId = 0; statId < 8; statId++) {
            let limit = slotLimit;
            let level = slots;

            if (statId === Stat.BulletSpeed) {
                limit = Math.min(limit, 50);
                level = Math.min(level, 50);
            }

            if (statId === Stat.MovementSpeed) {
                limit = Math.min(limit, 30);
                level = Math.min(level, 30);
            }

            camera.statLimits[statId as Stat] = limit;
            camera.statLevels[statId as Stat] = level;
        }
    }
},
admin_demote_player: (client: Client, targetName: string) => {
    const game = client.game;
    if (!game) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        switch (target.accessLevel) {
            case AccessLevel.kReserved:
                target.accessLevel = AccessLevel.PublicAccess;
                break;
            case AccessLevel.BetaAccess:
                target.accessLevel = AccessLevel.kReserved;
                break;
            case AccessLevel.FullAccess:
                target.accessLevel = AccessLevel.BetaAccess;
                break;
        }

        target.notify("You have been demoted!", 0xFF0000, 10000);
        console.log(`${client.toString()} demoted ${target.toString()}`);
    }
},
admin_promote_player: (client: Client, targetName: string) => {
    const game = client.game;
    if (!game) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        switch (target.accessLevel) {
            case AccessLevel.NoAccess:
                target.accessLevel = AccessLevel.PublicAccess;
                break;
            case AccessLevel.PublicAccess:
                target.accessLevel = AccessLevel.kReserved;
                break;
            case AccessLevel.kReserved:
                target.accessLevel = AccessLevel.BetaAccess;
                break;
            case AccessLevel.BetaAccess:
                target.accessLevel = AccessLevel.FullAccess;
                break;
        }

        target.notify("You have been promoted!", 0x008000, 10000);
        console.log(`${client.toString()} promoted ${target.toString()}`);
    }
},
admin_shiny_player: (caller: Client, targetName: string) => {
    const game = caller.game;
    if (!game) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        const tank = target.camera?.cameraData?.player;

        if (tank instanceof TankBody) {
            tank.setTank(Tank.Shiny);
            target.notify("Your tank has been set to Shiny!", 0xFFD700, 5000);
            console.log(`${caller.toString()} made ${target.toString()} Shiny`);
        }
    }
},
game_change_team_player: (client: Client, targetName: string) => {
    const game = client.game;
    if (!game) return;

    const targets = findClientsByName(game, targetName);
    if (targets.length === 0) return;

    for (const target of targets) {
        const player = target.camera?.cameraData.player;

        if (!Entity.exists(player) || !(player instanceof ObjectEntity))
            continue;

        player.relationsData.values.team = null;
        player.setVelocity(0, 0);

        player.entityState |=
            EntityStateFlags.needsCreate |
            EntityStateFlags.needsDelete;

        target.notify("You are now neutral! (shapes team)", 0xFFA500, 5000);
        console.log(`${client.toString()} set ${target.toString()} to neutral`);
    }
},
event_claim: (client: Client, password?: string) => {
    if (!client) return;

    const tank = client.camera?.cameraData?.player;
    if (!tank || !(tank instanceof TankBody)) {
        client.notify("Something went wrong.", 0xD30000, 4000);
        return;
    }
    if (password === "you won! 2468") {
        switch (client.accessLevel) {
        case AccessLevel.NoAccess:
            client.accessLevel = AccessLevel.kReserved;
            break;
        case AccessLevel.PublicAccess:
            client.accessLevel = AccessLevel.kReserved;
            break;
        case AccessLevel.kReserved:
            client.accessLevel = AccessLevel.kReserved;
            break;
        case AccessLevel.BetaAccess:
            client.accessLevel = AccessLevel.kReserved;
            break;
        case AccessLevel.FullAccess:
            break;
    }
  }
},
spectate: (caller: Client, password?: string) => {
    if (!caller) return;

    const tank = caller.camera?.cameraData?.player;
    if (!tank || !(tank instanceof TankBody)) {
        caller.notify("Something went wrong.", 0xD30000, 4000);
        return;
    }
    tank.setTank(Tank.Spectator);
}

// end of commands

} as Record<CommandID, CommandCallback>

export const executeCommand = (client: Client, cmd: string, args: string[]) => {
    if (!commandDefinitions.hasOwnProperty(cmd) || !commandCallbacks.hasOwnProperty(cmd)) {
        return saveToVLog(`${client.toString()} tried to run the invalid command ${cmd}`);
    }

    if (client.accessLevel < commandDefinitions[cmd as CommandID].permissionLevel) {
        return console.log(`${client.toString()} tried to run the command ${cmd} with a permission that was too low`);
    }

    const commandDefinition = commandDefinitions[cmd as CommandID];
    if (commandDefinition.isCheat) client.setHasCheated(true);

    const response = commandCallbacks[cmd as CommandID](client, ...args);
    if (response) {
        client.notify(response, 0x00ff00, 5000, `cmd-callback${commandDefinition.id}`);
    }
}