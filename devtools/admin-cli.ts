import readline from "readline-sync";
import fs from "fs";
import path from "path";
import type GameServer from "../src/Game";
import { liveClients } from "../src/Globals";

import http from "http";
import { execFileSync } from "child_process";

function listPlayers() {
    try {
        const raw = execFileSync(
            "curl",
            ["-s", "http://localhost:8080/api/players"],
            { encoding: "utf8" }
        ).trim();

        const players = JSON.parse(raw || "[]");

        console.log("\n--- CURRENT PLAYERS ---");

        if (!players.length) {
            console.log("No players online.");
            return;
        }

        for (const p of players) {
            console.log(`${p.ip} | ${p.name}`);
        }
    } catch (err: any) {
        console.log("Failed to load players:", err?.message || String(err));
    }
}

let games: GameServer[] = [];

type LogEntry = {
    ip: string;
    name: string;
    time: number;
};

type BanEntry = {
    ip: string;
    reason: string;
    time: number;
    expiresAt: number;
};

// =========================
// FILE PATHS
// =========================
const BASE = path.resolve(process.cwd(), "devtools");
const LOG_FILE = path.join(BASE, "server-log.json");
const BAN_FILE = path.join(BASE, "bans.json");
const AUDIT_FILE = path.join(BASE, "logs.json");
const FROZE_FILE = path.join(BASE, "frozen.json");

// =========================
// HELPERS
// =========================

export function startCLI(g: GameServer[] = []) {
    console.log("STARTCLI CALLED");
    console.log("received", g.length, "servers");

    games = g;

    console.log("stored", games.length, "servers");

    if (games.length === 0) {
        console.log("⚠ CLI attached, but no game servers are available yet.");
        return;
    }

    console.log("✅ CLI attached to GameServer");
}

function now(): number {
    return Date.now();
}

function normalizeIP(ip: string): string {
    return String(ip).trim().toLowerCase();
}

export function canonicalIP(ip: string): string {
    ip = String(ip).trim().toLowerCase();

  // normalize IPv6 loopback variants
    if (
        ip === "::1" ||
        ip === "0:0:0:0:0:0:0:0:1" ||
        ip === "0000:0000:0000:0000:0000:0000:0000:0001"
    ) {
        return "127.0.0.1";
    }

  // collapse leading zero IPv6 (basic improvement)
    ip = ip.replace(/\b0{1,3}/g, "0");

    return ip;
}

function isValidIP(ip: string): boolean {
    ip = normalizeIP(ip);

    if (!ip) return false;
    if (ip === "1" || ip === "001" || ip === "0") return false;
    if (ip.length > 128) return false;

    return true;
}

function ensureArrayFile(file: string) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]", "utf8");
        return;
    }

    const raw = fs.readFileSync(file, "utf8");
    if (!raw || raw.trim() === "") {
        fs.writeFileSync(file, "[]", "utf8");
    }
}

function load(file: string): any[] {
    try {
        ensureArrayFile(file);
        const raw = fs.readFileSync(file, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        fs.writeFileSync(file, "[]", "utf8");
        return [];
    }
}

function save(file: string, data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function readInt(input: string, fallback: number): number {
    const n = parseInt(String(input), 10);
    return Number.isFinite(n) ? n : fallback;
}

// =========================
// AUDIT
// =========================
function audit(action: string, data?: any) {
    const logs = load(AUDIT_FILE);

    logs.push({
        action,
        data: data ?? null,
        time: now()
    });

    save(AUDIT_FILE, logs);
}

// =========================
// FREEZE COMMAND (stops all actions)
// =========================

export function loadFrozen(): string[] {
    try {
        const data = JSON.parse(fs.readFileSync("devtools/frozen.json", "utf8"));

        const list = Array.isArray(data) ? data : [];

        frozenIPs.clear();
        for (const ip of list) {
            frozenIPs.add(ip);
        }

        return list;
    } catch {
        frozenIPs.clear();
        return [];
    }
}

function saveFrozen(list: string[]) {
    fs.writeFileSync(FROZE_FILE, JSON.stringify(list, null, 2));
}

export function toggleFreeze(ip: string) {
    ip = canonicalIP(ip);

    let frozen = loadFrozen();

    const isFrozen = frozen.includes(ip);

    console.log("FREEZE TOGGLE:", ip);

    if (isFrozen) {
        frozen = frozen.filter(x => x !== ip);
       saveFrozen(frozen);

        console.log(`❄ Unfroze IP: ${ip}`);
    } else {
        frozen.push(ip);
        saveFrozen(frozen);

        console.log(`🧊 Froze IP: ${ip}`);
    }
}

export const frozenIPs: Set<string> = new Set();

// =========================
// GAME LOG VIEW (JOINS)
// =========================
export function logJoin(ip: string, name: string) {
    const logs = load(LOG_FILE) as LogEntry[];

    logs.push({
        ip: canonicalIP(ip),
        name: String(name),
        time: now()
    });

    save(LOG_FILE, logs);
}

// =========================
// BAN SYSTEM
// =========================
function cleanupExpiredBans(): BanEntry[] {
    const bans = load(BAN_FILE) as BanEntry[];
    const current = now();

    const active = bans.filter(b => {
        if (!b || typeof b.ip !== "string") return false;
        if (typeof b.expiresAt !== "number") return false;
        return b.expiresAt > current;
    });

    if (active.length !== bans.length) {
        save(BAN_FILE, active);
    }

    return active;
}

function banIP(ip: string, hours: number, reason = "manual") {
    const expiresAt = Date.now() + hours * 3600 * 1000;

    const bans = load(BAN_FILE) as BanEntry[];

    bans.push({
        ip: canonicalIP(ip),
        reason,
        time: Date.now(),
        expiresAt
    });

    save(BAN_FILE, bans);

    console.log(`🚫 Banned ${ip} for ${hours}h`);
}

function unbanIP(ip: string) {
    ip = canonicalIP(ip);

    if (!isValidIP(ip)) {
        console.log("❌ Invalid IP format");
        return;
    }

    let bans = cleanupExpiredBans();
    const before = bans.length;

    bans = bans.filter(b => canonicalIP(b.ip) !== ip);

    save(BAN_FILE, bans);
    audit("UNBAN", { ip });

    if (bans.length === before) {
        console.log(`⚠ IP was not banned: ${ip}`);
    } else {
        console.log(`✅ Unbanned: ${ip}`);
    }
}

// =========================
// VIEW FUNCTIONS
// =========================
function listBans() {
    const bans = cleanupExpiredBans() as BanEntry[];

    console.log("\n--- BANS ---");

    if (bans.length === 0) {
        console.log("No active bans.");
        return;
    }

    for (const b of bans) {
        const remainingMs = Math.max(0, b.expiresAt - now());
        const remainingHours = (remainingMs / 3600000).toFixed(2);

        console.log(
            `${b.ip} | ${b.reason} | ${new Date(b.time).toISOString()} | expires in ${remainingHours}h`
        );
    }
}

function listRecent(hours: number) {
    const logs = load(LOG_FILE) as LogEntry[];
    const cutoff = now() - hours * 3600 * 1000;

    console.log(`\n--- LAST ${hours} HOURS (RAW JOINS) ---`);

    const recent = logs.filter(l => l && typeof l.time === "number" && l.time > cutoff);

    if (recent.length === 0) {
        console.log("No players found in that time range.");
        return;
    }

    for (const l of recent) {
        console.log(`${canonicalIP(l.ip)} | ${l.name} | ${new Date(l.time).toISOString()}`);
    }
}

function listRepeatedConnections(threshold = 200, hours = 24) {
    const logs = load(LOG_FILE) as LogEntry[];
    const cutoff = now() - hours * 3600 * 1000;

    const counts = new Map<string, number>();

    for (const l of logs) {
        if (!l || typeof l.time !== "number" || l.time < cutoff) continue;

        const ip = canonicalIP(l.ip);
        counts.set(ip, (counts.get(ip) || 0) + 1);
    }

    console.log(`\n--- REPEATED CONNECTIONS (last ${hours} hours) ---`);

    const flagged: Array<{ ip: string; count: number }> = [];

    for (const [ip, count] of counts.entries()) {
        if (count >= threshold) {
            flagged.push({ ip, count });
        }
    }

    flagged.sort((a, b) => b.count - a.count);

    if (flagged.length === 0) {
        console.log("No suspicious IPs detected.");
        return;
    }

    for (const item of flagged) {
        if (item.count >= threshold * 2) {
            console.log(`🚨 SEVERE: ${item.ip} → ${item.count} joins`);
        } else {
            console.log(`⚠ ${item.ip} → ${item.count} joins`);
        }
    }
}

function toggleLagProtection() {
    const servers = [
        "sandbox",
        "domtest",
        "ball",
        "atmg",
        "nexus",
        "seige",
        "blackhole",
        "events",
        "pvp"
    ];

    let serverState: any[] = [];

    try {
        const raw = execFileSync(
            "curl",
            ["-s", "http://localhost:8080/api/servers"],
            { encoding: "utf8" }
        ).toString();

        serverState = JSON.parse(raw);
    } catch (err) {
        console.log("Failed to load server states:", err);
        return;
    }

    console.log("\nAvailable servers:");

    servers.forEach((name, i) => {
        const game = serverState.find(g => g.gamemode === name);
        const state = game?.lagProtectionEnabled ? "ON" : "OFF";

        console.log(`${i + 1}. ${name} (${state})`);
    });

    const index = parseInt(readline.question("Server number: "), 10) - 1;

    if (index < 0 || index >= servers.length) {
        console.log("Invalid server.");
        return;
    }

    const gamemode = servers[index];

    try {
        const url = `http://localhost:8080/api/toggle-lag?gamemode=${encodeURIComponent(gamemode)}`;

        const response = execFileSync(
            "curl",
            ["-s", url],
            { encoding: "utf8" }
        ).toString().trim();

        const result = JSON.parse(response);

        console.log(
            `Lag protection for ${result.gamemode}: ` +
            `${result.lagProtectionEnabled ? "ENABLED" : "DISABLED"}`
        );

    } catch (err: any) {
        console.log("Failed to toggle lag protection:", err?.message || String(err));
    }
}

// =========================
// MENU
// =========================
function menu() {
    console.log("\n=== DEVTOOLS ADMIN CLI ===");
    console.log("1. Ban IP");
    console.log("2. Unban IP");
    console.log("3. List bans");
    console.log("4. Show recent players");
    console.log("5. List players");
    console.log("6. Flag repeated connections");
    console.log("7. Freeze an IP (prevents commands + input)");
    console.log("8. Toggle lag protection for a single server");
    console.log("9. Exit");

    const choice = readline.question("\nSelect: ");

    switch (choice) {
        case "1": {
            const ip = readline.question("IP: ");
            const hours = Math.max(1, readInt(readline.question("Hours: "), 1));
            const reason = readline.question("Reason: ");
            banIP(ip, hours, reason || "manual");
            break;
        }

        case "2":
            unbanIP(readline.question("IP: "));
            break;

        case "3":
            listBans();
            break;

        case "4": {
            const hours = Math.max(1, readInt(readline.question("Hours: "), 1));
            listRecent(hours);
            break;
        }

        case "5": {
            listPlayers();
            break;
        }

        case "6": {
            const threshold = Math.max(1, readInt(readline.question("Threshold: "), 200));
            const hours = Math.max(1, readInt(readline.question("Hours: "), 24));
            listRepeatedConnections(threshold, hours);
            break;
        }

        case "7": {
            const ip = readline.question("IP: ");
            toggleFreeze(ip);
            break;
        }

        case "8": {
            toggleLagProtection();
            break;
        }

        case "9":
            process.exit(0);
            break;

        default:
            console.log("Invalid option.");
            break;
    }
}

if (require.main === module) {
    while (true) {
        menu();
    }
}