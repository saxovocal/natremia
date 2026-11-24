import { anatomyDefs, brainArt, cellArt, diagramLabel, flow, heartArt, hit, kidneyArt } from './anatomy.js'
import { ORGANS } from './content.js'

function brain(id) {
  return `<g>
    <path d="M210 355c32-26 38-51 36-89-13-32-20-70-6-111 14-49 57-90 113-95 70-6 122 49 121 110 0 17 6 36 16 51 9 13 14 22 9 27-3 4-13 3-20 4l-5 31c-4 31-18 45-47 46-24 1-38 11-36 41l3 89" class="anatomical-background"/>
    <path d="M256 355c27-25 49-58 52-90m93 46c-19-29-38-48-48-69" class="anatomical-trace"/>
    <ellipse cx="346" cy="180" rx="144" ry="124" fill="url(#${id}-halo)" opacity=".60"/>
    <g transform="translate(350 165) scale(2.05)">${brainArt(id)}</g>
    <path d="M339 188c-10 10-2 23 2 35 3 10 11 12 18 5s20-12 17-23c-6-17-22-27-37-17Z" fill="#8b63bc" fill-opacity=".35" stroke="#ac8ed4" stroke-opacity=".65"/>
    ${flow(id, 'osmo', 'M324 215Q339 231 358 226', 'violet')}
    ${flow(id, 'osmo', 'M331 177Q341 202 358 222', 'violet')}
    ${flow(id, 'neurons', 'M369 232Q388 263 359 305', 'violet')}
    ${flow(id, 'thirst', 'M371 220c56-12 100 7 116 38s19 51 58 58', 'water')}
    ${flow(id, 'drinking', 'M559 341c-3 34-18 64-48 77', 'water')}
    ${flow(id, 'avp', 'M357 316c-17 19-32 53-21 76l18 35', 'violet')}
    ${flow(id, 'baro', 'M183 334c27-13 45-59 84-79l76-22', 'rose', false)}
    <path d="m341 226 4 14" fill="none" stroke="#de92a2" stroke-opacity=".62" stroke-width="1.4"/>
    ${hit('brain', 'osmoreceptors', `<g fill="#e8cdff">
      <circle cx="325" cy="210" r="12" class="signal-ring" data-dot="osmo" stroke="#e0c2ff"/><circle cx="325" cy="210" r="4.8"/>
      <circle cx="331" cy="173" r="10" class="signal-ring" data-dot="osmo" stroke="#e0c2ff"/><circle cx="331" cy="173" r="4.1"/>
      <text x="310" y="175" text-anchor="end" class="diagram-note">SFO</text>
      <text x="309" y="214" text-anchor="end" class="diagram-note">OVLT</text>
    </g>`)}
    ${hit('brain', 'neurons', `<g transform="translate(363 226)">
      <circle r="17" class="signal-ring" data-dot="neurons" stroke="#ceb4e5"/><path d="M0-9c2 5 4 6 9 9-6 3-7 4-9 11-3-7-4-8-10-11 6-2 7-5 10-9Z" fill="#d2adfc"/>
    </g>`)}
    ${hit('brain', 'pituitary', '<path d="M372 262c-4 14-1 27-10 39-7 2-16-3-20 4-7 12 12 26 25 14 12-12 5-34 10-51" fill="#a47ccc" stroke="#e0b9f0" stroke-width="1.4"/>')}
    ${hit('brain', 'thirst', '<path d="M559 298c-5 12-17 21-17 31a17 17 0 0 0 34 0c0-10-12-19-17-31Z" fill="#26485b" stroke="#82c8df" stroke-width="1.7"/><path d="M550 328c0 5 3 9 7 9" fill="none" stroke="#a2d7ef" stroke-width="1.45"/>')}
    <g transform="translate(357 443) scale(.44)">${kidneyArt(id)}</g>
    <text x="353" y="482" class="diagram-note" text-anchor="middle">AVP to the collecting duct</text>
    <circle cx="171" cy="341" r="8" fill="#6e394b" stroke="#de92a2"/>
    <text x="159" y="369" class="diagram-note" text-anchor="middle">Arterial baroreceptors</text>
    ${diagramLabel('brain', 'osmoreceptors', 41, 124, 'M42 133v24h138l78 42h60')}
    ${diagramLabel('brain', 'neurons', 486, 134, 'M487 143v24h-55l-59 51')}
    ${diagramLabel('brain', 'pituitary', 42, 257, 'M43 266v25h155l48 17h92')}
    ${diagramLabel('brain', 'thirst', 552, 387, 'M553 396v27h-36l-9-12', 144)}
  </g>`
}

function heart(id) {
  return `<g>
    <path d="M328 69c-30 15-109 35-142 73-49 56-43 246-13 301 29 48 104 64 186 64s163-23 188-67c34-58 31-244-13-298-31-38-113-60-143-73" class="anatomical-background"/>
    <path d="M267 141c-42 12-71 62-65 124s31 118 66 131m186-255c42 12 71 62 65 124s-31 118-66 131" class="anatomical-trace"/>
    <path class="vessel arterial" data-vessel="arterial" d="M358 198c-27-18-28-35-28-58s-13-41-17-72m17 74c-40 17-75 41-95 76l-30 93m145-110c-22 73-59 150-58 260"/>
    <path class="vessel venous" data-vessel="venous" d="M395 207c44-33 47-82 35-136m-22 120c33 7 51 23 67 69l25 71m-100-97c31 52 44 119 30 217"/>
    ${flow(id, 'filling', 'M309 406c7-71 31-130 54-184', 'rose')}
    ${flow(id, 'congestion', 'M433 403c4-65-18-125-40-156', 'blue')}
    ${flow(id, 'baro', 'M329 103c26-48 60-52 88-29', 'rose')}
    ${flow(id, 'anp', 'M333 257c-62 14-90 54-106 103', 'violet')}
    ${flow(id, 'bnp', 'M386 307c64 2 99 29 118 57', 'violet')}
    ${flow(id, 'anp', 'M227 360c5 42 51 70 105 71')}
    ${flow(id, 'bnp', 'M504 364c-9 46-50 69-135 68')}
    ${hit('heart', 'natriuresis', `<g transform="translate(356 430) scale(.62)">${kidneyArt(id)}</g>`)}
    ${flow(id, 'natriuresis', 'M367 439c18 12 36 12 53 6', 'sodium')}
    <g transform="translate(363 253) scale(2.02)">${heartArt(id)}</g>
    ${hit('heart', 'carotid', '<circle cx="320" cy="104" r="12" class="signal-ring" data-dot="carotid" stroke="#f6a0ac"/><circle cx="320" cy="104" r="4.4" fill="#fcc0bc"/>')}
    ${hit('heart', 'aortic', '<circle cx="335" cy="160" r="11" class="signal-ring" data-dot="aortic" stroke="#f6a0ac"/><circle cx="335" cy="160" r="4" fill="#fcc0bc"/>')}
    ${hit('heart', 'cardiopulmonary', '<circle cx="415" cy="202" r="12" class="signal-ring" data-dot="cardiopulmonary" stroke="#bec5f6"/><circle cx="415" cy="202" r="4.4" fill="#c7cff7"/>')}
    ${hit('heart', 'anp', '<ellipse cx="325" cy="234" rx="25" ry="20" class="stretch-ring" data-ring="atrial" stroke="#f4acba"/><circle cx="325" cy="234" r="5" fill="#ffc3cf"/>')}
    ${hit('heart', 'bnp', '<ellipse cx="392" cy="305" rx="29" ry="33" class="stretch-ring" data-ring="ventricular" stroke="#e9a0c7"/><circle cx="392" cy="305" r="5" fill="#f9bdd7"/>')}
    ${diagramLabel('heart', 'carotid', 43, 69, 'M44 77v24h195l71 3', 141)}
    ${diagramLabel('heart', 'aortic', 43, 145, 'M44 154v25h190l93-17', 141)}
    ${diagramLabel('heart', 'arterial', 43, 252, 'M44 261v25h127l44-27', 147)}
    ${diagramLabel('heart', 'anp', 43, 373, 'M44 382v25h163l15-42', 141)}
    ${diagramLabel('heart', 'cardiopulmonary', 536, 132, 'M537 141v25h-64l-50 34', 174)}
    ${diagramLabel('heart', 'venous', 536, 249, 'M537 258v25h-32l-18-12', 176)}
    ${diagramLabel('heart', 'bnp', 536, 373, 'M537 382v25h-28l-5-31', 174)}
    ${diagramLabel('heart', 'natriuresis', 298, 481, 'M299 491v22h115v-39l-47-15', 138)}
  </g>`
}

function glomerulus() {
  return `<circle r="29" fill="#543347" stroke="#dd91a8" stroke-width="1.65"/>
    <path d="M-23-3c-2-13 14-22 19-13 6 16-22 14-18 27 4 10 22 9 25-3 3-9-10-14-7-22 3-7 22-3 25 1 8 11-8 13-3 22 6 12-12 19-16 11m-18-22c6 1 18-2 19-7m8 34c-7-5-3-14 0-20 3-6 1-11-1-14" fill="none" stroke="#eea5b6" stroke-width="2" stroke-linecap="round"/>
    <path d="M-49 7h20m-19 11h15" fill="none" stroke="#d28595" stroke-width="5" stroke-linecap="round"/>`
}

function raas(id) {
  return `<g>
    <path d="M80 50h560v286H80zM80 354h560v122H80z" class="technical-box"/>
    <g transform="translate(170 155) scale(1.75)">${kidneyArt(id)}</g>
    ${hit('raas', 'jga', `<g transform="translate(171 157) scale(.64)">${glomerulus()}<circle cx="-24" cy="-6" r="14" fill="#e9a969" fill-opacity=".39" stroke="#f8c180" data-dot="jga"/></g>`)}
    ${hit('raas', 'renin', '<g transform="translate(282 153)"><path d="M0-21 18-11v21L0 21l-18-11v-21Z" class="raas-molecule"/><circle r="4" fill="#f4b777"/><circle cx="-8" cy="4" r="2" fill="#f4b777"/><circle cx="7" cy="-7" r="2" fill="#f4b777"/></g>')}
    ${hit('raas', 'angI', '<g transform="translate(393 153)"><circle r="22" class="raas-molecule"/><path d="m-11 4 7-10 8 7 7-8" class="molecule-bonds"/><circle class="molecule-atom" cx="-11" cy="4" r="2.5"/><circle class="molecule-atom" cx="11" cy="-7" r="2.5"/></g>')}
    ${hit('raas', 'angII', '<g transform="translate(524 153)"><circle r="24" class="raas-molecule"/><path d="m-12 5 8-11 7 8 10-10" class="molecule-bonds"/><circle class="molecule-atom" cx="-12" cy="5" r="3"/><circle class="molecule-atom" cx="13" cy="-8" r="3"/></g>')}
    ${flow(id, 'underfill', 'M137 249c-24-25-26-63 4-87', 'rose')}
    <text x="108" y="274" class="diagram-note">Low perfusion activates JGA</text>
    ${flow(id, 'renin', 'M203 153h57')}
    ${flow(id, 'angI', 'M305 153h64')}
    ${flow(id, 'angII', 'M418 153h79')}
    <text x="458" y="134" class="diagram-note" text-anchor="middle">ACE</text>
    ${flow(id, 'aldosterone', 'M524 180v48')}
    ${flow(id, 'angII', 'M535 176c83 102 67 184-6 218')}
    ${flow(id, 'vascular', 'M501 172c-38 47-84 95-163 124-73 27-125 30-137 82')}
    ${flow(id, 'aldosterone', 'M520 285c8 42 16 71 1 104')}
    ${hit('raas', 'aldosterone', '<path d="M489 275c7-23 16-42 33-46 17-4 36 11 43 29-13-2-21-2-28 4-11 11-25 17-48 13Z" fill="#946346" stroke="#f2ba79" stroke-width="1.8"/><path d="M496 267c13-1 20-12 29-13 9-1 13-6 20-7m-43 13c7-10 16-14 25-14" fill="none" stroke="#f7c999" stroke-opacity=".67"/>')}
    ${hit('raas', 'vascular', '<g transform="translate(195 409)"><g data-scale="arteriole"><path d="M-55-17c19-4 38 3 55 4 19 1 37-8 55-4v34c-18 4-36-5-55-4-17 1-36 8-55 4Z" fill="#603848" stroke="#d48c9d" stroke-width="1.7"/><path d="M-51 1c21-3 59 6 100 0" stroke="#f0a5b2" stroke-width="2" fill="none"/></g></g>')}
    ${hit('raas', 'renal', `<g transform="translate(502 410) scale(.78)">${kidneyArt(id)}</g><path d="M514 409c11-6 25-1 32 9m-34 4c12-2 23 2 28 9" fill="none" stroke="#dcab75" stroke-width="1.8" stroke-linecap="round"/>`)}
    ${diagramLabel('raas', 'jga', 108, 69, 'M109 75h-3v27h28l17 26', 149)}
    ${diagramLabel('raas', 'renin', 245, 199, 'M246 204h-13v-20h35l6-10', 106)}
    ${diagramLabel('raas', 'angI', 349, 69, 'M350 75h-7v27h34l12 25', 140)}
    ${diagramLabel('raas', 'angII', 496, 69, 'M497 75h-7v27h27l7 25', 150)}
    ${diagramLabel('raas', 'aldosterone', 443, 301, 'M444 310v14h-15v-42h53', 156)}
    ${diagramLabel('raas', 'vascular', 261, 399, 'M262 408v22h-23l-12-8', 168)}
    ${diagramLabel('raas', 'renal', 541, 451, 'M542 460v25h-27l-9-33', 166)}
  </g>`
}

function nephron(id) {
  const tubule = 'M131 154c7-27 29-40 45-27 10 11-14 23-14 36s16 18 25 6c9-12 13-30 27-27 13 3 11 19 2 31-9 11-11 28-9 47l10 155c1 16 10 26 23 26s24-9 25-24l15-207c1-16 7-33 23-33 12 0 15 11 8 20-6 9-2 18 8 19 16 1 12-20 24-18 11 2 13 15 24 14'
  const channels = [0.10, 0.38, 0.62].map((threshold, index) => ({ threshold, y: 221 + index * 25 }))
  return `<g>
    <text x="42" y="64" class="diagram-section">NEPHRON</text>
    <text x="445" y="64" class="diagram-section">COLLECTING DUCT · PRINCIPAL CELL</text>
    <path d="M420 83v385" class="anatomical-trace"/>
    <rect x="49" y="221" width="352" height="229" rx="13" fill="#19253d" stroke="#344967"/>
    <g fill="#5e77ba" stroke="#849acd" stroke-opacity=".3">
      <rect x="50" y="236" width="350" height="53" data-gradient=".3"/>
      <rect x="50" y="289" width="350" height="53" data-gradient=".53"/>
      <rect x="50" y="342" width="350" height="53" data-gradient=".78"/>
      <path d="M50 395h350v42a12 12 0 0 1-12 12H62a12 12 0 0 1-12-12Z" data-gradient="1"/>
    </g>
    <g fill="#abb9e6" opacity=".63">
      <circle cx="71" cy="313" r="1.3"/><circle cx="106" cy="327" r="1.3"/><circle cx="144" cy="303" r="1.3"/><circle cx="164" cy="339" r="1.3"/>
      <circle cx="79" cy="376" r="1.6"/><circle cx="116" cy="356" r="1.6"/><circle cx="142" cy="373" r="1.6"/><circle cx="157" cy="368" r="1.6"/><circle cx="177" cy="388" r="1.6"/>
      <circle cx="71" cy="420" r="1.9"/><circle cx="94" cy="400" r="1.9"/><circle cx="121" cy="432" r="1.9"/><circle cx="139" cy="406" r="1.9"/><circle cx="151" cy="442" r="1.9"/><circle cx="159" cy="415" r="1.9"/><circle cx="189" cy="434" r="1.9"/>
    </g>
    <path d="${tubule}" fill="none" stroke="#bb8e83" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${tubule}" fill="none" stroke="#704f59" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${tubule}" fill="none" stroke="#f1b195" stroke-opacity=".51" stroke-width="2" stroke-linecap="round"/>
    <path d="M367 146q8 16 8 42l5 242" fill="none" stroke="#9e89b9" stroke-width="20" stroke-linecap="round"/>
    <path d="M367 146q8 16 8 42l5 242" fill="none" stroke="#544864" stroke-width="15" stroke-linecap="round"/>
    <path d="M367 146q8 16 8 42l5 242" fill="none" stroke="#c9abc9" stroke-width="2" stroke-opacity=".64"/>
    <path d="M375 248C410 243 425 176 450 169m-73 179c35 7 52 47 73 52" fill="none" stroke="#879aba" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>
    <g transform="translate(103 151) scale(.83)">${glomerulus()}</g>
    ${flow(id, 'proximal', 'M174 160c-11 31-45 44-61 55', 'sodium')}
    ${flow(id, 'proximal', 'M220 150c21 8 18 23 13 34', 'sodium')}
    ${flow(id, 'loop', 'M270 324c8 15 26 14 39 27', 'sodium')}
    ${flow(id, 'loop', 'M272 289c14 5 24 15 37 14', 'sodium')}
    ${flow(id, 'distal', 'M308 138c-7-21 13-32 38-31', 'sodium')}
    ${flow(id, 'water', 'M383 267c12 1 19-6 26-15', 'water')}
    ${flow(id, 'water', 'M383 317c12 1 19-6 26-15', 'water')}
    ${flow(id, 'urine', 'M380 431v27', 'water')}
    ${hit('kidney', 'urine', '<path d="M380 458c-4 9-13 18-13 25a13 13 0 0 0 26 0c0-7-9-16-13-25Z" fill="#f6ba67" stroke="#edbe81" stroke-width="1.4" data-urine="color"/>')}
    ${diagramLabel('kidney', 'proximal', 43, 88, 'M44 96v18h98l24 13', 149)}
    ${diagramLabel('kidney', 'distal', 256, 88, 'M257 96v18h46l7 14', 143)}
    ${diagramLabel('kidney', 'loop', 57, 269, 'M58 278v25h98l59 27', 151)}
    ${diagramLabel('kidney', 'gradient', 47, 465, 'M48 474v25h144l-6-51', 181)}
    ${diagramLabel('kidney', 'urine', 256, 483, 'M257 492v21h86l20-20', 110)}
    <rect x="440" y="121" width="247" height="324" rx="13" fill="#111d30" stroke="#354961"/>
    <rect x="448" y="161" width="43" height="245" rx="8" fill="#223c51" fill-opacity=".74"/>
    <rect x="492" y="162" width="123" height="244" rx="18" fill="#2b3c55" fill-opacity=".81" stroke="#6b80a1"/>
    <rect x="616" y="161" width="64" height="245" rx="8" fill="#334775" fill-opacity=".61" data-gradient=".85"/>
    <path d="M494 162v244m119-244v244" stroke="#a2b5c4" stroke-width="3" stroke-opacity=".52"/>
    <text x="470" y="148" class="diagram-note" text-anchor="middle">Lumen</text>
    <text x="554" y="148" class="diagram-note" text-anchor="middle">Principal cell</text>
    <text x="647" y="148" class="diagram-note" text-anchor="middle">Medulla</text>
    <ellipse cx="551" cy="301" rx="21" ry="14" fill="#526388" stroke="#8192b1" opacity=".66"/>
    <path d="M539 294q12 12 24 1m-18 9q10 3 17-4" class="anatomical-trace"/>
    <g fill="#9cb5d3" opacity=".42"><circle cx="565" cy="228" r="3"/><circle cx="578" cy="246" r="2"/><circle cx="583" cy="204" r="2.5"/><circle cx="517" cy="206" r="2"/><circle cx="574" cy="289" r="2"/><circle cx="528" cy="348" r="2.5"/><circle cx="580" cy="357" r="2.5"/></g>
    ${flow(id, 'avp', 'M647 98c23 20 18 61-22 86', 'violet')}
    <text x="643" y="96" class="diagram-note" text-anchor="middle">AVP → V2</text>
    <path d="M617 176v7l7 4-7 4v7" fill="none" stroke="#c0a5fe" stroke-width="2"/>
    ${channels.map(({ y, threshold }) => flow(id, 'water', `M458 ${y}h207`, 'water', true, threshold)).join('')}
    ${channels.map(({ y }) => `<rect x="609" y="${y - 6}" width="9" height="12" rx="2.5" fill="#28465c" stroke="#7faebb"/>`).join('')}
    ${hit('kidney', 'aqp2', `<rect x="482" y="208" width="72" height="80" fill="transparent"/>
      ${channels.map(({ y, threshold }) => `<g transform="translate(494 ${y})"><g class="channel" data-channel="${threshold}"><rect x="-6" y="-8" width="12" height="16" rx="3" fill="#234d69" stroke="#87d7f3" stroke-width="1.3"/><path d="M-6 0H6" stroke="#c4effc"/></g></g>`).join('')}
      <text x="513" y="292" class="transport-label" fill="#9edcf2">AQP2</text>`)}
    ${hit('kidney', 'enac', '<rect x="486" y="319" width="16" height="21" rx="4" fill="#634f37" stroke="#efbd75" stroke-width="1.4"/><rect x="607" y="319" width="13" height="21" rx="4" fill="#634f37" stroke="#efbd75" stroke-width="1.4"/><text x="512" y="345" class="transport-label" fill="#f3c88b">ENaC</text>')}
    ${flow(id, 'enac', 'M457 329h206', 'sodium')}
    ${hit('kidney', 'potassium', '<rect x="486" y="359" width="16" height="20" rx="4" fill="#604655" stroke="#e995ac" stroke-width="1.4"/><text x="514" y="382" class="transport-label" fill="#ecacc2">K⁺ channel</text>')}
    ${flow(id, 'potassium', 'M564 368H456', 'potassium')}
    ${flow(id, 'aldosterone', 'M644 415c-22-23-49-40-63-77')}
    <text x="644" y="431" class="diagram-note" text-anchor="middle">Aldosterone</text>
    <text x="448" y="474" class="diagram-note">Luminal AQP2 · Basolateral AQP3/4</text>
  </g>`
}

function fluids(id) {
  return `<g>
    <rect x="94" y="77" width="530" height="375" rx="26" fill="#111f32" stroke="#415775"/>
    <path d="M95 187h529v31H95z" fill="#2b435d" opacity=".49"/>
    ${hit('fluids', 'interstitial', `<g transform="translate(357 329)"><g data-scale="interstitial"><path d="M-190-50c29-39 154-61 222-47 72 15 159 25 170 64 17 57-66 107-175 108C-88 75-211 49-190-50Z" fill="#375f80" fill-opacity=".49" stroke="#81b9ce" stroke-opacity=".58" stroke-dasharray="3 5"/>
      <path d="M-165-7c23 22 58 34 106 39m63 8c52 14 129-14 164-43" class="anatomical-trace"/></g></g>`)}
    <path d="M159 200c88-52 179-48 203-48s116-1 205 43" fill="none" stroke="#657f9b" stroke-width="34" stroke-linecap="round" stroke-opacity=".24"/>
    ${hit('fluids', 'plasma', `<g transform="translate(362 154)"><g data-scale="plasma"><ellipse rx="65" ry="15" fill="#a16a92" fill-opacity=".43" stroke="#c58caa" stroke-opacity=".48"/>
      <ellipse cx="-32" rx="8" ry="3.5" fill="#d19eb8" opacity=".65"/><ellipse cx="10" cy="2" rx="6" ry="3.3" fill="#d19eb8" opacity=".65"/><ellipse cx="43" cy="-3" rx="8" ry="3.5" fill="#d19eb8" opacity=".65"/></g></g>`)}
    ${hit('fluids', 'filling', '<path class="vessel arterial" data-vessel="arterial" d="M148 215c77-54 138-63 162-63" stroke-linecap="round"/>')}
    ${hit('fluids', 'congestion', '<path class="vessel venous" data-vessel="venous" d="M414 152c47 0 113 12 163 60" stroke-linecap="round"/>')}
    ${flow(id, 'filling', 'M154 200c52-42 104-55 155-55', 'rose')}
    ${flow(id, 'congestion', 'M421 144c56 1 100 14 148 55', 'blue')}
    ${hit('fluids', 'intracellular', `<g transform="translate(303 316) rotate(-17) scale(1.53)"><g data-scale="cells">${cellArt(id)}</g></g>
      <g transform="translate(429 341) rotate(18) scale(1.24)"><g data-scale="cells">${cellArt(id)}</g></g>
      <g transform="translate(477 264) rotate(-16) scale(.62)"><g data-scale="cells">${cellArt(id)}</g></g>`)}
    <g data-direction="in">${flow(id, 'exchange', 'M216 370q10-24 36-33', 'water')}${flow(id, 'exchange', 'M475 385q-12-5-20-15', 'water')}</g>
    <g data-direction="out">${flow(id, 'exchange', 'M252 337q-28 11-36 33', 'water')}${flow(id, 'exchange', 'M455 370q10 12 20 15', 'water')}</g>
    <g data-direction="balanced">${flow(id, 'exchange', 'M226 350l21-12', 'water')}${flow(id, 'exchange', 'M241 355l-22 12', 'water')}</g>
    ${diagramLabel('fluids', 'filling', 58, 97, 'M59 107v26h72l47 46', 159)}
    ${diagramLabel('fluids', 'plasma', 316, 97, 'M317 107v26h42l4 7', 142)}
    ${diagramLabel('fluids', 'congestion', 534, 97, 'M535 107v26h-49l-16 24', 177)}
    ${diagramLabel('fluids', 'intracellular', 58, 405, 'M59 414v25h103l103-79', 177)}
    ${diagramLabel('fluids', 'interstitial', 543, 405, 'M544 414v25h-60l-23-34', 173)}
    <text x="360" y="495" text-anchor="middle" class="diagram-note">Water moves across cell membranes in response to effective tonicity.</text>
  </g>`
}

const render = { brain, heart, raas, kidney: nephron, fluids }

export function organScene(organ, id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="anatomy-svg detail-svg" data-scene="${organ}" viewBox="0 0 720 555" aria-label="${ORGANS[organ].title} pathway diagram">
    ${anatomyDefs(id)}
    <ellipse cx="360" cy="272" rx="343" ry="265" fill="url(#${id}-halo)" opacity=".16"/>
    ${render[organ](id)}
  </svg>`
}
