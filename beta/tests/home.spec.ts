import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Acceptance checks from the v5 brief (design/v5/CLAUDE_CODE_HANDOFF.md §11, §12).
 * Run `npm run build` first: these run against the production build.
 */

const ESSAY = 'https://johnrubino.substack.com/p/figma-isnt-always-the-starting-line';
const DESKTOP = { width: 1440, height: 900 };

async function open(page: Page, viewport = DESKTOP) {
  await page.setViewportSize(viewport);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  // Wait for React to attach, so clicks are handled.
  await page.waitForFunction(() => {
    const el = document.querySelector('.greet');
    return !!el && Object.keys(el).some((k) => k.startsWith('__reactProps'));
  });
}

test.describe('rail map', () => {
  test('no label touches another label, a line or a station marker', async ({ page }) => {
    await open(page);
    const clashes = await page.evaluate(() => {
      type Box = { name: string; x: number; y: number; r: number; b: number; owner?: Element | null };
      const svg = document.querySelector('#mapsvg')!;
      const box = (el: Element, name: string, pad = 0): Box => {
        const r = el.getBoundingClientRect();
        return { name, x: r.left - pad, y: r.top - pad, r: r.right + pad, b: r.bottom + pad };
      };
      const hit = (a: Box, b: Box) => a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;

      // The badge code sits inside its badge on purpose, so it isn't a free-standing label.
      const labels = [...svg.querySelectorAll('text:not(.code)')].map((t) => box(t, `"${t.textContent}"`));
      const out: string[] = [];

      for (let i = 0; i < labels.length; i++)
        for (let j = i + 1; j < labels.length; j++)
          if (hit(labels[i], labels[j])) out.push(`${labels[i].name} × ${labels[j].name}`);

      const markers = [...svg.querySelectorAll('.pill, .badge, .end, a > circle')].map((m, i) => box(m, `marker ${i}`));
      for (const l of labels) for (const m of markers) if (hit(l, m)) out.push(`${l.name} × ${m.name}`);

      // Lines: sample every 2px along each path and test a line-width square at that point.
      const scale = svg.getBoundingClientRect().width / 220;
      const ctm = (svg as SVGSVGElement).getScreenCTM()!;
      const check = (name: string, x: number, y: number, half: number) => {
        const px = x * ctm.a + ctm.e;
        const py = y * ctm.d + ctm.f;
        const dot: Box = { name, x: px - half, y: py - half, r: px + half, b: py + half };
        for (const l of labels) if (hit(l, dot)) out.push(`${l.name} × ${name}`);
      };
      for (const p of svg.querySelectorAll<SVGPathElement>('path.rt')) {
        const len = p.getTotalLength();
        for (let d = 0; d <= len; d += 2) {
          const pt = p.getPointAtLength(d);
          check(`line ${p.id}`, pt.x, pt.y, 2.5 * scale);
        }
      }
      const base = svg.querySelector<SVGLineElement>('line.base')!;
      for (let y = base.y1.baseVal.value; y <= base.y2.baseVal.value; y += 2) check('base line', base.x1.baseVal.value, y, 1.5 * scale);

      return [...new Set(out)];
    });
    expect(clashes).toEqual([]);
  });

  test('all map text is horizontal', async ({ page }) => {
    await open(page);
    const rotated = await page.locator('#mapsvg text[transform], #mapsvg text[rotate]').count();
    expect(rotated).toBe(0);
  });

  test('badges keep their fixed codes, colours and size', async ({ page }) => {
    await open(page);
    const map = await page.locator('#mapsvg .stop').evaluateAll((stops) =>
      stops.map((s) => {
        const badge = s.querySelector('.badge')!;
        const r = badge.getBoundingClientRect();
        return { code: s.querySelector('.code')!.textContent, fill: getComputedStyle(badge).fill, w: Math.round(r.width), h: Math.round(r.height) };
      }),
    );
    expect(map.map((b) => b.code)).toEqual(['FoWA', 'FPL', 'PPR', 'Labs', 'W']);
    expect(map.map((b) => b.fill)).toEqual(['rgb(255, 107, 74)', 'rgb(232, 163, 23)', 'rgb(91, 140, 255)', 'rgb(181, 123, 255)', 'rgb(212, 192, 154)']);
    for (const b of map) expect([b.w, b.h]).toEqual([44, 18]);
  });

  test('hover lights the line, dims the rest, shows the card and runs the train', async ({ page }) => {
    await open(page);
    await page.hover('[data-stop="fpl"] .badge');
    await expect(page.locator('.map-wrap')).toHaveClass(/dim/);
    await expect(page.locator('#p-fpl')).toHaveClass(/lit/);
    await expect(page.locator('#p-fowa')).not.toHaveClass(/lit/);
    await expect(page.locator('#p-fowa')).toHaveCSS('opacity', '0.14');
    await expect(page.locator('.preview')).toHaveClass(/show/);
    await expect(page.locator('.preview .pv-t')).toHaveText('Fully Paid Lending');
    await expect(page.locator('.preview')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#train')).toHaveCSS('opacity', '1');

    // The card sits to the right of the rail, over the content.
    const rail = (await page.locator('.rail').boundingBox())!;
    const card = (await page.locator('.preview').boundingBox())!;
    expect(card.x).toBeGreaterThanOrEqual(rail.x + rail.width);

    // PPR also lights Labs: they meet at the interchange.
    await page.hover('[data-stop="ppr"] .badge');
    await expect(page.locator('#p-ppr')).toHaveClass(/lit/);
    await expect(page.locator('#p-labs')).toHaveClass(/lit/);

    await page.mouse.move(800, 450);
    await expect(page.locator('.map-wrap')).not.toHaveClass(/dim/);
    await expect(page.locator('.preview')).not.toHaveClass(/show/);
  });

  test('HARD RULE: a map hover changes nothing in the content column', async ({ page }) => {
    await open(page);
    await page.evaluate(() => {
      const w = window as unknown as { __changes: string[] };
      w.__changes = [];
      new MutationObserver((records) => {
        for (const r of records) w.__changes.push(`${r.type} ${r.attributeName ?? ''} on <${(r.target as Element).nodeName}>`);
      }).observe(document.querySelector('main')!, { subtree: true, childList: true, attributes: true, characterData: true });
    });
    const before = await page.evaluate(() => ({ y: window.scrollY, html: document.querySelector('main')!.innerHTML }));
    for (const stop of ['fowa', 'fpl', 'ppr', 'labs', 'write']) {
      await page.hover(`[data-stop="${stop}"] .badge`);
      await page.waitForTimeout(350);
    }
    await page.mouse.move(800, 450);
    await page.waitForTimeout(350);
    const after = await page.evaluate(() => ({
      y: window.scrollY,
      html: document.querySelector('main')!.innerHTML,
      changes: (window as unknown as { __changes: string[] }).__changes,
    }));
    expect(after.changes).toEqual([]);
    expect(after.html).toBe(before.html);
    expect(after.y).toBe(before.y);
  });

  test('every line end and station is a real link to the right place', async ({ page }) => {
    await open(page);
    const href = (name: string) => page.locator(`#mapsvg a[aria-label^="${name}"]`).getAttribute('href');
    expect(await href('Future of Wealth Advisory')).toBe('#stop-fowa');
    expect(await href('Fully Paid Lending')).toBe('#stop-fpl');
    expect(await href('Purple Panda Rentals')).toBe('#stop-ppr');
    expect(await href('Colllective Design')).toBe('#stop-labs');
    expect(await href('Figma isn’t always the starting line')).toBe(ESSAY);
    // The About stop was removed from the map at John's request.
    await expect(page.locator('#mapsvg a[aria-label^="About"]')).toHaveCount(0);
    expect(await href('Timetable')).toBe('#stop-timetable');
    expect(await href('Home')).toBe('#home');
    for (const name of ['Figma isn’t always the starting line']) {
      await expect(page.locator(`#mapsvg a[aria-label^="${name}"]`)).toHaveAttribute('target', '_blank');
    }
    // Every in-page destination exists.
    for (const id of ['stop-fowa', 'stop-fpl', 'stop-ppr', 'stop-labs', 'stop-timetable', 'home', 'list']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    // Every link on the map has a name.
    const unnamed = await page.locator('#mapsvg a:not([aria-label])').count();
    expect(unnamed).toBe(0);
  });

  test('reduced motion hides the train', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.hover('[data-stop="fpl"] .badge');
    await expect(page.locator('#train')).toHaveCSS('display', 'none');
    await expect(page.locator('#p-fpl')).toHaveClass(/lit/);
  });
});

test.describe('word expansions', () => {
  const word = (page: Page, id: string) => page.locator(`button[aria-controls="xp-${id}"]`);
  const panel = (page: Page, id: string) => page.locator(`#xp-${id}`);
  const isInert = (page: Page, id: string) => panel(page, id).evaluate((el) => (el as HTMLElement).inert);

  test('every word is a button wired to a closed, inert paragraph', async ({ page }) => {
    await open(page);
    const words = page.locator('button.hl');
    // Eight in the intro, plus Wove waiting inside the closed "product designer" paragraph.
    expect(await words.count()).toBe(9);
    for (const w of await words.all()) {
      await expect(w).toHaveAttribute('type', 'button');
      await expect(w).toHaveAttribute('aria-expanded', 'false');
      const id = (await w.getAttribute('aria-controls'))!;
      expect(await page.locator(`#${id}`).evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    }
  });

  test('clicking turns the word into plain text and opens a paragraph under it, for good', async ({ page }) => {
    await open(page);
    await word(page, 'fowa').click();
    // The pill is gone: the words are plain text in the sentence, with no underline.
    await expect(word(page, 'fowa')).toHaveCount(0);
    await expect(page.locator('p.stand')).toContainText('working on wealth advisory,');
    expect(await page.locator('p.stand').evaluate((p) => [...p.querySelectorAll('*')].some((e) => e.textContent === 'wealth advisory'))).toBe(false);

    expect(await isInert(page, 'fowa')).toBe(false);
    await expect(panel(page, 'fowa').locator('.xpp')).toHaveCSS('opacity', '1');
    // Focus moves to the new paragraph, since the button it came from is gone.
    await expect(panel(page, 'fowa').locator('.xpp')).toBeFocused();

    const plain = await panel(page, 'fowa').evaluate((el) =>
      [el, el.firstElementChild!, el.querySelector('p')!].every((n) => {
        const s = getComputedStyle(n);
        return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.borderTopWidth === '0px' && s.boxShadow === 'none' && s.position === 'static';
      }),
    );
    expect(plain).toBe(true);
    expect(await panel(page, 'fowa').locator('svg, img, button').count()).toBe(0);

    // It sits between the standfirst and the body paragraph, in the same type.
    const order = await page.evaluate(() => {
      const y = (s: string) => document.querySelector(s)!.getBoundingClientRect().top;
      return [y('.stand'), y('#xp-fowa .xpp'), y('p.body')];
    });
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);
    const type = (s: string) => page.locator(s).evaluate((el) => { const c = getComputedStyle(el); return [c.fontSize, c.fontWeight, c.lineHeight, c.color, c.fontFamily]; });
    expect(await type('#xp-fowa .xpp')).toEqual(await type('p.body'));

    // Several open at once, in document order; nothing folds back on Esc.
    await word(page, 'designer').click();
    await page.waitForTimeout(600);
    const stacked = await page.evaluate(() => {
      const y = (s: string) => document.querySelector(s)!.getBoundingClientRect().top;
      return y('#xp-designer .xpp') < y('#xp-fowa .xpp');
    });
    expect(stacked).toBe(true);
    await page.keyboard.press('Escape');
    expect(await isInert(page, 'fowa')).toBe(false);
    expect(await isInert(page, 'designer')).toBe(false);
  });

  test('opened paragraphs can hold more words: Wove opens a second layer', async ({ page }) => {
    await open(page);
    // Wove waits inside the closed paragraph, out of reach until it opens.
    expect(await isInert(page, 'designer')).toBe(true);
    await word(page, 'designer').click();
    expect(await isInert(page, 'designer')).toBe(false);
    await expect(word(page, 'wove')).toBeVisible();
    await word(page, 'wove').click();
    await expect(word(page, 'wove')).toHaveCount(0);
    expect(await isInert(page, 'wove')).toBe(false);
    await expect(panel(page, 'wove').locator('.xpp')).toBeFocused();
  });

  test('keyboard only: Enter and Space open words, and reading carries on from the new paragraph', async ({ page }) => {
    await open(page);
    await word(page, 'designer').focus();
    await expect(word(page, 'designer')).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(panel(page, 'designer').locator('.xpp')).toBeFocused();
    // The next Tab lands on the word inside the paragraph that just opened.
    await page.keyboard.press('Tab');
    await expect(word(page, 'wove')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(word(page, 'wove')).toHaveCount(0);
    await expect(panel(page, 'wove').locator('.xpp')).toBeFocused();
  });

  test('the greeting cycles on each click', async ({ page }) => {
    await open(page);
    const greet = page.locator('.hello button');
    const first = (await greet.innerText()).trim();
    await greet.click();
    const second = (await greet.innerText()).trim();
    expect(second).not.toBe(first);
    for (let n = 0; n < 10; n++) await greet.click();
    expect((await greet.innerText()).trim()).toBeTruthy();
  });

  test('the tools toggle opens its list', async ({ page }) => {
    await open(page);
    const toggle = page.locator('.tools-b');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-controls', 'tools');
    expect(await page.locator('#tools').evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(await page.locator('#tools').evaluate((el) => (el as HTMLElement).inert)).toBe(false);
  });

  test('reduced motion: no blur and no animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(panel(page, 'fowa').locator('.xpp')).toHaveCSS('filter', 'none');
    await expect(panel(page, 'fowa')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('.rv').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('.portrait img')).toHaveCSS('transition-duration', '0s');
  });
});

test.describe('typography', () => {
  for (const viewport of [DESKTOP, { width: 390, height: 844 }]) {
    test(`only 12/16/22/72px, three families and no italics at ${viewport.width}px`, async ({ page }) => {
      await open(page, viewport);
      // Open everything so hidden paragraphs are measured too.
      const hl = page.locator('.hero-top button.hl');
      while (await hl.count()) await hl.first().click();
      await page.locator('.tools-b').click();
      if (viewport.width > 760) await page.hover('[data-stop="fpl"] .badge');

      const report = await page.evaluate(() => {
        const sizes = new Set<string>();
        const families = new Set<string>();
        const italics: string[] = [];
        const odd: string[] = [];
        for (const el of document.body.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          for (const pseudo of [null, '::before', '::after']) {
            if (getComputedStyle(el, pseudo).fontStyle !== 'normal') italics.push(el.nodeName + (pseudo ?? ''));
          }
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
          if (!hasText) continue;
          sizes.add(cs.fontSize);
          const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
          families.add(family);
          if (!['12px', '16px', '22px', '72px'].includes(cs.fontSize)) odd.push(`${el.nodeName}.${el.getAttribute('class')} ${cs.fontSize}`);
        }
        return { sizes: [...sizes].sort(), families: [...families].sort(), italics, odd };
      });
      expect(report.odd).toEqual([]);
      expect(report.italics).toEqual([]);
      expect(report.families).toEqual(['Bricolage Grotesque', 'JetBrains Mono', 'Public Sans']);
      expect(report.sizes).toEqual(['12px', '16px', '22px', '72px']);
    });
  }

  test('the three web fonts load, self-hosted', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await open(page);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')));
    expect([...new Set(loaded)].sort()).toEqual(['Bricolage Grotesque', 'JetBrains Mono', 'Public Sans']);
    expect(requests.filter((u) => !u.startsWith('http://localhost'))).toEqual([]);
  });
});

test.describe('content', () => {
  test('placeholder tags and both slots are present and untouched', async ({ page }) => {
    await open(page);
    // The sign-off slot was removed at John's request.
    await expect(page.locator('.signoff')).toHaveCount(0);
    await expect(page.locator('.ph3')).toHaveText('Placeholder · John to rewrite');
    await expect(page.locator('.pf.slot')).toHaveText('An AI-first vision prototype with four designers. [Project name · link · John to confirm]');
    await expect(page.locator('.tools-p .slot')).toHaveText('[daily stack · John to confirm]');
  });

  test('facts match the brief (§8)', async ({ page }) => {
    await open(page);
    const text = await page.locator('body').evaluate((b) => b.textContent ?? '');
    expect(text).toContain('Sep 29, 2026');
    expect(text).toContain('I’m an advisor to Colllective Design');
    expect(text).not.toMatch(/Col{1,2}ective|Col{4,}ective/);
    expect(text).not.toMatch(/founder of Colllective|co-founder/i);
    expect(text).not.toContain('New Account Opening');
    expect(text).not.toContain('AI-first advisor workspace');
    expect(text).not.toMatch(/\$\s?\d|\d\+?\s+years/i);

    // The legend, the latest-essay card and the Case studies key were removed from the hero at John's request.
    await expect(page.locator('.legend, .dt, .continue')).toHaveCount(0);
    await expect(page.locator('#stop-fowa .li-s')).toHaveText('BNY Pershing · Wealth Services · NDA');
    await expect(page.locator('#stop-fpl .li-s')).toHaveText('BNY Pershing · Wealth Services · NDA');
    await expect(page.locator('#stop-ppr .li-s')).toHaveText('Founder project · In progress');
    // Exactly three case studies.
    await expect(page.locator('.grp').first().locator('li')).toHaveCount(3);
  });

  test('3dicons credit is in the head, and icons are files with set sizes', async ({ page }) => {
    await open(page);
    const head = await page.evaluate(() => document.head.innerHTML);
    expect(head).toContain('3D icons: 3dicons by Vijay Verma (realvjy), https://3dicons.co — CC0 1.0 (github.com/realvjy/3dicons). Clay style, dynamic angle; recoloured.');
    const imgs = await page.locator('img').evaluateAll((els) => els.map((i) => ({ src: i.getAttribute('src')!, w: i.getAttribute('width'), h: i.getAttribute('height') })));
    expect(imgs).toHaveLength(1);
    for (const i of imgs) {
      expect(i.src).toMatch(/\.webp$/);
      expect(i.src.startsWith('data:')).toBe(false);
      expect(i.w && i.h).toBeTruthy();
    }
    expect(await page.locator('#list img, .xw img, #howai img, .now img').count()).toBe(0);
  });

  test('landmarks, headings and link names', async ({ page }) => {
    await open(page);
    await expect(page.locator('nav[aria-label="System map"]')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('John Rubino');
    // Intro structure: greeting, the sentence with the name and photo inline, second paragraph.
    const order = await page.locator('.hero-top > *').evaluateAll((els) => els.map((e) => e.className.split(' ')[0] || e.nodeName));
    expect(order.filter((c) => ['hello', 'stand', 'body'].includes(c))).toEqual(['hello', 'stand', 'body']);
    await expect(page.locator('p.stand .nm')).toHaveText('John Rubino');
    await expect(page.locator('p.stand .nm img')).toHaveCount(1);
    // The contact links were removed from the intro at John's request.
    await expect(page.locator('.contact')).toHaveCount(0);
    // "Currently shipping for" sits right under the intro.
    await expect(page.locator('#h-now')).toHaveText('Currently shipping for');
    await expect(page.locator('.now-t')).toHaveText(['BNY Pershing', 'Colllective Design', 'Design Thinker']);
    const y = (s: string) => page.locator(s).evaluate((e) => e.getBoundingClientRect().top);
    expect(await y('.now')).toBeGreaterThan(await y('p.body'));
    for (const s of await page.locator('main section').all()) {
      const id = (await s.getAttribute('aria-labelledby'))!;
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    const unnamed = await page.locator('a').evaluateAll((els) => els.filter((a) => !(a.textContent ?? '').trim() && !a.getAttribute('aria-label')).length);
    expect(unnamed).toBe(0);
  });
});

test.describe('contrast', () => {
  // The depth effects (gloss, embossed and stamped labels, paper cards) must keep text at WCAG AA.
  for (const viewport of [DESKTOP, { width: 390, height: 844 }]) {
    test(`all text meets AA contrast at ${viewport.width}px, with every paragraph open`, async ({ page }) => {
      await open(page, viewport);
      const hl = page.locator('.hero-top button.hl');
      while (await hl.count()) await hl.first().click();
      await page.locator('.tools-b').click();
      await page.evaluate(() => document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')));
      await page.waitForTimeout(900);
      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      const failures = results.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')}: ${n.failureSummary?.split('\n').slice(1).join(' ')}`));
      expect(failures).toEqual([]);
    });
  }
});

test.describe('layout', () => {
  test('the hero has no scrollbar inside it and the rail fills the window at 1440 × 900', async ({ page }) => {
    await open(page);
    const m = await page.evaluate(() => {
      const hero = document.querySelector('#home')!;
      const r = hero.getBoundingClientRect();
      const rail = document.querySelector('.rail')!.getBoundingClientRect();
      return { top: r.top, height: r.height, scrollH: hero.scrollHeight, clientH: hero.clientHeight, railW: rail.width, railH: rail.height, pageW: document.documentElement.scrollWidth };
    });
    expect(m.top).toBe(0);
    // The hero is as tall as its content (no forced full-screen gap), and never taller than the window at rest.
    // The hero is as tall as its content; no inner scrollbar.
    expect(m.scrollH).toBeLessThanOrEqual(m.clientH);
    expect(m.railW).toBe(220);
    expect(m.railH).toBe(900);
    expect(m.pageW).toBe(1440);
    // The whole map is visible inside the rail.
    const map = (await page.locator('#mapsvg').boundingBox())!;
    expect(map.height).toBe(800);
    expect(map.y + map.height).toBeLessThanOrEqual(900);
  });

  for (const width of [1280, 1440, 1920]) {
    test(`nothing overlaps at ${width}px wide`, async ({ page }) => {
      await open(page, { width, height: 900 });
      const m = await page.evaluate(() => {
        const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        const hit = (a: DOMRect, b: DOMRect) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
        const pairs: [string, string][] = [
          ['.rail', '.content'], ['.hero-top', '.now'], ['.now', '.foot'],
          ['.ai-l', '.ai-r'], ['#home', '#howai'], ['#howai', '#list'],
        ];
        const cols = [...document.querySelectorAll('.cols .grp')].map((g) => g.getBoundingClientRect());
        const colClash = cols.some((a, i) => cols.some((b, j) => j > i && hit(a, b)));
        return {
          clashes: pairs.filter(([a, b]) => hit(box(a), box(b))).map((p) => p.join(' × ')),
          colClash,
          overflowX: document.documentElement.scrollWidth - window.innerWidth,
          clipped: [...document.querySelectorAll('.li-t, .ac h4, .nm, .lh h2, .now-t')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent),
        };
      });
      expect(m.clashes).toEqual([]);
      expect(m.colClash).toBe(false);
      expect(m.overflowX).toBeLessThanOrEqual(0);
      expect(m.clipped).toEqual([]);
    });
  }

  test('the map scales to fit a short window', async ({ page }) => {
    await open(page, { width: 1280, height: 640 });
    const map = (await page.locator('#mapsvg').boundingBox())!;
    expect(map.y + map.height).toBeLessThanOrEqual(640);
    await page.hover('[data-stop="write"] .badge');
    const card = (await page.locator('.preview').boundingBox())!;
    expect(card.y + card.height).toBeLessThanOrEqual(640);
  });

  test('mobile: no horizontal page scroll, only the strip scrolls sideways', async ({ page }) => {
    await open(page, { width: 390, height: 844 });
    const m = await page.evaluate(() => {
      const strip = document.querySelector('.strip')!;
      const rail = document.querySelector('.rail')!;
      return {
        pageW: document.documentElement.scrollWidth,
        stripScrolls: strip.scrollWidth > strip.clientWidth,
        stripOverflow: getComputedStyle(strip).overflowX,
        railPos: getComputedStyle(rail).position,
        railH: rail.getBoundingClientRect().height,
        mapHidden: getComputedStyle(document.querySelector('.map-wrap')!).display === 'none',
        badges: [...strip.querySelectorAll('a')].map((a) => a.textContent),
        wide: [...document.querySelectorAll('main *')].filter((e) => e.getBoundingClientRect().right > 390.5).map((e) => `${e.nodeName}.${e.getAttribute('class')}`),
      };
    });
    expect(m.pageW).toBe(390);
    expect(m.wide).toEqual([]);
    expect(m.stripScrolls).toBe(true);
    expect(m.stripOverflow).toBe('auto');
    expect(m.railPos).toBe('sticky');
    expect(m.railH).toBeGreaterThanOrEqual(44);
    expect(m.railH).toBeLessThanOrEqual(48);
    expect(m.mapHidden).toBe(true);
    expect(m.badges).toEqual(['Home', 'FoWA', 'FPL', 'PPR', 'Labs', 'W']);

    // The page itself can't be scrolled sideways.
    await page.evaluate(() => window.scrollTo(200, 0));
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
  });
});
