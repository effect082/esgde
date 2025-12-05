
export enum Category {
  E = "Environment (환경)",
  S = "Social (사회)",
  G = "Governance (지배구조)"
}

export interface Question {
  id: string; // e.g., "E1-1"
  category: Category;
  subCategory: string; // e.g., "친환경 경영"
  indicator: string; // e.g., "지역사회가 공감하는 목표수립 과정"
  description: string[]; // List of specific check items from the PDF
}

export type Rating = 1 | 2 | 3 | 4;

export interface Answer {
  questionId: string;
  rating: Rating;
  // Map of description index to selected options (e.g., 0: ["알고 있음", "하고 있음"])
  details?: Record<number, string[]>; 
}

export interface UserInfo {
  name: string;
  department: string;
}

export interface AnalysisResult {
  focusAreas: string[];
  improvementAreas: string[];
  collaborationWithResidents: string[];
  communitySolidarity: string[];
  corporatePartnership: string[];
  otherMeaningfulAreas: string[];
  summary: string;
}

// For Admin Dashboard
export interface SurveySubmission extends UserInfo {
  timestamp: string;
  // Value can be simple number (legacy) or object with rating and details
  answers: Record<string, number | { rating: number; details?: Record<number, string[]> }>; 
  totalScore: {
    E: number;
    S: number;
    G: number;
  };
}
