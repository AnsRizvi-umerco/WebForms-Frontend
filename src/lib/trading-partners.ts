const TRADING_PARTNERS = {
  buyers: {
    "Demo-Partner": { name: "Demo Partner", ediVersion: "D96A", active: true },
    "Haroon-Motors": { name: "Haroon Motors", ediVersion: "D96A", active: true }
  },
  suppliers: {
    "XYZ-PARTS": { name: "XYZ Parts", active: true }
  }
} as const;

export type SchedulePrefillMessage = {
  tradingPartner: string;
  supplierCode: string;
};

export function resolveBuyerDisplayName(tradingPartner: string): string {
  const buyers = TRADING_PARTNERS.buyers as Record<string, { name: string }>;
  return buyers[tradingPartner]?.name ?? tradingPartner;
}
