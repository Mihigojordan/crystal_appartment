"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linearTrendFromSamples = linearTrendFromSamples;
exports.daysToThreshold = daysToThreshold;
exports.ageYears = ageYears;
exports.clamp = clamp;
exports.pct = pct;
exports.weightedScore = weightedScore;
function olsFit(xs, ys) {
    const n = xs.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i] - meanX) * (ys[i] - meanY);
        den += (xs[i] - meanX) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = meanY - slope * meanX;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
        const predicted = intercept + slope * xs[i];
        ssRes += (ys[i] - predicted) ** 2;
        ssTot += (ys[i] - meanY) ** 2;
    }
    const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
    return { slope, intercept, r2: Math.round(r2 * 1000) / 1000 };
}
function linearTrendFromSamples(samples) {
    const n = samples.length;
    if (n === 0)
        return { slopePerDay: 0, intercept: 0, current: 0, r2: 0 };
    const sorted = [...samples].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const t0 = sorted[0].timestamp.getTime();
    const xs = sorted.map((s) => (s.timestamp.getTime() - t0) / 86400000);
    const ys = sorted.map((s) => s.value);
    if (n === 1)
        return { slopePerDay: 0, intercept: ys[0], current: ys[0], r2: 0 };
    const { slope, intercept, r2 } = olsFit(xs, ys);
    return { slopePerDay: slope, intercept, current: ys[n - 1], r2 };
}
function daysToThreshold(current, slopePerDay, threshold) {
    if (slopePerDay <= 0.0005)
        return null;
    if (current >= threshold)
        return 0;
    return Math.round((threshold - current) / slopePerDay);
}
function ageYears(createdAt) {
    if (!createdAt)
        return null;
    const ms = Date.now() - createdAt.getTime();
    return ms > 0 ? ms / (365.25 * 86400000) : null;
}
function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}
function pct(used, total) {
    const u = Number(used) || 0;
    const t = Number(total) || 0;
    return t > 0 ? clamp((u / t) * 100, 0, 100) : 0;
}
function weightedScore(components) {
    const usable = components.filter((c) => c.available !== false);
    const totalWeight = usable.reduce((s, c) => s + c.weight, 0) || 1;
    return Math.round(usable.reduce((s, c) => s + c.value * (c.weight / totalWeight), 0));
}
//# sourceMappingURL=trend.util.js.map