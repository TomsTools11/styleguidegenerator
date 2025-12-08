import { StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

// Color palette matching the example PDF
export const colors = {
  // Primary blues
  navyDark: '#021A2E',
  navyMedium: '#014379',
  bluePrimary: '#0D91FD',
  blueLight: '#5DB5FE',
  bluePale: '#C2E3FE',

  // Text
  textPrimary: '#374151',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Backgrounds
  white: '#FFFFFF',
  grayLight: '#F9FAFB',
  grayBorder: '#E5E7EB',

  // Table headers
  tableHeaderBg: '#E8F4FD',
  tableHeaderText: '#374151',

  // System
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

// Main stylesheet
export const styles = StyleSheet.create({
  // Page layout
  page: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    padding: 50,
    paddingBottom: 70,
  },

  // Cover page
  coverPage: {
    fontFamily: 'Inter',
    backgroundColor: colors.white,
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  coverTitle: {
    fontSize: 42,
    fontWeight: 700,
    color: colors.navyDark,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  coverColorBar: {
    flexDirection: 'row',
    marginBottom: 80,
  },
  coverColorSwatch: {
    width: 80,
    height: 40,
  },
  coverMeta: {
    marginTop: 'auto',
  },
  coverMetaItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  coverMetaLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.textPrimary,
    width: 120,
  },
  coverMetaValue: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Page footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: colors.textMuted,
  },

  // Section headings
  sectionTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.navyDark,
    marginBottom: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  subsectionTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: colors.bluePrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  subsubsectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.bluePrimary,
    marginTop: 16,
    marginBottom: 8,
  },

  // Paragraphs
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'justify',
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  // Tables
  table: {
    marginTop: 12,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.tableHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.tableHeaderText,
    padding: 8,
    flex: 1,
  },
  tableCell: {
    fontSize: 10,
    color: colors.textPrimary,
    padding: 8,
    flex: 1,
  },

  // Color swatches
  colorSwatchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  colorSwatch: {
    width: 80,
    alignItems: 'center',
    marginBottom: 12,
  },
  colorSwatchBox: {
    width: 80,
    height: 50,
    borderRadius: 4,
    marginBottom: 6,
  },
  colorSwatchHex: {
    fontSize: 9,
    fontWeight: 500,
    color: colors.textPrimary,
  },
  colorSwatchName: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Lists
  bulletList: {
    marginTop: 8,
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletPoint: {
    width: 6,
    fontSize: 11,
    color: colors.textPrimary,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 11,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 1.5,
  },

  // Table of Contents
  tocItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tocNumber: {
    width: 40,
    fontSize: 12,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  tocTitle: {
    fontSize: 12,
    color: colors.textPrimary,
  },

  // Inline color box (for tables)
  inlineColorBox: {
    width: 24,
    height: 24,
    borderRadius: 2,
    marginRight: 8,
  },
  colorTableCell: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    flex: 1,
  },

  // Design principles
  principleTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.bluePrimary,
    marginBottom: 4,
  },
  principleDescription: {
    fontSize: 11,
    color: colors.textPrimary,
    lineHeight: 1.5,
    marginBottom: 16,
  },

  // Accessibility checkmark
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkmark: {
    fontSize: 10,
    color: colors.success,
    marginRight: 8,
  },
});
