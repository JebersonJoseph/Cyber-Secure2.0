
export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Unknown = 'Unknown',
}

export interface AnalysisPoint {
  tactic: string;
  explanation: string;
  quote: string;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  analysisPoints: AnalysisPoint[];
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  summary: string;
  imageUrl: string;
  articleUrl: string;
  publishedDate: string;
}
