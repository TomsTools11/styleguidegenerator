import { chromium, Browser, Page } from 'playwright';
import type { StyleGuideData, Color, TypeScaleItem } from '@/types/style-guide';

interface ExtractedStyles {
  colors: string[];
  fonts: string[];
  fontSizes: string[];
  fontWeights: string[];
  spacing: string[];
}

// Color conversion utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function parseColor(colorStr: string): string | null {
  // Handle hex
  if (colorStr.startsWith('#')) {
    const hex = colorStr.length === 4
      ? '#' + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2] + colorStr[3] + colorStr[3]
      : colorStr;
    return hex.toUpperCase();
  }

  // Handle rgb/rgba
  const rgbMatch = colorStr.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }

  return null;
}

function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#808080': 'Gray',
    '#C0C0C0': 'Silver',
    '#800000': 'Maroon',
    '#808000': 'Olive',
    '#008000': 'Dark Green',
    '#800080': 'Purple',
    '#008080': 'Teal',
    '#000080': 'Navy',
  };

  // Check for exact matches
  if (colorNames[hex]) return colorNames[hex];

  // Generate name based on color characteristics
  const rgb = hexToRgb(hex);
  if (!rgb) return 'Custom';

  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;

  if (max === min) {
    if (lightness < 0.2) return 'Near Black';
    if (lightness > 0.8) return 'Near White';
    return 'Gray';
  }

  let hue = '';
  if (r >= g && r >= b) {
    if (g > b) hue = 'Orange';
    else if (b > g) hue = 'Pink';
    else hue = 'Red';
  } else if (g >= r && g >= b) {
    if (r > b) hue = 'Yellow-Green';
    else if (b > r) hue = 'Cyan';
    else hue = 'Green';
  } else {
    if (r > g) hue = 'Purple';
    else if (g > r) hue = 'Teal';
    else hue = 'Blue';
  }

  if (lightness < 0.3) return `Dark ${hue}`;
  if (lightness > 0.7) return `Light ${hue}`;
  return hue;
}

function classifyColorRole(hex: string, allColors: string[], index: number): { role: string; usage: string } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { role: 'Custom', usage: 'General use' };

  const { r, g, b } = rgb;
  const lightness = (r + g + b) / 3 / 255;

  // Very dark colors - likely primary/dark
  if (lightness < 0.15) {
    return { role: 'Primary Dark', usage: 'Headers, footers, primary backgrounds' };
  }

  // Very light colors - likely background
  if (lightness > 0.9) {
    return { role: 'Background', usage: 'Page backgrounds, card backgrounds' };
  }

  // Gray tones
  if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) {
    if (lightness < 0.5) {
      return { role: 'Text Primary', usage: 'Body text, primary content' };
    }
    return { role: 'Text Secondary', usage: 'Secondary text, captions' };
  }

  // Saturated colors
  const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
  if (saturation > 0.5) {
    // Check for semantic colors
    if (r > 200 && g < 100 && b < 100) {
      return { role: 'Error', usage: 'Error states, destructive actions' };
    }
    if (g > 150 && r < 100 && b < 100) {
      return { role: 'Success', usage: 'Success states, confirmations' };
    }
    if (r > 200 && g > 150 && b < 100) {
      return { role: 'Warning', usage: 'Warnings, cautions' };
    }
    if (b > 150) {
      if (index < 3) {
        return { role: 'Primary Accent', usage: 'CTAs, links, interactive elements' };
      }
      return { role: 'Light Accent', usage: 'Hover states, highlights' };
    }
  }

  return { role: 'Accent', usage: 'Highlights, accents' };
}

export async function analyzeWebsite(url: string): Promise<StyleGuideData> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    // Use 'domcontentloaded' instead of 'networkidle' for complex sites
    // Then wait a bit for JS to render
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for body to be attached to DOM (not necessarily visible, as some sites hide body during initialization)
    await page.waitForSelector('body', { state: 'attached', timeout: 10000 });
    // Give JS time to render and potentially unhide the body
    await page.waitForTimeout(2000);

    // Dismiss common popups, cookie banners, and modals
    await dismissPopups(page);

    // Scroll to load lazy content
    await autoScroll(page);

    // Extract page metadata
    const metadata = await page.evaluate(() => {
      const title = document.querySelector('title')?.textContent || '';
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';
      return { title, description, siteName: ogSiteName || title };
    });

    // Extract styles from the page
    const extractedStyles = await extractStyles(page);

    // Process colors
    const processedColors = processColors(extractedStyles.colors);

    // Process typography
    const typography = processTypography(extractedStyles);

    // Get domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const brandName = metadata.siteName || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

    await browser.close();

    return buildStyleGuideData(url, domain, brandName, metadata.description, processedColors, typography);
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

// Dismiss common popups, cookie banners, and modals
async function dismissPopups(page: Page): Promise<void> {
  const dismissSelectors = [
    // Cookie consent buttons
    '[class*="cookie"] button[class*="accept"]',
    '[class*="cookie"] button[class*="agree"]',
    '[class*="cookie"] button[class*="allow"]',
    '[class*="cookie"] button[class*="close"]',
    '[id*="cookie"] button[class*="accept"]',
    '[id*="cookie"] button[class*="close"]',
    'button[id*="accept-cookies"]',
    'button[id*="acceptCookies"]',
    'button[class*="accept-cookies"]',
    '[data-testid*="cookie"] button',

    // Generic close/dismiss buttons
    '[class*="modal"] [class*="close"]',
    '[class*="popup"] [class*="close"]',
    '[class*="overlay"] [class*="close"]',
    '[class*="dialog"] [class*="close"]',
    '[aria-label="Close"]',
    '[aria-label="close"]',
    '[aria-label="Dismiss"]',
    'button[class*="dismiss"]',

    // Newsletter/signup popups
    '[class*="newsletter"] [class*="close"]',
    '[class*="signup"] [class*="close"]',
    '[class*="subscribe"] [class*="close"]',

    // Age verification (common on beverage sites like Liquid Death)
    'button[class*="age"]',
    '[class*="age-gate"] button',
    '[class*="agegate"] button',
    '[class*="verify"] button',
  ];

  for (const selector of dismissSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        const isVisible = await element.isVisible();
        if (isVisible) {
          await element.click();
          await page.waitForTimeout(500);
        }
      }
    } catch {
      // Ignore errors - element may not exist or be clickable
    }
  }

  // Also try pressing Escape to close modals
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } catch {
    // Ignore
  }
}

// Scroll down the page to trigger lazy loading
async function autoScroll(page: Page): Promise<void> {
  try {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const maxScrolls = 10;
        let scrollCount = 0;

        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          scrollCount++;

          if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
            clearInterval(timer);
            window.scrollTo(0, 0); // Scroll back to top
            resolve();
          }
        }, 200);
      });
    });
    await page.waitForTimeout(500);
  } catch {
    // Ignore scroll errors
  }
}

async function extractStyles(page: Page): Promise<ExtractedStyles> {
  return page.evaluate(() => {
    const colors: Set<string> = new Set();
    const fonts: Set<string> = new Set();
    const fontSizes: Set<string> = new Set();
    const fontWeights: Set<string> = new Set();
    const spacing: Set<string> = new Set();

    // Get all stylesheets
    const styleSheets = Array.from(document.styleSheets);

    // Extract from inline styles and computed styles
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
      const computed = window.getComputedStyle(element);

      // Colors
      ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].forEach((prop) => {
        const value = computed.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
          colors.add(value);
        }
      });

      // Typography
      const fontFamily = computed.fontFamily;
      if (fontFamily) {
        const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
        fonts.add(primaryFont);
      }

      const fontSize = computed.fontSize;
      if (fontSize) fontSizes.add(fontSize);

      const fontWeight = computed.fontWeight;
      if (fontWeight) fontWeights.add(fontWeight);

      // Spacing
      ['margin', 'padding', 'gap'].forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (value && value !== '0px') {
          spacing.add(value);
        }
      });
    });

    // Also extract from CSS rules
    styleSheets.forEach((sheet) => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          Array.from(rules).forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              const style = rule.style;
              // Extract colors from CSS
              ['color', 'background-color', 'border-color', 'background'].forEach((prop) => {
                const value = style.getPropertyValue(prop);
                if (value) {
                  // Extract hex colors
                  const hexMatches = value.match(/#[0-9A-Fa-f]{3,6}/g);
                  if (hexMatches) hexMatches.forEach((hex) => colors.add(hex));

                  // Extract rgb/rgba colors
                  const rgbMatches = value.match(/rgba?\s*\([^)]+\)/g);
                  if (rgbMatches) rgbMatches.forEach((rgb) => colors.add(rgb));
                }
              });
            }
          });
        }
      } catch {
        // CORS restrictions on external stylesheets
      }
    });

    return {
      colors: Array.from(colors),
      fonts: Array.from(fonts),
      fontSizes: Array.from(fontSizes),
      fontWeights: Array.from(fontWeights),
      spacing: Array.from(spacing),
    };
  });
}

function processColors(rawColors: string[]): Color[] {
  const colorMap = new Map<string, number>();

  // Parse and deduplicate colors
  rawColors.forEach((colorStr) => {
    const hex = parseColor(colorStr);
    if (hex && hex !== '#000000' && hex !== '#FFFFFF') {
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
  });

  // Also add black and white
  colorMap.set('#000000', 1);
  colorMap.set('#FFFFFF', 1);

  // Sort by frequency
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([hex]) => hex);

  // Convert to Color objects with classification
  return sortedColors.map((hex, index) => {
    const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
    const { role, usage } = classifyColorRole(hex, sortedColors, index);
    return {
      hex,
      rgb,
      name: getColorName(hex),
      role,
      usage,
    };
  });
}

function processTypography(styles: ExtractedStyles): {
  primaryFont: { name: string; fallback: string; category: 'primary' };
  secondaryFont?: { name: string; fallback: string; category: 'secondary' };
  monospaceFont?: { name: string; fallback: string; category: 'monospace' };
  scale: TypeScaleItem[];
} {
  const fonts = styles.fonts.filter((f) => f && f !== 'inherit' && f !== 'initial');
  const fontSizes = styles.fontSizes
    .map((s) => parseFloat(s))
    .filter((s) => !isNaN(s) && s > 0)
    .sort((a, b) => b - a);

  // Deduplicate and get unique sizes
  const uniqueSizes = [...new Set(fontSizes.map((s) => Math.round(s)))].slice(0, 10);

  // Get font weights
  const weights = styles.fontWeights
    .map((w) => parseInt(w))
    .filter((w) => !isNaN(w))
    .sort((a, b) => b - a);
  const uniqueWeights = [...new Set(weights)];

  const primaryFont = fonts[0] || 'Inter';
  const secondaryFont = fonts[1];
  const monospaceFont = fonts.find((f) =>
    ['monospace', 'mono', 'code', 'consolas', 'menlo', 'courier', 'jetbrains'].some((m) =>
      f.toLowerCase().includes(m)
    )
  );

  // Build type scale
  const scale: TypeScaleItem[] = [];
  const elements = ['Display', 'H1', 'H2', 'H3', 'H4', 'Body Large', 'Body', 'Body Small', 'Caption', 'Code'];

  uniqueSizes.slice(0, 10).forEach((size, index) => {
    const element = elements[index] || `Size ${index + 1}`;
    const weight = index < 4 ? (uniqueWeights[0] || 700) : (uniqueWeights[uniqueWeights.length - 1] || 400);
    const weightName = weight >= 700 ? 'Bold' : weight >= 600 ? 'Semi-Bold' : weight >= 500 ? 'Medium' : 'Regular';

    scale.push({
      element,
      size: `${size}px / ${(size / 16).toFixed(3).replace(/\.?0+$/, '')}rem`,
      weight: `${weight} (${weightName})`,
      lineHeight: index < 4 ? '1.2' : '1.6',
      letterSpacing: index < 2 ? '-0.02em' : '0',
    });
  });

  return {
    primaryFont: { name: primaryFont, fallback: 'system-ui, sans-serif', category: 'primary' },
    secondaryFont: secondaryFont ? { name: secondaryFont, fallback: 'system-ui, sans-serif', category: 'secondary' } : undefined,
    monospaceFont: monospaceFont ? { name: monospaceFont, fallback: 'Consolas, monospace', category: 'monospace' } : undefined,
    scale: scale.length > 0 ? scale : [
      { element: 'Display', size: '48px / 3rem', weight: '700 (Bold)', lineHeight: '1.1', letterSpacing: '-0.02em' },
      { element: 'H1', size: '36px / 2.25rem', weight: '700 (Bold)', lineHeight: '1.2', letterSpacing: '-0.01em' },
      { element: 'H2', size: '28px / 1.75rem', weight: '600 (Semi-Bold)', lineHeight: '1.3', letterSpacing: '0' },
      { element: 'H3', size: '22px / 1.375rem', weight: '600 (Semi-Bold)', lineHeight: '1.4', letterSpacing: '0' },
      { element: 'Body', size: '16px / 1rem', weight: '400 (Regular)', lineHeight: '1.6', letterSpacing: '0' },
      { element: 'Small', size: '14px / 0.875rem', weight: '400 (Regular)', lineHeight: '1.5', letterSpacing: '0' },
    ],
  };
}

function buildStyleGuideData(
  url: string,
  domain: string,
  brandName: string,
  description: string,
  colors: Color[],
  typography: ReturnType<typeof processTypography>
): StyleGuideData {
  // Categorize colors
  const primaryColors = colors.filter((c) => c.role.includes('Primary') || c.role.includes('Dark')).slice(0, 3);
  const secondaryColors = colors.filter((c) => c.role.includes('Accent') || c.role.includes('Light')).slice(0, 3);
  const textColors = colors.filter((c) => c.role.includes('Text')).slice(0, 2);
  const bgColors = colors.filter((c) => c.role.includes('Background')).slice(0, 2);

  // Ensure we have some colors in each category
  if (primaryColors.length === 0) primaryColors.push(...colors.slice(0, 2));
  if (secondaryColors.length === 0) secondaryColors.push(...colors.slice(2, 4));
  if (textColors.length === 0) {
    textColors.push({ hex: '#374151', rgb: { r: 55, g: 65, b: 81 }, name: 'Gray Dark', role: 'Text Primary', usage: 'Body text' });
  }
  if (bgColors.length === 0) {
    bgColors.push({ hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, name: 'White', role: 'Background', usage: 'Main background' });
  }

  const systemColors = {
    success: colors.find((c) => c.role === 'Success') || { hex: '#10B981', rgb: { r: 16, g: 185, b: 129 }, name: 'Green', role: 'Success', usage: 'Success states' },
    warning: colors.find((c) => c.role === 'Warning') || { hex: '#F59E0B', rgb: { r: 245, g: 158, b: 11 }, name: 'Amber', role: 'Warning', usage: 'Warnings' },
    error: colors.find((c) => c.role === 'Error') || { hex: '#EF4444', rgb: { r: 239, g: 68, b: 68 }, name: 'Red', role: 'Error', usage: 'Errors' },
    info: { hex: primaryColors[0]?.hex || '#0D91FD', rgb: primaryColors[0]?.rgb || { r: 13, g: 145, b: 253 }, name: 'Info', role: 'Info', usage: 'Information' },
  };

  return {
    meta: {
      url,
      domain,
      title: `${brandName} Style Guide`,
      analyzedAt: new Date().toISOString(),
      version: '1.0',
    },
    brand: {
      name: brandName,
      description: description || `Brand and design style guide for ${domain}`,
      missionStatement: `To provide exceptional digital experiences through ${domain}.`,
      visionStatement: `A world where ${brandName} sets the standard for design excellence.`,
      strategicPositioning: `${brandName} positions itself as a leader in delivering high-quality, user-centered digital solutions.`,
    },
    designPrinciples: [
      { name: 'Clarity Above All', description: 'Every element should communicate its purpose instantly. Users should understand what they\'re looking at and what actions are available without explanation.' },
      { name: 'Discovery-Driven', description: 'Design for exploration. Enable users to browse, filter, and discover content organically. Surface connections and inspire new possibilities.' },
      { name: 'Developer-Friendly', description: 'Respect the technical audience. Provide quick access to technical specifications, details, and code examples.' },
      { name: 'Trustworthy & Professional', description: 'Establish credibility through clean, polished design. Consistent patterns and attention to detail signal reliability.' },
      { name: 'Efficient & Performant', description: 'Speed is a feature. Optimize for fast loading, minimal friction, and quick task completion.' },
      { name: 'Accessible & Inclusive', description: 'Design for everyone. Ensure all users can access and interact with content regardless of ability, device, or connection speed.' },
    ],
    logo: {
      specifications: [
        { attribute: 'Primary Format', specification: 'SVG (vector) for web, PNG for applications' },
        { attribute: 'Minimum Width', specification: '120px for digital, 1 inch for print' },
        { attribute: 'Clear Space', specification: "Minimum padding equal to 'M' height on all sides" },
        { attribute: 'Primary Color', specification: `${primaryColors[0]?.hex || '#021A2E'} on light backgrounds` },
        { attribute: 'Inverse Color', specification: '#FFFFFF (White) on dark backgrounds' },
        { attribute: 'Accent Variant', specification: `${secondaryColors[0]?.hex || '#0D91FD'} for special applications` },
      ],
      incorrectUsage: [
        'Do not stretch or distort the logo proportions',
        'Do not rotate the logo at any angle',
        'Do not add effects (shadows, gradients, outlines)',
        'Do not place on busy photographic backgrounds',
        'Do not use unapproved color combinations',
        'Do not reduce below minimum size requirements',
      ],
    },
    colors: {
      primary: primaryColors,
      secondary: secondaryColors,
      system: systemColors,
      text: textColors,
      background: bgColors,
    },
    typography,
    iconography: {
      specifications: [
        { attribute: 'Style', specification: 'Outlined (stroke-based) with rounded corners' },
        { attribute: 'Stroke Width', specification: '1.5px for standard size, scale proportionally' },
        { attribute: 'Grid Size', specification: '24x24px base, with 16px and 20px variants' },
        { attribute: 'Corner Radius', specification: '2px on rounded elements' },
        { attribute: 'Color', specification: 'Inherit from text color or use semantic colors' },
        { attribute: 'Library', specification: 'Lucide React or Heroicons (outline variant)' },
      ],
      usageGuidelines: [
        'Use icons to supplement text, not replace it (accessibility)',
        'Maintain consistent icon sizes within the same context',
        'Ensure 4px minimum spacing between icon and accompanying text',
        'Use semantic colors for status icons (success, warning, error)',
        'Provide tooltips or aria-labels for icon-only buttons',
      ],
    },
    imagery: {
      specifications: [
        { type: 'Tool Logos', format: 'PNG/SVG', maxSize: '96x96px @2x', guidelines: 'Square, transparent bg, optimized' },
        { type: 'Screenshots', format: 'PNG/WebP', maxSize: '1200px width', guidelines: 'Clean, minimal chrome, annotated' },
        { type: 'Hero Images', format: 'WebP/AVIF', maxSize: '1920px width', guidelines: 'Abstract tech patterns, brand tones' },
        { type: 'Thumbnails', format: 'WebP', maxSize: '400x300px', guidelines: 'Consistent aspect ratio, focal point' },
      ],
    },
    contentStyle: {
      voiceCharacteristics: [
        { name: 'Knowledgeable', description: 'We speak with expertise and authority on our subject matter' },
        { name: 'Helpful', description: 'Every interaction aims to solve problems or provide value' },
        { name: 'Clear', description: 'We avoid jargon unless necessary, then explain it' },
        { name: 'Efficient', description: 'We respect users\' time with concise communication' },
        { name: 'Trustworthy', description: 'We\'re honest about limitations and capabilities' },
      ],
      toneVariations: [
        { context: 'Tool Descriptions', tone: 'Informative, neutral', example: 'Enables bidirectional sync between your application and external services.' },
        { context: 'Error Messages', tone: 'Helpful, reassuring', example: 'We couldn\'t find that. Try checking the name or browse our categories.' },
        { context: 'Success States', tone: 'Encouraging, brief', example: 'Added to your favorites!' },
        { context: 'Empty States', tone: 'Friendly, guiding', example: 'No items match your filters. Try broadening your search.' },
        { context: 'Technical Docs', tone: 'Precise, instructional', example: 'Install via npm: npm install package-name' },
      ],
      writingGuidelines: {
        capitalization: [
          'Use sentence case for headings and UI elements',
          'Capitalize proper nouns and product names',
          'Avoid ALL CAPS except for abbreviations',
        ],
        punctuation: [
          'Use Oxford comma in lists (item 1, item 2, and item 3)',
          'Avoid exclamation points in UI copy (reserve for celebrations)',
          'Use en-dashes (–) for ranges, em-dashes (—) for breaks',
        ],
        numbers: [
          'Spell out numbers one through nine',
          'Use numerals for 10 and above, and for technical specifications',
          'Format large numbers with commas (1,000 / 10,000)',
        ],
        technicalWriting: [
          'Use code formatting for commands, file names, and API references',
          'Explain acronyms on first use',
          'Link to relevant documentation when referencing external tools',
        ],
      },
    },
    uiComponents: {
      buttons: {
        variants: [
          { variant: 'Primary', background: primaryColors[0]?.hex || '#0D91FD', text: '#FFFFFF', border: 'None', useCase: 'Main CTA, form submissions' },
          { variant: 'Secondary', background: 'Transparent', text: primaryColors[0]?.hex || '#0D91FD', border: `1px ${primaryColors[0]?.hex || '#0D91FD'}`, useCase: 'Secondary actions' },
          { variant: 'Tertiary', background: 'Transparent', text: '#374151', border: 'None', useCase: 'Minor actions, text links' },
          { variant: 'Ghost', background: 'Transparent', text: primaryColors[0]?.hex || '#0D91FD', border: 'None', useCase: 'Icon buttons, subtle actions' },
          { variant: 'Destructive', background: '#EF4444', text: '#FFFFFF', border: 'None', useCase: 'Delete, remove actions' },
          { variant: 'Disabled', background: '#E5E7EB', text: '#9CA3AF', border: 'None', useCase: 'Unavailable actions' },
        ],
        sizes: [
          { size: 'Small', height: '32px', paddingH: '12px', fontSize: '14px', borderRadius: '6px' },
          { size: 'Medium (Default)', height: '40px', paddingH: '16px', fontSize: '16px', borderRadius: '8px' },
          { size: 'Large', height: '48px', paddingH: '24px', fontSize: '18px', borderRadius: '10px' },
        ],
      },
      cards: [
        { property: 'Background', value: '#FFFFFF' },
        { property: 'Border', value: '1px solid #E5E7EB' },
        { property: 'Border Radius', value: '12px' },
        { property: 'Padding', value: '20px' },
        { property: 'Shadow (Default)', value: '0 1px 3px rgba(0,0,0,0.1)' },
        { property: 'Shadow (Hover)', value: '0 4px 12px rgba(0,0,0,0.15)' },
        { property: 'Transition', value: 'all 0.2s ease-in-out' },
        { property: 'Min Height', value: '160px (adjustable)' },
      ],
      forms: [
        { property: 'Height', textInput: '40px', select: '40px', checkbox: '20px' },
        { property: 'Border', textInput: '1px #E5E7EB', select: '1px #E5E7EB', checkbox: '1px #E5E7EB' },
        { property: 'Border Radius', textInput: '8px', select: '8px', checkbox: '4px' },
        { property: 'Focus Border', textInput: `2px ${primaryColors[0]?.hex || '#0D91FD'}`, select: `2px ${primaryColors[0]?.hex || '#0D91FD'}`, checkbox: `2px ${primaryColors[0]?.hex || '#0D91FD'}` },
        { property: 'Background', textInput: '#FFFFFF', select: '#FFFFFF', checkbox: '#FFFFFF' },
        { property: 'Checked BG', textInput: '—', select: '—', checkbox: primaryColors[0]?.hex || '#0D91FD' },
        { property: 'Padding', textInput: '10px 14px', select: '10px 14px', checkbox: '—' },
        { property: 'Font Size', textInput: '16px', select: '16px', checkbox: '—' },
      ],
      navigation: [
        { element: 'Header Height', specification: '64px (desktop), 56px (mobile)' },
        { element: 'Logo Area', specification: 'Left-aligned, 120px max width' },
        { element: 'Nav Links', specification: 'Center or right-aligned, 16px font, 24px gap' },
        { element: 'Active State', specification: `${primaryColors[0]?.hex || 'Blue Primary'} underline (2px) or text color` },
        { element: 'Hover State', specification: `${secondaryColors[0]?.hex || 'Blue Light'} text color` },
        { element: 'Mobile Menu', specification: 'Full-screen overlay, hamburger trigger' },
        { element: 'Search Bar', specification: 'Right-aligned, expandable on mobile' },
      ],
    },
    layout: {
      grid: [
        { property: 'Columns', value: '12' },
        { property: 'Gutter Width', value: '24px (desktop), 16px (mobile)' },
        { property: 'Max Container Width', value: '1280px' },
        { property: 'Container Padding', value: '24px (desktop), 16px (mobile)' },
        { property: 'Content Width', value: '100% (fluid) up to max-width' },
      ],
      breakpoints: [
        { name: 'Mobile (xs)', width: '< 640px', columns: '1-2', layout: 'Stacked, full-width cards' },
        { name: 'Tablet (sm)', width: '640px - 768px', columns: '2-3', layout: '2-column grid' },
        { name: 'Tablet (md)', width: '768px - 1024px', columns: '3-4', layout: '3-column grid' },
        { name: 'Desktop (lg)', width: '1024px - 1280px', columns: '4', layout: '4-column grid' },
        { name: 'Large (xl)', width: '> 1280px', columns: '4-6', layout: 'Centered container, max-width' },
      ],
      spacing: [
        { token: 'space-1', value: '4px', useCase: 'Tight spacing, icon gaps' },
        { token: 'space-2', value: '8px', useCase: 'Default inline spacing' },
        { token: 'space-3', value: '12px', useCase: 'Component internal padding' },
        { token: 'space-4', value: '16px', useCase: 'Small section gaps' },
        { token: 'space-5', value: '20px', useCase: 'Card padding' },
        { token: 'space-6', value: '24px', useCase: 'Section spacing' },
        { token: 'space-8', value: '32px', useCase: 'Large section breaks' },
        { token: 'space-10', value: '40px', useCase: 'Page section margins' },
        { token: 'space-12', value: '48px', useCase: 'Major section separators' },
        { token: 'space-16', value: '64px', useCase: 'Hero/feature spacing' },
      ],
    },
    accessibility: {
      contrastPairs: generateContrastPairs(primaryColors, textColors, bgColors),
      keyboardNav: [
        'All interactive elements are focusable via Tab key',
        'Focus order follows logical reading order',
        `Focus indicators are clearly visible (2px ring, ${primaryColors[0]?.hex || '#0D91FD'})`,
        'Escape key closes modals and dropdowns',
      ],
      screenReader: [
        'All images have descriptive alt text',
        'Form fields have associated labels',
        'ARIA landmarks define page regions',
        'Live regions announce dynamic content changes',
      ],
      visualDesign: [
        'Color is not the only means of conveying information',
        'Text can be resized up to 200% without loss of function',
        'Links are distinguishable from surrounding text',
        'Touch targets are at least 44x44px',
      ],
      motion: [
        'Respect prefers-reduced-motion setting',
        'No content flashes more than 3 times per second',
        'Animations can be paused or disabled',
      ],
    },
    resources: [
      { name: 'Design Files (Figma)', location: '[Link to Figma project]' },
      { name: 'Icon Library', location: 'Lucide React: https://lucide.dev/' },
      { name: 'Font Files', location: `${typography.primaryFont.name}: https://fonts.google.com/specimen/${typography.primaryFont.name.replace(' ', '+')}` },
      { name: 'Monospace Font', location: typography.monospaceFont ? `${typography.monospaceFont.name}: https://www.jetbrains.com/lp/mono/` : 'JetBrains Mono: https://www.jetbrains.com/lp/mono/' },
      { name: 'Color Contrast Tool', location: 'https://webaim.org/resources/contrastchecker/' },
      { name: 'WCAG Guidelines', location: 'https://www.w3.org/WAI/WCAG21/quickref/' },
      { name: 'Component Library', location: '[Link to Storybook or component docs]' },
      { name: 'Code Repository', location: '[Link to GitHub repository]' },
      { name: 'Brand Assets', location: '[Link to downloadable assets]' },
    ],
    changelog: [
      {
        version: '1.0',
        date: new Date().toISOString().split('T')[0],
        changes: 'Initial release. Established brand identity, color palette, typography, UI components, accessibility guidelines.',
      },
    ],
  };
}

function generateContrastPairs(primary: Color[], text: Color[], bg: Color[]): { combination: string; ratio: string; status: string }[] {
  const pairs: { combination: string; ratio: string; status: string }[] = [];

  // Calculate contrast ratio
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (c1: Color, c2: Color): number => {
    const l1 = getLuminance(c1.rgb.r, c1.rgb.g, c1.rgb.b);
    const l2 = getLuminance(c2.rgb.r, c2.rgb.g, c2.rgb.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const getStatus = (ratio: number): string => {
    if (ratio >= 7) return 'AAA Pass';
    if (ratio >= 4.5) return 'AA Pass';
    if (ratio >= 3) return 'AA Large Text';
    return 'Fail';
  };

  const white: Color = { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, name: 'White', role: 'Background', usage: '' };

  // Primary colors on white
  primary.forEach((color) => {
    const ratio = getContrastRatio(color, white);
    pairs.push({
      combination: `${color.name} (${color.hex}) on White`,
      ratio: `${ratio.toFixed(1)}:1`,
      status: getStatus(ratio),
    });
  });

  // Text colors on white
  text.forEach((color) => {
    const ratio = getContrastRatio(color, white);
    pairs.push({
      combination: `${color.name} (${color.hex}) on White`,
      ratio: `${ratio.toFixed(1)}:1`,
      status: getStatus(ratio),
    });
  });

  // White on primary colors
  primary.forEach((color) => {
    const ratio = getContrastRatio(white, color);
    pairs.push({
      combination: `White on ${color.name} (${color.hex})`,
      ratio: `${ratio.toFixed(1)}:1`,
      status: getStatus(ratio),
    });
  });

  return pairs;
}
