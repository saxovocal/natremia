import { clamp } from '../model/balance.js'
import { ORGANS } from './content.js'

const INK = { violet: '#b5a0fa', rose: '#f396a9', amber: '#efbb72', mint: '#71dfc2', cyan: '#77c7f5', blue: '#66a5fa', sodium: '#f0be71', potassium: '#f39caa', water: '#78d3f6' }

export function anatomyDefs(id) {
  return `<defs>
    <linearGradient id="${id}-body" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop stop-color="#263957" stop-opacity=".78"/><stop offset=".52" stop-color="#1c2b45" stop-opacity=".61"/>
      <stop offset="1" stop-color="#1a2a43" stop-opacity=".43"/>
    </linearGradient>
    <linearGradient id="${id}-brain" x2=".7" y2="1">
      <stop stop-color="#8673c7"/><stop offset=".46" stop-color="#544783"/><stop offset="1" stop-color="#2c2650"/>
    </linearGradient>
    <linearGradient id="${id}-heart" x2=".8" y2="1">
      <stop stop-color="#a85e7c"/><stop offset=".5" stop-color="#74374e"/><stop offset="1" stop-color="#431f3a"/>
    </linearGradient>
    <linearGradient id="${id}-kidney" x2=".75" y2="1">
      <stop stop-color="#6a537b"/><stop offset=".45" stop-color="#534367"/><stop offset="1" stop-color="#2c2448"/>
    </linearGradient>
    <radialGradient id="${id}-cell" cx=".38" cy=".28" r=".8">
      <stop stop-color="#5386a1" stop-opacity=".67"/><stop offset=".7" stop-color="#2c5269" stop-opacity=".75"/>
      <stop offset="1" stop-color="#233b53" stop-opacity=".87"/>
    </radialGradient>
    <radialGradient id="${id}-halo">
      <stop stop-color="#907bfd" stop-opacity=".35"/><stop offset="1" stop-color="#907bfd" stop-opacity="0"/>
    </radialGradient>
    ${Object.entries(INK).map(([name, tint]) => `<marker id="${id}-arrow-${name}" viewBox="0 0 8 8" refX="6.8" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M1 1l5 3-5 3" fill="none" stroke="${tint}" stroke-width="1.4" stroke-linecap="round"/></marker>`).join('')}
  </defs>`
}

export function hit(organ, node, body, extra = '') {
  const label = node ? ORGANS[organ].nodes[node].title : ORGANS[organ].title
  return `<g class="diagram-hit ${extra}" data-organ="${organ}" ${node ? `data-node="${node}"` : ''} tabindex="0" role="button" aria-label="${label}"><title>${label}</title>${body}</g>`
}

export function flow(id, key, d, color = 'violet', arrow = true, channelThreshold = null) {
  return `<g class="flow flow-${color}" data-flow="${key}" ${channelThreshold === null ? '' : `data-channel-threshold="${channelThreshold}"`} aria-hidden="true">
    <path class="flow-track" d="${d}" stroke="${INK[color]}" ${arrow ? `marker-end="url(#${id}-arrow-${color})"` : ''}/>
    <path class="flow-pulse" d="${d}" stroke="${INK[color]}"/>
  </g>`
}

export function diagramLabel(organ, node, x, y, leader, width = 182) {
  const detail = ORGANS[organ]
  const title = node ? detail.nodes[node].short : detail.mapTitle
  return hit(organ, node, `<path d="${leader}" class="label-leader"/>
    <g transform="translate(${x} ${y})">
      <rect class="label-hitbox" x="-9" y="-20" rx="7" width="${width}" height="53"/>
      <circle class="label-point" cx="1" cy="1" r="3.4"/>
      <text class="map-label-title" x="13" y="5">${title}</text>
      <text class="map-label-status" x="13" y="23" data-status="${organ}${node ? '.' + node : ''}"></text>
    </g>`, `map-label tone-${detail.color}`)
}

export function brainArt(id) {
  return `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M-2-32c-8-7-22-5-26 3-10-1-19 6-19 15-10 6-12 19-4 27 1 10 12 16 23 13 7 8 20 7 28 1 7 6 19 7 26 0 11 3 24-3 25-14 9-9 6-22-4-28-2-10-10-15-19-15C22-39 9-39 2-33Z"
      fill="url(#${id}-brain)" stroke="#a18dcf" stroke-opacity=".8" stroke-width="1.4"/>
    <path d="M0-31c-5 7 4 12 0 19-4 7 2 12 0 19-3 8-3 14 0 20M-28-29c3 6 9 8 16 6m-33 9c9-5 13 2 21-3 4-2 8-1 13 0m-40 30c6-5 16 1 21-4 3-3 1-9 8-11 4-1 9 1 11 6m-17 22c-4-8 3-11 8-11m10-46c3 3 4 5 3 9m35-8c-3 6-10 6-17 5m36 9c-8-3-13 3-19-2-4-3-10-2-15 0m38 31c-7-6-16 0-21-3-5-3-3-9-9-12-4-2-9 0-12 5m17 24c4-8-2-13-8-13"
      fill="none" stroke="#c8b0f7" stroke-opacity=".53" stroke-width="1.25"/>
    <path d="M-41 2c4-2 9-2 15 1m-10 16c4 1 7 0 8-2m66-16c-4-3-9-3-14 0m14 17c-3 0-6 0-8-3M-18-10c6-1 9 1 11 7M17-10c-5 0-9 2-10 7"
      fill="none" stroke="#d8c2fe" stroke-opacity=".28" stroke-width="1.15"/>
  </g>`
}

export function heartArt(id) {
  return `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M-18-14c-3-10-5-20-4-35 1-5 11-6 14-1l1 28m29 6 7-23c2-5 13-3 11 4l-4 19"
      stroke="#7391c2" stroke-width="2" fill="#3c537d"/>
    <path d="M-1-22c-2-13 11-23 25-22 8 1 16 5 19 11l-2 7c-7 1-12-4-18-4-4 1-7 4-7 11"
      stroke="#d78194" stroke-width="2" fill="#744056"/>
    <path d="M-33-5c0-13 9-24 22-23C0-28 6-23 8-15c11-5 25 0 30 11 5 11 2 28-7 40-5 7-11 14-22 20-9-1-20-8-28-15C-32 31-42 16-33-5Z"
      stroke="#db8398" stroke-width="1.6" fill="url(#${id}-heart)"/>
    <path d="M-34 0c7-11 22-12 29-4 3 4 4 9 3 14M9-15c3 7 9 9 15 11 4 1 8 3 11 6M-22 13c12 1 23 14 31 37m-1-35c5 7 8 12 9 21m4-18c4 0 9 3 11 5M-26 27c5 1 11 4 16 8"
      fill="none" stroke="#f3a4b6" stroke-opacity=".44" stroke-width="1.35"/>
    <path d="M-26-7c-3 5-3 11-1 16m7 14c6 9 14 16 24 22" fill="none" stroke="#f6bbcb" stroke-opacity=".29" stroke-width="1.8"/>
  </g>`
}

export function kidneyArt(id) {
  return `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M13-25c-9-9-24-8-34 1-10 10-13 25-10 38 3 14 12 23 23 25 10 2 18-3 19-10 1-6-3-12-9-16C-3 9-3 1 4-3c9-4 15-15 9-22Z"
      fill="url(#${id}-kidney)" stroke="#b68bc6" stroke-width="1.5"/>
    <path d="M5-22c-8-4-19 0-25 8-12 17-4 42 10 45 5 1 9 0 13-3m-9-13c-6-7-6-14 1-21m-12-2c-5 9-4 20 2 28"
      fill="none" stroke="#c59bcd" stroke-opacity=".49" stroke-width="1.15"/>
    <path d="M-6 1c10-1 14-8 21-9m-21 12c9 1 13 9 22 9M0 13c5 6 10 14 10 25"
      fill="none" stroke="#d8afd6" stroke-opacity=".52" stroke-width="1.6"/>
  </g>`
}

export function cellArt(id) {
  return `<path d="M-35-5c3-17 19-25 36-26 18 0 34 10 36 25 6 17-6 31-25 34-24 4-47-1-47-21-1-5-1-8 0-12Z"
    fill="url(#${id}-cell)" stroke="#81bad3" stroke-opacity=".82" stroke-width="1.3"/>
    <path d="M-30-7c5-13 18-18 29-18 11 0 25 5 30 15m-56 23c4 7 17 10 28 10" fill="none" stroke="#a8d6ec" stroke-opacity=".26"/>
    <ellipse cx="3" cy="1" rx="10" ry="8" fill="#324f7b" stroke="#8a9fd5" stroke-opacity=".77"/>
    <path d="M-20-6c2-3 4-4 7-4m34 9c2 2 1 5-1 7m-36 6c3 1 6 1 8-1m23-23c4 0 6 3 6 5" fill="none" stroke="#b4d7f4" stroke-opacity=".65" stroke-linecap="round"/> `
}

function figure(id) {
  return `<g class="body-figure">
    <path d="M324 126c-5-9-8-18-9-28-9 1-13-10-11-18 1-4 4-6 8-5-1-29 13-57 48-59 35 2 49 30 48 59 4-1 7 1 8 5 2 8-2 19-11 18-1 10-4 19-9 28l2 16c5 10 24 16 46 22 25 8 36 27 42 55l15 93 14 83c3 19-1 30-10 32-10 2-16-9-20-22l-22-77-20-64c-4 27-12 55-12 81 0 29 10 58 11 90 2 31-3 62-8 99h-63l-11-56-11 56h-63c-5-37-10-68-8-99 1-32 11-61 11-90 0-26-8-54-12-81l-20 64-22 77c-4 13-10 24-20 22-9-2-13-13-10-32l14-83 15-93c6-28 17-47 42-55 22-6 41-12 46-22Z"
      fill="url(#${id}-body)" stroke="#6b82ac" stroke-opacity=".63" stroke-width="1.35"/>
    <path d="M287 173c27-4 47-13 59-30m87 30c-27-4-47-13-59-30m-32-19c5 5 11 8 18 8s13-3 18-8m-28-17 10-6 10 6m-38-12c5-3 10-3 15-1m26 0c5-2 10-2 15 1m-89 93c-11 15-21 37-23 60m145-60c11 15 21 37 23 60m-143 74c-8 30-6 55 1 83m118-83c8 30 6 55-1 83m-129 27c18 12 42 15 66 28 24-13 48-16 66-28"
      fill="none" stroke="#5e749b" stroke-opacity=".30" stroke-width="1.15"/>
    <path d="M344 164c-15-1-35 8-46 21-15 17-24 58-15 77 7 19 32 19 51 11 12-6 14-20 14-42v-47c0-10 0-18-4-20Zm32 0c15-1 35 8 46 21 15 17 24 58 15 77-7 19-32 19-51 11-12-6-14-20-14-42v-47c0-10 0-18 4-20Z"
      fill="#253653" fill-opacity=".61" stroke="#667da2" stroke-opacity=".32" stroke-width="1.3"/>
    <path d="M286 228c14 1 22 11 46 13m-40 12c12 9 25 8 41 5m102-30c-14 1-22 11-46 13m40 12c-12 9-25 8-41 5"
      fill="none" stroke="#6b83ac" stroke-opacity=".29"/>
    <path d="M308 166c14 8 30 14 52 14s38-6 52-14M315 283c16 7 28 16 45 16s29-9 45-16"
      fill="none" stroke="#7285a2" stroke-opacity=".29" stroke-width="1.1"/>
    <path d="M360 136v306" fill="none" stroke="#a8bbd8" stroke-opacity=".08" stroke-dasharray="3 5"/>
  </g>`
}

export function overview(id, compact = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="anatomy-svg overview-svg" data-scene="overview" viewBox="${compact ? '218 8 284 516' : '0 0 720 555'}" aria-label="Interactive human fluid homeostasis anatomy">
    ${anatomyDefs(id)}
    <ellipse cx="360" cy="256" rx="319" ry="254" fill="url(#${id}-halo)" opacity=".13"/>
    ${figure(id)}
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="vessel arterial" data-vessel="arterial" d="M380 206c-2-23-22-34-26-55l-8-37m9 48c-25 6-44 10-59 25l-32 76-26 108m114-179c-3 31-3 51 0 80l4 57-4 76m1-92c-18-3-33-5-53 0m56 14c21 2 42-2 65-8m-66 81-37 88m37-88 40 82M375 175c19 1 43 8 52 28l24 78 26 91"/>
      <path class="vessel venous" data-vessel="venous" d="M349 211c-16-13-21-30-18-49l-1-40m4 69c-34 4-48 25-57 56l-35 137m102-162 2 81-11 76 6 21-18 89m20-185c-20 6-37 7-49 18m50-15c26-7 46-2 65 11m-71 78 50 90M369 186c24 7 51 23 62 50l18 53 31 94"/>
      <path d="M300 337c2 27 22 40 40 44h40c18-4 38-17 40-44" stroke="#bf9e9e" stroke-width="1.35" stroke-opacity=".40"/>
    </g>
    <g aria-hidden="true">
      ${flow(id, 'baro', 'M348 141c-47 1-47-34-20-56', 'rose', false)}
      ${flow(id, 'avp', 'M369 94c37 22 39 63 51 103 14 45 27 80 12 111', 'violet')}
      ${flow(id, 'angII', 'M296 311c-28-14-30-47-12-56 21-11 29 2 22 25')}
      ${flow(id, 'peptides', 'M393 234c35 3 50 24 41 61', 'violet')}
      ${flow(id, 'water', 'M411 355c3 40-15 62-29 80', 'water')}
      ${flow(id, 'enac', 'M309 337c-5 18 12 34 23 38', 'sodium')}
    </g>
    ${hit('brain', null, `<g transform="translate(360 62) scale(.86)">
      <ellipse class="organ-glow" cy="0" rx="78" ry="68" fill="url(#${id}-halo)" />
      ${brainArt(id)}
      <path d="M-7 14c4-5 8-6 14 0l2 11-8 11-7-12Z" fill="#c9a2ee" fill-opacity=".44" stroke="#ceb6ee" stroke-width="1"/>
      <circle cx="0" cy="24" r="9" class="signal-ring" data-dot="osmo" stroke="#cab1ff"/>
      <circle cx="0" cy="24" r="3.6" fill="#e5caff"/>
      <circle cx="7" cy="39" r="3.8" fill="#a987e0" stroke="#e7cbfa"/>
    </g>`, 'organ-art tone-violet')}
    ${hit('heart', null, `<g>
      <circle cx="345" cy="141" r="8" class="signal-ring" data-dot="carotid" stroke="#f3a0a8"/>
      <circle cx="345" cy="141" r="3" fill="#e99aa8"/>
      <circle cx="363" cy="177" r="7" class="signal-ring" data-dot="aortic" stroke="#f3a0a8"/>
      <g transform="translate(379 223) scale(.89)">
        ${heartArt(id)}
        <ellipse cx="-18" cy="-7" rx="13" ry="11" class="stretch-ring" data-ring="atrial" stroke="#f5a9bd"/>
        <ellipse cx="14" cy="25" rx="17" ry="19" class="stretch-ring" data-ring="ventricular" stroke="#eda7c7"/>
        <circle cx="-22" cy="-8" r="2.8" fill="#ffc0c9"/>
      </g>
    </g>`, 'organ-art tone-rose')}
    ${hit('raas', null, `<g>
      <path d="M278 288c7-9 13-15 24-15 5 0 10 2 13 8-9-1-15 1-20 6-7 6-11 5-17 1Zm164 0c-7-9-13-15-24-15-5 0-10 2-13 8 9-1 15 1 20 6 7 6 11 5 17 1Z" fill="#bd8d64" stroke="#f0ba77" stroke-width="1.2"/>
      <path d="M285 286c7 1 12-7 20-8m130 8c-7 1-12-7-20-8" fill="none" stroke="#f8cd98" stroke-opacity=".67"/>
      <circle cx="307" cy="314" r="7" fill="#b98254" stroke="#f0b676" data-dot="jga"/>
      <circle cx="307" cy="314" r="2.7" fill="#ffe0aa"/>
    </g>`, 'organ-art tone-amber')}
    ${hit('kidney', null, `<g>
      <g transform="translate(297 319) scale(.9)">${kidneyArt(id)}</g>
      <g transform="translate(423 319) scale(-.9 .9)">${kidneyArt(id)}</g>
      <path d="M410 312c7-10 16-7 15 1-1 7-9 2-9 8v10c0 6 10 5 10 0v-11m-12-3c-5 8-4 14-3 19" fill="none" stroke="#8be3d3" stroke-width="1.55" stroke-linecap="round"/>
      <circle cx="307" cy="313" r="5" class="signal-ring" data-dot="jga" stroke="#efc18d"/>
    </g>`, 'organ-art tone-mint')}
    ${hit('fluids', null, `<g>
      <ellipse cx="358" cy="430" rx="53" ry="38" fill="#4686ab" fill-opacity=".15" stroke="#89b4cf" stroke-opacity=".36" stroke-dasharray="2.5 4"/>
      <g transform="translate(348 425) rotate(-12) scale(.72)"><g data-scale="cells">${cellArt(id)}</g></g>
      <g transform="translate(380 441) rotate(17) scale(.55)"><g data-scale="cells">${cellArt(id)}</g></g>
      <circle cx="321" cy="440" r="2" fill="#92d6ee" fill-opacity=".55"/><circle cx="399" cy="419" r="2" fill="#92d6ee" fill-opacity=".55"/>
    </g>`, 'organ-art tone-cyan')}
    ${compact ? '' : `<g class="map-labels">
      ${diagramLabel('brain', null, 42, 91, 'M43 100v25h163l39-39h65', 199)}
      ${diagramLabel('heart', null, 518, 185, 'M519 194v25h-77l-31-17', 190)}
      ${diagramLabel('raas', null, 42, 249, 'M43 258v25h151l35 26h69', 170)}
      ${diagramLabel('kidney', null, 518, 328, 'M519 337v25h-47l-33-25', 180)}
      ${diagramLabel('fluids', null, 42, 428, 'M43 437v25h167l35-27h70', 195)}
    </g>`}
  </svg>`
}

export function paintScene(svg, out, selected) {
  if (!svg) return
  const { sensors, hormones, hemodynamics: h, renal, volumes, rates } = out
  const strength = {
    osmo: (sensors.ovlt + sensors.sfoOsmotic) / 2, neurons: hormones.avpDemand, avp: hormones.avp,
    baro: (sensors.carotid + sensors.aortic) / 2, underfill: 2 * sensors.underfilling,
    thirst: hormones.thirst, drinking: rates.oralWater / 4,
    jga: sensors.jga, renin: hormones.renin, angI: hormones.angI, angII: hormones.angII, aldosterone: hormones.aldosterone,
    anp: hormones.anp, bnp: hormones.bnp, peptides: (hormones.anp + hormones.bnp) / 2,
    natriuresis: Math.max(0, hormones.natriureticSignal) * 1.5,
    vascular: hormones.vascularTone, renal: renal.proximal, proximal: renal.proximal, loop: renal.thickAscendingLimb,
    distal: renal.distal, water: renal.waterRecovery * 1.55, enac: renal.enac, potassium: renal.kSecretion,
    urine: renal.urine.water / 3, filling: h.filling * 0.55, congestion: h.congestion + 0.2, exchange: Math.abs(volumes.sodium - 140) / 10,
  }
  svg.querySelectorAll('[data-flow]').forEach((element) => {
    const channelAvailable = !element.dataset.channelThreshold || renal.aqp2 >= Number(element.dataset.channelThreshold)
    const activity = channelAvailable ? clamp(strength[element.dataset.flow]) : 0
    element.style.setProperty('--activity', activity.toFixed(3))
    element.style.setProperty('--flow-speed', (3.1 - 1.7 * activity).toFixed(2) + 's')
  })
  svg.querySelectorAll('[data-vessel]').forEach((element) => {
    const venous = element.dataset.vessel === 'venous'
    element.style.strokeWidth = venous ? 3.7 + 5.8 * h.congestion : 2.4 + 2.6 * h.filling
    element.style.strokeOpacity = venous ? clamp(0.64 + h.congestion * 0.28) : clamp(0.42 + h.filling * 0.34)
  })
  svg.querySelectorAll('[data-dot]').forEach((element) => {
    const index = element.dataset.dot
    const value = strength[index] ?? sensors[index]
    element.style.opacity = 0.26 + 0.74 * clamp(value)
    element.style.strokeWidth = 0.8 + 2.3 * clamp(value)
  })
  svg.querySelectorAll('[data-ring]').forEach((element) => {
    const value = h[element.dataset.ring + 'Stretch']
    element.style.transform = `scale(${(0.88 + 0.63 * value).toFixed(3)})`
    element.style.opacity = 0.30 + 0.64 * value
  })
  const scales = {
    cells: clamp((volumes.icf / 28) ** 0.75, 0.58, 1.43),
    interstitial: clamp((volumes.interstitial / 10.7) ** 0.5, 0.65, 1.45),
    plasma: clamp(volumes.plasma / 3.3, 0.50, 1.65),
    arteriole: clamp(1.16 - 0.68 * hormones.vascularTone, 0.45, 1.16),
  }
  svg.querySelectorAll('[data-scale]').forEach((element) => {
    const value = scales[element.dataset.scale]
    const x = element.dataset.scale === 'arteriole' ? 1 : value
    element.style.transform = `scale(${x.toFixed(3)}, ${value.toFixed(3)})`
  })
  svg.querySelectorAll('[data-gradient]').forEach((element) => {
    const depth = Number(element.dataset.gradient)
    element.style.opacity = 0.10 + depth * renal.gradient * 0.65
  })
  svg.querySelectorAll('[data-channel]').forEach((element) => {
    const number = Number(element.dataset.channel)
    const inserted = renal.aqp2 >= number
    element.classList.toggle('inserted', inserted)
    element.style.setProperty('--channel-shift', inserted ? '0px' : '35px')
  })
  svg.querySelectorAll('[data-urine]').forEach((element) => {
    element.style.fillOpacity = clamp(0.29 + (renal.concentration - 0.5) * 0.30, 0.17, 0.93)
  })
  svg.querySelectorAll('[data-direction]').forEach((element) => {
    const direction = volumes.sodium > 142 ? 'out' : volumes.sodium < 138 ? 'in' : 'balanced'
    element.classList.toggle('direction-hidden', element.dataset.direction !== direction)
  })
  svg.querySelectorAll('[data-status]').forEach((element) => {
    const [organ, node] = element.dataset.status.split('.')
    const detail = ORGANS[organ]
    const status = node ? detail.nodes[node].status(out) : detail.mapStatus(out)
    if (element.textContent !== status) element.textContent = status
  })
  svg.querySelectorAll('.diagram-hit').forEach((element) => {
    const active = element.dataset.organ === selected.organ && (element.dataset.node ?? null) === selected.node
    element.classList.toggle('selected', active)
    element.setAttribute('aria-pressed', String(active))
  })
}
