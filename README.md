# The Sodium Lab

The Sodium Lab is an interactive SVG simulator for teaching human fluid homeostasis. The anatomy map, organ diagrams and pathway inspector all read the same patient state.

## Run locally

Use Node.js 24 as pinned in `.node-version`.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. The app runs entirely in the browser with bundled fonts.

```sh
npm test
npm run test:browser
npm run build
```

The browser suite uses system Chromium when available at `/usr/bin/chromium`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use another Chromium binary, or install the managed browser with `npx playwright install chromium`.

## Use the simulator

- Select a patient scenario and click a structure or label on the anatomy map to open its organ diagram. Select a receptor or transporter in the diagram or the pathway inspector for its explanation.
- Change any input to see the immediate sensor and transporter response. Advance time or run the clock to integrate changes in water, sodium and potassium. The fluid inspector includes the cumulative balance ledger.
- Open **Advanced controls** to set relative hormone activity manually or freeze a variable at its current value. To test the medullary gradient independently, hold AVP high and select a loop diuretic. The collecting duct retains its inserted AQP2 channels while water recovery falls.
- Open **Compare** and choose **Patient A** or **Patient B** to edit that patient's inputs and preset. Both timelines advance together in this view. **Reset** restarts the active scenario. **Undo** restores the preceding committed change or the start of a continuous run.
- Use **Teach** for a scenario-specific prompt or **Predict** to choose an outcome. Record a direction to reveal a 24-hour projection on a separate timeline.

## Physiology and assumptions

- **Mass balance** keeps distinct exchangeable Na⁺, K⁺ and total body water pools. Each pool integrates intake, extrarenal losses and urinary output. An explicit clamp transfer closes the ledger during a freeze. A positive numerical floor bounds depletion. The starting pools describe an illustrative reference adult. Solute intake scales dietary sodium, potassium and urine solute load together. The gut loss composition is representative and varies in real illness. [Edelman et al., pp. 1236–1256](https://doi.org/10.1172/JCI103712)
- **Fluid compartments** use a simplified osmotic partition to allocate water to ICF and ECF, then split ECF into plasma and interstitial fluid. The ratio of exchangeable Na⁺ and K⁺ to total body water gives an illustrative plasma sodium estimate. This omits the clinical Edelman slope and intercept, glucose and tissue-specific solute shifts. The visual categories use model reference ranges. [Edelman et al., pp. 1236–1256](https://doi.org/10.1172/JCI103712) · [Sterns, pp. 55–65](https://doi.org/10.1056/NEJMra1404489)
- **Brain and sensors** combine osmotic drive with arterial and central stretch. Loss of arterial stretch increases AVP drive. Thirst can augment oral intake only when water access is enabled. SIADH imposes an AVP activity floor. The AVP deficiency preset reduces release and the AVP resistance preset reduces the renal response. Sensor indices omit individual thresholds and anticipatory drinking. [Bourque, pp. 519–531](https://doi.org/10.1038/nrn2400) · [Schrier and Abraham, pp. 577–585](https://doi.org/10.1056/NEJM199908193410806)
- **RAAS** couples renal perfusion and the diuretic effect on macula densa signalling to renin. Angiotensin II increases proximal sodium reabsorption, vascular tone and aldosterone signalling. Vascular tone is visualised as a parallel effect. Effective arterial filling uses plasma volume and pump function. This leaves out detailed filtration and arteriolar feedback. [Sparks et al., pp. 1201–1228](https://doi.org/10.1002/cphy.c130040)
- **Heart and natriuretic peptides** use separate indices for arterial filling, venous congestion, chamber stretch, circulating ANP/BNP signals and renal responsiveness. In heart failure, peptide signals can rise while effective natriuresis remains limited and RAAS stays active. The model omits pressure waveforms, peptide clearance and receptor kinetics. [Schrier and Abraham, pp. 577–585](https://doi.org/10.1056/NEJM199908193410806) · [Volpe et al., pp. 419–425](https://doi.org/10.1093/eurheartj/eht466)
- **Kidney and nephron** use AVP-sensitive AQP2 insertion and an independently modelled medullary gradient to determine water recovery. The loop and distal panels depict their diuretic-sensitive transporters. ENaC responds to aldosterone, while potassium secretion also depends on distal delivery. Segment and hormone indices are unitless. Urinary outputs are teaching estimates from a lumped model without measured urine osmolality or detailed filtered loads. [Nielsen et al., pp. 205–244](https://doi.org/10.1152/physrev.00024.2001) · [Sands and Layton, pp. 178–195](https://doi.org/10.1016/j.semnephrol.2009.03.008) · [Pearce et al., pp. 135–146](https://doi.org/10.2215/CJN.05760513) · [Ellison, pp. 1248–1257](https://doi.org/10.2215/CJN.09630818)

The clock advances the mass balance in integration steps of at most one hour. Sensor, hormone and transporter rules recalculate immediately from the current model state. Animation speed conveys relative activity. Anatomy and pathway drawings are original SVGs.

The edition-specific page and figure crosswalk for **Harrison’s Principles of Internal Medicine, Chapter 63, Fluid and Electrolyte Disturbances** is pending the local chapter. The in-app **References** dialog maps the rules and assumptions to the peer-reviewed sources currently available.
