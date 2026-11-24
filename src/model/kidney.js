import { clamp, DIET, REFERENCE } from './balance.js'
import { HORMONE_BASELINE } from './hormones.js'

export function kidney(inputs, stores, hemodynamics, hormones, frozen) {
  const renal = inputs.renal / 100
  const loop = Number(inputs.diuretic === 'loop')
  const thiazide = Number(inputs.diuretic === 'thiazide')
  const diet = inputs.soluteIntake / 100
  const clearance = 0.20 + 0.80 * renal
  const angiotensinEffect = hormones.angII - HORMONE_BASELINE.angII
  const aldoEffect = hormones.aldosterone - HORMONE_BASELINE.aldosterone
  const proximal = clamp(0.63 + 0.33 * angiotensinEffect - 0.28 * hormones.natriureticSignal)
  const thickAscendingLimb = clamp(0.68 - 0.49 * loop)
  const distal = clamp(0.49 - 0.39 * thiazide)
  const gradient = frozen.gradient ?? clamp(0.84 * (0.18 + 0.82 * renal) * (1 - 0.57 * loop) * (0.78 + 0.22 * diet))
  const aqp2 = clamp(hormones.avp * inputs.avpSensitivity)
  const waterRecovery = aqp2 * gradient
  const enac = clamp(0.34 + 0.78 * aldoEffect - 0.21 * hormones.natriureticSignal)
  const distalDelivery = 0.48 * loop + 0.34 * thiazide
  const kSecretion = clamp(0.34 + 0.68 * (enac - 0.34) + 0.70 * distalDelivery
    + 0.35 * (stores.potassium / REFERENCE.potassium - 1))
  const pressureNatriuresis = 1.35 * (hemodynamics.filling - 1)
  const sodium = DIET.sodium * clearance * clamp(1 + pressureNatriuresis + 0.75 * loop
    + 0.49 * thiazide - 0.62 * angiotensinEffect - 0.54 * aldoEffect + 1.1 * hormones.natriureticSignal, 0.025, 3)
  const potassium = DIET.potassium * clearance * clamp(1 + 1.2 * (kSecretion - 0.34)
    + 0.38 * (stores.potassium / REFERENCE.potassium - 1), 0.05, 2.5)
  // Compare against a reference solute load and diluting/concentrating state.
  // These indices are illustrative and do not report measured urine osmolality.
  const soluteLoad = 2 * (sodium + potassium) + 270 * diet
  const dilution = (0.58 + 0.42 * renal) * (1 - 0.30 * thiazide) * (1 - 0.15 * loop)
  const concentration = 0.25 / dilution + 0.75 * waterRecovery / (HORMONE_BASELINE.avp * 0.84)
  const water = clamp(1.5 * (soluteLoad / 670) / concentration, 0.25, 1.5 + 7.5 * renal)
  return {
    proximal, thickAscendingLimb, distal, gradient, aqp2, waterRecovery, enac, kSecretion, concentration,
    urine: { water, sodium, potassium },
  }
}
