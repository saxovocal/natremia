import { fluidVolumes, fluxRates, integratePools } from './balance.js'
import { signal } from './hormones.js'
import { kidney } from './kidney.js'
import { circulation, sense } from './sensors.js'

export function evaluate(patient) {
  const { stores, inputs, overrides, frozen } = patient
  const volumes = fluidVolumes(stores)
  const hemodynamics = circulation(volumes, inputs, frozen)
  const sensors = sense(volumes, hemodynamics, inputs)
  const hormones = signal(sensors, hemodynamics, stores, inputs, overrides, frozen)
  const renal = kidney(inputs, stores, hemodynamics, hormones, frozen)
  return {
    stores, inputs, volumes, hemodynamics, sensors, hormones, renal,
    rates: fluxRates(inputs, hormones.thirst, renal.urine),
  }
}

export function advance(patient, hours) {
  if (!Number.isFinite(hours) || hours < 0) throw new RangeError('Expected a non-negative duration in hours.')
  let current = patient
  // Hour-sized integration steps for numerical bookkeeping, without imposing
  // hour-scale response kinetics on the instantaneous signalling rules.
  for (let elapsed = 0; elapsed < hours; elapsed += 1) {
    const stepHours = Math.min(1, hours - elapsed)
    const { rates } = evaluate(current)
    const next = integratePools(current.stores, rates, stepHours / 24, current.frozen, current.ledger)
    current = { ...current, ...next, hours: current.hours + stepHours }
  }
  return current
}

export const FREEZABLE = {
  water: { label: 'Total body water', value: (s) => s.stores.water },
  sodium: { label: 'Exchangeable sodium', value: (s) => s.stores.sodium },
  potassium: { label: 'Exchangeable potassium', value: (s) => s.stores.potassium },
  avp: { label: 'AVP', value: (s) => s.hormones.avp },
  angII: { label: 'Angiotensin II', value: (s) => s.hormones.angII },
  aldosterone: { label: 'Aldosterone', value: (s) => s.hormones.aldosterone },
  anp: { label: 'ANP', value: (s) => s.hormones.anp },
  bnp: { label: 'BNP', value: (s) => s.hormones.bnp },
  gradient: { label: 'Medullary gradient', value: (s) => s.renal.gradient },
  filling: { label: 'Arterial filling', value: (s) => s.hemodynamics.filling },
  congestion: { label: 'Venous congestion', value: (s) => s.hemodynamics.congestion },
}

export function toggleFreeze(patient, key) {
  const frozen = { ...patient.frozen }
  if (Object.hasOwn(frozen, key)) delete frozen[key]
  else frozen[key] = FREEZABLE[key].value(evaluate(patient))
  return { ...patient, frozen }
}

export const OUTCOMES = {
  sodium: { label: 'Plasma sodium estimate', unit: 'mmol/L', digits: 1, threshold: 0.1, value: (s) => s.volumes.sodium, cause: 'The estimate rises when water falls relative to the exchangeable sodium and potassium pools.' },
  icf: { label: 'Intracellular volume', unit: 'L', digits: 1, threshold: 0.1, value: (s) => s.volumes.icf, cause: 'Higher effective tonicity draws water out of cells. Lower effective tonicity lets water enter them.' },
  urine: { label: 'Urine water output', unit: 'L/day', digits: 2, threshold: 0.05, value: (s) => s.renal.urine.water, cause: 'Urine water reflects AQP2, the medullary gradient, filtered solute and diluting capacity.' },
  filling: { label: 'Effective arterial filling', unit: '× baseline', digits: 2, threshold: 0.02, value: (s) => s.hemodynamics.filling, cause: 'Arterial filling depends on both plasma volume and the ability of the heart to deliver flow.' },
  avp: { label: 'AVP activity index', unit: '', digits: 2, threshold: 0.02, value: (s) => s.hormones.avp, cause: 'Tonicity and arterial stretch change AVP drive. The preset and overrides can alter the released signal.' },
}

export function predict(patient, outcome, hours = 24) {
  const metric = OUTCOMES[outcome]
  const projected = advance(patient, hours)
  const before = metric.value(evaluate(patient))
  const after = metric.value(evaluate(projected))
  const difference = after - before
  const direction = Math.abs(difference) < metric.threshold ? 'stable' : difference > 0 ? 'increase' : 'decrease'
  return { before, after, direction }
}
