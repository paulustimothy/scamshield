// ========================
// ScamShield Type Definitions
// ========================

export type RiskLevel = 'aman' | 'mencurigakan' | 'berbahaya';
export type ScanType = 'text' | 'url' | 'email' | 'image' | 'audio';
export type Severity = 'low' | 'medium' | 'high';

export interface SuspiciousPhrase {
  text: string;
  reason: string;
  severity: Severity;
}

export interface WhyPeopleFallForThis {
  psychologicalTactics: string[];
  explanation: string;
  emotionalTriggers: string[];
}

export interface URLReputationData {
  isHTTPS: boolean;
  domainAge?: string;
  suspiciousIndicators: { indicator: string; explanation: string }[];
  safeIndicators: { indicator: string; explanation: string }[];
  trustScore: number;
  virusTotal?: { detected: number; total: number; vendors: string[] };
  typosquatting?: { targetDomain: string; similarity: number };
}

export interface ScamAnalysisResult {
  scamProbability: number;
  riskLevel: RiskLevel;
  confidenceScore: number;
  suspiciousPhrases: SuspiciousPhrase[];
  scamTypes: string[];
  explanation: string;
  simpleExplanation: string;
  recommendedActions: string[];
  redFlags: string[];
  safeIndicators: string[];
  extractedText?: string; // For image analysis
  transcript?: string; // For audio analysis
  whyPeopleFallForThis?: WhyPeopleFallForThis; // Psychology section
  urlReputation?: URLReputationData; // URL reputation data
}

export interface ScanHistoryEntry {
  id: string;
  type: ScanType;
  contentPreview: string;
  result: ScamAnalysisResult;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ScamPattern {
  id: string;
  title: string;
  description: string;
  icon: string;
  riskLevel: RiskLevel;
  examples: string[];
  howToProtect: string[];
  indicators: string[];
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  simplifiedUI: boolean;
}

// Context passed from scan result to AI chat
export interface ScanContext {
  originalContent: string;
  riskLevel: RiskLevel;
  scamProbability: number;
  scamTypes: string[];
  suspiciousPhrases: SuspiciousPhrase[];
  explanation: string;
  simpleExplanation: string;
  recommendedActions: string[];
  redFlags: string[];
  safeIndicators: string[];
}
