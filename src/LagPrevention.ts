import { performance } from "node:perf_hooks";

export interface LagPreventionOptions {
    tpsThreshold?: number;       // trigger below this TPS
    fpsThreshold?: number;       // trigger below this FPS (only if recordFrame() is called)
    windowMs?: number;           // rolling average window
    cooldownMs?: number;         // minimum time between triggers
    minSamples?: number;         // do not evaluate until we have enough samples
    recoverMultiplier?: number;  // how much better it must get before re-arming
    log?: (message: string) => void;
}

type TriggerFn = (reason: string) => void;

interface Sample {
    at: number;
    dt: number;
}

export default class LagPrevention {
    private readonly tpsSamples: Sample[] = [];
    private readonly fpsSamples: Sample[] = [];

    private lastTickAt = performance.now();
    private lastFrameAt = performance.now();

    private lastTriggerAt = 0;
    private armed = true;

    private readonly opts: Required<Omit<LagPreventionOptions, "log">> & {
        log?: (message: string) => void;
    };

    public constructor(
        private readonly triggerKillAll: TriggerFn,
        options: LagPreventionOptions = {},
    ) {
        this.opts = {
            tpsThreshold: options.tpsThreshold ?? 100,
            fpsThreshold: options.fpsThreshold ?? 10,
            windowMs: options.windowMs ?? 50,
            cooldownMs: options.cooldownMs ?? 500,
            minSamples: options.minSamples ?? 2,
            recoverMultiplier: options.recoverMultiplier ?? 1.15,
            log: options.log,
        };
    }

    public recordTick(now: number = performance.now()): void {
        this.recordSample("tick", now);
    }

    public recordFrame(now: number = performance.now()): void {
        this.recordSample("frame", now);
    }

    private recordSample(kind: "tick" | "frame", now: number): void {
        const isTick = kind === "tick";
        const lastAt = isTick ? this.lastTickAt : this.lastFrameAt;
        const dt = now - lastAt;

        if (isTick) this.lastTickAt = now;
        else this.lastFrameAt = now;

        if (!Number.isFinite(dt) || dt <= 0) return;

        const samples = isTick ? this.tpsSamples : this.fpsSamples;
        samples.push({ at: now, dt });
        this.prune(samples, now);

        if (samples.length < this.opts.minSamples) return;

        const avgMs = samples.reduce((sum, s) => sum + s.dt, 0) / samples.length;
        const currentRate = 1000 / dt;
        const avgRate = 1000 / avgMs;

        const threshold = isTick ? this.opts.tpsThreshold : this.opts.fpsThreshold;
        const recoverThreshold = threshold * this.opts.recoverMultiplier;

        // Trigger when the average is bad, or when the current sample is very bad.
        if (this.armed) {
            const severeDrop = currentRate < threshold;
            const sustainedDrop = avgRate < threshold;

            if ((severeDrop || sustainedDrop) && now - this.lastTriggerAt >= this.opts.cooldownMs) {
                this.lastTriggerAt = now;
                this.armed = false;

                const label = isTick ? "TPS" : "FPS";
                this.opts.log?.(
                    `[LagPrevention] ${label} low: current=${currentRate.toFixed(1)} avg=${avgRate.toFixed(1)} threshold=${threshold}`,
                );

                            console.log(
    "currentRate=", currentRate,
    "avgRate=", avgRate
);

                this.triggerKillAll(
                    `${label} too low (current=${currentRate.toFixed(1)}, avg=${avgRate.toFixed(1)}, threshold=${threshold})`,
                );
            }
        } else {
            // Re-arm once performance recovers.
            if (avgRate > recoverThreshold && currentRate > recoverThreshold) {
                this.armed = true;
                this.opts.log?.(`[LagPrevention] recovered: ${isTick ? "TPS" : "FPS"} avg=${avgRate.toFixed(1)}`);
            }
        }
    }

    private prune(samples: Sample[], now: number): void {
        while (samples.length > 0 && now - samples[0].at > this.opts.windowMs) {
            samples.shift();
        }
    }
}