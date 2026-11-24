import { clamp, REFERENCE } from './balance.js'

export function circulation(volumes, inputs, frozen) {
  const pump = inputs.cardiac / 100
  const plasmaRatio = volumes.plasma / REFERENCE.plasma
  const ecfExpansion = volumes.ecf / REFERENCE.ecf - 1
  const filling = frozen.filling ?? clamp(plasmaRatio * (0.37 + 0.63 * pump), 0, 1.55)
  const congestion = frozen.congestion ?? clamp(0.85 * ecfExpansion + 0.95 * (1 - pump) * plasmaRatio, 0, 1.55)
  const atrialStretch = clamp(0.18 + 0.65 * congestion + 0.45 * (plasmaRatio - 1))
  const ventricularStretch = clamp(0.16 + 0.46 * congestion + 0.55 * (1 - pump) + 0.15 * (filling - 1))
  return { pump, filling, congestion, atrialStretch, ventricularStretch }
}

export function sense(volumes, hemodynamics, inputs) {
  const { filling, atrialStretch, ventricularStretch } = hemodynamics
  const excessTonicity = volumes.sodium - 140
  const underfilling = Math.max(0, 1 - filling)
  const cardiopulmonary = clamp(0.33 + 0.74 * ((atrialStretch + ventricularStretch) / 2 - 0.17))
  return {
    ovlt: clamp(0.35 + 0.045 * excessTonicity),
    sfoOsmotic: clamp(0.30 + 0.038 * excessTonicity),
    osmoticDrive: clamp(0.055 * excessTonicity, -0.33, 0.82),
    carotid: clamp(0.52 + 0.85 * (filling - 1)),
    aortic: clamp(0.48 + 0.75 * (filling - 1)),
    cardiopulmonary,
    centralVolumeDrive: 0.12 * (0.33 - cardiopulmonary),
    underfilling,
    thirstDrive: 0.16 + Math.max(0, 0.038 * excessTonicity) + 0.95 * underfilling,
    jga: clamp(0.20 + 1.55 * underfilling - 0.50 * Math.max(0, filling - 1)
      + (inputs.diuretic === 'loop' ? 0.28 : 0) + (inputs.diuretic === 'thiazide' ? 0.1 : 0)),
  }
}
