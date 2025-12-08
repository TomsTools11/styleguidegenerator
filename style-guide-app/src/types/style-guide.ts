// Type definitions for the Style Guide Generator

export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
  role: string;
  usage: string;
}

export interface ColorPalette {
  primary: Color[];
  secondary: Color[];
  system: {
    success?: Color;
    warning?: Color;
    error?: Color;
    info?: Color;
  };
  text: Color[];
  background: Color[];
}

export interface FontFamily {
  name: string;
  fallback: string;
  category: 'primary' | 'secondary' | 'monospace';
}

export interface TypeScaleItem {
  element: string;
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
}

export interface Typography {
  primaryFont: FontFamily;
  secondaryFont?: FontFamily;
  monospaceFont?: FontFamily;
  scale: TypeScaleItem[];
}

export interface ButtonSpec {
  variant: string;
  background: string;
  text: string;
  border: string;
  useCase: string;
}

export interface ButtonSize {
  size: string;
  height: string;
  paddingH: string;
  fontSize: string;
  borderRadius: string;
}

export interface CardSpec {
  property: string;
  value: string;
}

export interface FormSpec {
  property: string;
  textInput: string;
  select: string;
  checkbox: string;
}

export interface NavigationSpec {
  element: string;
  specification: string;
}

export interface UIComponents {
  buttons: {
    variants: ButtonSpec[];
    sizes: ButtonSize[];
  };
  cards: CardSpec[];
  forms: FormSpec[];
  navigation: NavigationSpec[];
}

export interface GridSpec {
  property: string;
  value: string;
}

export interface Breakpoint {
  name: string;
  width: string;
  columns: string;
  layout: string;
}

export interface SpacingToken {
  token: string;
  value: string;
  useCase: string;
}

export interface Layout {
  grid: GridSpec[];
  breakpoints: Breakpoint[];
  spacing: SpacingToken[];
}

export interface ContrastPair {
  combination: string;
  ratio: string;
  status: string;
}

export interface Accessibility {
  contrastPairs: ContrastPair[];
  keyboardNav: string[];
  screenReader: string[];
  visualDesign: string[];
  motion: string[];
}

export interface IconSpec {
  attribute: string;
  specification: string;
}

export interface ImageSpec {
  type: string;
  format: string;
  maxSize: string;
  guidelines: string;
}

export interface LogoSpec {
  attribute: string;
  specification: string;
}

export interface VoiceCharacteristic {
  name: string;
  description: string;
}

export interface ToneVariation {
  context: string;
  tone: string;
  example: string;
}

export interface ContentStyle {
  voiceCharacteristics: VoiceCharacteristic[];
  toneVariations: ToneVariation[];
  writingGuidelines: {
    capitalization: string[];
    punctuation: string[];
    numbers: string[];
    technicalWriting: string[];
  };
}

export interface Resource {
  name: string;
  location: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string;
}

export interface StyleGuideData {
  meta: {
    url: string;
    domain: string;
    title: string;
    analyzedAt: string;
    version: string;
  };

  brand: {
    name: string;
    description: string;
    missionStatement?: string;
    visionStatement?: string;
    strategicPositioning?: string;
  };

  designPrinciples: {
    name: string;
    description: string;
  }[];

  logo: {
    specifications: LogoSpec[];
    incorrectUsage: string[];
  };

  colors: ColorPalette;

  typography: Typography;

  iconography: {
    specifications: IconSpec[];
    usageGuidelines: string[];
  };

  imagery: {
    specifications: ImageSpec[];
  };

  contentStyle: ContentStyle;

  uiComponents: UIComponents;

  layout: Layout;

  accessibility: Accessibility;

  resources: Resource[];

  changelog: ChangelogEntry[];
}

export interface AnalysisJob {
  id: string;
  url: string;
  status: 'pending' | 'fetching' | 'extracting_colors' | 'extracting_typography' | 'identifying_components' | 'generating_pdf' | 'completed' | 'failed';
  progress: number;
  error?: string;
  data?: StyleGuideData;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
