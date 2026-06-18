// js/engine.js — Pure bill calculation engine (no DOM dependencies)

import {
  findDiscom,
  getEffectiveTariff,
  getCategory,
  findStateMetaByDiscom,
  resolveDatedTariff,
  fyStart,
} from './tariffs/registry.js';

export function resolveFixedCharge(fixedCharge, connectedLoadKw) {
  if (typeof fixedCharge === 'number') return fixedCharge;
  if (!fixedCharge) return 0;
  if (fixedCharge.type === 'flat') return fixedCharge.rate;
  if (fixedCharge.type === 'per_kw') return fixedCharge.rate * connectedLoadKw;
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
                                billedDemandKw, billingPeriodDays, billingDate,
                                facRate, facMode, arrears, arrearLpsc, lpscRate, currentLpscMonths,
                                lpscApplicable, payments, adjustments, delhiSubsidy, todUnits }) {
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

  // Use billed demand for fixed charge calculation (commercial); falls back to connected load
  const effectiveDemand = billedDemandKw || connectedLoadKw;

  const billingMonths = billingPeriodDays ? billingPeriodDays / 30 : 1;
  // Fixed/demand charge is a per-MONTH charge → multiply by the whole months in the period.
  // Whole-month rounding matches real UPPCL bills (a ~33-day cycle bills 1 month, not 1.1).
  const fixedChargeMonths = Math.max(1, Math.round(billingMonths));
  const fixedPerMonth     = resolveFixedCharge(eff.fixedCharge, effectiveDemand);
  const fixedCharge       = +(fixedPerMonth * fixedChargeMonths).toFixed(2);

  const slabBreakdown = calculateEnergySlabs(eff.energySlabs, units, billingMonths);
  const totalEnergy   = slabBreakdown.reduce((s, r) => s + r.amount, 0);

  // Excess demand penalty: charged when billed demand exceeds sanctioned load
  const excessDemand        = Math.max(0, effectiveDemand - connectedLoadKw);
  const excessDemandRate    = eff.excessDemandRate || 0;
  const excessDemandPenalty = (excessDemand > 0 && excessDemandRate)
    ? +(excessDemand * excessDemandRate).toFixed(2)
    : 0;

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
    : +(units * (facRate || 0)).toFixed(2);

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
      amount = +(units * charge.rate).toFixed(2);
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
  if (delhiSubsidy && units > 0) {
    if (units <= 200) {
      subsidyAmount = currentGross;
      subsidyLabel  = 'GNCTD Subsidy (100% — ≤200 units)';
    } else if (units <= 400) {
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
    connectedLoadKw,
    billedDemandKw: effectiveDemand,
    billingPeriodDays: billingPeriodDays || null,
    fixedCharge: +fixedCharge.toFixed(2),
    fixedChargeMonths,
    fixedPerMonth: +fixedPerMonth.toFixed(2),
    slabBreakdown,
    totalEnergy: +totalEnergy.toFixed(2),
    excessDemand: +excessDemand.toFixed(2),
    excessDemandPenalty,
    excessDemandRate,
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
