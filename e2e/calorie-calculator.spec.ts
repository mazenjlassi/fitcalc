import { test, expect, type Page } from '@playwright/test';

async function targetValue(page: Page): Promise<number> {
  const text = await page.locator('.result__primary').innerText();
  return Number(text.replace(/[^0-9]/g, ''));
}

test('calculates a target and keeps it when switching units', async ({ page }) => {
  await page.goto('/calorie-calculator/');

  await page.locator('#age').fill('25');
  await page.locator('#height-cm').fill('165');
  await page.locator('#weight-kg').fill('60');

  await expect(page.locator('.result__primary')).toContainText('2,085');
  const metricTarget = await targetValue(page);
  expect(metricTarget).toBeGreaterThan(0);

  await page.locator('.units__option', { hasText: 'Imperial' }).click();

  await expect(page.locator('#height-imperial')).toHaveValue('5\' 5"');
  const imperialTarget = await targetValue(page);

  expect(Math.abs(metricTarget - imperialTarget)).toBeLessThanOrEqual(5);
});
