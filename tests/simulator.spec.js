import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#scene [data-scene="overview"]')).toBeVisible()
})

function nodeStatus(page, key) {
  return page.locator(`[data-node-value="${key}"]`)
}

function mapLabel(page, key) {
  return page.locator(`.map-label[data-organ="${key}"]`).first()
}

async function organ(page, key) {
  await mapLabel(page, key).click()
  await expect(page.locator(`#scene [data-scene="${key}"]`)).toBeVisible()
}

test('opens each anatomical zoom, inspects receptor details and returns to the figure', async ({ page }) => {
  const diagrams = [
    ['brain', 'osmoreceptors', 'third ventricle'],
    ['heart', 'carotid', 'afferent firing'],
    ['raas', 'jga', 'macula densa'],
    ['kidney', 'enac', 'basolateral Na⁺/K⁺ pump'],
    ['fluids', 'intracellular', 'osmotic'],
  ]
  for (const [key, node, text] of diagrams) {
    await organ(page, key)
    const part = page.locator(`.pathway-node[data-node="${node}"]`)
    await part.click()
    await expect(part).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('#mechanism-text')).toContainText(text)
    await page.getByRole('button', { name: 'Overview', exact: true }).click()
  }
  await expect(page.locator('#scene [data-scene="overview"]')).toBeVisible()
})

test('uses the same state for AVP, AQP2 insertion, water flow and medullary gradient', async ({ page }) => {
  await organ(page, 'kidney')
  const inserted = page.locator('[data-channel].inserted')
  await expect(inserted).toHaveCount(1)
  await page.getByText('Advanced controls', { exact: true }).click()
  await page.getByRole('button', { name: 'Manual AVP override' }).click()
  const avp = page.getByRole('slider', { name: 'AVP relative activity', exact: true })
  await avp.press('End')
  await expect(inserted).toHaveCount(3)
  await expect(nodeStatus(page, 'aqp2')).toHaveText('More inserted')
  await expect(nodeStatus(page, 'gradient')).toHaveText('Preserved')
  expect(await page.locator('[data-channel-threshold="0.62"]').evaluate((el) => Number(el.style.getPropertyValue('--activity')))).toBeGreaterThan(0.5)
  await page.getByLabel('Diuretics').selectOption('loop')
  await expect(nodeStatus(page, 'gradient')).toHaveText('Weakened')
  await expect(inserted).toHaveCount(3)
  expect(await page.locator('[data-channel-threshold="0.62"]').evaluate((el) => Number(el.style.getPropertyValue('--activity')))).toBeLessThan(0.7)
  await avp.press('Home')
  await expect(inserted).toHaveCount(0)
  await expect(nodeStatus(page, 'aqp2')).toHaveText('Retrieved')
})

test('maps heart failure to separate arterial and venous changes, peptide stretch and RAAS', async ({ page }) => {
  await page.getByLabel('Patient scenario').selectOption('heartFailure')
  await organ(page, 'heart')
  await expect(nodeStatus(page, 'arterial')).toHaveText('Underfilled')
  await expect(nodeStatus(page, 'venous')).toHaveText('Congested')
  await expect(nodeStatus(page, 'carotid')).toHaveText('Unloaded')
  await expect(nodeStatus(page, 'cardiopulmonary')).toHaveText('Stretched')
  await expect(nodeStatus(page, 'bnp')).toHaveText('Elevated')
  await expect(nodeStatus(page, 'natriuresis')).toHaveText('Attenuated')
  const vein = await page.locator('.detail-svg [data-vessel="venous"]').evaluate((el) => parseFloat(el.style.strokeWidth))
  const artery = await page.locator('.detail-svg [data-vessel="arterial"]').evaluate((el) => parseFloat(el.style.strokeWidth))
  expect(vein).toBeGreaterThan(artery)
  await page.getByRole('button', { name: 'Overview', exact: true }).click()
  await organ(page, 'raas')
  await expect(nodeStatus(page, 'aldosterone')).toHaveText('Elevated')
})

test('rescales cell art in hypotonic and hypertonic patients', async ({ page }) => {
  await organ(page, 'fluids')
  const cell = page.locator('#scene [data-scale="cells"]').first()
  const reference = await cell.evaluate((el) => el.style.transform)
  await page.getByLabel('Patient scenario').selectOption('siadh')
  await expect(nodeStatus(page, 'intracellular')).toHaveText('Cells swell')
  const swollen = await cell.evaluate((el) => el.style.transform)
  await page.getByLabel('Patient scenario').selectOption('hypernatraemia')
  await expect(nodeStatus(page, 'intracellular')).toHaveText('Cells shrink')
  const shrunken = await cell.evaluate((el) => el.style.transform)
  expect(swollen).not.toBe(reference)
  expect(shrunken).not.toBe(reference)
  await expect(page.locator('[data-direction="out"]')).not.toHaveClass(/direction-hidden/)
})

test('freezes water, shows clamp accounting, unfreezes and supports undo and reset', async ({ page }) => {
  await page.getByRole('slider', { name: 'Water intake', exact: true }).press('End')
  await expect(page.locator('#value-waterIntake')).toHaveText('5.0 L/day')
  await page.getByText('Advanced controls', { exact: true }).click()
  await page.getByRole('button', { name: 'Freeze Total body water', exact: true }).click()
  await page.getByRole('button', { name: '+6 h', exact: true }).click()
  await expect(page.locator('#clock')).toHaveText('Day 0 · 06 h')
  await organ(page, 'fluids')
  await page.getByRole('button', { name: 'View mass balance' }).click()
  const waterRow = page.getByRole('row', { name: /Water \(L\)/ })
  await expect(waterRow.getByRole('cell').first()).toHaveText('42.00')
  await expect(waterRow.getByRole('cell').last()).toHaveText('-0.75')
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByRole('button', { name: 'Undo last change' }).click()
  await expect(page.locator('#clock')).toHaveText('Day 0 · 00 h')
  await page.locator('#freeze-button').click()
  await expect(page.locator('#frozen-variables')).toBeEmpty()
  await page.getByRole('button', { name: 'Reset patient' }).click()
  await expect(page.locator('#value-waterIntake')).toHaveText('2.0 L/day')
})

test('reveals a teaching prediction only after the learner records a direction', async ({ page }) => {
  await page.getByLabel('Patient scenario').selectOption('siadh')
  await page.getByRole('button', { name: 'Teaching mode' }).click()
  await expect(page.locator('#teaching-question')).toContainText('AVP stays elevated')
  await page.getByRole('button', { name: 'Record prediction' }).click()
  const dialog = page.getByRole('dialog', { name: 'Make a prediction' })
  await expect(dialog.getByLabel('Outcome')).toHaveValue('sodium')
  await expect(page.locator('#prediction-result')).toBeHidden()
  await dialog.getByRole('radio', { name: /Decrease/ }).check()
  await dialog.getByRole('button', { name: 'Reveal 24-hour result' }).click()
  await expect(dialog.getByText('Prediction matched')).toBeVisible()
  await expect(dialog.getByText(/Plasma sodium estimate decreased/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#clock')).toHaveText('Day 0 · 00 h')
})

test('compares two independent patients and advances them together', async ({ page }) => {
  await page.getByRole('button', { name: 'Compare', exact: true }).click()
  const patientA = page.getByRole('region', { name: 'Patient A', exact: true })
  const patientB = page.getByRole('region', { name: 'Patient B', exact: true })
  await expect(patientA.getByText('Healthy baseline')).toBeVisible()
  await expect(patientB.getByText('Heart failure')).toBeVisible()
  await page.getByRole('button', { name: 'Edit patient B' }).click()
  await page.getByLabel('Patient scenario').selectOption('diarrhoea')
  await page.getByRole('switch', { name: 'Drinking-water access' }).uncheck()
  await expect(patientB.getByText('Diarrhoea')).toBeVisible()
  await expect(patientA.getByText('Healthy baseline')).toBeVisible()
  await page.getByRole('button', { name: '+6 h', exact: true }).click()
  await expect(patientA.getByText('Day 0 · 06 h')).toBeVisible()
  await expect(patientB.getByText('Day 0 · 06 h')).toBeVisible()
  await page.getByRole('button', { name: 'Edit patient A' }).click()
  await expect(page.getByRole('switch', { name: 'Drinking-water access' })).toBeChecked()
})

test('supports keyboard organ navigation, zoom, run and pause, and toggling signals', async ({ page }) => {
  const brain = mapLabel(page, 'brain')
  await brain.focus()
  await brain.press('Enter')
  await expect(page.locator('#scene [data-scene="brain"]')).toBeVisible()
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(page.locator('.detail-svg')).toHaveCSS('--diagram-zoom', '1.2')
  await page.getByRole('switch', { name: 'Show animated signals' }).uncheck()
  await expect(page.locator('#map-card')).toHaveClass(/signals-off/)
  await page.getByRole('button', { name: 'Run simulation' }).click()
  await expect(page.locator('#time-state')).toHaveText('Running')
  await page.getByRole('button', { name: 'Pause simulation' }).click()
  await expect(page.locator('#time-state')).toHaveText('Paused')
})

test('lists pathway citations and identifies the missing local chapter', async ({ page }) => {
  await page.getByRole('button', { name: 'Sources & assumptions' }).click()
  const dialog = page.getByRole('dialog', { name: 'Brain & hypothalamus sources' })
  await expect(dialog.getByText(/local copy of/)).toBeVisible()
  await expect(dialog.getByRole('link', { name: /Bourque/ })).toHaveAttribute('href', 'https://doi.org/10.1038/nrn2400')
  await expect(dialog.getByText(/individual osmotic thresholds/)).toBeVisible()
})

test('keeps the mobile canvas within the viewport and provides organ shortcuts', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 })
  const shortcuts = page.getByRole('navigation', { name: 'Organ shortcuts' })
  await shortcuts.getByRole('button', { name: 'Kidney', exact: true }).click()
  await expect(page.locator('#scene [data-scene="kidney"]')).toBeVisible()
  const dimensions = await page.locator('#scene').evaluate((frame) => ({
    scroll: frame.scrollWidth,
    width: frame.clientWidth,
    page: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scroll).toBeGreaterThan(dimensions.width)
  expect(dimensions.page).toBe(393)
})
