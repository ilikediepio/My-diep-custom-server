export function canonicalIP(ip: string): string {
    ip = String(ip).trim().toLowerCase();

    // IPv6 loopback variants
    if (
        ip === "::1" ||
        ip === "0:0:0:0:0:0:0:1" ||
        ip === "0000:0000:0000:0000:0000:0000:0000:0001"
    ) {
        return "127.0.0.1";
    }

    return ip;
}