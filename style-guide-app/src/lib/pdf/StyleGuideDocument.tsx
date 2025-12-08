import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { StyleGuideData } from '@/types/style-guide';
import { styles, colors } from './styles';

interface StyleGuideDocumentProps {
  data: StyleGuideData;
}

// Helper to render page footer
const PageFooter = ({ title, version }: { title: string; version: string }) => (
  <View style={styles.footer} fixed>
    <Text>{title} Style Guide v{version}</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

// Cover Page
const CoverPage = ({ data }: { data: StyleGuideData }) => {
  const primaryColors = [
    ...(data.colors.primary || []),
    ...(data.colors.secondary || []),
  ].slice(0, 5);

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.coverTitle}>{data.brand.name}</Text>
        <Text style={styles.coverSubtitle}>Brand & Design Style Guide</Text>

        {/* Color Bar */}
        <View style={styles.coverColorBar}>
          {primaryColors.map((color, index) => (
            <View
              key={index}
              style={[styles.coverColorSwatch, { backgroundColor: color.hex }]}
            />
          ))}
        </View>
      </View>

      {/* Metadata */}
      <View style={styles.coverMeta}>
        <View style={styles.coverMetaItem}>
          <Text style={styles.coverMetaLabel}>Version:</Text>
          <Text style={styles.coverMetaValue}>{data.meta.version}</Text>
        </View>
        <View style={styles.coverMetaItem}>
          <Text style={styles.coverMetaLabel}>Last Updated:</Text>
          <Text style={styles.coverMetaValue}>
            {new Date(data.meta.analyzedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.coverMetaItem}>
          <Text style={styles.coverMetaLabel}>Design Reference:</Text>
          <Text style={styles.coverMetaValue}>{data.meta.domain}</Text>
        </View>
        <View style={styles.coverMetaItem}>
          <Text style={styles.coverMetaLabel}>Target Platform:</Text>
          <Text style={styles.coverMetaValue}>{data.meta.domain}</Text>
        </View>
      </View>

      <PageFooter title={data.brand.name} version={data.meta.version} />
    </Page>
  );
};

// Table of Contents
const TableOfContents = ({ data }: { data: StyleGuideData }) => {
  const tocItems = [
    { num: '1.0', title: 'Introduction' },
    { num: '1.1', title: 'Mission & Vision' },
    { num: '1.2', title: 'Design Principles' },
    { num: '2.0', title: 'Brand Identity' },
    { num: '2.1', title: 'Logo Usage' },
    { num: '2.2', title: 'Color Palette' },
    { num: '2.3', title: 'Typography' },
    { num: '2.4', title: 'Iconography' },
    { num: '2.5', title: 'Imagery Guidelines' },
    { num: '3.0', title: 'Content Style Guide' },
    { num: '3.1', title: 'Voice and Tone' },
    { num: '3.2', title: 'Writing Guidelines' },
    { num: '4.0', title: 'UI Components' },
    { num: '4.1', title: 'Buttons' },
    { num: '4.2', title: 'Cards' },
    { num: '4.3', title: 'Forms' },
    { num: '4.4', title: 'Navigation' },
    { num: '5.0', title: 'Layout & Grid' },
    { num: '6.0', title: 'Accessibility' },
    { num: '7.0', title: 'Resources' },
    { num: '8.0', title: 'Changelog' },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Table of Contents</Text>
      <View style={{ marginTop: 24 }}>
        {tocItems.map((item) => (
          <View key={item.num} style={styles.tocItem}>
            <Text style={styles.tocNumber}>{item.num}</Text>
            <Text style={styles.tocTitle}>{item.title}</Text>
          </View>
        ))}
      </View>
      <PageFooter title={data.brand.name} version={data.meta.version} />
    </Page>
  );
};

// Introduction Page
const IntroductionPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionTitle}>1.0 Introduction</Text>

    <Text style={styles.paragraph}>
      This style guide establishes the visual language and design standards for {data.brand.name},
      a platform for {data.brand.description}. Drawing inspiration from modern design approaches,
      this guide ensures consistency across all digital touchpoints while maintaining a professional,
      approachable aesthetic that resonates with users.
    </Text>

    <Text style={styles.label}>Purpose:</Text>
    <Text style={styles.paragraph}>
      To provide a comprehensive reference for design decisions, ensuring visual consistency and
      brand cohesion across the {data.brand.name} platform. This document serves as the single
      source of truth for designers, developers, and content creators.
    </Text>

    <Text style={styles.label}>Target Audience:</Text>
    <Text style={styles.paragraph}>
      This guide is intended for anyone involved in creating or maintaining content and interfaces
      for {data.meta.domain}, including designers, front-end developers, content writers, and
      marketing professionals.
    </Text>

    <Text style={styles.subsectionTitle}>1.1 Mission & Vision</Text>

    <Text style={styles.label}>Mission Statement:</Text>
    <Text style={styles.paragraph}>{data.brand.missionStatement}</Text>

    <Text style={styles.label}>Vision Statement:</Text>
    <Text style={styles.paragraph}>{data.brand.visionStatement}</Text>

    <Text style={styles.label}>Strategic Positioning:</Text>
    <Text style={styles.paragraph}>{data.brand.strategicPositioning}</Text>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Design Principles Page
const DesignPrinciplesPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsectionTitle}>1.2 Design Principles</Text>

    {data.designPrinciples.map((principle, index) => (
      <View key={index} style={{ marginBottom: 16 }}>
        <Text style={styles.principleTitle}>{principle.name}</Text>
        <Text style={styles.principleDescription}>{principle.description}</Text>
      </View>
    ))}

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Brand Identity Page
const BrandIdentityPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionTitle}>2.0 Brand Identity</Text>

    <Text style={styles.paragraph}>
      The {data.brand.name} brand identity combines professionalism with approachability.
      The color palette conveys trust, technology, and clarity—essential qualities for a
      modern digital platform. Visual elements should feel modern and clean without being
      cold or overly corporate.
    </Text>

    <Text style={styles.subsectionTitle}>2.1 Logo Usage</Text>

    <Text style={styles.paragraph}>
      The {data.brand.name} wordmark should be clear, legible, and given adequate breathing room.
      The logo represents the brand's identity and should never be distorted, recolored outside
      approved variations, or placed on backgrounds that reduce legibility.
    </Text>

    <Text style={styles.subsubsectionTitle}>Logo Specifications</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Attribute</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Specification</Text>
      </View>
      {data.logo.specifications.map((spec, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{spec.attribute}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{spec.specification}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Incorrect Logo Usage</Text>

    <View style={styles.bulletList}>
      {data.logo.incorrectUsage.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Color Palette Page
const ColorPalettePage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsectionTitle}>2.2 Color Palette</Text>

    <Text style={styles.paragraph}>
      The {data.brand.name} color palette is built on a sophisticated spectrum that conveys trust,
      technology, and professionalism. Each color has a specific role in the design system, ensuring
      consistent application across all interfaces.
    </Text>

    <Text style={styles.subsubsectionTitle}>Primary Colors</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Role</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Name</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>HEX</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>RGB</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Usage</Text>
      </View>
      {data.colors.primary?.map((color, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.colorTableCell, { flex: 1 }]}>
            <View style={[styles.inlineColorBox, { backgroundColor: color.hex }]} />
            <Text style={{ fontSize: 10 }}>{color.role}</Text>
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.hex}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.rgb.r}, {color.rgb.g}, {color.rgb.b}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{color.usage}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Secondary & Accent Colors</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Role</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Name</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>HEX</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>RGB</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Usage</Text>
      </View>
      {data.colors.secondary?.map((color, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.colorTableCell, { flex: 1 }]}>
            <View style={[styles.inlineColorBox, { backgroundColor: color.hex }]} />
            <Text style={{ fontSize: 10 }}>{color.role}</Text>
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.hex}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.rgb.r}, {color.rgb.g}, {color.rgb.b}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{color.usage}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Color Swatches</Text>

    <View style={styles.colorSwatchContainer}>
      {[...(data.colors.primary || []), ...(data.colors.secondary || [])].slice(0, 5).map((color, index) => (
        <View key={index} style={styles.colorSwatch}>
          <View style={[styles.colorSwatchBox, { backgroundColor: color.hex }]} />
          <Text style={styles.colorSwatchHex}>{color.hex}</Text>
          <Text style={styles.colorSwatchName}>{color.name}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// System Colors Page
const SystemColorsPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsubsectionTitle}>System & Utility Colors</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Role</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Name</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>HEX</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>RGB</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Usage</Text>
      </View>
      {data.colors.system.success && (
        <View style={styles.tableRow}>
          <View style={[styles.colorTableCell, { flex: 1 }]}>
            <View style={[styles.inlineColorBox, { backgroundColor: data.colors.system.success.hex }]} />
            <Text style={{ fontSize: 10 }}>Success</Text>
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.success.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.success.hex}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.success.rgb.r}, {data.colors.system.success.rgb.g}, {data.colors.system.success.rgb.b}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{data.colors.system.success.usage}</Text>
        </View>
      )}
      {data.colors.system.warning && (
        <View style={styles.tableRow}>
          <View style={[styles.colorTableCell, { flex: 1 }]}>
            <View style={[styles.inlineColorBox, { backgroundColor: data.colors.system.warning.hex }]} />
            <Text style={{ fontSize: 10 }}>Warning</Text>
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.warning.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.warning.hex}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.warning.rgb.r}, {data.colors.system.warning.rgb.g}, {data.colors.system.warning.rgb.b}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{data.colors.system.warning.usage}</Text>
        </View>
      )}
      {data.colors.system.error && (
        <View style={styles.tableRow}>
          <View style={[styles.colorTableCell, { flex: 1 }]}>
            <View style={[styles.inlineColorBox, { backgroundColor: data.colors.system.error.hex }]} />
            <Text style={{ fontSize: 10 }}>Error</Text>
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.error.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.error.hex}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{data.colors.system.error.rgb.r}, {data.colors.system.error.rgb.g}, {data.colors.system.error.rgb.b}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{data.colors.system.error.usage}</Text>
        </View>
      )}
      {data.colors.text?.map((color, index) => (
        <View key={index} style={styles.tableRow}>
          <View style={[styles.colorTableCell, { flex: 1 }]}>
            <View style={[styles.inlineColorBox, { backgroundColor: color.hex }]} />
            <Text style={{ fontSize: 10 }}>{color.role}</Text>
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.hex}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{color.rgb.r}, {color.rgb.g}, {color.rgb.b}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{color.usage}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Typography Page
const TypographyPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsectionTitle}>2.3 Typography</Text>

    <Text style={styles.paragraph}>
      Typography is fundamental to readability and brand expression. {data.brand.name} uses a clean,
      modern type system that prioritizes legibility on screens while maintaining a professional
      appearance. We use system-native fonts with web-safe fallbacks for optimal performance.
    </Text>

    <Text style={styles.subsubsectionTitle}>Font Families</Text>

    <Text style={styles.label}>Primary Font: {data.typography.primaryFont.name}</Text>
    <Text style={styles.paragraph}>
      Fallback Stack: {data.typography.primaryFont.fallback}
    </Text>

    {data.typography.monospaceFont && (
      <>
        <Text style={styles.label}>Monospace: {data.typography.monospaceFont.name}</Text>
        <Text style={styles.paragraph}>
          Fallback Stack: {data.typography.monospaceFont.fallback}
        </Text>
      </>
    )}

    <Text style={styles.subsubsectionTitle}>Type Scale</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Element</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Size</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Weight</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Line Height</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Letter Spacing</Text>
      </View>
      {data.typography.scale.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.element}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.size}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.weight}</Text>
          <Text style={[styles.tableCell, { flex: 0.8 }]}>{item.lineHeight}</Text>
          <Text style={[styles.tableCell, { flex: 0.8 }]}>{item.letterSpacing}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Typography Guidelines</Text>

    <View style={styles.bulletList}>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Headings:</Text> Use sentence case for all headings (capitalize first word only)</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Body Text:</Text> Maintain optimal line length of 50-75 characters</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Links:</Text> Use Blue Primary with underline on hover</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Code Blocks:</Text> Use monospace font with subtle background</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Emphasis:</Text> Use bold (600) for important terms, avoid italics for emphasis</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Responsive:</Text> Scale type sizes down by ~15% on mobile devices</Text>
      </View>
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Iconography Page
const IconographyPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsectionTitle}>2.4 Iconography</Text>

    <Text style={styles.paragraph}>
      Icons enhance usability by providing quick visual cues. {data.brand.name} uses a consistent
      iconography system that complements the clean, modern aesthetic. Icons should be simple,
      recognizable, and functional.
    </Text>

    <Text style={styles.subsubsectionTitle}>Icon Specifications</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Attribute</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Specification</Text>
      </View>
      {data.iconography.specifications.map((spec, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{spec.attribute}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{spec.specification}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Usage Guidelines:</Text>
    <View style={styles.bulletList}>
      {data.iconography.usageGuidelines.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsectionTitle}>2.5 Imagery Guidelines</Text>

    <Text style={styles.paragraph}>
      While {data.brand.name} is primarily icon and interface-driven, imagery may be used for logos,
      screenshots, and promotional materials. When images are necessary, they should align with the
      brand's professional, technical aesthetic.
    </Text>

    <Text style={styles.subsubsectionTitle}>Image Specifications</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Type</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Format</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Max Size</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Guidelines</Text>
      </View>
      {data.imagery.specifications.map((spec, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{spec.type}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{spec.format}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{spec.maxSize}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{spec.guidelines}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Content Style Guide Page
const ContentStyleGuidePage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionTitle}>3.0 Content Style Guide</Text>

    <Text style={styles.paragraph}>
      Consistent, clear communication reinforces brand trust. The {data.brand.name} voice should feel
      knowledgeable yet approachable—like a helpful colleague who knows the subject matter inside and out.
    </Text>

    <Text style={styles.subsectionTitle}>3.1 Voice and Tone</Text>

    <Text style={styles.subsubsectionTitle}>Voice Characteristics (Consistent)</Text>

    <View style={styles.bulletList}>
      {data.contentStyle.voiceCharacteristics.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>{item.name}:</Text> {item.description}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Tone Variations (Context-Dependent)</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Context</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Tone</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Example</Text>
      </View>
      {data.contentStyle.toneVariations.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.context}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.tone}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{item.example}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Writing Guidelines Page
const WritingGuidelinesPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsectionTitle}>3.2 Writing Guidelines</Text>

    <Text style={styles.label}>Capitalization:</Text>
    <View style={styles.bulletList}>
      {data.contentStyle.writingGuidelines.capitalization.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Punctuation:</Text>
    <View style={styles.bulletList}>
      {data.contentStyle.writingGuidelines.punctuation.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Numbers:</Text>
    <View style={styles.bulletList}>
      {data.contentStyle.writingGuidelines.numbers.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Technical Writing:</Text>
    <View style={styles.bulletList}>
      {data.contentStyle.writingGuidelines.technicalWriting.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// UI Components Page
const UIComponentsPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionTitle}>4.0 UI Components</Text>

    <Text style={styles.paragraph}>
      Consistent UI components create a cohesive experience and reduce development time. Each
      component should be accessible, responsive, and aligned with the brand aesthetic. These
      specifications follow patterns established by modern design systems.
    </Text>

    <Text style={styles.subsectionTitle}>4.1 Buttons</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Variant</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Background</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Text</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Border</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Use Case</Text>
      </View>
      {data.uiComponents.buttons.variants.map((btn, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{btn.variant}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{btn.background}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{btn.text}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{btn.border}</Text>
          <Text style={[styles.tableCell, { flex: 1.5 }]}>{btn.useCase}</Text>
        </View>
      ))}
    </View>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Size</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Height</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Padding (H)</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Font Size</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Border Radius</Text>
      </View>
      {data.uiComponents.buttons.sizes.map((size, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{size.size}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{size.height}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{size.paddingH}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{size.fontSize}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{size.borderRadius}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Interactive States:</Text>
    <View style={styles.bulletList}>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Hover:</Text> Slightly darken background (10% darker) or use lighter accent</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Focus:</Text> 2px solid ring with 2px offset</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Active:</Text> Further darken (15% darker), slight scale transform (0.98)</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Loading:</Text> Show spinner icon, disable interaction</Text>
      </View>
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Cards Page
const CardsPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsectionTitle}>4.2 Cards</Text>

    <Text style={styles.paragraph}>
      Cards are the primary container for content listings. Each card should provide
      essential information at a glance while encouraging exploration.
    </Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Property</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Value</Text>
      </View>
      {data.uiComponents.cards.map((card, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{card.property}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{card.value}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Card Anatomy:</Text>
    <View style={styles.bulletList}>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>1.</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Logo/Icon</Text> – 48x48px, top-left or centered</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>2.</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Name</Text> – H4 typography, primary text color</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>3.</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Description</Text> – Body Small, 2-3 lines, secondary text color, ellipsis overflow</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>4.</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Tags/Categories</Text> – Pill-shaped badges, light background</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>5.</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Action Area</Text> – View details button or arrow icon</Text>
      </View>
    </View>

    <Text style={styles.subsectionTitle}>4.3 Forms</Text>

    <Text style={styles.paragraph}>
      Forms enable search, filtering, and user input. They should be intuitive, accessible, and provide
      clear feedback.
    </Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Property</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Text Input</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Select</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Checkbox</Text>
      </View>
      {data.uiComponents.forms.map((form, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{form.property}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{form.textInput}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{form.select}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{form.checkbox}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Validation States:</Text>
    <View style={styles.bulletList}>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Error:</Text> Border red, error icon, red helper text below</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Success:</Text> Border green, checkmark icon (optional)</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Disabled:</Text> Gray background, gray text, cursor not-allowed</Text>
      </View>
      <View style={styles.bulletItem}>
        <Text style={styles.bulletPoint}>•</Text>
        <Text style={styles.bulletText}><Text style={{ fontWeight: 600 }}>Loading:</Text> Spinner icon inside input, pointer-events none</Text>
      </View>
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Navigation Page
const NavigationPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.subsectionTitle}>4.4 Navigation</Text>

    <Text style={styles.paragraph}>
      Navigation should be intuitive, fast, and consistent. The primary navigation remains persistent,
      while secondary navigation adapts to context.
    </Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Element</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Specification</Text>
      </View>
      {data.uiComponents.navigation.map((nav, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{nav.element}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{nav.specification}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Layout & Grid Page
const LayoutPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionTitle}>5.0 Layout & Grid</Text>

    <Text style={styles.paragraph}>
      A consistent grid system ensures visual harmony and responsive behavior. {data.brand.name} uses
      a 12-column grid with responsive breakpoints that adapt to different screen sizes.
    </Text>

    <Text style={styles.subsubsectionTitle}>Grid Specifications</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Property</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Value</Text>
      </View>
      {data.layout.grid.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.property}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{item.value}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Responsive Breakpoints</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Breakpoint</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Width</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Columns</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Typical Layout</Text>
      </View>
      {data.layout.breakpoints.map((bp, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{bp.name}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{bp.width}</Text>
          <Text style={[styles.tableCell, { flex: 0.8 }]}>{bp.columns}</Text>
          <Text style={[styles.tableCell, { flex: 1.5 }]}>{bp.layout}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Spacing Scale</Text>

    <Text style={styles.paragraph}>
      Use a consistent 4px base unit for spacing. Common values form the spacing scale:
    </Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Token</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Value</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Use Case</Text>
      </View>
      {data.layout.spacing.map((sp, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{sp.token}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{sp.value}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{sp.useCase}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Accessibility Page
const AccessibilityPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionTitle}>6.0 Accessibility</Text>

    <Text style={styles.paragraph}>
      {data.brand.name} is committed to WCAG 2.1 AA compliance, ensuring all users can access and
      interact with our platform regardless of ability. Accessibility is not an afterthought—it's
      built into every component and decision.
    </Text>

    <Text style={styles.subsubsectionTitle}>Color Contrast Requirements</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Combination</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Ratio</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
      </View>
      {data.accessibility.contrastPairs.map((pair, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>{pair.combination}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{pair.ratio}</Text>
          <View style={[styles.checkRow, { flex: 1, padding: 8 }]}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={{ fontSize: 10 }}>{pair.status}</Text>
          </View>
        </View>
      ))}
    </View>

    <Text style={styles.subsubsectionTitle}>Accessibility Checklist</Text>

    <Text style={styles.label}>Keyboard Navigation:</Text>
    <View style={styles.bulletList}>
      {data.accessibility.keyboardNav.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Screen Readers:</Text>
    <View style={styles.bulletList}>
      {data.accessibility.screenReader.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Visual Design:</Text>
    <View style={styles.bulletList}>
      {data.accessibility.visualDesign.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.label}>Motion & Animation:</Text>
    <View style={styles.bulletList}>
      {data.accessibility.motion.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Resources Page
const ResourcesPage = ({ data }: { data: StyleGuideData }) => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.sectionTitle}>7.0 Resources</Text>

    <Text style={styles.paragraph}>
      The following resources support implementation of this style guide. Links and locations should
      be updated as assets are created and organized.
    </Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Resource</Text>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Location / Link</Text>
      </View>
      {data.resources.map((resource, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1 }]}>{resource.name}</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>{resource.location}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.sectionTitle}>8.0 Changelog</Text>

    <Text style={styles.paragraph}>
      This section tracks changes to the style guide over time. Update this log whenever significant
      changes are made to brand guidelines, components, or design specifications.
    </Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Version</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Date</Text>
        <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Changes</Text>
      </View>
      {data.changelog.map((entry, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 0.5 }]}>{entry.version}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{entry.date}</Text>
          <Text style={[styles.tableCell, { flex: 3 }]}>{entry.changes}</Text>
        </View>
      ))}
    </View>

    <View style={{ marginTop: 40 }}>
      <Text style={styles.subsubsectionTitle}>Questions or Feedback?</Text>
      <Text style={styles.paragraph}>
        This style guide is a living document. If you have questions, suggestions, or notice
        inconsistencies, please reach out to the design team.
      </Text>
    </View>

    <PageFooter title={data.brand.name} version={data.meta.version} />
  </Page>
);

// Main Document Component
export const StyleGuideDocument = ({ data }: StyleGuideDocumentProps) => (
  <Document>
    <CoverPage data={data} />
    <TableOfContents data={data} />
    <IntroductionPage data={data} />
    <DesignPrinciplesPage data={data} />
    <BrandIdentityPage data={data} />
    <ColorPalettePage data={data} />
    <SystemColorsPage data={data} />
    <TypographyPage data={data} />
    <IconographyPage data={data} />
    <ContentStyleGuidePage data={data} />
    <WritingGuidelinesPage data={data} />
    <UIComponentsPage data={data} />
    <CardsPage data={data} />
    <NavigationPage data={data} />
    <LayoutPage data={data} />
    <AccessibilityPage data={data} />
    <ResourcesPage data={data} />
  </Document>
);

export default StyleGuideDocument;
