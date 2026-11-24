import { clamp, REFERENCE } from './balance.js'

export const HORMONE_BASELINE = Object.freeze({ avp: 0.33, angII: 0.22, aldosterone: 0.25, anp: 0.18, bnp: 0.16 })
export const HORMONE_KEYS = Object.keys(HORMONE_BASELINE)

export function signal(sensors, hemodynamics, stores, inputs, overrides, frozen) {
  const { atrialStretch, ventricularStretch, pump, filling } = hemodynamics
  const resolve = (key, automatic) => frozen[key] ?? overrides[key] ?? clamp(automatic)
  const avpDemand = clamp(HORMONE_BASELINE.avp + sensors.osmoticDrive + 1.55 * sensors.underfilling + sensors.centralVolumeDrive)
  const avp = resolve('avp', Math.max(avpDemand * inputs.avpCapacity, inputs.avpFloor))
  const anp = resolve('anp', atrialStretch)
  const bnp = resolve('bnp', ventricularStretch)
  const peptideResponse = (0.18 + 0.82 * inputs.renal / 100) * pump ** 2 * clamp(filling, 0, 1)
  const peptideExcess = 0.65 * (anp - HORMONE_BASELINE.anp) + 0.35 * (bnp - HORMONE_BASELINE.bnp)
  const natriureticSignal = peptideExcess * peptideResponse
  const renin = clamp(sensors.jga - 0.55 * natriureticSignal)
  const angI = renin
  const angII = resolve('angII', HORMONE_BASELINE.angII + (angI - 0.20) * 0.95)
  const potassiumDrive = stores.potassium / REFERENCE.potassium - 1
  const aldosterone = resolve('aldosterone', HORMONE_BASELINE.aldosterone
    + 0.9 * (angII - HORMONE_BASELINE.angII) + 0.65 * potassiumDrive - 0.30 * natriureticSignal)
  const thirst = clamp(sensors.thirstDrive + 0.25 * Math.max(0, angII - HORMONE_BASELINE.angII))
  const vascularTone = clamp(0.24 + 0.80 * (angII - HORMONE_BASELINE.angII))
  return { avpDemand, avp, thirst, renin, angI, angII, aldosterone, anp, bnp, peptideResponse, natriureticSignal, vascularTone }
}
