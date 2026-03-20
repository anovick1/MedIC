export type ShootdownTier = 'LOW' | 'MED' | 'HIGH';

const shootdownProb: Record<ShootdownTier, number> = {
  LOW: 0.10, MED: 0.50, HIGH: 0.90,
};

export function dronesNeeded(tier: ShootdownTier, confidence = 0.95): number {
  const p = shootdownProb[tier];
  if (p <= 0) return 1;
  if (p >= 1) return 99;
  return Math.ceil(Math.log(1 - confidence) / Math.log(p));
}

export function deliveryProbSingle(tier: ShootdownTier): number {
  return Math.round((1 - shootdownProb[tier]) * 100);
}

export function shootdownPercent(tier: ShootdownTier): number {
  return shootdownProb[tier] * 100;
}
