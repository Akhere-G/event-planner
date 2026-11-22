export interface FeatureScreenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export interface FeatureStep {
  title: string;
  body: string;
}

export interface FeatureFaq {
  question: string;
  answer: string;
}

export interface FeaturePage {
  slug: string;
  name: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  screenshots: FeatureScreenshot[];
  summary: string;
  steps: FeatureStep[];
  benefits: string[];
  limits: string[];
  faqs: FeatureFaq[];
  relatedFeatureSlugs: string[];
  relatedArticleSlugs: string[];
}
