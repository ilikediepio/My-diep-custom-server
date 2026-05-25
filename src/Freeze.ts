import fs from "fs";
import path from "path";

const FILE = path.resolve(process.cwd(), "devtools/frozen.json");

export const frozenIPs = new Set<string>();

export function canonicalIP(ip: string): string {
    return String(ip).trim().toLowerCase();
}

export function loadFrozen(): void {
    try {
        const raw = fs.readFileSync(FILE, "utf8");
        const parsed = JSON.parse(raw);

        frozenIPs.clear();

        if (!Array.isArray(parsed)) return;

        for (const ip of parsed) {
            frozenIPs.add(canonicalIP(String(ip)));
        }
    } catch {
        frozenIPs.clear();
    }
}

export function saveFrozen(): void {
    fs.writeFileSync(FILE, JSON.stringify([...frozenIPs], null, 2));
}

export function toggleFreeze(ip: string): void {
    ip = canonicalIP(ip);

    loadFrozen();

    if (frozenIPs.has(ip)) {
        frozenIPs.delete(ip);
        console.log("❄ Unfroze IP:", ip);
    } else {
        frozenIPs.add(ip);
        console.log("🧊 Froze IP:", ip);
    }

    saveFrozen();
}