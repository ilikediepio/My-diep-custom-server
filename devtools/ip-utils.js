"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalIP = canonicalIP;
function canonicalIP(ip) {
    ip = String(ip).trim().toLowerCase();
    if (ip === "::1" ||
        ip === "0:0:0:0:0:0:0:1" ||
        ip === "0000:0000:0000:0000:0000:0000:0000:0001") {
        return "127.0.0.1";
    }
    return ip;
}
