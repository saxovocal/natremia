import { HORMONE_BASELINE } from '../model/hormones.js'

export const REFERENCES = {
  bourque: {
    citation: 'Bourque CW. Central mechanisms of osmosensation and systemic osmoregulation. Nature Reviews Neuroscience. 2008;9:519–531.',
    url: 'https://doi.org/10.1038/nrn2400',
    rule: 'OVLT and SFO osmosensation, hypothalamic AVP neurons and thirst.',
  },
  aquaporin: {
    citation: 'Nielsen S et al. Aquaporins in the kidney: from molecules to medicine. Physiological Reviews. 2002;82:205–244.',
    url: 'https://doi.org/10.1152/physrev.00024.2001',
    rule: 'AVP-dependent AQP2 trafficking in collecting-duct principal cells.',
  },
  schrier: {
    citation: 'Schrier RW, Abraham WT. Hormones and hemodynamics in heart failure. New England Journal of Medicine. 1999;341:577–585.',
    url: 'https://doi.org/10.1056/NEJM199908193410806',
    rule: 'Arterial underfilling and neurohormonal activation despite extracellular expansion in heart failure.',
  },
  peptides: {
    citation: 'Volpe M, Rubattu S, Burnett J Jr. Natriuretic peptides in cardiovascular diseases: current use and perspectives. European Heart Journal. 2014;35:419–425.',
    url: 'https://doi.org/10.1093/eurheartj/eht466',
    rule: 'Myocardial stretch, ANP and BNP signalling, and attenuated natriuretic responsiveness in heart failure.',
  },
  raas: {
    citation: 'Sparks MA et al. Classical renin–angiotensin system in kidney physiology. Comprehensive Physiology. 2014;4:1201–1228.',
    url: 'https://doi.org/10.1002/cphy.c130040',
    rule: 'JGA control of renin, angiotensin conversion, vascular effects and renal sodium handling.',
  },
  urine: {
    citation: 'Sands JM, Layton HE. The physiology of urinary concentration: an update. Seminars in Nephrology. 2009;29:178–195.',
    url: 'https://doi.org/10.1016/j.semnephrol.2009.03.008',
    rule: 'Countercurrent concentration and the medullary gradient as distinct determinants of water recovery.',
  },
  principal: {
    citation: 'Pearce D et al. Collecting duct principal cell transport processes and their regulation. Clinical Journal of the American Society of Nephrology. 2015;10:135–146.',
    url: 'https://doi.org/10.2215/CJN.05760513',
    rule: 'ENaC, aldosterone, potassium secretion and principal-cell water transport.',
  },
  diuretic: {
    citation: 'Ellison DH. Clinical pharmacology in diuretic use. Clinical Journal of the American Society of Nephrology. 2019;14:1248–1257.',
    url: 'https://doi.org/10.2215/CJN.09630818',
    rule: 'Loop and thiazide sites of action, distal sodium delivery and electrolyte losses.',
  },
  edelman: {
    citation: 'Edelman IS et al. Interrelations between serum sodium concentration, serum osmolarity and total exchangeable sodium, total exchangeable potassium and total body water. Journal of Clinical Investigation. 1958;37:1236–1256.',
    url: 'https://doi.org/10.1172/JCI103712',
    rule: 'Exchangeable Na⁺ and K⁺ relative to total body water as determinants of plasma sodium.',
  },
  sterns: {
    citation: 'Sterns RH. Disorders of plasma sodium: causes, consequences, and correction. New England Journal of Medicine. 2015;372:55–65.',
    url: 'https://doi.org/10.1056/NEJMra1404489',
    rule: 'Dysnatraemia, AVP-related water imbalance and osmotic movement across cell membranes.',
  },
}

function level(value, reference, labels = ['Low', 'Baseline', 'High'], range = 0.09) {
  if (value < reference - range) return labels[0]
  if (value > reference + range) return labels[2]
  return labels[1]
}

const avp = ({ hormones }) => level(hormones.avp, HORMONE_BASELINE.avp, ['Suppressed', 'Tonic', 'Elevated'])
const filling = ({ hemodynamics }) => level(hemodynamics.filling, 1, ['Underfilled', 'Balanced', 'Expanded'], 0.08)
const congestion = ({ hemodynamics }) => hemodynamics.congestion > 0.22 ? 'Congested' : 'Uncongested'
const vessels = ({ hemodynamics }) => level(hemodynamics.filling, 1, ['Reduced', 'Baseline', 'Increased'], 0.08)
const tonicity = ({ volumes }) => level(volumes.sodium, 140, ['Hypotonic', 'Isotonic', 'Hypertonic'], 2)

export const ORGANS = {
  brain: {
    title: 'Brain & hypothalamus', mapTitle: 'Brain & hypothalamus', icon: 'brain', color: 'violet',
    summary: 'The brain compares effective tonicity with arterial filling to regulate thirst and water retention.',
    mapStatus: (s) => avp(s) + ' AVP',
    sources: ['bourque', 'aquaporin', 'schrier'],
    limitation: 'Sensor activity and hormone release are qualitative indices. The model omits individual osmotic thresholds, anticipatory drinking signals and AVP clearance.',
    nodes: {
      osmoreceptors: { title: 'OVLT / SFO osmoreceptors', short: 'OVLT / SFO', status: (s) => tonicity(s), description: 'Higher effective tonicity activates osmosensitive neurons near the third ventricle. These areas signal hypothalamic AVP neurons and contribute to thirst.' },
      neurons: { title: 'Hypothalamic AVP neurons', short: 'Hypothalamus', status: ({ hormones }) => level(hormones.avpDemand, 0.33, ['Inhibited', 'Tonic', 'Stimulated']), description: 'Magnocellular neurons integrate osmotic and circulatory signals. Reduced arterial baroreceptor input can sustain AVP drive during hypotonicity.' },
      pituitary: { title: 'Posterior pituitary', short: 'Posterior pituitary', status: avp, description: 'Hypothalamic axon terminals release arginine vasopressin (AVP) into the circulation. AVP activates V2 receptors in the collecting duct.' },
      thirst: { title: 'Thirst response', short: 'Thirst', status: ({ hormones, inputs }) => inputs.waterAccess ? level(hormones.thirst, 0.16, ['Low', 'Baseline', 'Increased']) : hormones.thirst > 0.25 ? 'High · no water' : 'No water access', description: 'Hypertonicity, arterial underfilling and angiotensin II increase thirst. This drive can increase drinking only when water is available.' },
    },
  },
  heart: {
    title: 'Heart & circulation', mapTitle: 'Heart & circulation', icon: 'heart', color: 'rose',
    summary: 'Arterial filling and venous congestion can move in opposite directions. Different stretch receptors report each signal.',
    mapStatus: (s) => s.hemodynamics.congestion > 0.22 ? filling(s) + ' · congested' : filling(s) + ' filling',
    sources: ['schrier', 'peptides'],
    limitation: 'Arterial filling, chamber stretch and peptide levels are separate relative indices. The model omits measured pressures, flow curves and peptide clearance.',
    nodes: {
      arterial: { title: 'Effective arterial filling', short: 'Arterial filling', status: filling, description: 'Arterial filling depends on plasma volume and pump function. A weak pump can produce arterial underfilling even when extracellular fluid is expanded.' },
      carotid: { title: 'Carotid sinus receptor', short: 'Carotid sinus', status: ({ sensors }) => level(sensors.carotid, 0.52, ['Unloaded', 'Tonic', 'Stretched']), description: 'Less carotid sinus stretch reduces afferent firing, favouring sympathetic activation and nonosmotic AVP release.' },
      aortic: { title: 'Aortic baroreceptors', short: 'Aortic arch', status: ({ sensors }) => level(sensors.aortic, 0.48, ['Unloaded', 'Tonic', 'Stretched']), description: 'Aortic arch stretch follows effective arterial filling. The aortic and carotid signals share an arterial filling proxy here.' },
      cardiopulmonary: { title: 'Cardiopulmonary receptors', short: 'Low-pressure receptors', status: ({ sensors }) => level(sensors.cardiopulmonary, 0.33, ['Unloaded', 'Tonic', 'Stretched']), description: 'Low-pressure receptors sense central filling. Central stretch contributes a small inhibitory influence on AVP that may be outweighed by arterial underfilling.' },
      venous: { title: 'Venous congestion', short: 'Venous congestion', status: congestion, description: 'Impaired forward flow and extracellular expansion can enlarge the venous side of the circulation. Its filling is computed separately from arterial filling.' },
      anp: { title: 'Atrial stretch → ANP', short: 'Atrium → ANP', status: ({ hormones }) => level(hormones.anp, 0.18, ['Low', 'Basal', 'Elevated']), description: 'Atrial wall stretch increases the ANP signal. Responsive kidneys can excrete more sodium and suppress renin in response.' },
      bnp: { title: 'Ventricular stretch → BNP', short: 'Ventricle → BNP', status: ({ hormones }) => level(hormones.bnp, 0.16, ['Low', 'Basal', 'Elevated']), description: 'Ventricular wall stress increases the BNP signal. In heart failure, high peptide levels can accompany reduced renal peptide responsiveness, persistent RAAS and sodium retention.' },
      natriuresis: { title: 'Renal peptide response', short: 'Renal response', status: ({ hormones }) => hormones.peptideResponse < 0.30 ? 'Attenuated' : 'Preserved', description: 'ANP and BNP can promote renal sodium excretion and suppress renin. Poor forward flow and impaired renal function reduce the effective response in this model.' },
    },
  },
  raas: {
    title: 'Renin–angiotensin system', mapTitle: 'RAAS signalling', icon: 'raas', color: 'amber',
    summary: 'The kidney responds to underfilling by releasing renin. Angiotensin II and aldosterone act on different targets.',
    mapStatus: ({ hormones }) => level(hormones.angII, 0.22, ['Suppressed RAAS', 'Basal RAAS', 'Activated RAAS']),
    sources: ['raas', 'peptides', 'principal'],
    limitation: 'JGA stimuli are combined into one rule. Angiotensin generation and aldosterone respond immediately in the model. Vascular tone is shown as a parallel effect and does not recalculate filling.',
    nodes: {
      jga: { title: 'Juxtaglomerular apparatus', short: 'Renal JGA', status: ({ sensors }) => level(sensors.jga, 0.20), description: 'Low renal perfusion and reduced macula densa NaCl delivery favour renin release. A loop diuretic also stimulates the JGA through the macula densa.' },
      renin: { title: 'Renin release', short: 'Renin', status: ({ hormones }) => level(hormones.renin, 0.20, ['Low', 'Basal', 'Elevated']), description: 'Renin cleaves circulating angiotensinogen to angiotensin I. Effective natriuretic peptide signalling can inhibit renin.' },
      angI: { title: 'Angiotensin I', short: 'Angiotensin I', status: ({ hormones }) => level(hormones.angI, 0.20, ['Low', 'Basal', 'Elevated']), description: 'Angiotensin I is the substrate for angiotensin-converting enzyme (ACE). Conversion is represented as an instantaneous coupling.' },
      angII: { title: 'Angiotensin II', short: 'Angiotensin II', status: ({ hormones }) => level(hormones.angII, 0.22, ['Low', 'Basal', 'Elevated']), description: 'Angiotensin II increases vascular tone, stimulates thirst and encourages proximal sodium reabsorption. It also stimulates adrenal aldosterone production.' },
      aldosterone: { title: 'Adrenal cortex → aldosterone', short: 'Aldosterone', status: ({ hormones }) => level(hormones.aldosterone, 0.25, ['Low', 'Basal', 'Elevated']), description: 'Angiotensin II and potassium stimulate aldosterone. In the collecting duct, aldosterone increases ENaC activity and favours potassium secretion.' },
      vascular: { title: 'Vascular smooth muscle', short: 'Vascular target', status: ({ hormones }) => level(hormones.vascularTone, 0.24, ['Relaxed', 'Basal tone', 'Constricted']), description: 'Angiotensin II constricts resistance vessels. The diagram depicts this effect while estimating effective filling from plasma volume and cardiac function.' },
      renal: { title: 'Renal sodium retention', short: 'Renal target', status: ({ renal }) => level(renal.proximal, 0.63, ['Reduced', 'Basal', 'Increased'], 0.055), description: 'Angiotensin II favours proximal Na⁺ reabsorption. Aldosterone also increases collecting-duct ENaC transport downstream.' },
    },
  },
  kidney: {
    title: 'Kidney & nephron', mapTitle: 'Kidney & nephron', icon: 'kidney', color: 'mint',
    summary: 'Follow filtrate through the nephron and inspect the signals that alter sodium reabsorption and water recovery.',
    mapStatus: ({ renal }) => level(renal.concentration, 1, ['Dilute urine', 'Regulated urine', 'Concentrated urine'], 0.28),
    sources: ['aquaporin', 'urine', 'principal', 'diuretic'],
    limitation: 'Transporters and medullary strength use activity indices. Urine rates are illustrative mass-balance outputs. There is no numerical osmolality or segment-by-segment filtered load.',
    nodes: {
      proximal: { title: 'Proximal tubule', short: 'Proximal tubule', status: ({ renal }) => level(renal.proximal, 0.63, ['Reduced', 'Basal', 'Increased'], 0.055), description: 'The proximal tubule reabsorbs most filtered sodium and water. Angiotensin II enhances proximal sodium reabsorption.' },
      loop: { title: 'Loop of Henle · NKCC2', short: 'Loop of Henle', status: ({ inputs }) => inputs.diuretic === 'loop' ? 'NKCC2 inhibited' : 'NKCC2 active', description: 'The thick ascending limb transports Na⁺, K⁺ and Cl⁻ through NKCC2 while remaining poorly water permeable. Loop diuretics weaken the medullary gradient and increase distal sodium delivery.' },
      gradient: { title: 'Medullary osmotic gradient', short: 'Medullary gradient', status: ({ renal }) => level(renal.gradient, 0.84, ['Weakened', 'Preserved', 'Strong']), description: 'The medullary gradient supplies the driving force for water to leave a permeable collecting duct. AVP controls permeability. The gradient can weaken even while AVP remains high.' },
      distal: { title: 'Distal convoluted tubule · NCC', short: 'Distal tubule', status: ({ inputs }) => inputs.diuretic === 'thiazide' ? 'NCC inhibited' : 'NCC active', description: 'The early distal tubule reabsorbs NaCl through NCC. Thiazides inhibit NCC, increase sodium delivery downstream and limit urine dilution.' },
      aqp2: { title: 'Collecting duct · AQP2', short: 'AQP2 channels', status: ({ renal }) => level(renal.aqp2, 0.33, ['Retrieved', 'Basal insertion', 'More inserted']), description: 'AVP activates V2 receptors and promotes AQP2 insertion into the luminal membrane. Water enters through AQP2 and exits through basolateral AQP3/4 when an osmotic gradient is present.' },
      enac: { title: 'Principal cell · ENaC', short: 'ENaC transport', status: ({ renal }) => level(renal.enac, 0.34, ['Reduced', 'Basal', 'Increased']), description: 'Aldosterone increases apical ENaC activity. Na⁺ enters from the lumen and the basolateral Na⁺/K⁺ pump transfers it to interstitial fluid.' },
      potassium: { title: 'Potassium secretion', short: 'K⁺ secretion', status: ({ renal }) => level(renal.kSecretion, 0.34, ['Reduced', 'Basal', 'Increased']), description: 'ENaC-mediated sodium uptake makes the lumen more negative, favouring potassium secretion through apical K⁺ channels. Increased distal delivery can amplify this effect.' },
      urine: { title: 'Urinary output', short: 'Urine output', status: ({ renal }) => level(renal.concentration, 1, ['Dilute', 'Baseline', 'Concentrated'], 0.28), description: 'Water output reflects filtered solute, diluting capacity and water recovery. Sodium and potassium outputs enter the mass balance separately.' },
    },
  },
  fluids: {
    title: 'Body-fluid compartments', mapTitle: 'Fluid compartments', icon: 'cell', color: 'cyan',
    summary: 'Follow the redistribution of water between cells, plasma and interstitial space as effective tonicity changes.',
    mapStatus: tonicity,
    sources: ['edelman', 'sterns', 'schrier'],
    limitation: 'The model uses a simplified exchangeable Na⁺ and K⁺ to water ratio. It omits the clinical Edelman regression slope and intercept, glucose effects and separate tissue compartments.',
    nodes: {
      intracellular: { title: 'Intracellular volume', short: 'Intracellular fluid', status: ({ volumes }) => level(volumes.icf, 28, ['Cells shrink', 'Baseline', 'Cells swell'], 0.5), description: 'Water crosses cell membranes in response to effective osmotic forces. Relative water excess expands cells, and water deficit contracts them.' },
      plasma: { title: 'Plasma volume', short: 'Plasma', status: ({ volumes }) => level(volumes.plasma, 3.3, ['Reduced', 'Baseline', 'Expanded'], 0.15), description: 'Plasma is the intravascular portion of the extracellular pool. Plasma expansion can coexist with reduced effective arterial filling.' },
      interstitial: { title: 'Interstitial volume', short: 'Interstitial fluid', status: ({ volumes }) => level(volumes.interstitial, 10.7, ['Reduced', 'Baseline', 'Expanded'], 0.45), description: 'Interstitial fluid occupies the space outside cells and blood vessels. In this model, a larger share of excess ECF accumulates here when ECF expands.' },
      filling: { title: 'Effective arterial filling', short: 'Arterial filling', status: vessels, description: 'This functional signal depends on circulating plasma and cardiac output. It is computed independently of total extracellular volume.' },
      congestion: { title: 'Venous congestion', short: 'Venous congestion', status: congestion, description: 'The right-sided circulation can be congested while arterial filling is low. Congestion increases myocardial stretch and the natriuretic peptide signals.' },
    },
  },
}

export function describePatient(output) {
  const { hemodynamics, volumes, hormones, renal } = output
  if (hemodynamics.congestion > 0.22 && hemodynamics.filling < 0.92) {
    return 'The arteries are underfilled while the veins are congested.'
  }
  if (volumes.sodium < 138 && hormones.avp > 0.50) {
    return 'AVP remains active as low tonicity drives water into cells.'
  }
  if (volumes.sodium > 142 && renal.aqp2 < 0.18) {
    return 'Cells shrink in hypertonic fluid while the kidney loses dilute urine.'
  }
  if (volumes.sodium > 142) return 'Hypertonicity draws water out of cells and stimulates thirst.'
  if (hemodynamics.filling < 0.92) return 'Low arterial filling activates water and sodium conservation.'
  if (!output.inputs.waterAccess) return 'Thirst can rise, but drinking is blocked until water is available.'
  return 'Water and solute pools are close to the reference state.'
}
