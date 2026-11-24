import { DEFAULT_INPUTS, emptyLedger, POOLS, REFERENCE } from './balance.js'

export const PRESETS = {
  baseline: {
    name: 'Healthy baseline',
    description: 'Water and electrolyte intake roughly match output. Change an input, then advance time to see the fluid pools respond.',
  },
  diarrhoea: {
    name: 'Diarrhoea',
    description: 'Gut losses remove water, sodium and potassium. The smaller extracellular pool reduces arterial filling and activates AVP and RAAS.',
    stores: { water: 38.9, sodium: 2240, potassium: 3270 },
    inputs: { waterIntake: 1.6, fluidLoss: 1.7 },
  },
  siadh: {
    name: 'SIADH',
    description: 'Persistent AVP action despite low tonicity retains water. Dilution lowers the plasma sodium estimate and expands cells.',
    stores: { water: 45, sodium: 2470, potassium: 3340 },
    inputs: { avpFloor: 0.77 },
  },
  heartFailure: {
    name: 'Heart failure',
    description: 'Reduced pump function leaves the arteries underfilled while venous pressure and wall stretch rise. High BNP can coexist with sodium retention.',
    stores: { water: 47, sodium: 2860, potassium: 3310 },
    inputs: { cardiac: 34, renal: 78 },
  },
  hypernatraemia: {
    name: 'Hypernatraemia',
    description: 'A free-water deficit raises tonicity and shrinks cells. Thirst and AVP increase, but drinking requires access to water.',
    stores: { water: 38, sodium: 2520, potassium: 3360 },
    inputs: { waterAccess: false, fluidLoss: 0.5, lossType: 'water' },
  },
  avpDeficiency: {
    name: 'AVP deficiency',
    description: 'The brain detects hypertonicity, but releases little AVP. Few AQP2 channels are inserted and the kidney produces dilute urine.',
    stores: { water: 40, sodium: 2520, potassium: 3360 },
    inputs: { avpCapacity: 0.07 },
  },
  avpResistance: {
    name: 'AVP resistance',
    description: 'The AVP signal is present, but the collecting duct responds weakly. Dilute urine continues despite high AVP.',
    stores: { water: 40, sodium: 2520, potassium: 3360 },
    inputs: { avpSensitivity: 0.10 },
  },
}

export function createPatient(preset = 'baseline') {
  const scenario = PRESETS[preset]
  return {
    preset,
    hours: 0,
    stores: { water: REFERENCE.water, sodium: REFERENCE.sodium, potassium: REFERENCE.potassium, ...scenario.stores },
    inputs: { ...DEFAULT_INPUTS, ...scenario.inputs },
    overrides: {},
    frozen: {},
    ledger: Object.fromEntries(POOLS.map((pool) => [pool, emptyLedger()])),
  }
}
