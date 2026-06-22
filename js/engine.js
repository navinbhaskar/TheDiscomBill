// js/engine.js — Pure bill calculation engine (no DOM dependencies)
//
// ── Rounding policy ──────────────────────────────────────────────────────────
// Every individual charge is rounded to 2 decimal places (paise) as it is computed — energy per
// slab, fixed/demand charge, excess-demand penalty, FPPA, each additional charge — using the
// `+(x).toFixed(2)` idiom (or the local `round2`). Components are then summed, so the printed line
// items always add up to the sub-totals exactly. Only the FINAL consumer-facing figures — the
// current net bill and the total payable — are rounded to the nearest whole rupee (`Math.round`),
// matching how DISCOM bills present a round-rupee amount. Intermediate sums are NOT whole-rupee
// rounded, so no rounding error accumulates across line items. (Regression-tested in
// tests/engine.test.mjs.)

import {
  findDiscom,
  getEffectiveTariff,
  getCategory,
  findStateMetaByDiscom,
  resolveDatedTariff,
  fyStart,
} from './tariffs/registry.js';

// Default excess (exceeding) demand penalty when a tariff/state defines none: the most common
// Indian SERC rule — the demand above the sanctioned/contract load is charged at 2× the normal
// per-kW demand rate, with no tolerance band. States with a known rule override this (state-level
// `excessDemand`), and a category may override with its own `excessDemand` or flat `excessDemandRate`.
export const DEFAULT_EXCESS_DEMAND = { multiplier: 2, tolerancePct: 0 };

// Default billing-demand floor for kVA tariffs: the demand charge is levied on the higher of the
// recorded Maximum Demand or this percentage of the contract demand. 75% is the common HT figure;
// a tariff/state may override via `billingDemandFloorPct`. Non-kVA (kW) tariffs get no floor.
export const DEFAULT_DEMAND_FLOOR_PCT = 75;

export function resolveFixedCharge(fixedCharge, connectedLoadKw) {
  if (typeof fixedCharge === 'number') return fixedCharge;
  if (!fixedCharge) return 0;
  if (fixedCharge.type === 'flat') return fixedCharge.rate;
  // per_kw and per_kva are computed identically (rate × demand); the demand's unit is carried
  // by the tariff's `demandUnit` and only affects labelling, not the arithmetic.
  if (fixedCharge.type === 'per_kw' || fixedCharge.type === 'per_kva') return fixedCharge.rate * connectedLoadKw;
  if (fixedCharge.type === 'tiered') {
    for (const slab of fixedCharge.slabs) {
      if (connectedLoadKw <= slab.maxLoad) return slab.rate;
    }
    return fixedCharge.slabs[fixedCharge.slabs.length - 1].rate;
  }
  return 0;
}

export function calculateEnergySlabs(slabs, units, billingMonths = 1) {
  const round2 = n => Math.round(n * 100) / 100;
  const fmtU   = n => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  // Scale slab limits proportionally for multi-month billing periods (rounded to 2 dp)
  const effectiveSlabs = billingMonths === 1 ? slabs : slabs.map(s => ({
    ...s,
    limit: s.limit === Infinity ? Infinity : round2(s.limit * billingMonths)
  }));

  const breakdown = [];
  let remaining = units;
  let prevLimit = 0;

  for (const slab of effectiveSlabs) {
    if (remaining <= 0) break;
    const capacity = slab.limit === Infinity ? remaining : slab.limit - prevLimit;
    const rawUnits = Math.min(remaining, capacity);
    if (rawUnits > 0) {
      const unitsInSlab = round2(rawUnits);
      const from = round2(prevLimit + 1);
      const to   = round2(prevLimit + rawUnits);
      const label = slab.label ||
        (slab.limit === Infinity || to >= slab.limit
          ? `${fmtU(from)}${from === to ? '' : ' – ' + fmtU(to)} units`
          : `${fmtU(from)} – ${fmtU(to)} units`);
      breakdown.push({
        label,
        units: unitsInSlab,
        rate: slab.rate,
        amount: round2(unitsInSlab * slab.rate)
      });
    }
    remaining -= rawUnits;
    prevLimit = Math.min(slab.limit, prevLimit + capacity);
  }
  return breakdown;
}

export function calculateBill({ discomId, categoryId, supplyTypeId, units, connectedLoadKw,
                                billedDemandKw, billingBasis, billingPeriodDays, billingDate,
                                facRate, facMode, arrears, arrearLpsc, lpscRate, currentLpscMonths,
                                lpscApplicable, payments, adjustments, delhiSubsidy, todUnits,
                                netMetering, exportUnits, openingCreditUnits }) {
  const discom = findDiscom(discomId);
  if (!discom) return null;

  const tariff = getEffectiveTariff(discomId, categoryId, supplyTypeId);
  if (!tariff) return null;

  const cat = getCategory(discomId, categoryId);

  // Resolve the rate set effective for the billing date (historical / year-versioned tariffs)
  const stateMeta        = findStateMetaByDiscom(discomId);
  const currentRatesFrom = (stateMeta && stateMeta.currentRatesFrom) || fyStart(discom.tariffYear);
  const currentLabel     = discom.tariffYear ? `FY ${discom.tariffYear}` : 'Current rates';
  const eff              = resolveDatedTariff(tariff, billingDate, currentRatesFrom, currentLabel);

  // Billing basis — what the energy and demand are measured in:
  //   'kwh'   active energy (kWh) + demand in kW (standard LT billing)
  //   'kvah'  "kVA based": apparent energy (kVAh = kWh ÷ PF) + kVA demand. A poor PF raises the
  //           kVAh energy directly, so the PF cost is baked in (no separate PF penalty).
  // An explicit `billingBasis` (from the UI selector) overrides the tariff; otherwise a kVA tariff
  // defaults to 'kvah' and everything else to 'kwh' (so existing kWh bills are unchanged). A legacy
  // 'kva_md' value (old share links) maps to the tariff default.
  const tariffIsKva = (eff.demandUnit === 'kVA' || eff.demandUnit === 'kva');
  const basis = (billingBasis === 'kvah' || billingBasis === 'kwh')
    ? billingBasis
    : (tariffIsKva ? 'kvah' : 'kwh');
  const demandIsKva = (basis === 'kvah');

  // Maximum demand (billed demand) recorded this period; falls back to connected load.
  // For kVA bases the "demand" figures (load, MD, charge rate) are all in kVA — the arithmetic is
  // identical, only the displayed unit differs (see demandUnit).
  const demandUnit = demandIsKva ? 'kVA' : 'kW';
  const effectiveDemand = billedDemandKw || connectedLoadKw;
  // Demand-billed categories (a kVA basis, or an explicit excess-demand rate/config, i.e. commercial/HT)
  // charge the fixed/demand component on the recorded MD; others (e.g. domestic) bill on the
  // sanctioned load regardless of MD, so an entered MD can't wrongly lower a domestic fixed charge.
  // (A state-level/global default penalty does NOT flag a category as MD-billed.)
  const isDemandBilled = demandIsKva || !!eff.excessDemandRate || !!eff.excessDemand;

  // Billing-demand floor (HT / kVA rule): the demand the charge is levied on is the HIGHER of the
  // recorded MD and a percentage of the contract demand (so a consumer can't avoid demand charges by
  // drawing little in a slack month). The floor % is configurable (eff → state), defaulting to 75%
  // for kVA tariffs and 0 (no floor) otherwise — so it never disturbs sanctioned-load (kW) bills.
  const demandFloorPct = (eff.billingDemandFloorPct != null) ? eff.billingDemandFloorPct
                       : (stateMeta && stateMeta.billingDemandFloorPct != null) ? stateMeta.billingDemandFloorPct
                       : (demandUnit === 'kVA' ? DEFAULT_DEMAND_FLOOR_PCT : 0);
  const demandFloor   = +(connectedLoadKw * demandFloorPct / 100).toFixed(2);
  const billingDemand = isDemandBilled ? Math.max(effectiveDemand, demandFloor) : effectiveDemand;
  const demandFloorApplied = isDemandBilled && demandFloor > effectiveDemand && demandFloorPct > 0;
  const demandForFixed = isDemandBilled ? billingDemand : connectedLoadKw;

  const billingMonths = billingPeriodDays ? billingPeriodDays / 30 : 1;
  // Fixed/demand charge is a per-MONTH charge → multiply by the whole months in the period.
  // Whole-month rounding matches real UPPCL bills (a ~33-day cycle bills 1 month, not 1.1).
  const fixedChargeMonths = Math.max(1, Math.round(billingMonths));
  const fixedPerMonth     = resolveFixedCharge(eff.fixedCharge, demandForFixed);
  const fixedCharge       = +(fixedPerMonth * fixedChargeMonths).toFixed(2);

  // Under kVA-based billing the meter is read in kVAh (apparent energy), so the units entered are
  // already apparent and billed directly — no PF conversion. Only the displayed unit differs; a poor
  // power factor shows up as more kVAh on the meter, which is why kVAh regimes drop the PF penalty.
  const energyUnit = basis === 'kvah' ? 'kVAh' : 'kWh';

  // Net metering (rooftop solar): energy is billed on NET import = metered import − (units exported
  // this period + credit banked from earlier). Any surplus banks as a unit credit carried forward
  // (monthly netting; no cash payout modelled). Fixed/demand charges are unaffected.
  const importUnits   = units;
  const availCredit   = netMetering ? Math.max(0, (exportUnits || 0)) + Math.max(0, (openingCreditUnits || 0)) : 0;
  const netUnits      = netMetering ? Math.max(0, +(importUnits - availCredit).toFixed(2)) : units;
  const closingCredit = netMetering ? Math.max(0, +(availCredit - importUnits).toFixed(2)) : 0;

  const slabBreakdown = calculateEnergySlabs(eff.energySlabs, netUnits, billingMonths);
  const totalEnergy   = slabBreakdown.reduce((s, r) => s + r.amount, 0);

  // ── Excess (exceeding) demand penalty ──────────────────────────────────────
  // Charged when recorded MD exceeds the sanctioned load (beyond any tolerance band).
  // Rate resolution, first match wins:
  //   1. eff.excessDemandRate — explicit ₹/kW on the excess (also flags the category MD-billed)
  //   2. eff.excessDemand → stateMeta.excessDemand → DEFAULT_EXCESS_DEMAND, each being
  //      { rate? } (flat ₹/kW) or { multiplier? } (× the per-kW demand rate), with { tolerancePct? }.
  // Per-kW demand rate to multiply: for per_kw fixed charges this is exactly the rate; for
  // tiered/flat charges it's the fixed charge expressed per sanctioned kW (so a multiplier still
  // applies, and e.g. Delhi's "30% of the fixed charge for the excess load" comes out correct).
  const perKwDemandRate = connectedLoadKw > 0
    ? resolveFixedCharge(eff.fixedCharge, connectedLoadKw) / connectedLoadKw
    : 0;
  const exCfg = eff.excessDemand || (stateMeta && stateMeta.excessDemand) || DEFAULT_EXCESS_DEMAND;
  const excessTolerancePct = (eff.excessDemandRate != null) ? 0 : (exCfg.tolerancePct || 0);
  let excessDemandRate = 0, excessDemandMultiplier = null, excessPctEnergyPerKw = null;
  if (eff.excessDemandRate) {
    excessDemandRate = eff.excessDemandRate;
  } else if (exCfg.rate) {
    excessDemandRate = exCfg.rate;
  } else if (exCfg.multiplier && perKwDemandRate > 0) {
    excessDemandRate = +(exCfg.multiplier * perKwDemandRate).toFixed(2);
    excessDemandMultiplier = exCfg.multiplier;
  } else if (exCfg.pctEnergyPerKw) {
    excessPctEnergyPerKw = exCfg.pctEnergyPerKw;   // e.g. TN: 1% of energy charges per excess kW
  }
  const excessThreshold = connectedLoadKw * (1 + excessTolerancePct / 100);
  const excessDemand    = Math.max(0, +(effectiveDemand - excessThreshold).toFixed(2));
  let excessDemandPenalty = 0;
  if (excessDemand > 0) {
    if (excessPctEnergyPerKw) excessDemandPenalty = +(excessDemand * excessPctEnergyPerKw / 100 * totalEnergy).toFixed(2);
    else if (excessDemandRate)  excessDemandPenalty = +(excessDemand * excessDemandRate).toFixed(2);
  }

  // TOD surcharge/rebate: 20% surcharge on peak units, 20% rebate on off-peak units
  // Computed proportionally from the slab-based energy amount
  let todPeakSurcharge = 0;
  let todOffPeakRebate = 0;
  let todNet = 0;
  if (todUnits && totalEnergy > 0) {
    const todTotal = (todUnits.peak || 0) + (todUnits.normal || 0) + (todUnits.offPeak || 0);
    if (todTotal > 0) {
      todPeakSurcharge = +(totalEnergy * (todUnits.peak    || 0) / todTotal * 0.20).toFixed(2);
      todOffPeakRebate = +(totalEnergy * (todUnits.offPeak || 0) / todTotal * 0.20).toFixed(2);
      todNet = +(todPeakSurcharge - todOffPeakRebate).toFixed(2);
    }
  }

  // FPPA / FAC — computed BEFORE percent_total charges so it's in their base (e.g. UPPCL ED%).
  // Two correct methods per SERC regulations:
  //   per_unit: FPPCA = (APPC − BPPC) × units  (notified ₹/unit, traditional)
  //   percent:  surcharge = rate% × (supply + demand charges)  (e.g. UP MYT Reg. 2025, cl.16(4))
  const facBase   = fixedCharge + totalEnergy + excessDemandPenalty + todNet;
  const facAmount = facMode === 'percent'
    ? +(facBase * (facRate || 0) / 100).toFixed(2)
    : +(netUnits * (facRate || 0)).toFixed(2);

  const extraCharges = [];
  let totalExtra = 0;
  for (const charge of (eff.additionalCharges || [])) {
    let amount = 0;
    if (charge.type === 'percent_energy') {
      amount = +(totalEnergy * charge.rate / 100).toFixed(2);
    } else if (charge.type === 'percent_total') {
      // Base includes excess demand, TOD net, and FPPA/FAC (per UPPCL tariff order)
      amount = +((fixedCharge + totalEnergy + excessDemandPenalty + todNet + facAmount) * charge.rate / 100).toFixed(2);
    } else if (charge.type === 'per_unit') {
      amount = +(netUnits * charge.rate).toFixed(2);
    } else if (charge.type === 'flat') {
      amount = charge.rate;
    }
    extraCharges.push({ name: charge.name, amount, rate: charge.rate, type: charge.type });
    totalExtra += amount;
  }

  const currentGross = +(fixedCharge + totalEnergy + excessDemandPenalty + todNet + facAmount + totalExtra).toFixed(2);

  // Delhi GNCTD subsidy
  let subsidyAmount = 0;
  let subsidyLabel  = '';
  if (delhiSubsidy && netUnits > 0) {
    if (netUnits <= 200) {
      subsidyAmount = currentGross;
      subsidyLabel  = 'GNCTD Subsidy (100% — ≤200 units)';
    } else if (netUnits <= 400) {
      subsidyAmount = Math.min(200 * 3.00, totalEnergy) * 0.5;
      subsidyLabel  = 'GNCTD Subsidy (50% rebate on first 200 units)';
    }
  }

  const currentNet = Math.round(Math.max(0, currentGross - subsidyAmount));

  const safeArrears = arrears    || 0;
  const safeArrLpsc = arrearLpsc || 0;
  // LPSC on the current bill — only when the consumer/period has LPSC applicable
  const currentLpsc = (lpscApplicable === false)
    ? 0
    : +(currentNet * (lpscRate || 0) / 100 * (currentLpscMonths || 0)).toFixed(2);

  const totalPayments    = (payments    || []).reduce((s, p) => s + (p.amount || 0), 0);
  const totalAdjustments = (adjustments || []).reduce((s, a) => s + (a.amount || 0), 0);

  const totalPayable = Math.round(
    currentNet + safeArrears + safeArrLpsc + currentLpsc
    - totalPayments + totalAdjustments
  );

  return {
    discom,
    category: cat,
    supplyTypeId,
    supplyTypeName: (cat && cat.supplyTypes && cat.supplyTypes.length > 0 && supplyTypeId)
      ? tariff.name : null,
    units,
    billingBasis: basis,
    energyUnit,
    netMetering: !!netMetering,
    importUnits,
    exportUnits: netMetering ? Math.max(0, exportUnits || 0) : 0,
    openingCreditUnits: netMetering ? Math.max(0, openingCreditUnits || 0) : 0,
    netUnits,
    closingCredit,
    connectedLoadKw,
    billedDemandKw: effectiveDemand,
    billingDemand,
    isDemandBilled,
    demandFloorPct,
    demandFloor,
    demandFloorApplied,
    demandUnit,
    billingPeriodDays: billingPeriodDays || null,
    fixedCharge: +fixedCharge.toFixed(2),
    fixedChargeMonths,
    fixedPerMonth: +fixedPerMonth.toFixed(2),
    slabBreakdown,
    totalEnergy: +totalEnergy.toFixed(2),
    excessDemand: +excessDemand.toFixed(2),
    excessDemandPenalty,
    excessDemandRate,
    excessDemandMultiplier,
    excessDemandPctEnergyPerKw: excessPctEnergyPerKw,
    excessDemandTolerancePct: excessTolerancePct,
    todUnits: todUnits || null,
    todPeakSurcharge,
    todOffPeakRebate,
    todNet,
    extraCharges,
    facAmount,
    facRate: facRate || 0,
    facMode: facMode === 'percent' ? 'percent' : 'per_unit',
    tariffPeriodLabel: eff.periodLabel,
    tariffEstimated: !!eff.estimated,
    tariffEffectiveFrom: eff.effectiveFrom || null,
    // Data-confidence metadata: whether these rates were checked against an official tariff order
    // (vs. a representative estimate). Tariff-level wins, else DISCOM-level, else state-level.
    tariffVerified:  (eff.verified != null) ? !!eff.verified
                   : (discom.verified != null) ? !!discom.verified
                   : !!(stateMeta && stateMeta.verified),
    tariffAsOf:      eff.asOf || discom.ratesAsOf || (stateMeta && stateMeta.ratesAsOf) || null,
    tariffSourceUrl: eff.sourceUrl || discom.sourceUrl || discom.website || (stateMeta && stateMeta.sourceUrl) || null,
    billingDate: billingDate || null,
    // Resolved rate schedule behind this bill (for the Tariff Details panel)
    tariffRates: {
      fixedCharge:       eff.fixedCharge,
      energySlabs:       eff.energySlabs,
      additionalCharges: eff.additionalCharges || [],
      excessDemandRate:  eff.excessDemandRate || 0,
    },
    currentGross,
    subsidyAmount: +subsidyAmount.toFixed(2),
    subsidyLabel,
    currentNet,
    arrears: safeArrears,
    arrearLpsc: safeArrLpsc,
    lpscRate: lpscRate || 0,
    currentLpscMonths: currentLpscMonths || 0,
    lpscApplicable: lpscApplicable !== false,
    currentLpsc,
    payments: payments || [],
    totalPayments: +totalPayments.toFixed(2),
    adjustments: adjustments || [],
    totalAdjustments: +totalAdjustments.toFixed(2),
    totalPayable
  };
}
