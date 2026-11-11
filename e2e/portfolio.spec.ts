import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const locales = [
  {
    locale: 'en',
    path: '/en/',
    introduction: 'A personal portfolio in progress',
    projectsCta: 'View projects',
    menuLabel: 'Open menu',
  },
  {
    locale: 'pl',
    path: '/pl/',
    introduction: 'Portfolio w budowie',
    projectsCta: 'Zobacz projekty',
    menuLabel: 'Otwórz menu',
  },
] as const;
const responsiveSizes = [
  { width: 320, height: 760 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 820, height: 900 },
  { width: 821, height: 900 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
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
    await expect(page.locator('h1')).toContainText('Junior Software Developer');
    await expect(page.locator('.intro-copy')).toContainText(pageSpec.introduction);
    await expect(page.locator('.project-card')).toHaveCount(0);
    await expect(page.getByRole('link', { name: pageSpec.projectsCta })).toHaveAttribute(
      'href',
      '#projects',
    );
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    const menuToggle = page.locator('.mobile-menu-toggle');
    await expect(menuToggle).toBeVisible();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await menuToggle.click();
    await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(6);
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await page
      .getByRole('button', { name: pageSpec.locale === 'en' ? 'Close menu' : 'Zamknij menu' })
      .click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('script[type="module"][src^="/assets/"]')).toHaveCount(1);
    await expect(page.locator('link[rel="stylesheet"][href^="/assets/"]')).toHaveCount(1);

    await page.reload();
    await expect(page.locator('h1')).toContainText('Junior Software Developer');
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

  test(`${pageSpec.locale} visual regression baselines`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pageSpec.path);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${pageSpec.locale}-390x844.png`, {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
      threshold: 0.15,
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot(`${pageSpec.locale}-1440x900.png`, {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
      threshold: 0.15,
    });
  });

  test(`${pageSpec.locale} responsive smoke across required breakpoints`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.goto(pageSpec.path);

    for (const { width, height } of responsiveSizes) {
      await page.setViewportSize({ width, height });
      await expect(page.locator('.intro-copy')).toBeVisible();
      await expect(page.getByRole('link', { name: pageSpec.projectsCta })).toBeVisible();
      await expect(page.locator('#projects')).toBeVisible();
      await expect(page.locator('#about')).toBeVisible();
      await expect(page.locator('#technologies')).toBeVisible();
      await expect(page.locator('#social')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (width >= 1280) {
        const projectHeadingBottom = await page
          .locator('#projects h2')
          .evaluate((heading) => heading.getBoundingClientRect().bottom);
        expect(projectHeadingBottom).toBeLessThanOrEqual(height);
      }

      const navigationLinks = page.getByRole('navigation').getByRole('link');
      if (width <= 820) {
        const menuToggle = page.locator('.mobile-menu-toggle');
        await menuToggle.click();
        await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
        await expect(navigationLinks).toHaveCount(6);
        await page.keyboard.press('Escape');
        await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
      } else {
        await expect(navigationLinks).toHaveCount(6);
        await expect(navigationLinks.first()).toBeVisible();
      }

      if (pageSpec.locale === 'en' && width === 390) {
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
        await page.screenshot({ path: 'test-results/pf002-mobile-390x844.png' });
      }
      if (pageSpec.locale === 'en' && width === 1440) {
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
        await page.screenshot({ path: 'test-results/pf002-desktop-1440x900.png' });
      }
    }
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

test('mobile menu closes with Escape and returns focus to its toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  const toggle = page.locator('.mobile-menu-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Projects' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Projects' })).toBeHidden();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'View projects' })).toBeFocused();
});

test('mobile menu opens and closes by touch', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('/en/');
    const toggle = page.locator('.mobile-menu-toggle');
    await toggle.tap();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'Projects' }),
    ).toBeVisible();
    await toggle.tap();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  } finally {
    await context.close();
  }
});

test('hero CTA and section navigation reach real sections', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await page.getByRole('link', { name: 'View projects' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#projects')).toBeFocused();
  const projectSectionTop = await page
    .locator('#projects')
    .evaluate((section) => section.getBoundingClientRect().top);
  const stickyHeaderBottom = await page
    .locator('.site-header')
    .evaluate((header) => header.getBoundingClientRect().bottom);
  expect(projectSectionTop).toBeGreaterThanOrEqual(stickyHeaderBottom - 1);

  const toggle = page.getByRole('button', { name: 'Open menu' });
  await toggle.click();
  await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#about')).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('language switch keeps the current section anchor', async ({ page }) => {
  await page.goto('/en/#projects');
  await page.getByRole('navigation').getByRole('link', { name: 'Polski' }).click();
  await expect(page).toHaveURL(/\/pl\/#projects$/);
  await page.getByRole('navigation').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/#projects$/);
});

test('keyboard navigation reaches the skip link first', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
});

test('reduced motion keeps navigation and page content available', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');

  const motionStyles = await page.evaluate(() => ({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    buttonTransitionDuration: getComputedStyle(document.querySelector('.button-primary')!)
      .transitionDuration,
  }));

  expect(motionStyles.reducedMotion).toBe(true);
  expect(motionStyles.scrollBehavior).toBe('auto');
  expect(Number.parseFloat(motionStyles.buttonTransitionDuration)).toBeLessThanOrEqual(0.00001);
  await expect(page.locator('h1')).toContainText('Junior Software Developer');
  await expect(page.getByRole('link', { name: 'View projects' })).toBeVisible();
  const menuToggle = page.locator('.mobile-menu-toggle');
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
});

test('both localized documents remain useful with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    for (const pageSpec of locales) {
      const page = await context.newPage();
      await page.goto(pageSpec.path);
      await expect(page.locator('html')).toHaveAttribute('lang', pageSpec.locale);
      await expect(page.locator('h1')).toContainText('Junior Software Developer');
      await expect(page.locator('.intro-copy')).toContainText(pageSpec.introduction);
      await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(6);
      await expect(page.getByRole('link', { name: pageSpec.projectsCta })).toHaveAttribute(
        'href',
        '#projects',
      );
      await page.close();
    }
  } finally {
    await context.close();
  }
});

test('404 page uses the shared theme stylesheet and keeps locale links usable', async ({
  page,
}) => {
  const stylesheetResponses: number[] = [];
  page.on('response', (response) => {
    if (response.url().includes('/assets/entry-client-') && response.url().endsWith('.css')) {
      stylesheetResponses.push(response.status());
    }
  });

  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.locator('link[rel="stylesheet"][href^="/assets/"]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'English portfolio' })).toHaveAttribute(
    'href',
    '/en/',
  );
  await expect(page.getByRole('link', { name: 'Polskie portfolio' })).toHaveAttribute(
    'href',
    '/pl/',
  );

  const computedPalette = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    text: getComputedStyle(document.body).color,
    link: getComputedStyle(document.querySelector('a')!).color,
  }));
  expect(computedPalette).toEqual({
    background: 'rgb(7, 13, 32)',
    text: 'rgb(244, 247, 255)',
    link: 'rgb(184, 164, 255)',
  });
  expect(stylesheetResponses).toEqual([200]);
});
