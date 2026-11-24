// A reference adult for teaching mass conservation. Sodium and potassium are
// exchangeable pools, with osmotic proxies chosen to give 14 L ECF at baseline.
export const REFERENCE = Object.freeze({ water: 42, sodium: 2520, potassium: 3360, ecf: 14, plasma: 3.3 })
export const DIET = Object.freeze({ sodium: 130, potassium: 70 })
export const DEFAULT_INPUTS = Object.freeze({
  waterIntake: 2,
  soluteIntake: 100,
  fluidLoss: 0,
  lossType: 'gut',
  cardiac: 100,
  renal: 100,
  diuretic: 'none',
  waterAccess: true,
  avpCapacity: 1,
  avpFloor: 0,
  avpSensitivity: 1,
})

const LOSS_COMPOSITIONS = {
  gut: { sodium: 65, potassium: 25 },
  water: { sodium: 0, potassium: 0 },
}

export const POOLS = ['water', 'sodium', 'potassium']
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export function fluidVolumes(stores) {
  const extracellularSolute = Math.max(1, 1960 + stores.sodium - REFERENCE.sodium)
  const intracellularSolute = Math.max(1, 3920 + stores.potassium - REFERENCE.potassium)
  const ecf = stores.water * extracellularSolute / (extracellularSolute + intracellularSolute)
  // A schematic shift toward interstitial storage as ECF expands.
  const plasmaFraction = clamp(REFERENCE.plasma / REFERENCE.ecf - 0.08 * (ecf / REFERENCE.ecf - 1), 0.12, 0.34)
  const plasma = ecf * plasmaFraction
  return {
    ecf,
    plasma,
    interstitial: ecf - plasma,
    icf: stores.water - ecf,
    sodium: (stores.sodium + stores.potassium) / stores.water,
  }
}

export function fluxRates(inputs, thirst, urine) {
  const diet = inputs.soluteIntake / 100
  const loss = LOSS_COMPOSITIONS[inputs.lossType]
  const oralWater = inputs.waterAccess ? inputs.waterIntake + 1.4 * Math.max(0, thirst - 0.16) : 0
  return {
    oralWater,
    intake: { water: 0.25 + oralWater, sodium: DIET.sodium * diet, potassium: DIET.potassium * diet },
    extraRenal: {
      water: 0.75 + inputs.fluidLoss,
      sodium: loss.sodium * inputs.fluidLoss,
      potassium: loss.potassium * inputs.fluidLoss,
    },
    urine: { water: urine.water, sodium: urine.sodium, potassium: urine.potassium },
  }
}

export function emptyLedger() {
  return { intake: 0, extraRenal: 0, urine: 0, clamp: 0 }
}

export function integratePools(stores, rates, fractionOfDay, frozen, ledger) {
  const next = {}
  const nextLedger = {}
  for (const pool of POOLS) {
    const intake = rates.intake[pool] * fractionOfDay
    const requestedLoss = (rates.extraRenal[pool] + rates.urine[pool]) * fractionOfDay
    const available = Math.max(0, stores[pool] + intake - 1)
    const outflowScale = requestedLoss > available ? available / requestedLoss : 1
    const extraRenal = rates.extraRenal[pool] * fractionOfDay * outflowScale
    const urine = rates.urine[pool] * fractionOfDay * outflowScale
    const balanced = stores[pool] + intake - extraRenal - urine
    next[pool] = frozen[pool] ?? balanced
    nextLedger[pool] = {
      intake: ledger[pool].intake + intake,
      extraRenal: ledger[pool].extraRenal + extraRenal,
      urine: ledger[pool].urine + urine,
      clamp: ledger[pool].clamp + next[pool] - balanced,
    }
  }
  return { stores: next, ledger: nextLedger }
}
