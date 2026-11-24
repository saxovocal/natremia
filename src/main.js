import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './styles.css'
import { advance, evaluate, FREEZABLE, OUTCOMES, predict, toggleFreeze } from './model/index.js'
import { createPatient, PRESETS } from './model/presets.js'
import { HORMONE_KEYS } from './model/hormones.js'
import { overview, paintScene } from './ui/anatomy.js'
import { describePatient, ORGANS, REFERENCES } from './ui/content.js'
import { icon } from './ui/icons.js'
import { organScene } from './ui/scenes.js'

const app = document.querySelector('#app')
const $ = (selector) => document.querySelector(selector)
const all = (selector) => [...document.querySelectorAll(selector)]
const organKeys = Object.keys(ORGANS)
const shortOrgan = { brain: 'Brain', heart: 'Circulation', raas: 'RAAS', kidney: 'Kidney', fluids: 'Fluids' }
const hormoneNames = { avp: 'AVP', angII: 'Angiotensin II', aldosterone: 'Aldosterone', anp: 'ANP', bnp: 'BNP' }
const patientLetter = ['A', 'B']

const ranges = {
  waterIntake: { label: 'Water intake', min: 0, max: 5, step: 0.1, format: (value) => `${value.toFixed(1)} L/day` },
  soluteIntake: { label: 'Solute intake', min: 25, max: 200, step: 5, format: (value) => `${value}%` },
  fluidLoss: { label: 'Extra fluid loss', min: 0, max: 4, step: 0.1, format: (value) => `${value.toFixed(1)} L/day` },
  cardiac: { label: 'Cardiac function', min: 10, max: 100, step: 1, format: (value) => `${value}%` },
  renal: { label: 'Renal function', min: 5, max: 100, step: 1, format: (value) => `${value}%` },
}

const lessons = {
  baseline: { outcome: 'urine', prompt: 'Increase water intake. After 24 hours, what happens to urine water output?' },
  diarrhoea: { outcome: 'filling', prompt: 'With gut losses continuing, will effective arterial filling recover or fall over the next 24 hours?' },
  siadh: { outcome: 'sodium', prompt: 'If water intake continues while AVP stays elevated, what happens to the plasma sodium estimate?' },
  heartFailure: { outcome: 'filling', prompt: 'What happens to effective arterial filling over 24 hours while the veins are congested?' },
  hypernatraemia: { outcome: 'icf', prompt: 'With drinking-water access still off, what happens to cell volume over the next 24 hours?' },
  avpDeficiency: { outcome: 'sodium', prompt: 'If the kidney continues to lose dilute urine, does drinking fully compensate over the next 24 hours?' },
  avpResistance: { outcome: 'sodium', prompt: 'Override AVP to its maximum. What happens to the plasma sodium estimate if the collecting duct remains resistant?' },
}

let patients = [createPatient(), createPatient('heartFailure')]
let history = []
let mode = 'simulation'
let activePatient = 0
let selected = { organ: 'brain', node: null }
let viewOrgan = null
let signals = true
let teaching = false
let timer = null
let inputDraft = null
let sceneKey = ''
let inspectorKey = ''
let zoom = 1
let modalReturnFocus = null

function button(action, iconName, label, css = '', extra = '') {
  return `<button type="button" class="button ${css}" data-action="${action}" ${extra}>${icon(iconName)}${label ? `<span>${label}</span>` : ''}</button>`
}

function selectOptions(values) {
  return Object.entries(values).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')
}

const scenarios = selectOptions(Object.fromEntries(Object.entries(PRESETS).map(([key, preset]) => [key, preset.name])))

function rangeInput(key) {
  const { label, min, max, step } = ranges[key]
  return `<div class="range-control">
    <div class="control-label"><label for="input-${key}">${label}</label><output id="value-${key}" for="input-${key}"></output></div>
    <input id="input-${key}" aria-describedby="value-${key}" data-input="${key}" type="range" min="${min}" max="${max}" step="${step}">
  </div>`
}

function controls() {
  return `<aside class="card input-panel" aria-label="Physiological inputs">
    <div class="panel-heading">
      <span class="heading-icon">${icon('sliders', 17)}</span>
      <h2>Physiological inputs</h2>
      <span class="target-label" id="edit-target" hidden></span>
    </div>
    <div class="inputs-body">
      <div class="input-group">
        <h3>Fluid &amp; solute</h3>
        ${['waterIntake', 'soluteIntake', 'fluidLoss'].map(rangeInput).join('')}
        <div class="inline-control loss-control" id="loss-control" hidden>
          <label for="loss-type">Loss type</label>
          <span class="select-wrap"><select id="loss-type" data-input="lossType">
            <option value="gut">Gut fluid</option><option value="water">Free water</option>
          </select>${icon('chevron', 14)}</span>
        </div>
      </div>
      <div class="input-group organ-inputs">
        <h3>Organ function</h3>
        ${['cardiac', 'renal'].map(rangeInput).join('')}
        <div class="inline-control">
          <label for="diuretic">Diuretics</label>
          <span class="select-wrap"><select id="diuretic" data-input="diuretic">
            <option value="none">None</option><option value="loop">Loop</option><option value="thiazide">Thiazide</option>
          </select>${icon('chevron', 14)}</span>
        </div>
      </div>
      <div class="input-group access-group">
        <span class="form-icon">${icon('drop', 17)}</span>
        <label for="water-access">Drinking-water access</label>
        <label class="switch">
          <input id="water-access" type="checkbox" role="switch" aria-label="Drinking-water access" data-input="waterAccess">
          <span aria-hidden="true"></span>
        </label>
      </div>
      <details class="advanced">
        <summary>${icon('sliders', 15)}<span>Advanced controls</span>${icon('chevron', 15)}</summary>
        <div class="advanced-content">
          <h3>Hormone overrides</h3>
          <p>Manual values set a relative activity index. A frozen value takes precedence.</p>
          ${HORMONE_KEYS.map((key) => `<div class="hormone-control">
            <div class="control-label"><label for="override-${key}">${hormoneNames[key]}</label>
              <button class="mode-button" type="button" data-action="override" data-key="${key}" aria-label="Manual ${hormoneNames[key]} override">Auto</button>
            </div>
            <input type="range" min="0" max="100" step="1" id="override-${key}" data-override="${key}" aria-label="${hormoneNames[key]} relative activity">
          </div>`).join('')}
          <h3>Freeze a variable</h3>
          <div class="freeze-row">
            <span class="select-wrap"><select id="freeze-select" aria-label="Variable to freeze">${selectOptions(Object.fromEntries(Object.entries(FREEZABLE).map(([key, detail]) => [key, detail.label])))}</select>${icon('chevron', 14)}</span>
            ${button('freeze', 'lock', '', 'icon-button', 'id="freeze-button" aria-label="Freeze selected variable" title="Freeze selected variable"')}
          </div>
          <div id="frozen-variables" class="frozen-variables"></div>
        </div>
      </details>
    </div>
  </aside>`
}

function layout() {
  return `<header class="topbar">
    <div class="topbar-inner">
      <button type="button" class="brand" data-action="home" aria-label="The Sodium Lab home">
        <span class="brand-mark">${icon('flask', 23)}</span>
        <span class="brand-text">The Sodium Lab<small>PHYSIOLOGY SIMULATOR</small></span>
      </button>
      <nav class="top-nav" aria-label="Lab views">
        ${button('simulation', 'map', 'Simulation', 'nav-button', 'id="nav-simulation"')}
        ${button('compare', 'compare', 'Compare', 'nav-button', 'id="nav-compare"')}
        ${button('references', 'book', 'References', 'nav-button')}
      </nav>
      <div class="top-actions">
        ${button('undo', 'undo', '', 'icon-button undo-button', 'id="undo" aria-label="Undo last change" title="Undo last change"')}
        ${button('reset', 'reset', 'Reset', 'reset-button', 'aria-label="Reset patient" title="Reset patient"')}
      </div>
    </div>
  </header>
  <main class="page">
    <section class="intro" aria-labelledby="page-title">
      <div>
        <h1 id="page-title">Human fluid homeostasis</h1>
        <p>Change a physiological input and follow its effects through the body.</p>
      </div>
      <div class="preset-control">
        <span class="preset-icon">${icon('pulse', 18)}</span>
        <div>
          <label for="scenario">Patient scenario</label>
          <span class="select-wrap"><select id="scenario" data-scenario aria-describedby="scenario-description">${scenarios}</select>${icon('chevron', 16)}</span>
        </div>
      </div>
    </section>
    <p id="scenario-description" class="sr-only"></p>
    <div class="workspace" id="workspace">
      ${controls()}
      <section class="center-panel" aria-label="Simulation canvas">
        <div class="card map-card" id="map-card">
          <div class="canvas-header">
            <div class="canvas-heading">
              <div id="canvas-kicker"><span></span><span>INTERACTIVE ANATOMY</span></div>
              <h2 id="canvas-title">Anatomy map</h2>
            </div>
            <div id="canvas-actions" class="canvas-actions"></div>
          </div>
          <div id="scene" class="scene"></div>
          <nav id="organ-navigation" class="organ-navigation" aria-label="Organ shortcuts"></nav>
          <div class="canvas-footer">
            <div class="legend" aria-label="Signal legend">
              <span><i class="legend-water"></i> Water</span>
              <span><i class="legend-sodium"></i> Sodium</span>
              <span><i class="legend-hormone"></i> Hormones</span>
            </div>
            <div class="signal-control">
              <label for="show-signals">Signals</label>
              <label class="switch small"><input type="checkbox" id="show-signals" role="switch" aria-label="Show animated signals" checked><span aria-hidden="true"></span></label>
            </div>
          </div>
        </div>
        <div class="card timebar" aria-label="Simulation time controls">
          <div class="time-actions">
            ${button('play', 'play', '', 'play-button', 'id="play" aria-label="Run simulation" title="Run simulation"')}
            ${button('advance', 'step', '+6 h', 'step-button', 'title="Advance six hours"')}
          </div>
          <div class="time-display">
            <span id="clock"></span>
            <span id="time-state"><i></i><span>Paused</span></span>
          </div>
          <div class="lesson-actions">
            ${button('teaching', 'book', 'Teach', 'teaching-button', 'id="teaching" aria-label="Teaching mode" title="Teaching mode"')}
            ${button('prediction', 'predict', 'Predict', 'predict-button', 'aria-label="Make a prediction"')}
          </div>
        </div>
      </section>
      <aside id="inspector" class="card inspector" aria-label="Pathway inspector"></aside>
    </div>
  </main>
  <dialog id="dialog" aria-labelledby="dialog-title"></dialog>
  <div id="announcement" class="sr-only" aria-live="polite"></div>`
}

app.innerHTML = layout()

function currentPatient(index = activePatient) {
  const patient = patients[index]
  if (inputDraft?.index !== index) return patient
  if (inputDraft.hormone) {
    return { ...patient, overrides: { ...patient.overrides, [inputDraft.key]: inputDraft.value } }
  }
  return { ...patient, inputs: { ...patient.inputs, [inputDraft.key]: inputDraft.value } }
}

function announce(message) {
  $('#announcement').textContent = message
}

function mutate(change) {
  history = [...history.slice(-63), { patients, activePatient }]
  patients = change(patients)
  inputDraft = null
}

function changePatient(change) {
  mutate((current) => current.map((patient, i) => i === activePatient ? change(patient) : patient))
}

function timeLabel(hours) {
  return `Day ${Math.floor(hours / 24)} · ${String(Math.round(hours % 24)).padStart(2, '0')} h`
}

function refreshControls(patient, output) {
  for (const [key, range] of Object.entries(ranges)) {
    const control = $('#input-' + key)
    control.value = patient.inputs[key]
    control.style.setProperty('--range', `${(patient.inputs[key] - range.min) / (range.max - range.min) * 100}%`)
    $('#value-' + key).value = range.format(patient.inputs[key])
    control.setAttribute('aria-valuetext', range.format(patient.inputs[key]))
  }
  $('#loss-type').value = patient.inputs.lossType
  $('#loss-control').hidden = patient.inputs.fluidLoss === 0
  $('#diuretic').value = patient.inputs.diuretic
  $('#water-access').checked = patient.inputs.waterAccess
  $('#scenario').value = patient.preset
  $('#scenario-description').textContent = PRESETS[patient.preset].description
  $('#edit-target').hidden = mode !== 'compare'
  $('#edit-target').textContent = patientLetter[activePatient]
  for (const key of HORMONE_KEYS) {
    const manual = Object.hasOwn(patient.overrides, key)
    const frozen = Object.hasOwn(patient.frozen, key)
    const toggle = $(`[data-action="override"][data-key="${key}"]`)
    toggle.textContent = manual ? 'Manual' : 'Auto'
    toggle.setAttribute('aria-pressed', String(manual))
    toggle.disabled = frozen
    const range = $('#override-' + key)
    const value = Math.round((manual ? patient.overrides[key] : output.hormones[key]) * 100)
    range.value = value
    range.disabled = !manual || frozen
    range.style.setProperty('--range', value + '%')
    range.setAttribute('aria-valuetext', `${value} of 100 relative activity`)
  }
  refreshFreeze(patient)
}

function refreshFreeze(patient) {
  const key = $('#freeze-select').value
  const frozen = Object.hasOwn(patient.frozen, key)
  const action = (frozen ? 'Unfreeze ' : 'Freeze ') + FREEZABLE[key].label
  $('#freeze-button').setAttribute('aria-label', action)
  $('#freeze-button').title = action
  $('#freeze-button').setAttribute('aria-pressed', String(frozen))
  const current = Object.keys(patient.frozen)
  const chips = $('#frozen-variables')
  if (chips.dataset.keys === current.join(',')) return
  chips.dataset.keys = current.join(',')
  chips.innerHTML = current.map((name) => `<button type="button" class="frozen-chip" data-action="unfreeze" data-key="${name}" aria-label="Unfreeze ${FREEZABLE[name].label}">${icon('lock', 12)}${FREEZABLE[name].label}${icon('close', 12)}</button>`).join('')
}

function compareCards() {
  return `<div class="compare-grid">${patients.map((_, i) => `
    <section class="compare-patient" id="patient-${i}" aria-label="Patient ${patientLetter[i]}">
      <div class="compare-patient-heading">
        <button class="patient-tab" type="button" data-action="edit" data-index="${i}" aria-label="Edit patient ${patientLetter[i]}">Patient ${patientLetter[i]}</button>
        <time data-compare="time"></time>
      </div>
      <h3 data-compare="preset"></h3>
      <div class="compare-art">${overview('comparison-' + i, true)}</div>
      <p data-compare="interpretation"></p>
      <div class="compare-readouts">
        <div><span>Plasma Na⁺</span><b data-compare="sodium"></b></div>
        <div><span>Arterial filling</span><b data-compare="filling"></b></div>
        <div><span>Venous state</span><b data-compare="venous"></b></div>
      </div>
    </section>`).join('')}</div>`
}

function renderScene() {
  const key = mode === 'compare' ? 'compare' : viewOrgan ?? 'overview'
  if (sceneKey === key) return
  sceneKey = key
  const compare = key === 'compare'
  $('#canvas-title').textContent = compare ? 'Compare patients' : viewOrgan ? ORGANS[viewOrgan].title : 'Anatomy map'
  $('#canvas-kicker').lastElementChild.textContent = compare ? 'PARALLEL SIMULATION' : viewOrgan ? 'ORGAN DETAIL' : 'INTERACTIVE ANATOMY'
  $('#map-card').classList.toggle('compare-view', compare)
  $('#map-card').classList.toggle('organ-view', !compare && Boolean(viewOrgan))
  $('#scene').tabIndex = viewOrgan && !compare ? 0 : -1
  $('#scene').setAttribute('aria-label', viewOrgan && !compare ? 'Scrollable anatomical diagram' : 'Anatomical diagram')
  $('#scene').innerHTML = compare ? compareCards() : viewOrgan ? organScene(viewOrgan, 'current-detail') : overview('current-overview')
  const nav = $('#organ-navigation')
  nav.hidden = compare
  nav.innerHTML = compare ? '' : organKeys.map((organ) => `<button data-organ="${organ}" type="button" class="organ-shortcut tone-${ORGANS[organ].color}">${icon(ORGANS[organ].icon, 15)}${shortOrgan[organ]}</button>`).join('')
  $('#canvas-actions').innerHTML = compare
    ? button('show-organ', 'expand', 'Inspect organ', 'canvas-button')
    : viewOrgan
      ? button('overview', 'back', 'Overview', 'canvas-button') +
        `<div class="zoom-actions">${button('zoom-out', 'minus', '', 'icon-button', 'id="zoom-out" aria-label="Zoom out" title="Zoom out"')}${button('zoom-in', 'plus', '', 'icon-button', 'id="zoom-in" aria-label="Zoom in" title="Zoom in"')}</div>`
      : button('show-organ', 'expand', '', 'icon-button map-expand', 'aria-label="Zoom into selected organ" title="Zoom into selected organ"')
}

function refreshScene(output, otherPatient) {
  $('#map-card').classList.toggle('signals-off', !signals)
  if (mode === 'compare') {
    for (const index of [0, 1]) {
      const article = $('#patient-' + index)
      const patient = currentPatient(index)
      const out = index === activePatient ? output : otherPatient
      const active = index === activePatient
      article.classList.toggle('active', active)
      article.querySelector('.patient-tab').setAttribute('aria-pressed', String(active))
      const readouts = {
        time: timeLabel(patient.hours),
        preset: PRESETS[patient.preset].name,
        interpretation: describePatient(out),
        sodium: out.volumes.sodium.toFixed(1) + ' mmol/L',
        filling: ORGANS.heart.nodes.arterial.status(out),
        venous: ORGANS.heart.nodes.venous.status(out),
      }
      for (const [field, value] of Object.entries(readouts)) {
        article.querySelector(`[data-compare="${field}"]`).textContent = value
      }
      paintScene(article.querySelector('svg.anatomy-svg'), out, active ? selected : {})
    }
    return
  }
  const svg = $('#scene .anatomy-svg')
  svg.style.setProperty('--diagram-zoom', zoom)
  paintScene(svg, output, selected)
  const minus = $('#zoom-out')
  if (minus) {
    minus.disabled = zoom === 1
    $('#zoom-in').disabled = zoom >= 1.4
  }
  all('.organ-shortcut').forEach((element) => {
    element.setAttribute('aria-pressed', String(element.dataset.organ === selected.organ))
  })
}

function renderInspector() {
  if (inspectorKey === selected.organ) return
  inspectorKey = selected.organ
  const organ = ORGANS[selected.organ]
  $('#inspector').innerHTML = `
    <div class="panel-heading">
      <span class="heading-icon inspector-heading-icon">${icon('routes', 17)}</span>
      <h2>Pathway inspector</h2>
    </div>
    <div class="inspector-body tone-${organ.color}">
      <div class="organ-intro">
        <span class="organ-emblem">${icon(organ.icon, 28)}</span>
        <h3>${organ.title}</h3>
      </div>
      <p class="organ-summary">${organ.summary}</p>
      <div class="teaching-prompt" id="teaching-prompt" hidden>
        <h4>${icon('predict', 15)} Teaching prompt</h4>
        <p id="teaching-question"></p>
        ${button('lesson-prediction', 'arrow', 'Record prediction', 'text-button')}
      </div>
      <div class="pathway-list" aria-label="${organ.title} pathway">
        ${Object.entries(organ.nodes).map(([key, node]) => `<button type="button" class="pathway-node" data-organ="${selected.organ}" data-node="${key}">
          <span class="node-dot"></span>
          <span class="node-name">${node.title}</span>
          <span class="node-status" data-node-value="${key}"></span>
        </button>`).join('')}
      </div>
      <div class="mechanism">
        <h4 id="mechanism-title">${icon('info', 15)} <span>How it works</span></h4>
        <p id="mechanism-text"></p>
      </div>
      <div id="inspector-readouts" class="inspector-readouts" hidden></div>
      ${button('pathway-references', 'book', 'Sources &amp; assumptions', 'text-button source-button') }
    </div>`
}

const mechanismDefaults = {
  brain: 'Osmoreceptors signal the hypothalamus. AVP then travels to the collecting duct, where it inserts AQP2 water channels.',
  heart: 'Stretch in the atria and ventricles releases ANP and BNP. Arterial baroreceptors respond separately to effective filling.',
  raas: 'Low arterial filling stimulates renin. The resulting angiotensin II and aldosterone help conserve sodium.',
  kidney: 'AVP controls the permeability of the collecting duct. The medullary gradient determines how strongly water is drawn out.',
  fluids: 'Water shifts to equalise effective tonicity between extracellular and intracellular space. Sodium and potassium mass help determine where water goes.',
}

function readoutItems(pairs) {
  return `<dl>${pairs.map(([name, value]) => `<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}</dl>`
}

function refreshInspector(output, patient) {
  const { nodes } = ORGANS[selected.organ]
  for (const [key, node] of Object.entries(nodes)) {
    const status = $(`[data-node-value="${key}"]`)
    const name = node.status(output)
    if (status.textContent !== name) status.textContent = name
    status.parentElement.setAttribute('aria-pressed', String(selected.node === key))
  }

  const node = nodes[selected.node]
  const inspectorBody = $('.inspector-body')
  const mechanism = $('.mechanism')
  const pathway = $('.pathway-list')
  if (node && pathway.previousElementSibling !== mechanism) inspectorBody.insertBefore(mechanism, pathway)
  if (!node && pathway.nextElementSibling !== mechanism) inspectorBody.insertBefore(mechanism, $('#inspector-readouts'))
  $('#mechanism-title span').textContent = node?.short ?? 'How it works'
  $('#mechanism-text').textContent = node?.description ?? mechanismDefaults[selected.organ]
  $('#teaching-prompt').hidden = !teaching
  $('#teaching-question').textContent = lessons[patient.preset].prompt

  let readouts = ''
  const { volumes, renal } = output
  if (selected.organ === 'kidney') {
    const { water, sodium, potassium } = renal.urine
    readouts = readoutItems([
      ['Urine water', water.toFixed(2) + ' L/day'], ['Urine Na⁺', sodium.toFixed(0) + ' mmol/day'], ['Urine K⁺', potassium.toFixed(0) + ' mmol/day'],
    ])
  } else if (selected.organ === 'fluids') {
    readouts = readoutItems([
      ['Plasma Na⁺ estimate', volumes.sodium.toFixed(1) + ' mmol/L'], ['Intracellular', volumes.icf.toFixed(1) + ' L'],
      ['Plasma', volumes.plasma.toFixed(1) + ' L'], ['Interstitial', volumes.interstitial.toFixed(1) + ' L'],
      ['Total extracellular', volumes.ecf.toFixed(1) + ' L'],
    ]) + button('ledger', 'routes', 'View mass balance', 'text-button ledger-button')
  } else if (selected.organ === 'heart' && selected.node === 'natriuresis') {
    readouts = readoutItems([['Urine Na⁺', renal.urine.sodium.toFixed(0) + ' mmol/day'], ['Dietary Na⁺', output.rates.intake.sodium.toFixed(0) + ' mmol/day']])
  }
  const area = $('#inspector-readouts')
  area.hidden = !readouts
  if (area.dataset.content !== readouts) {
    area.dataset.content = readouts
    area.innerHTML = readouts
  }
}

function refreshTime(patient) {
  const playing = timer !== null
  $('#clock').textContent = timeLabel(patient.hours)
  $('#time-state').classList.toggle('playing', playing)
  $('#time-state span').textContent = playing ? 'Running' : 'Paused'
  const play = $('#play')
  const label = playing ? 'Pause simulation' : 'Run simulation'
  if (play.getAttribute('aria-label') !== label || !play.firstElementChild) {
    play.innerHTML = icon(playing ? 'pause' : 'play', 17)
    play.setAttribute('aria-label', label)
    play.title = label
  }
  $('#undo').disabled = history.length === 0
  $('#teaching').setAttribute('aria-pressed', String(teaching))
}

function refresh() {
  const patient = currentPatient()
  const output = evaluate(patient)
  $('#nav-simulation').setAttribute('aria-pressed', String(mode === 'simulation'))
  $('#nav-compare').setAttribute('aria-pressed', String(mode === 'compare'))
  refreshControls(patient, output)
  renderScene()
  refreshScene(output, mode === 'compare' ? evaluate(currentPatient(1 - activePatient)) : null)
  renderInspector()
  refreshInspector(output, patient)
  refreshTime(patient)
}

function stop() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function stepTime(hours, save = true) {
  const change = (current) => current.map((patient, i) => i === activePatient || mode === 'compare' ? advance(patient, hours) : patient)
  if (save) mutate(change)
  else patients = change(patients)
  refresh()
}

function openOrgan(organ, node = null, target) {
  const comparisonCard = target?.closest('.compare-patient')
  if (comparisonCard) activePatient = Number(comparisonCard.id.slice(-1))
  selected = { organ, node }
  if (mode === 'simulation') {
    if (viewOrgan !== organ) zoom = 1
    viewOrgan = organ
  }
}

function zoomScene(next) {
  const scene = $('#scene')
  const svg = scene.querySelector('.anatomy-svg')
  const ratio = next / zoom
  const centerX = scene.scrollLeft + scene.clientWidth / 2
  const centerY = scene.scrollTop + scene.clientHeight / 2
  zoom = next
  svg.style.setProperty('--diagram-zoom', zoom)
  scene.scrollTo(centerX * ratio - scene.clientWidth / 2, centerY * ratio - scene.clientHeight / 2)
}

function openDialog(title, body, style = '') {
  stop()
  refreshTime(currentPatient())
  const dialog = $('#dialog')
  modalReturnFocus = document.activeElement
  dialog.className = style
  dialog.innerHTML = `<div class="dialog-inner"><div class="dialog-heading">
    <h2 id="dialog-title">${title}</h2>
    ${button('close-dialog', 'close', '', 'icon-button', 'aria-label="Close dialog"')}
  </div>${body}</div>`
  dialog.showModal()
}

function references(pathway) {
  const items = pathway ? ORGANS[selected.organ].sources : Object.keys(REFERENCES)
  const assumptions = pathway ? [ORGANS[selected.organ]] : Object.values(ORGANS)
  openDialog(pathway ? ORGANS[selected.organ].title + ' sources' : 'Sources & assumptions', `
    <p class="dialog-lead">The diagrams and activity indices illustrate direction and mechanism in a reference adult. Model volumes and fluxes are teaching estimates.</p>
    <div class="reference-note">${icon('book', 18)}
      <div><strong>Harrison’s Principles of Internal Medicine, Chapter 63</strong>
      <p>The local copy of <em>Fluid and Electrolyte Disturbances</em> is pending. Edition-specific page and figure citations require that copy.</p></div>
    </div>
    <h3 class="dialog-section-title">Model rules and sources</h3>
    <ul class="reference-list">${items.map((key) => {
      const { rule, citation, url } = REFERENCES[key]
      return `<li><strong>${rule}</strong><a href="${url}" target="_blank" rel="noopener noreferrer">${citation}</a></li>`
    }).join('')}</ul>
    <h3 class="dialog-section-title">Physiological assumptions</h3>
    <div class="assumption-list">${assumptions.map((organ) => `<section><h4>${organ.title}</h4><p>${organ.limitation}</p></section>`).join('')}</div>
  `)
}

function openPrediction(isLesson = false) {
  const patient = currentPatient()
  const lesson = lessons[patient.preset]
  openDialog('Make a prediction', `
    <p class="dialog-lead">${isLesson ? lesson.prompt : 'Predict how one variable will change when the current inputs are held for the next 24 hours.'}</p>
    <form id="predict-form">
      <label class="prediction-variable" for="outcome">Outcome</label>
      <span class="select-wrap"><select id="outcome" name="outcome">${selectOptions(Object.fromEntries(Object.entries(OUTCOMES).map(([key, detail]) => [key, detail.label])))}</select>${icon('chevron', 15)}</span>
      <fieldset id="directions"><legend>Expected direction</legend>
        <div class="directions">
          <label><input required type="radio" name="direction" value="decrease"><span>↓ Decrease</span></label>
          <label><input required type="radio" name="direction" value="stable"><span>→ Stable</span></label>
          <label><input required type="radio" name="direction" value="increase"><span>↑ Increase</span></label>
        </div>
      </fieldset>
      <button type="submit" class="button primary-button">${icon('predict', 17)}<span>Reveal 24-hour result</span></button>
    </form>
    <div id="prediction-result" class="prediction-result" aria-live="polite" hidden></div>`, 'prediction-dialog')
  if (isLesson) $('#outcome').value = lesson.outcome
}

function revealPrediction(form) {
  const fields = new FormData(form)
  const key = fields.get('outcome')
  const expected = fields.get('direction')
  const { before, after, direction } = predict(currentPatient(), key)
  const metric = OUTCOMES[key]
  const same = expected === direction
  const verb = { decrease: 'decreased', increase: 'increased', stable: 'stayed close to its starting value' }
  const area = $('#prediction-result')
  area.hidden = false
  area.innerHTML = `<h3>${same ? 'Prediction matched' : 'Compare with your prediction'}</h3>
    <p>${metric.label} ${verb[direction]}.</p>
    <p class="prediction-values">${before.toFixed(metric.digits)} ${icon('arrow', 17)} ${after.toFixed(metric.digits)} <small>${metric.unit}</small></p>
    <p>${metric.cause} The live patient is on the original timeline.</p>`
  $('#outcome').disabled = true
  $('#directions').disabled = true
  form.querySelector('button').disabled = true
  area.scrollIntoView({ block: 'nearest' })
}

function formatPool(key, value) {
  return value.toFixed(key === 'water' ? 2 : 1)
}

function openLedger() {
  const patient = currentPatient()
  const labels = { water: 'Water (L)', sodium: 'Sodium (mmol)', potassium: 'Potassium (mmol)' }
  openDialog('Water and electrolyte balance', `
    <p class="dialog-lead">Cumulative transfers since the start of this patient’s timeline. Frozen pools include an explicit clamp to conserve the accounting.</p>
    <div class="table-scroll"><table class="ledger-table">
      <thead><tr><th scope="col">Pool</th><th scope="col">Stored</th><th scope="col">In</th><th scope="col">Other loss</th><th scope="col">Urine</th><th scope="col">Clamp</th></tr></thead>
      <tbody>${Object.entries(patient.ledger).map(([key, row]) => `<tr><th scope="row">${labels[key]}</th>
        <td>${formatPool(key, patient.stores[key])}</td>${Object.values(row).map((value) => `<td>${formatPool(key, value)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`)
}

const actions = {
  home() {
    stop()
    mode = 'simulation'
    selected = { organ: 'brain', node: null }
    viewOrgan = null
    zoom = 1
  },
  simulation() { mode = 'simulation' },
  compare() { mode = 'compare' },
  edit(target) { activePatient = Number(target.dataset.index); inputDraft = null },
  overview() { viewOrgan = null; zoom = 1; selected = { organ: selected.organ, node: null } },
  'show-organ'() { mode = 'simulation'; openOrgan(selected.organ, selected.node) },
  'zoom-in'() { zoomScene(Math.min(1.4, zoom + 0.2)) },
  'zoom-out'() { zoomScene(Math.max(1, zoom - 0.2)) },
  undo() {
    if (!history.length) return
    stop()
    const saved = history.pop()
    patients = saved.patients
    activePatient = saved.activePatient
    inputDraft = null
    announce('Last simulation change undone.')
  },
  reset() {
    stop()
    changePatient((patient) => createPatient(patient.preset))
    announce('Patient reset to the start of the current scenario.')
  },
  play() {
    if (timer !== null) stop()
    else {
      stepTime(3)
      timer = setInterval(() => stepTime(3, false), 1400)
    }
  },
  advance() {
    stop()
    stepTime(6)
    announce('Simulation advanced six hours.')
  },
  teaching() {
    teaching = !teaching
    refresh()
    if (teaching && matchMedia('(max-width: 730px)').matches) $('#teaching-prompt').scrollIntoView({ block: 'center' })
  },
  prediction() { openPrediction() },
  'lesson-prediction'() { openPrediction(true) },
  'close-dialog'() { $('#dialog').close() },
  references() { references(false) },
  'pathway-references'() { references(true) },
  ledger() { openLedger() },
  override(target) {
    const key = target.dataset.key
    changePatient((patient) => {
      const overrides = { ...patient.overrides }
      if (Object.hasOwn(overrides, key)) delete overrides[key]
      else overrides[key] = evaluate(patient).hormones[key]
      return { ...patient, overrides }
    })
  },
  freeze() { changePatient((patient) => toggleFreeze(patient, $('#freeze-select').value)) },
  unfreeze(target) { changePatient((patient) => toggleFreeze(patient, target.dataset.key)) },
}

function activateOrgan(target) {
  const changesScene = mode === 'simulation' && viewOrgan !== target.dataset.organ
  const changesInspector = selected.organ !== target.dataset.organ
  openOrgan(target.dataset.organ, target.dataset.node ?? null, target)
  refresh()
  if (changesScene || (changesInspector && !target.isConnected)) {
    const next = target.dataset.node
      ? $('.pathway-node[aria-pressed="true"]')
      : $('#canvas-actions [data-action="overview"]')
    next?.focus()
  }
}

app.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')
  if (action) {
    actions[action.dataset.action](action)
    refresh()
    return
  }
  const organ = event.target.closest('[data-organ]')
  if (organ) activateOrgan(organ)
  if (event.target === $('#dialog')) $('#dialog').close()
})

app.addEventListener('keydown', (event) => {
  const organ = event.target.closest('.diagram-hit')
  if (organ && ['Enter', ' '].includes(event.key)) {
    event.preventDefault()
    activateOrgan(organ)
  }
})

function inputValue(control) {
  if (control.type === 'checkbox') return control.checked
  if (control.type === 'range') return Number(control.value)
  return control.value
}

app.addEventListener('input', ({ target }) => {
  if (target.type !== 'range') return
  const hormone = Boolean(target.dataset.override)
  const key = hormone ? target.dataset.override : target.dataset.input
  inputDraft = { index: activePatient, key, hormone, value: inputValue(target) / (hormone ? 100 : 1) }
  refresh()
})

app.addEventListener('change', ({ target }) => {
  if (target.matches('[data-input]')) {
    const key = target.dataset.input
    const value = inputValue(target)
    changePatient((patient) => ({ ...patient, inputs: { ...patient.inputs, [key]: value } }))
  } else if (target.matches('[data-override]')) {
    const key = target.dataset.override
    const value = inputValue(target) / 100
    changePatient((patient) => ({ ...patient, overrides: { ...patient.overrides, [key]: value } }))
  } else if (target.matches('[data-scenario]')) {
    stop()
    const preset = target.value
    changePatient(() => createPatient(preset))
    announce(PRESETS[preset].description)
  } else if (target.id === 'show-signals') {
    signals = target.checked
  } else if (target.id !== 'freeze-select') return
  refresh()
})

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'predict-form') return
  event.preventDefault()
  revealPrediction(event.target)
})

$('#dialog').addEventListener('close', () => modalReturnFocus?.focus())

refresh()
