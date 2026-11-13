import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const locales = [
  {
    locale: 'en',
    path: '/en/',
    introduction: 'I build applications',
    portraitAlt: 'Portrait of Miłosz Podsiadły',
    projectsCta: 'View projects',
    interestTitles: ['Games', 'Science & Fantasy', 'Technology'],
  },
  {
    locale: 'pl',
    path: '/pl/',
    introduction: 'Tworzę aplikacje',
    portraitAlt: 'Portret Miłosza Podsiadłego',
    projectsCta: 'Zobacz projekty',
    interestTitles: ['Gry', 'Nauka i fantastyka', 'Technologia'],
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

async function sceneComposition(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.portfolio-shell')!.getBoundingClientRect();
    return [
      '.hero-workspace',
      'h1',
      '.hero-portrait',
      '#projects',
      '#about',
      '#technologies',
      '#social',
    ].map((selector) => {
      const bounds = document.querySelector(selector)!.getBoundingClientRect();
      return {
        left: (bounds.left - canvas.left) / canvas.width,
        top: (bounds.top - canvas.top) / canvas.height,
        width: bounds.width / canvas.width,
        height: bounds.height / canvas.height,
      };
    });
  });
}

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
    const portrait = page.getByRole('img', { name: pageSpec.portraitAlt });
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute('src', '/assets/portraits/hero-960.webp');
    await expect
      .poll(() => portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator('.project-card')).toHaveCount(4);
    await expect(page.locator('.interest-card h3')).toHaveText([...pageSpec.interestTitles]);
    await expect(page.locator('.interest-illustration')).toHaveCount(3);
    await expect
      .poll(() =>
        page
          .locator('.interest-illustration')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    await expect(page.getByRole('link', { name: pageSpec.projectsCta })).toHaveAttribute(
      'href',
      'https://github.com/MiloszPodsiadly',
    );
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    await expect(page.locator('.mobile-menu-toggle')).toHaveCount(0);
    await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(2);
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

  test(`${pageSpec.locale} responsive smoke across required breakpoints`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.goto(pageSpec.path);

    await page.setViewportSize({ width: 1920, height: 900 });
    const baseline = await sceneComposition(page);

    for (const { width, height } of responsiveSizes) {
      await page.setViewportSize({ width, height });
      await expect(page.locator('.intro-copy')).toBeVisible();
      await expect(page.getByRole('link', { name: pageSpec.projectsCta })).toBeVisible();
      await expect(page.locator('#projects')).toBeVisible();
      await expect(page.locator('#about')).toBeVisible();
      await expect(page.locator('#technologies')).toBeVisible();
      await expect(page.locator('#social')).toBeVisible();
      await expect(page.locator('footer')).toHaveCount(0);
      const alignedPanels = await page.evaluate(() => {
        const panels = [
          document.querySelector('#projects')!,
          document.querySelector('#about')!,
          document.querySelector('#technologies')!,
        ].map((panel) => panel.getBoundingClientRect());
        const first = panels[0];
        return panels.every(
          (panel) =>
            Math.abs(panel.height - first.height) < 1 &&
            Math.abs(panel.top - first.top) < 1 &&
            Math.abs(panel.bottom - first.bottom) < 1,
        );
      });
      expect(alignedPanels).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (width === 320 || width === 820) {
        const ctaBounds = await page
          .getByRole('link', { name: pageSpec.projectsCta })
          .evaluate((link) => link.getBoundingClientRect().toJSON());
        expect(ctaBounds.left).toBeGreaterThanOrEqual(0);
        expect(ctaBounds.right).toBeLessThanOrEqual(width);

        const projectCards = await page.locator('.project-card').evaluateAll((cards) =>
          cards.map((card) => {
            const bounds = card.getBoundingClientRect();
            const image = card.querySelector('img');
            const imageBounds = image?.getBoundingClientRect();
            const artworkBounds = card.querySelector('.project-card-art')?.getBoundingClientRect();
            const repositoryLink = card.querySelector('.project-card-actions a');
            const linkBounds = repositoryLink?.getBoundingClientRect();
            return {
              hasLoadedImage: Boolean(image?.complete && image.naturalWidth > 0),
              illustrationFits:
                Boolean(imageBounds && artworkBounds) &&
                imageBounds.width <= artworkBounds.width + 1 &&
                imageBounds.height <= artworkBounds.height + 1,
              hasRepositoryLink: Boolean(repositoryLink),
              contentFits:
                card.scrollWidth <= card.clientWidth + 1 &&
                card.scrollHeight <= card.clientHeight + 1,
              repositoryLinkFits:
                Boolean(linkBounds) &&
                linkBounds.left >= bounds.left - 1 &&
                linkBounds.right <= bounds.right + 1 &&
                linkBounds.bottom <= bounds.bottom + 1,
            };
          }),
        );
        expect(projectCards).toHaveLength(4);
        expect(projectCards).toEqual(
          Array.from({ length: 4 }, () => ({
            hasLoadedImage: true,
            illustrationFits: true,
            hasRepositoryLink: true,
            contentFits: true,
            repositoryLinkFits: true,
          })),
        );
        const bannersFit = await page.locator('.interest-card').evaluateAll((cards) =>
          cards.every((card) => {
            const bounds = card.getBoundingClientRect();
            const image = card.querySelector('.interest-illustration')!.getBoundingClientRect();
            const copy = card.querySelector('.interest-copy')!.getBoundingClientRect();
            return (
              image.top >= bounds.top - 1 &&
              image.bottom <= bounds.bottom + 1 &&
              copy.left >= bounds.left - 1 &&
              copy.right <= bounds.right + 1 &&
              copy.top >= bounds.top - 1 &&
              copy.bottom <= bounds.bottom + 1
            );
          }),
        );
        expect(bannersFit).toBe(true);
      }
      if (width === 1440 && height === 900) {
        const projectHeadingBottom = await page
          .locator('#projects h2')
          .evaluate((heading) => heading.getBoundingClientRect().bottom);
        expect(projectHeadingBottom).toBeLessThanOrEqual(height);
      }

      await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(2);
      await expect(page.getByRole('navigation').getByRole('link').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(
        height,
      );
      const current = await sceneComposition(page);
      expect(current).toHaveLength(baseline.length);
      for (let index = 0; index < baseline.length; index++) {
        for (const key of ['left', 'top', 'width', 'height'] as const) {
          expect(current[index][key]).toBeCloseTo(baseline[index][key], 2);
        }
      }
    }
  });
  test(`${pageSpec.locale} scrolls to Library inside the project panel`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    await page.goto(pageSpec.path);
    const grid = page.locator('.project-grid');
    const libraryLink = page.locator('a[href="https://github.com/MiloszPodsiadly/Library"]');
    const aboutBounds = await page.locator('#about').boundingBox();
    await expect(libraryLink).not.toBeInViewport();

    await grid.hover();
    await page.mouse.wheel(0, 500);
    await expect.poll(() => grid.evaluate((element) => element.scrollTop)).toBeGreaterThan(100);
    await expect(libraryLink).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await page.locator('#about').boundingBox()).toEqual(aboutBounds);

    await grid.evaluate((element) => {
      element.scrollTop = 0;
    });
    await grid.focus();
    await page.keyboard.press('PageDown');
    await expect(libraryLink).toBeInViewport();

    for (const technology of ['AWS', 'JavaScript', 'Scala']) {
      await expect(
        page.locator('#technologies').getByText(technology, { exact: true }),
      ).toBeVisible();
    }
    await expect(page.locator('#technologies').getByText('FastAPI', { exact: true })).toHaveCount(
      0,
    );
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

test('language switch remains usable by keyboard in the scaled scene', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await page.getByRole('navigation').getByRole('link', { name: 'Polski' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/pl\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
});

test('language switch remains usable by touch in the scaled scene', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('/en/');
    await page.getByRole('navigation').getByRole('link', { name: 'Polski' }).tap();
    await expect(page).toHaveURL(/\/pl\/$/);
    await page.getByRole('navigation').getByRole('link', { name: 'English' }).tap();
    await expect(page).toHaveURL(/\/en\/$/);
  } finally {
    await context.close();
  }
});

test('hero CTA opens the main GitHub profile in the scaled scene', async ({ page, context }) => {
  await context.route('https://github.com/MiloszPodsiadly', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>GitHub profile</title>' }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'View projects' }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://github.com/MiloszPodsiadly');
  await popup.close();
  await expect(page).toHaveURL(/\/en\/$/);
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
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(2);
  const cta = page.getByRole('link', { name: 'View projects' });
  await expect(cta).toHaveAttribute('href', 'https://github.com/MiloszPodsiadly');
  await cta.focus();
  await expect(cta).toBeFocused();
});

test('keyboard focus and hover states remain perceivable', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  const focusOutline = await skipLink.evaluate((link) => ({
    style: getComputedStyle(link).outlineStyle,
    width: getComputedStyle(link).outlineWidth,
    color: getComputedStyle(link).outlineColor,
  }));
  expect(focusOutline).toEqual({
    style: 'solid',
    width: '3px',
    color: 'rgb(112, 183, 255)',
  });

  const projectsCta = page.getByRole('link', { name: 'View projects' });
  await projectsCta.hover();
  await expect
    .poll(() => projectsCta.evaluate((link) => getComputedStyle(link).filter))
    .toBe('brightness(1.16)');

  const profileLink = page.locator('#social .social-links a').first();
  await profileLink.hover();
  await expect
    .poll(() => profileLink.evaluate((link) => getComputedStyle(link).borderTopColor))
    .toBe('rgb(167, 231, 255)');
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
      await expect(page.getByRole('img', { name: pageSpec.portraitAlt })).toBeVisible();
      await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(2);
      await expect(page.locator('.project-card')).toHaveCount(4);
      await expect(page.locator('#about')).toBeVisible();
      await expect(page.locator('#technologies')).toBeVisible();
      await expect(page.locator('#after-hours')).toBeVisible();
      await expect(page.locator('#social').getByRole('link')).toHaveCount(2);
      await expect(
        page.locator('.project-card a[target="_blank"][rel="noopener noreferrer"]'),
      ).toHaveCount(4);
      await expect(page.getByRole('link', { name: pageSpec.projectsCta })).toHaveAttribute(
        'href',
        'https://github.com/MiloszPodsiadly',
      );
      await expect(page.getByRole('link', { name: pageSpec.projectsCta })).toHaveAttribute(
        'target',
        '_blank',
      );
      await page.locator('.project-grid').focus();
      await page.keyboard.press('End');
      await expect(
        page.locator('a[href="https://github.com/MiloszPodsiadly/Library"]'),
      ).toBeInViewport();
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
