// GNews API Response Types

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: GNewsSource;
}

export interface GNewsSource {
  name: string;
  url: string;
}

export type GNewsCategory =
  | 'general'
  | 'world'
  | 'nation'
  | 'business'
  | 'technology'
  | 'entertainment'
  | 'sports'
  | 'science'
  | 'health';

export type GNewsLanguage =
  | 'ar' // Arabic
  | 'zh' // Chinese
  | 'nl' // Dutch
  | 'en' // English
  | 'fr' // French
  | 'de' // German
  | 'el' // Greek
  | 'he' // Hebrew
  | 'hi' // Hindi
  | 'it' // Italian
  | 'ja' // Japanese
  | 'ml' // Malayalam
  | 'mr' // Marathi
  | 'no' // Norwegian
  | 'pt' // Portuguese
  | 'ro' // Romanian
  | 'ru' // Russian
  | 'es' // Spanish
  | 'sv' // Swedish
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'uk'; // Ukrainian

export type GNewsCountry =
  | 'au' // Australia
  | 'br' // Brazil
  | 'ca' // Canada
  | 'cn' // China
  | 'eg' // Egypt
  | 'fr' // France
  | 'de' // Germany
  | 'gr' // Greece
  | 'hk' // Hong Kong
  | 'in' // India
  | 'ie' // Ireland
  | 'il' // Israel
  | 'it' // Italy
  | 'jp' // Japan
  | 'nl' // Netherlands
  | 'no' // Norway
  | 'pk' // Pakistan
  | 'pe' // Peru
  | 'ph' // Philippines
  | 'pt' // Portugal
  | 'ro' // Romania
  | 'ru' // Russia
  | 'sg' // Singapore
  | 'es' // Spain
  | 'se' // Sweden
  | 'ch' // Switzerland
  | 'tw' // Taiwan
  | 'ua' // Ukraine
  | 'gb' // United Kingdom
  | 'us'; // United States

export interface GNewsSearchParams {
  q: string;
  lang?: GNewsLanguage;
  country?: GNewsCountry;
  max?: number; // 1-100, default 10
  from?: string; // ISO 8601 date format
  to?: string; // ISO 8601 date format
  sortby?: 'publishedAt' | 'relevance';
  nullable?: 'image' | 'description' | 'content';
}

export interface GNewsTopHeadlinesParams {
  category?: GNewsCategory;
  lang?: GNewsLanguage;
  country?: GNewsCountry;
  max?: number; // 1-100, default 10
  nullable?: 'image' | 'description' | 'content';
}
