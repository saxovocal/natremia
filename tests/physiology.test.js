import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { POOLS, REFERENCE } from '../src/model/balance.js'
import { HORMONE_BASELINE } from '../src/model/hormones.js'
import { advance, evaluate, predict, toggleFreeze } from '../src/model/index.js'
import { createPatient, PRESETS } from '../src/model/presets.js'
import { ORGANS, REFERENCES } from '../src/ui/content.js'

const baseline = () => createPatient()
const healthy = evaluate(baseline())
const changeInputs = (patient, overrides) => ({ ...patient, inputs: { ...patient.inputs, ...overrides } })
const replaceStores = (patient, stores) => ({ ...patient, stores: { ...patient.stores, ...stores } })
const closeTo = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `Expected ${actual} close to ${expected}`)

function conserved(before, after) {
  for (const pool of POOLS) {
    const { intake, extraRenal, urine, clamp } = after.ledger[pool]
    closeTo(after.stores[pool], before.stores[pool] + intake - extraRenal - urine + clamp)
  }
}

describe('Water and electrolyte mass balance', () => {
  test('healthy baseline preserves water, sodium and potassium stores for a week', () => {
    const initial = baseline()
    const after = advance(initial, 168)
    for (const pool of POOLS) closeTo(after.stores[pool], initial.stores[pool])
    conserved(initial, after)
  })

  test('all presets conserve each pool and the extracellular and intracellular volumes sum to TBW', () => {
    for (const key of Object.keys(PRESETS)) {
      const patient = createPatient(key)
      const after = advance(patient, 48)
      const { volumes } = evaluate(after)
      conserved(patient, after)
      closeTo(volumes.ecf + volumes.icf, after.stores.water)
      closeTo(volumes.plasma + volumes.interstitial, volumes.ecf)
    }
  })

  test('gut fluid carries Na and K and an equivalent free-water loss does not', () => {
    const losses = changeInputs(baseline(), { fluidLoss: 2 })
    const gut = evaluate(losses).rates.extraRenal
    const free = evaluate(changeInputs(losses, { lossType: 'water' })).rates.extraRenal
    assert.equal(gut.water, free.water)
    assert.ok(gut.sodium > free.sodium)
    assert.ok(gut.potassium > free.potassium)
  })

  test('pool depletion is bounded and accounted for under prolonged closed-water stress', () => {
    const patient = changeInputs(baseline(), { waterAccess: false, fluidLoss: 4, soluteIntake: 25 })
    const after = advance(patient, 24 * 20)
    assert.ok(after.stores.water >= 1 - 1e-8)
    assert.ok(Object.values(after.stores).every((value) => Number.isFinite(value) && value > 0))
    conserved(patient, after)
  })

  test('low tonicity expands cells and isolated free-water loss shrinks cells', () => {
    const diluted = evaluate(replaceStores(baseline(), { water: 46 }))
    const concentrated = evaluate(replaceStores(baseline(), { water: 38 }))
    assert.ok(diluted.volumes.icf > healthy.volumes.icf)
    assert.ok(concentrated.volumes.icf < healthy.volumes.icf)
    assert.ok(diluted.volumes.sodium < 140 && concentrated.volumes.sodium > 140)
  })

  test('exchangeable K contributes to the plasma sodium estimate and solute intake feeds both pools', () => {
    const output = evaluate(replaceStores(baseline(), { potassium: REFERENCE.potassium + 70 }))
    assert.ok(output.volumes.sodium > 140)
    const intake = evaluate(changeInputs(baseline(), { soluteIntake: 150 })).rates.intake
    assert.ok(intake.sodium > healthy.rates.intake.sodium)
    assert.ok(intake.potassium > healthy.rates.intake.potassium)
  })
})

describe('Osmosensation, thirst and AVP', () => {
  test('free-water deficit raises OVLT/SFO signals, AVP and thirst', () => {
    const output = evaluate(replaceStores(baseline(), { water: 39 }))
    assert.ok(output.sensors.ovlt > healthy.sensors.ovlt)
    assert.ok(output.sensors.sfoOsmotic > healthy.sensors.sfoOsmotic)
    assert.ok(output.hormones.avp > healthy.hormones.avp)
    assert.ok(output.hormones.thirst > healthy.hormones.thirst)
    assert.ok(output.renal.aqp2 > healthy.renal.aqp2)
    assert.ok(output.renal.urine.water < healthy.renal.urine.water)
  })

  test('drinking access gates intake while thirst remains high', () => {
    const patient = createPatient('hypernatraemia')
    const blocked = evaluate(patient)
    const available = evaluate(changeInputs(patient, { waterAccess: true }))
    assert.equal(blocked.hormones.thirst, available.hormones.thirst)
    assert.equal(blocked.rates.oralWater, 0)
    assert.ok(available.rates.oralWater > available.inputs.waterIntake)
    assert.ok(advance(patient, 24).stores.water < patient.stores.water)
    assert.ok(advance(changeInputs(patient, { waterAccess: true }), 24).stores.water > patient.stores.water)
  })

  test('SIADH sustains AVP action despite low osmosensor drive', () => {
    const patient = createPatient('siadh')
    const initial = evaluate(patient)
    const later = evaluate(advance(patient, 24))
    assert.ok(initial.volumes.sodium < 135)
    assert.ok(initial.sensors.ovlt < healthy.sensors.ovlt)
    assert.ok(initial.hormones.avp > initial.hormones.avpDemand)
    assert.ok(initial.renal.aqp2 > healthy.renal.aqp2)
    assert.ok(later.volumes.sodium < initial.volumes.sodium)
  })

  test('AVP deficiency and resistance share dilute urine with different upstream signals', () => {
    const deficiency = evaluate(createPatient('avpDeficiency'))
    const resistance = evaluate(createPatient('avpResistance'))
    assert.equal(deficiency.volumes.sodium, resistance.volumes.sodium)
    assert.ok(deficiency.hormones.avp < HORMONE_BASELINE.avp)
    assert.ok(resistance.hormones.avp > HORMONE_BASELINE.avp)
    for (const output of [deficiency, resistance]) {
      assert.ok(output.renal.aqp2 < healthy.renal.aqp2)
      assert.ok(output.renal.urine.water > healthy.renal.urine.water)
    }
  })

  test('raising AVP restores AQP2 in deficiency but leaves severe resistance', () => {
    const response = (preset) => evaluate({ ...createPatient(preset), overrides: { avp: 1 } })
    const responsive = response('avpDeficiency')
    const resistant = response('avpResistance')
    assert.ok(responsive.renal.aqp2 > resistant.renal.aqp2)
    assert.ok(responsive.renal.urine.water < resistant.renal.urine.water)
  })
})

describe('Circulation, RAAS and natriuretic peptides', () => {
  test('diarrhoea reduces effective arterial filling, unloads baroreceptors and activates RAAS', () => {
    const output = evaluate(createPatient('diarrhoea'))
    assert.ok(output.volumes.ecf < healthy.volumes.ecf)
    assert.ok(output.hemodynamics.filling < healthy.hemodynamics.filling)
    assert.ok(output.sensors.carotid < healthy.sensors.carotid)
    assert.ok(output.sensors.aortic < healthy.sensors.aortic)
    assert.ok(output.sensors.jga > healthy.sensors.jga)
    assert.ok(output.hormones.renin > healthy.hormones.renin)
    assert.ok(output.hormones.angI > healthy.hormones.angI)
    assert.ok(output.hormones.angII > healthy.hormones.angII)
    assert.ok(output.hormones.aldosterone > healthy.hormones.aldosterone)
    assert.ok(output.hormones.vascularTone > healthy.hormones.vascularTone)
    assert.ok(output.renal.urine.sodium < healthy.renal.urine.sodium)
  })

  test('heart failure raises ANP and BNP independently of effective arterial filling and renal response', () => {
    const patient = createPatient('heartFailure')
    const output = evaluate(patient)
    assert.ok(output.volumes.ecf > healthy.volumes.ecf)
    assert.ok(output.hemodynamics.filling < healthy.hemodynamics.filling)
    assert.ok(output.hemodynamics.congestion > healthy.hemodynamics.congestion)
    assert.ok(output.sensors.cardiopulmonary > healthy.sensors.cardiopulmonary)
    assert.ok(output.hemodynamics.atrialStretch > healthy.hemodynamics.atrialStretch)
    assert.ok(output.hemodynamics.ventricularStretch > healthy.hemodynamics.ventricularStretch)
    assert.ok(output.hormones.anp > healthy.hormones.anp && output.hormones.bnp > healthy.hormones.bnp)
    assert.ok(output.hormones.peptideResponse < healthy.hormones.peptideResponse)
    assert.ok(output.hormones.angII > healthy.hormones.angII)
    assert.ok(output.renal.urine.sodium < output.rates.intake.sodium)
    assert.ok(advance(patient, 24).stores.sodium > patient.stores.sodium)
  })

  test('the same peptide signal has a larger renal effect in a responsive patient', () => {
    const raised = { anp: 0.9, bnp: 0.9 }
    const suppressed = { anp: 0.18, bnp: 0.16 }
    function sodiumResponse(patient) {
      return evaluate({ ...patient, overrides: raised }).renal.urine.sodium
        - evaluate({ ...patient, overrides: suppressed }).renal.urine.sodium
    }
    assert.ok(sodiumResponse(baseline()) > sodiumResponse(createPatient('heartFailure')))
  })

  test('Ang II overrides act on the proximal tubule, vascular tone and adrenal cortex', () => {
    const output = evaluate({ ...baseline(), overrides: { angII: 0.85 } })
    assert.ok(output.renal.proximal > healthy.renal.proximal)
    assert.ok(output.hormones.vascularTone > healthy.hormones.vascularTone)
    assert.ok(output.hormones.aldosterone > healthy.hormones.aldosterone)
  })
})

describe('Nephron transport', () => {
  test('a loop diuretic weakens the gradient independently of AVP and AQP2', () => {
    const patient = { ...baseline(), overrides: { avp: 0.85 } }
    const before = evaluate(patient)
    const after = evaluate(changeInputs(patient, { diuretic: 'loop' }))
    assert.equal(before.hormones.avp, after.hormones.avp)
    assert.equal(before.renal.aqp2, after.renal.aqp2)
    assert.ok(after.renal.thickAscendingLimb < before.renal.thickAscendingLimb)
    assert.ok(after.renal.gradient < before.renal.gradient)
    assert.ok(after.renal.waterRecovery < before.renal.waterRecovery)
    assert.ok(after.renal.urine.water > before.renal.urine.water)
    assert.ok(after.renal.urine.sodium > before.renal.urine.sodium)
  })

  test('thiazide targets the distal segment while preserving the simulated medullary gradient', () => {
    const output = evaluate(changeInputs(baseline(), { diuretic: 'thiazide' }))
    assert.ok(output.renal.distal < healthy.renal.distal)
    assert.equal(output.renal.gradient, healthy.renal.gradient)
    assert.ok(output.renal.urine.potassium > healthy.renal.urine.potassium)
  })

  test('aldosterone promotes ENaC, Na retention and K secretion independently of AVP', () => {
    const output = evaluate({ ...baseline(), overrides: { aldosterone: 0.9 } })
    assert.equal(output.hormones.avp, healthy.hormones.avp)
    assert.ok(output.renal.enac > healthy.renal.enac)
    assert.ok(output.renal.kSecretion > healthy.renal.kSecretion)
    assert.ok(output.renal.urine.sodium < healthy.renal.urine.sodium)
    assert.ok(output.renal.urine.potassium > healthy.renal.urine.potassium)
  })

  test('renal impairment reduces the modelled concentrating gradient and sodium clearance', () => {
    const output = evaluate(changeInputs(baseline(), { renal: 30 }))
    assert.ok(output.renal.gradient < healthy.renal.gradient)
    assert.ok(output.renal.urine.sodium < healthy.renal.urine.sodium)
  })
})

describe('Teaching controls and source traceability', () => {
  test('a frozen pool stays steady, accounts for the clamp and resumes on release', () => {
    const patient = changeInputs(baseline(), { waterIntake: 5 })
    const frozen = toggleFreeze(patient, 'water')
    const after = advance(frozen, 24)
    assert.equal(after.stores.water, patient.stores.water)
    assert.ok(Math.abs(after.ledger.water.clamp) > 1)
    conserved(patient, after)
    assert.ok(advance(toggleFreeze(after, 'water'), 24).stores.water > after.stores.water)
  })

  test('a freeze takes precedence over overrides and can isolate the medullary gradient', () => {
    const avp = toggleFreeze(baseline(), 'avp')
    const overridden = { ...avp, overrides: { avp: 0.99 } }
    assert.equal(evaluate(overridden).hormones.avp, HORMONE_BASELINE.avp)
    assert.equal(evaluate(toggleFreeze(overridden, 'avp')).hormones.avp, 0.99)
    const gradient = changeInputs(toggleFreeze(baseline(), 'gradient'), { diuretic: 'loop' })
    assert.equal(evaluate(gradient).renal.gradient, healthy.renal.gradient)
  })

  test('a prediction is reproducible and does not mutate the live patient', () => {
    const patient = createPatient('siadh')
    const original = structuredClone(patient)
    const result = predict(patient, 'sodium')
    assert.equal(result.direction, 'decrease')
    assert.equal(result.after, evaluate(advance(patient, 24)).volumes.sodium)
    assert.deepEqual(patient, original)
  })

  test('every organ maps its rules to peer-reviewed citations and documents a modelling limit', () => {
    for (const organ of Object.values(ORGANS)) {
      assert.ok(organ.limitation.length > 40)
      assert.ok(organ.sources.length >= 2)
      for (const key of organ.sources) assert.match(REFERENCES[key].url, /^https:\/\/doi\.org\//)
    }
  })
})
