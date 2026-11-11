import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const locales = [
  { locale: 'en', path: '/en/', introduction: 'A personal portfolio in progress' },
  { locale: 'pl', path: '/pl/', introduction: 'Portfolio w budowie' },
] as const;

for (const pageSpec of locales) {
  test(`${pageSpec.locale} prerender, hydration, assets and mobile layout`, async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
      if (message.type() === 'warning' && /hydration|did not match/i.test(message.text())) {
        runtimeErrors.push(message.text());
      }
    });

    const assetResponses: number[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/assets/')) assetResponses.push(response.status());
    });

    await page.setViewportSize({ width: 320, height: 760 });
    await page.goto(pageSpec.path);
    await expect(page).toHaveTitle(/Junior Software Developer/);
    await expect(page.locator('html')).toHaveAttribute('lang', pageSpec.locale);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Junior Software Developer' }),
    ).toBeVisible();
    await expect(page.getByText(pageSpec.introduction)).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(2);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('script[type="module"][src^="/assets/"]')).toHaveCount(1);
    await expect(page.locator('link[rel="stylesheet"][href^="/assets/"]')).toHaveCount(1);

    await page.reload();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Junior Software Developer' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    expect(runtimeErrors).toEqual([]);
    expect(assetResponses.length).toBeGreaterThan(0);
    expect(assetResponses.every((status) => status < 400)).toBe(true);
  });

  test(`${pageSpec.locale} has no automated accessibility violations`, async ({ page }) => {
    await page.goto(pageSpec.path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('locale links navigate directly between the two prerendered routes', async ({ page }) => {
  await page.goto('/en/');
  await page.getByRole('navigation').getByRole('link', { name: 'Polski' }).click();
  await expect(page).toHaveURL(/\/pl\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await page.getByRole('navigation').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test('keyboard navigation reaches the skip link first', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
});

test('both localized documents remain useful with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    for (const pageSpec of locales) {
      const page = await context.newPage();
      await page.goto(pageSpec.path);
      await expect(page.locator('html')).toHaveAttribute('lang', pageSpec.locale);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Junior Software Developer' }),
      ).toBeVisible();
      await expect(page.getByText(pageSpec.introduction)).toBeVisible();
      await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(2);
      await page.close();
    }
  } finally {
    await context.close();
  }
});
