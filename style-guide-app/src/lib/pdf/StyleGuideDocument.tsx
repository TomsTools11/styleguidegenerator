import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Path,
  Circle,
} from '@react-pdf/renderer';
import type { StyleGuideData } from '@/types/style-guide';
import { styles, colors, ASSET_PATHS, ensureFontsRegistered } from './styles';

interface StyleGuideDocumentProps {
  data: StyleGuideData;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const COVER_BAR_FALLBACK = ['#131313', '#2A2A2A', '#422C00', '#E6C185', '#E6D5B8'];

const safeColors = (data: StyleGuideData) =>
  [...(data.colors.primary || []), ...(data.colors.secondary || [])].slice(0, 5);

const tableRowStyle = (i: number, total: number) => {
  const isLast = i === total - 1;
  const isAlt = i % 2 === 1;
  if (isLast && isAlt) return styles.tableRowAltLast;
  if (isLast) return styles.tableRowLast;
  if (isAlt) return styles.tableRowAlt;
  return styles.tableRow;
};

// ---------------------------------------------------------------------------
// Reusable atoms
// ---------------------------------------------------------------------------

const RunHead = ({ section, sub }: { section: string; sub: string }) => (
  <View style={styles.runhead} fixed>
    <Text style={styles.rhSection}>{section}</Text>
    <Text>{sub}</Text>
  </View>
);

const PageFooter = ({ brand, version }: { brand: string; version: string }) => (
  <View style={styles.footer} fixed>
    <View style={styles.footerBrand}>
      <View style={styles.footerDot} />
      <Text>
        {brand} · style guide v{version}
      </Text>
    </View>
    <Text
      style={styles.footerNum}
      render={({ pageNumber, totalPages }) =>
        `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`
      }
    />
  </View>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const SubsectionTitle = ({ num, children }: { num: string; children: React.ReactNode }) => (
  <View style={styles.subsectionTitle}>
    <Text style={styles.ssn}>{num}</Text>
    <Text style={styles.subsectionTitleText}>{children}</Text>
  </View>
);

const SectionNum = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.sectionNum}>{children}</Text>
);

const Lead = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.lead}>{children}</Text>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.label}>{children}</Text>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const Callout = ({
  strong,
  children,
}: {
  strong?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.callout}>
    <Text style={styles.calloutText}>
      {strong ? <Text style={styles.calloutStrong}>{strong} </Text> : null}
      {children}
    </Text>
  </View>
);

const Bullets = ({
  items,
}: {
  items: Array<string | { strong?: string; text: string }>;
}) => (
  <View style={styles.bulletList}>
    {items.map((it, i) => {
      const isObj = typeof it !== 'string';
      const strong = isObj ? it.strong : undefined;
      const text = isObj ? it.text : (it as string);
      return (
        <View key={i} style={styles.bulletItem} wrap={false}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            {strong ? <Text style={{ fontWeight: 700 }}>{strong} </Text> : null}
            {text}
          </Text>
        </View>
      );
    })}
  </View>
);

const Numbered = ({
  items,
}: {
  items: Array<{ strong?: string; text: string }>;
}) => (
  <View style={styles.numberedList}>
    {items.map((it, i) => (
      <View key={i} style={styles.numberedItem} wrap={false}>
        <Text style={styles.numberedNum}>{String(i + 1).padStart(2, '0')}</Text>
        <Text style={styles.bulletText}>
          {it.strong ? <Text style={{ fontWeight: 700 }}>{it.strong} </Text> : null}
          {it.text}
        </Text>
      </View>
    ))}
  </View>
);

const Table = ({
  headers,
  rows,
  flexes,
}: {
  headers: string[];
  rows: Array<Array<React.ReactNode | { mono?: boolean; node: React.ReactNode }>>;
  flexes?: number[];
}) => (
  <View style={styles.table}>
    <View style={styles.tableHeaderRow}>
      {headers.map((h, i) => (
        <Text
          key={i}
          style={[styles.tableHeaderCell, flexes ? { flex: flexes[i] ?? 1 } : null]}
        >
          {h}
        </Text>
      ))}
    </View>
    {rows.map((row, rIdx) => (
      <View key={rIdx} style={tableRowStyle(rIdx, rows.length)} wrap={false}>
        {row.map((cell, cIdx) => {
          const isObj =
            cell !== null &&
            typeof cell === 'object' &&
            !React.isValidElement(cell) &&
            'node' in (cell as Record<string, unknown>);
          const node = isObj ? (cell as { node: React.ReactNode }).node : cell;
          const mono = isObj ? Boolean((cell as { mono?: boolean }).mono) : false;
          const styleArr = [
            mono ? styles.tableCellMono : styles.tableCell,
            flexes ? { flex: flexes[cIdx] ?? 1 } : null,
          ];
          return (
            <View key={cIdx} style={styleArr}>
              {typeof node === 'string' || typeof node === 'number' ? (
                <Text>{node}</Text>
              ) : (
                node
              )}
            </View>
          );
        })}
      </View>
    ))}
  </View>
);

const ColorChipInline = ({ hex }: { hex: string }) => (
  <View style={[styles.colorChipInline, { backgroundColor: hex }]} />
);

// ---------------------------------------------------------------------------
// Cover Page
// ---------------------------------------------------------------------------

const CoverPage = ({ data }: { data: StyleGuideData }) => {
  const swatchHexes = safeColors(data).map((c) => c.hex);
  const barHexes = swatchHexes.length >= 3 ? swatchHexes : COVER_BAR_FALLBACK;

  return (
    <Page size="A4" style={styles.pageCover}>
      <View style={styles.coverTop}>
        <Image style={styles.coverLogo} src={ASSET_PATHS.logo} />
        <Text>STYLE GUIDE · {new Date(data.meta.analyzedAt).getFullYear()}</Text>
      </View>

      <View style={styles.coverStage}>
        <View style={styles.coverEyebrow}>
          <Text style={styles.coverEyebrowBadge}>v{data.meta.version}</Text>
          <Text>Brand &amp; design reference · generated from {data.meta.domain}</Text>
        </View>
        <Text style={styles.coverTitle}>{data.brand.name}</Text>
        <Text style={styles.coverTitleAccent}>style guide.</Text>
        <Text style={styles.coverSubtitle}>
          Visual language, typography, components, and accessibility standards
          for the {data.brand.name} storefront.
        </Text>
      </View>

      <View style={styles.coverBottom}>
        <View style={styles.coverColorBar}>
          {barHexes.map((hex, i) => (
            <View key={i} style={[styles.coverColorCell, { backgroundColor: hex }]}>
              <Text
                style={[
                  styles.coverColorCellLabel,
                  { color: isLightHex(hex) ? '#5a3e00' : '#FFFFFF' },
                ]}
              >
                {hex}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.coverMeta}>
          <View style={styles.coverMetaItem}>
            <Text style={styles.coverMetaLabel}>Version</Text>
            <Text style={[styles.coverMetaValue, { fontFamily: 'Courier' }]}>
              {data.meta.version}
            </Text>
          </View>
          <View style={styles.coverMetaItem}>
            <Text style={styles.coverMetaLabel}>Generated</Text>
            <Text style={styles.coverMetaValue}>{formatDate(data.meta.analyzedAt)}</Text>
          </View>
          <View style={styles.coverMetaItem}>
            <Text style={styles.coverMetaLabel}>Source</Text>
            <Text style={[styles.coverMetaValue, styles.coverMetaValueUrl]}>
              {data.meta.domain}
            </Text>
          </View>
          <View style={styles.coverMetaItem}>
            <Text style={styles.coverMetaLabel}>Brand</Text>
            <Text style={styles.coverMetaValue}>{data.brand.name}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
};

const isLightHex = (hex: string) => {
  const m = hex.replace('#', '');
  if (m.length !== 6) return false;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  // perceived luminance
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
};

// ---------------------------------------------------------------------------
// Table of Contents
// ---------------------------------------------------------------------------

const TocRow = ({
  num,
  title,
  page,
  major,
}: {
  num: string;
  title: string;
  page: string;
  major?: boolean;
}) => (
  <View style={major ? styles.tocRowMajor : styles.tocRow} wrap={false}>
    <Text style={major ? styles.tocNumMajor : styles.tocNum}>{num}</Text>
    <Text style={major ? styles.tocTitleMajor : styles.tocTitleSub} wrap={false}>
      {title}
    </Text>
    <Text style={styles.tocDots} wrap={false}>
      ····················································································
    </Text>
    <Text style={styles.tocPage}>{page}</Text>
  </View>
);

const TableOfContents = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="Contents" sub={`${data.meta.domain} · v${data.meta.version}`} />
    <SectionNum>00 · Index</SectionNum>
    <SectionTitle>Table of contents</SectionTitle>

    <View style={styles.tocList}>
      <TocRow num="01" title="Introduction" page="04" major />
      <TocRow num="1.1" title="Mission & vision" page="04" />
      <TocRow num="1.2" title="Design principles" page="05" />

      <TocRow num="02" title="Brand identity" page="07" major />
      <TocRow num="2.1" title="Logo usage" page="07" />
      <TocRow num="2.2" title="Color palette" page="08" />
      <TocRow num="2.3" title="Typography" page="10" />
      <TocRow num="2.4" title="Iconography & imagery" page="11" />

      <TocRow num="03" title="Voice & content" page="12" major />
      <TocRow num="04" title="UI components" page="13" major />
      <TocRow num="05" title="Layout & spacing" page="15" major />
      <TocRow num="06" title="Accessibility" page="16" major />
      <TocRow num="07" title="Resources & changelog" page="17" major />
    </View>

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// Divider page (Part 01, Part 02)
// ---------------------------------------------------------------------------

const DividerPage = ({
  data,
  part,
  eyebrow,
  title,
  lead,
  meta,
}: {
  data: StyleGuideData;
  part: string;
  eyebrow: string;
  title: string;
  lead: string;
  meta: Array<{ label: string; value: string }>;
}) => (
  <Page size="A4" style={styles.pageDark}>
    <Image style={styles.dividerLogo} src={ASSET_PATHS.logo} />
    <Text style={styles.dividerEyebrow}>
      Part {part} · {eyebrow}
    </Text>
    <Text style={styles.dividerTitle}>{title}</Text>
    <Text style={styles.dividerLead}>{lead}</Text>
    <View style={styles.dividerMeta}>
      {meta.map((m, i) => (
        <View key={i} style={styles.dividerMetaItem}>
          <Text style={styles.dividerMetaLabel}>{m.label}</Text>
          <Text style={styles.dividerMetaValue}>{m.value}</Text>
        </View>
      ))}
    </View>
  </Page>
);

// ---------------------------------------------------------------------------
// Introduction
// ---------------------------------------------------------------------------

const IntroductionPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="01 · Introduction" sub={`${data.meta.domain} · v${data.meta.version}`} />
    <SectionNum>01 · Introduction</SectionNum>
    <SectionTitle>A single source of truth.</SectionTitle>

    <Lead>
      This style guide establishes the visual language and design standards for {data.brand.name}.
      It exists to keep the work consistent, the voice steady, and design decisions easier to make.
    </Lead>

    <View style={styles.twoCol}>
      <View style={styles.twoColCell}>
        <Label>Purpose</Label>
        <P>
          A comprehensive reference for design decisions across {data.meta.domain} —
          ensuring consistency and brand cohesion across every interface, document,
          and touchpoint.
        </P>
      </View>
      <View style={styles.twoColCellLast}>
        <Label>Audience</Label>
        <P>
          Designers, front-end engineers, content writers, and marketing professionals
          who create or maintain content and interfaces for {data.meta.domain}.
        </P>
      </View>
    </View>

    <SubsectionTitle num="1.1">Mission &amp; vision</SubsectionTitle>

    {data.brand.missionStatement ? (
      <>
        <Label>Mission</Label>
        <P>{data.brand.missionStatement}</P>
      </>
    ) : null}
    {data.brand.visionStatement ? (
      <>
        <Label>Vision</Label>
        <P>{data.brand.visionStatement}</P>
      </>
    ) : null}
    {data.brand.strategicPositioning ? (
      <>
        <Label>Strategic positioning</Label>
        <P>{data.brand.strategicPositioning}</P>
      </>
    ) : null}

    <Callout strong="How to use this guide.">
      Treat it as a working reference, not a specification to memorize. When something here
      conflicts with shipping good work, flag it — the guide updates, the work doesn&rsquo;t bend.
    </Callout>

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// Design Principles
// ---------------------------------------------------------------------------

const DesignPrinciplesPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="01 · Introduction" sub="1.2 Design principles" />
    <SubsectionTitle num="1.2">Design principles</SubsectionTitle>
    <Lead>
      The principles below shape every interface and asset in the system. When in doubt,
      pick the principle most at risk — and design for that.
    </Lead>

    <View style={styles.principles}>
      {data.designPrinciples.map((p, i) => (
        <View key={i} style={styles.principle} wrap={false}>
          <Text style={styles.principleNum}>P · {String(i + 1).padStart(2, '0')}</Text>
          <Text style={styles.principleTitle}>{p.name}</Text>
          <Text style={styles.principleDesc}>{p.description}</Text>
        </View>
      ))}
    </View>

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// Logo usage
// ---------------------------------------------------------------------------

const LogoPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="02 · Brand identity" sub="2.1 Logo usage" />
    <SectionNum>02 · Brand identity</SectionNum>
    <SectionTitle>The mark, the palette, the type.</SectionTitle>

    <Lead>
      {data.brand.name} combines professionalism with approachability. The palette
      conveys clarity and seriousness, the type stays out of the way, and the mark
      gets adequate breathing room.
    </Lead>

    <SubsectionTitle num="2.1">Logo usage</SubsectionTitle>
    <P>
      The wordmark should be clear, legible, and given adequate breathing room.
      The logo represents the brand&rsquo;s identity and should never be distorted, recolored
      outside approved variations, or placed on backgrounds that reduce legibility.
    </P>

    <Label>Specifications</Label>
    <Table
      headers={['Attribute', 'Specification']}
      flexes={[1, 2]}
      rows={data.logo.specifications.map((s) => [
        s.attribute,
        { mono: true, node: s.specification },
      ])}
    />

    <Label>Don&rsquo;t</Label>
    <Bullets items={data.logo.incorrectUsage} />

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const Swatch = ({
  hex,
  role,
  name,
  rgb,
  isLast,
}: {
  hex: string;
  role: string;
  name: string;
  rgb: { r: number; g: number; b: number };
  isLast?: boolean;
}) => {
  const dark = !isLightHex(hex);
  return (
    <View style={isLast ? styles.swatchLast : styles.swatch}>
      <View style={[styles.swatchChip, { backgroundColor: hex }]}>
        <Text style={dark ? styles.swatchChipLabelDark : styles.swatchChipLabel}>{hex}</Text>
      </View>
      <View style={styles.swatchMeta}>
        <Text style={styles.swatchRole}>{role}</Text>
        <Text style={styles.swatchName}>{name}</Text>
        <Text style={styles.swatchVals}>
          RGB {rgb.r}, {rgb.g}, {rgb.b}
        </Text>
      </View>
    </View>
  );
};

const ColorPalettePage = ({ data }: { data: StyleGuideData }) => {
  const primary = (data.colors.primary || []).slice(0, 3);
  const secondary = (data.colors.secondary || []).slice(0, 3);
  const sys = data.colors.system;
  const sysRows: Array<[React.ReactNode, string, string, string, string]> = [];
  if (sys.success) {
    sysRows.push([
      <View style={styles.tableCellInner}><ColorChipInline hex={sys.success.hex} /><Text>Success</Text></View>,
      sys.success.name,
      sys.success.hex,
      `${sys.success.rgb.r}, ${sys.success.rgb.g}, ${sys.success.rgb.b}`,
      sys.success.usage,
    ]);
  }
  if (sys.warning) {
    sysRows.push([
      <View style={styles.tableCellInner}><ColorChipInline hex={sys.warning.hex} /><Text>Warning</Text></View>,
      sys.warning.name,
      sys.warning.hex,
      `${sys.warning.rgb.r}, ${sys.warning.rgb.g}, ${sys.warning.rgb.b}`,
      sys.warning.usage,
    ]);
  }
  if (sys.error) {
    sysRows.push([
      <View style={styles.tableCellInner}><ColorChipInline hex={sys.error.hex} /><Text>Error</Text></View>,
      sys.error.name,
      sys.error.hex,
      `${sys.error.rgb.r}, ${sys.error.rgb.g}, ${sys.error.rgb.b}`,
      sys.error.usage,
    ]);
  }

  return (
    <Page size="A4" style={styles.page}>
      <RunHead section="02 · Brand identity" sub="2.2 Color palette" />
      <SubsectionTitle num="2.2">Color palette</SubsectionTitle>
      <Lead>
        The palette is built around foundational tones with accent highlights — conveying
        seriousness without coldness. Each color has a defined role.
      </Lead>

      {primary.length ? (
        <View wrap={false}>
          <Label>Foundation</Label>
          <View style={styles.swatchGrid}>
            {primary.map((c, i) => (
              <Swatch
                key={i}
                hex={c.hex}
                role={`Primary · ${c.role}`}
                name={c.name}
                rgb={c.rgb}
                isLast={i === primary.length - 1}
              />
            ))}
          </View>
        </View>
      ) : null}

      {secondary.length ? (
        <View wrap={false}>
          <Label>Accent &amp; secondary</Label>
          <View style={styles.swatchGrid}>
            {secondary.map((c, i) => (
              <Swatch
                key={i}
                hex={c.hex}
                role={`Accent · ${c.role}`}
                name={c.name}
                rgb={c.rgb}
                isLast={i === secondary.length - 1}
              />
            ))}
          </View>
        </View>
      ) : null}

      {sysRows.length ? <Label>System &amp; utility</Label> : null}
      {sysRows.length ? (
        <Table
          headers={['Role', 'Name', 'Hex', 'RGB', 'Usage']}
          flexes={[1.2, 1, 1, 1, 2]}
          rows={sysRows.map((r) => [
            r[0],
            r[1],
            { mono: true, node: r[2] },
            { mono: true, node: r[3] },
            r[4],
          ])}
        />
      ) : null}

      <PageFooter brand={data.brand.name} version={data.meta.version} />
    </Page>
  );
};

// Color usage page — 60/30/10 ratio
const ColorUsagePage = ({ data }: { data: StyleGuideData }) => {
  const all = safeColors(data);
  const surface = all[0]?.hex ?? '#FFFFFF';
  const foundation = all[1]?.hex ?? '#131313';
  const accent = all[2]?.hex ?? '#E6C185';
  return (
    <Page size="A4" style={styles.page}>
      <RunHead section="02 · Brand identity" sub="2.2 Color usage" />
      <SubsectionTitle num="2.2.1">Color usage &amp; ratios</SubsectionTitle>
      <Lead>
        A 60 / 30 / 10 distribution: surface dominates; foundation handles structure
        and type; accents punctuate. Don&rsquo;t invert the ratio.
      </Lead>

      <View style={styles.usageBar}>
        <View
          style={[
            styles.usageCell,
            {
              flex: 6,
              backgroundColor: surface,
              borderRightWidth: 1,
              borderRightColor: colors.surfaceBorder,
            },
          ]}
        >
          <Text style={{ color: isLightHex(surface) ? '#5a3e00' : '#FFFFFF' }}>
            60% · Surface · {surface}
          </Text>
        </View>
        <View style={[styles.usageCell, { flex: 3, backgroundColor: foundation }]}>
          <Text style={{ color: isLightHex(foundation) ? '#5a3e00' : '#FFFFFF' }}>
            30% · Foundation · {foundation}
          </Text>
        </View>
        <View style={[styles.usageCell, { flex: 1, backgroundColor: accent }]}>
          <Text style={{ color: isLightHex(accent) ? '#5a3e00' : '#FFFFFF' }}>10% · Accent</Text>
        </View>
      </View>

      <Label>Quick rules</Label>
      <Bullets
        items={[
          { strong: 'One accent per view.', text: 'If a screen has accent headlines, don’t also use accent badges. Pick one role.' },
          { strong: 'Pair accents with foundation or surface.', text: 'Accent on accent reads as a mistake.' },
          { strong: 'Use system color sparingly.', text: 'Red, amber, and green are reserved for system feedback — never decorative.' },
          { strong: 'Stay within the palette.', text: 'Don’t introduce new colors mid-design — extend the system instead.' },
        ]}
      />

      <PageFooter brand={data.brand.name} version={data.meta.version} />
    </Page>
  );
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

const TypographyPage = ({ data }: { data: StyleGuideData }) => {
  const primary = data.typography.primaryFont;
  const mono = data.typography.monospaceFont;
  return (
    <Page size="A4" style={styles.page}>
      <RunHead section="02 · Brand identity" sub="2.3 Typography" />
      <SubsectionTitle num="2.3">Typography</SubsectionTitle>
      <Lead>
        {primary.name} handles headlines, body, and meta. {mono?.name ?? 'Mono'} carries
        technical detail — SKUs, identifiers, and code.
      </Lead>

      <View style={styles.twoCol}>
        <View style={styles.twoColCell}>
          <Label>Primary</Label>
          <View style={styles.specimen}>
            <View style={styles.specMeta}>
              <Text>{primary.name}</Text>
              <Text>400 / 700 / 900</Text>
            </View>
            <Text style={styles.specSampleHero}>Aa Bb Cc Dd</Text>
            <Text style={styles.specSampleBody}>
              The quick brown fox jumps over the lazy dog. 0123456789
            </Text>
          </View>
        </View>
        {mono ? (
          <View style={styles.twoColCellLast}>
            <Label>Mono · Technical</Label>
            <View style={styles.specimen}>
              <View style={styles.specMeta}>
                <Text>{mono.name}</Text>
                <Text>400 / 500</Text>
              </View>
              <Text style={[styles.specSampleHero, { fontFamily: 'Courier', fontWeight: 700 }]}>
                Aa Bb Cc Dd
              </Text>
              <Text style={[styles.specSampleBody, { fontFamily: 'Courier' }]}>
                sku-001 · qty=01 · 0123456789
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View wrap={false}>
      <Label>Type scale</Label>
      <View style={styles.typeScaleBox}>
        {data.typography.scale.map((row, i, arr) => {
          const sample = row.element.toLowerCase().includes('display')
            ? 'Display'
            : row.element.toLowerCase().includes('body')
            ? 'Body — set for comfortable reading.'
            : row.element.toLowerCase().includes('caption')
            ? 'Captions and metadata sit a step down.'
            : row.element.toLowerCase().includes('code')
            ? 'npm install @company/sdk'
            : `${row.element}`;
          const px = parseInt(String(row.size), 10) || 12;
          const sampleSize = Math.max(9, Math.min(28, Math.round(px * 0.7)));
          const isMono = row.element.toLowerCase().includes('code');
          return (
            <View key={i} style={i === arr.length - 1 ? styles.typeRowLast : styles.typeRow}>
              <Text style={styles.trLabel}>{row.element}</Text>
              <Text
                style={[
                  styles.trSample,
                  {
                    fontSize: sampleSize,
                    fontWeight: parseInt(row.weight, 10) || 400,
                    fontFamily: isMono ? 'Courier' : 'Lato',
                  },
                ]}
              >
                {sample}
              </Text>
              <Text style={styles.trMeta}>
                {row.size} · {row.weight}{'\n'}line {row.lineHeight}
              </Text>
            </View>
          );
        })}
      </View>
      </View>

      <Bullets
        items={[
          { strong: 'Headings:', text: 'sentence case (capitalize first word only).' },
          { strong: 'Body:', text: '50–75 character line length is the comfortable range.' },
          { strong: 'Mono:', text: 'reserve for SKUs, identifiers, code, and any value the user might copy.' },
          { strong: 'Responsive:', text: 'scale type sizes down by ~15% on viewports under 640px.' },
        ]}
      />

      <PageFooter brand={data.brand.name} version={data.meta.version} />
    </Page>
  );
};

// ---------------------------------------------------------------------------
// Iconography & Imagery
// ---------------------------------------------------------------------------

const IconCell = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.iconCell}>
    <Svg width="22" height="22" viewBox="0 0 24 24">
      {children}
    </Svg>
  </View>
);

const IconographyPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="02 · Brand identity" sub="2.4 Iconography &amp; imagery" />
    <SubsectionTitle num="2.4">Iconography</SubsectionTitle>
    <P>
      Icons are simple, recognizable, and functional. They supplement text — they
      don&rsquo;t replace it. One library, one stroke weight, one corner style.
    </P>

    <View style={styles.twoCol}>
      <View style={styles.twoColCell}>
        <Label>Specifications</Label>
        <Table
          headers={['Attribute', 'Value']}
          flexes={[1, 1.4]}
          rows={data.iconography.specifications.map((s) => [
            s.attribute,
            { mono: true, node: s.specification },
          ])}
        />
      </View>
      <View style={styles.twoColCellLast}>
        <Label>Sample set · 24px</Label>
        <View style={styles.iconGrid}>
          <IconCell>
            <Path
              d="M21 21l-4.35-4.35"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="11" cy="11" r="8" stroke={colors.textPrimary} strokeWidth={1.5} fill="none" />
          </IconCell>
          <IconCell>
            <Circle cx="9" cy="21" r="1" stroke={colors.textPrimary} strokeWidth={1.5} fill="none" />
            <Circle cx="20" cy="21" r="1" stroke={colors.textPrimary} strokeWidth={1.5} fill="none" />
            <Path
              d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </IconCell>
          <IconCell>
            <Path
              d="M3 6h18M3 12h18M3 18h18"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              fill="none"
            />
          </IconCell>
          <IconCell>
            <Path
              d="M19 14l-7 7-7-7"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 21V3"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
            />
          </IconCell>
          <IconCell>
            <Circle cx="12" cy="12" r="9" stroke={colors.textPrimary} strokeWidth={1.5} fill="none" />
            <Path
              d="M12 7v5l3 3"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
            />
          </IconCell>
          <IconCell>
            <Path
              d="M20 6L9 17l-5-5"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </IconCell>
          <IconCell>
            <Path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
            />
            <Path
              d="M14 2v6h6"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
            />
          </IconCell>
          <IconCell>
            <Path
              d="M12 2L2 7l10 5 10-5-10-5z"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
            />
            <Path
              d="M2 17l10 5 10-5"
              stroke={colors.textPrimary}
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
            />
          </IconCell>
        </View>
      </View>
    </View>

    <Label>Usage rules</Label>
    <Bullets items={data.iconography.usageGuidelines} />

    <SubsectionTitle num="2.5">Imagery</SubsectionTitle>
    <Table
      headers={['Type', 'Format', 'Max size', 'Guidelines']}
      flexes={[1.2, 1, 1, 2]}
      rows={data.imagery.specifications.map((s) => [
        s.type,
        { mono: true, node: s.format },
        { mono: true, node: s.maxSize },
        s.guidelines,
      ])}
    />

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// Voice & Content
// ---------------------------------------------------------------------------

const VoicePage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="03 · Voice &amp; content" sub="3.1 — 3.2" />
    <SectionNum>03 · Voice &amp; content</SectionNum>
    <SectionTitle>Knowledgeable, helpful, brief.</SectionTitle>

    <Lead>
      The voice is consistent — knowledgeable, helpful, and direct. The tone shifts
      with context.
    </Lead>

    <SubsectionTitle num="3.1">Voice characteristics</SubsectionTitle>
    <View style={styles.twoCol}>
      <View style={styles.twoColCell}>
        <Bullets
          items={data.contentStyle.voiceCharacteristics
            .slice(0, Math.ceil(data.contentStyle.voiceCharacteristics.length / 2))
            .map((c) => ({ strong: `${c.name}.`, text: c.description }))}
        />
      </View>
      <View style={styles.twoColCellLast}>
        <Bullets
          items={data.contentStyle.voiceCharacteristics
            .slice(Math.ceil(data.contentStyle.voiceCharacteristics.length / 2))
            .map((c) => ({ strong: `${c.name}.`, text: c.description }))}
        />
      </View>
    </View>

    <SubsectionTitle num="3.1.1">Tone variations</SubsectionTitle>
    <Table
      headers={['Context', 'Tone', 'Example']}
      flexes={[1, 1, 2]}
      rows={data.contentStyle.toneVariations.map((t) => [
        t.context,
        t.tone,
        t.example,
      ])}
    />

    <SubsectionTitle num="3.2">Writing guidelines</SubsectionTitle>
    <View style={styles.twoCol}>
      <View style={styles.twoColCell}>
        <Label>Capitalization</Label>
        <Bullets items={data.contentStyle.writingGuidelines.capitalization} />
        <Label>Punctuation</Label>
        <Bullets items={data.contentStyle.writingGuidelines.punctuation} />
      </View>
      <View style={styles.twoColCellLast}>
        <Label>Numbers</Label>
        <Bullets items={data.contentStyle.writingGuidelines.numbers} />
        <Label>Technical writing</Label>
        <Bullets items={data.contentStyle.writingGuidelines.technicalWriting} />
      </View>
    </View>

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// UI Components — Buttons & Forms
// ---------------------------------------------------------------------------

const Btn = ({
  variant,
  size,
  children,
}: {
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' | 'disabled';
  size?: 'sm' | 'lg';
  children: React.ReactNode;
}) => {
  const variantStyle =
    variant === 'primary'
      ? styles.btnPrimary
      : variant === 'secondary'
      ? styles.btnSecondary
      : variant === 'tertiary'
      ? styles.btnTertiary
      : variant === 'ghost'
      ? styles.btnGhost
      : variant === 'destructive'
      ? styles.btnDestructive
      : styles.btnDisabled;
  const sizeStyle = size === 'sm' ? styles.btnSm : size === 'lg' ? styles.btnLg : null;
  return <Text style={[styles.btn, variantStyle, sizeStyle]}>{children}</Text>;
};

const ButtonsAndFormsPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="04 · UI components" sub="4.1 Buttons · 4.3 Forms" />
    <SectionNum>04 · UI components</SectionNum>
    <SectionTitle>Buttons, forms, and feedback.</SectionTitle>

    <Lead>
      Components are accessible, responsive, and aligned with the brand. These specs
      keep implementations consistent across the storefront and admin.
    </Lead>

    <SubsectionTitle num="4.1">Buttons</SubsectionTitle>

    <View style={styles.btnPreviewRow}>
      <Btn variant="primary">Primary</Btn>
      <Btn variant="secondary">Secondary</Btn>
      <Btn variant="tertiary">Tertiary</Btn>
      <Btn variant="ghost">Ghost</Btn>
      <Btn variant="destructive">Destructive</Btn>
      <Btn variant="disabled">Disabled</Btn>
    </View>

    <Table
      headers={['Variant', 'Background', 'Text', 'Border', 'Use case']}
      flexes={[1, 1, 1, 1, 2]}
      rows={data.uiComponents.buttons.variants.map((v) => [
        v.variant,
        { mono: true, node: v.background },
        { mono: true, node: v.text },
        v.border ? { mono: true, node: v.border } : 'None',
        v.useCase,
      ])}
    />

    <Label>Sizes</Label>
    <View style={styles.btnPreviewRow}>
      <Btn variant="primary" size="sm">Small</Btn>
      <Btn variant="primary">Medium</Btn>
      <Btn variant="primary" size="lg">Large</Btn>
    </View>
    <Table
      headers={['Size', 'Height', 'Padding (H)', 'Font size', 'Radius']}
      rows={data.uiComponents.buttons.sizes.map((s) => [
        s.size,
        { mono: true, node: s.height },
        { mono: true, node: s.paddingH },
        { mono: true, node: s.fontSize },
        { mono: true, node: s.borderRadius },
      ])}
    />

    <SubsectionTitle num="4.3">Forms</SubsectionTitle>

    <View style={styles.formPreview}>
      <View style={styles.fpField}>
        <Text style={styles.fpLabel}>Default</Text>
        <View style={styles.inputMock}>
          <Text>Search…</Text>
        </View>
      </View>
      <View style={styles.fpField}>
        <Text style={styles.fpLabel}>Focus</Text>
        <View style={[styles.inputMock, styles.inputMockFocus]}>
          <Text>active value</Text>
        </View>
      </View>
      <View style={styles.fpField}>
        <Text style={styles.fpLabel}>Error</Text>
        <View style={[styles.inputMock, styles.inputMockError]}>
          <Text>error state</Text>
        </View>
      </View>
      <View style={styles.fpField}>
        <Text style={styles.fpLabel}>Success</Text>
        <View style={[styles.inputMock, styles.inputMockSuccess]}>
          <Text>validated ✓</Text>
        </View>
      </View>
    </View>

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// UI Components — Cards & Navigation
// ---------------------------------------------------------------------------

const CardsAndNavPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="04 · UI components" sub="4.2 Cards · 4.4 Navigation" />
    <SubsectionTitle num="4.2">Cards</SubsectionTitle>
    <P>
      Cards are the primary container for content listings. Each provides essential
      information at a glance and encourages exploration.
    </P>

    <View style={{ flexDirection: 'row', marginBottom: 14 }}>
      <View style={{ marginRight: 16 }}>
        <View style={styles.cardPreview}>
          <View style={styles.cardCi} />
          <Text style={styles.cardCt}>Sample item</Text>
          <Text style={styles.cardCd}>
            Brief description that fits in two to three lines without crowding.
          </Text>
          <View style={styles.cardPills}>
            <Text style={styles.cardPill}>tag</Text>
            <Text style={styles.cardPill}>label</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Table
          headers={['Property', 'Value']}
          flexes={[1, 1.5]}
          rows={data.uiComponents.cards.map((c) => [c.property, { mono: true, node: c.value }])}
        />
      </View>
    </View>

    <Label>Anatomy</Label>
    <Numbered
      items={[
        { strong: 'Logo / icon', text: '— 48×48, top-left or centered.' },
        { strong: 'Name', text: '— H4, primary text color.' },
        { strong: 'Description', text: '— body small, 2–3 lines, secondary color, ellipsis on overflow.' },
        { strong: 'Tags', text: '— pill-shaped badges, light surface.' },
        { strong: 'Action area', text: '— view-details button or arrow icon.' },
      ]}
    />

    <SubsectionTitle num="4.4">Navigation</SubsectionTitle>
    <View style={styles.navMock}>
      <Text style={styles.navBrand}>{data.brand.name.split(/\s+/)[0]}</Text>
      <View style={styles.navLinks}>
        <Text style={styles.navLinkActive}>Catalog</Text>
        <Text style={styles.navLink}>Bundles</Text>
        <Text style={styles.navLink}>About</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.navSearch}>
          <Text style={{ paddingTop: 5 }}>⌕ search</Text>
        </View>
        <Btn variant="primary" size="sm">Cart · 0</Btn>
      </View>
    </View>

    <Table
      headers={['Element', 'Specification']}
      flexes={[1, 2]}
      rows={data.uiComponents.navigation.map((n) => [
        n.element,
        { mono: true, node: n.specification },
      ])}
    />

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// Layout & spacing
// ---------------------------------------------------------------------------

const LayoutPage = ({ data }: { data: StyleGuideData }) => {
  const maxSpacing = data.layout.spacing.reduce((mx, s) => {
    const v = parseInt(String(s.value), 10) || 0;
    return v > mx ? v : mx;
  }, 1);
  return (
    <Page size="A4" style={styles.page}>
      <RunHead section="05 · Layout" sub="Grid · breakpoints · spacing" />
      <SectionNum>05 · Layout &amp; spacing</SectionNum>
      <SectionTitle>Twelve columns. Four-pixel base.</SectionTitle>
      <Lead>
        A 12-column grid handles structure across viewports; a 4-pixel base unit
        handles the rest. Use the tokens — don&rsquo;t invent values.
      </Lead>

      <View style={styles.twoCol}>
        <View style={styles.twoColCell}>
          <Label>Grid</Label>
          <Table
            headers={['Property', 'Value']}
            flexes={[1, 1.4]}
            rows={data.layout.grid.map((g) => [g.property, { mono: true, node: g.value }])}
          />
        </View>
        <View style={styles.twoColCellLast}>
          <Label>Breakpoints</Label>
          <Table
            headers={['Name', 'Width', 'Cols']}
            flexes={[1.2, 1, 1]}
            rows={data.layout.breakpoints.map((b) => [
              b.name,
              { mono: true, node: b.width },
              { mono: true, node: b.columns },
            ])}
          />
        </View>
      </View>

      <View wrap={false}>
      <Label>Spacing scale · 4px base</Label>
      <View style={styles.spacingBox}>
        {data.layout.spacing.map((s, i, arr) => {
          const px = parseInt(String(s.value), 10) || 4;
          const widthPct = Math.max(2, Math.min(100, (px / maxSpacing) * 100));
          return (
            <View key={i} style={i === arr.length - 1 ? styles.spacingRowLast : styles.spacingRow}>
              <Text style={styles.spToken}>{s.token}</Text>
              <View style={styles.spBarWrap}>
                <View style={[styles.spBar, { width: `${widthPct}%` }]} />
              </View>
              <Text style={styles.spUse}>
                {s.value} · {s.useCase}
              </Text>
            </View>
          );
        })}
      </View>
      </View>

      <PageFooter brand={data.brand.name} version={data.meta.version} />
    </Page>
  );
};

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

const AccessibilityPage = ({ data }: { data: StyleGuideData }) => {
  const featuredPairs = data.accessibility.contrastPairs.slice(0, 4);
  return (
    <Page size="A4" style={styles.page}>
      <RunHead section="06 · Accessibility" sub="WCAG 2.1 AA" />
      <SectionNum>06 · Accessibility</SectionNum>
      <SectionTitle>WCAG 2.1 AA, by default.</SectionTitle>
      <Lead>
        {data.brand.name} is built to WCAG 2.1 AA. Accessibility isn&rsquo;t an afterthought —
        it&rsquo;s checked into every component before it ships.
      </Lead>

      <View wrap={false}>
      <Label>Color contrast pairs</Label>
      <View style={styles.contrastGrid}>
        {featuredPairs.map((pair, i) => {
          const passes = /aaa|aa(?!\s*fail)/i.test(pair.status) && !/fail/i.test(pair.status);
          const m = pair.combination.match(/(#[0-9A-Fa-f]{3,6})/g) || [];
          const fg = m[0] || '#FFFFFF';
          const bg = m[1] || colors.textPrimary;
          return (
            <View key={i} style={styles.contrastCard}>
              <View style={[styles.contrastSwatch, { backgroundColor: bg }]}>
                <Text style={[styles.contrastLetters, { color: fg }]}>Aa Bb Cc</Text>
                <Text style={[styles.contrastSmall, { color: fg }]}>Body — 14px regular</Text>
              </View>
              <View style={styles.contrastMetaBar}>
                <Text>{pair.combination}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text>{pair.ratio}</Text>
                  <Text style={passes ? styles.contrastPass : styles.contrastFail}>
                    {passes ? 'PASS' : 'FAIL'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.twoColCell}>
          <Label>Keyboard</Label>
          <Bullets items={data.accessibility.keyboardNav} />
          <Label>Screen readers</Label>
          <Bullets items={data.accessibility.screenReader} />
        </View>
        <View style={styles.twoColCellLast}>
          <Label>Visual design</Label>
          <Bullets items={data.accessibility.visualDesign} />
          <Label>Motion</Label>
          <Bullets items={data.accessibility.motion} />
        </View>
      </View>

      <PageFooter brand={data.brand.name} version={data.meta.version} />
    </Page>
  );
};

// ---------------------------------------------------------------------------
// Resources & changelog
// ---------------------------------------------------------------------------

const ResourcesPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <RunHead section="07 · Resources" sub="Links · changelog · contact" />
    <SectionNum>07 · Resources</SectionNum>
    <SectionTitle>Links, changelog, and contact.</SectionTitle>
    <Lead>
      The following resources support implementation. Update links as assets are
      created and organized.
    </Lead>

    <Table
      headers={['Resource', 'Location']}
      flexes={[1, 2]}
      rows={data.resources.map((r) => [r.name, { mono: true, node: r.location }])}
    />

    <SubsectionTitle num="7.2">Changelog</SubsectionTitle>
    <Table
      headers={['Version', 'Date', 'Changes']}
      flexes={[0.6, 1, 3]}
      rows={data.changelog.map((c) => [
        { mono: true, node: c.version },
        { mono: true, node: c.date },
        c.changes,
      ])}
    />

    <Callout strong="Questions or feedback?">
      This guide is a living document. If something here is wrong, missing, or no
      longer reflects the work — flag it. The guide updates; the work doesn&rsquo;t bend
      around stale rules.
    </Callout>

    <View style={styles.endNote}>
      <View>
        <Text style={styles.endLabel}>End of document</Text>
        <Text style={styles.endTitle}>{data.brand.name}.</Text>
      </View>
      <Text style={styles.endRight}>
        v{data.meta.version}{'\n'}
        Generated {formatDate(data.meta.analyzedAt)}{'\n'}
        {data.meta.domain}
      </Text>
    </View>

    <PageFooter brand={data.brand.name} version={data.meta.version} />
  </Page>
);

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export const StyleGuideDocument = ({ data }: StyleGuideDocumentProps) => {
  ensureFontsRegistered();
  const principleCount = data.designPrinciples.length;
  const colorCount =
    (data.colors.primary?.length || 0) +
    (data.colors.secondary?.length || 0) +
    Object.values(data.colors.system || {}).filter(Boolean).length;

  return (
    <Document
      title={`${data.brand.name} — Style Guide v${data.meta.version}`}
      author={data.brand.name}
      subject="Brand & design style guide"
    >
      <CoverPage data={data} />
      <TableOfContents data={data} />

      <DividerPage
        data={data}
        part="01"
        eyebrow="Foundations"
        title="Introduction."
        lead={`What this guide is, who it serves, and the principles that shape every decision on ${data.meta.domain}.`}
        meta={[
          { label: 'Sections', value: '2' },
          { label: 'Principles', value: String(principleCount) },
          { label: 'Pages', value: '04 — 05' },
        ]}
      />
      <IntroductionPage data={data} />
      <DesignPrinciplesPage data={data} />

      <DividerPage
        data={data}
        part="02"
        eyebrow="Identity"
        title="Brand identity."
        lead="The visible language: logo, color, typography, iconography, and imagery. Tight enough to be recognizable; flexible enough to ship."
        meta={[
          { label: 'Subsections', value: '4' },
          { label: 'Colors', value: String(colorCount) },
          { label: 'Pages', value: '07 — 11' },
        ]}
      />
      <LogoPage data={data} />
      <ColorPalettePage data={data} />
      <ColorUsagePage data={data} />
      <TypographyPage data={data} />
      <IconographyPage data={data} />

      <VoicePage data={data} />
      <ButtonsAndFormsPage data={data} />
      <CardsAndNavPage data={data} />
      <LayoutPage data={data} />
      <AccessibilityPage data={data} />
      <ResourcesPage data={data} />
    </Document>
  );
};

export default StyleGuideDocument;
