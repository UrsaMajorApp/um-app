import type { JsonObject } from '$types/index';

export interface Diagnostic {
  childId: string;
  scores: Record<string, number>;
  summary: string;
  recommendedConstellation: string;
  timestamp?: string;
  tier?: 'basic' | 'pro';
  ageGroup?: string;
  intellectType?: string;
  personalityBehavior?: string;
  careerArchetypes?: string[];
  parentAdvice?: string;
  topStrengths?: string[];
  developmentAreas?: string[];
  rawMetadata?: JsonObject;
}

export type DiagnosticAiResponse = Partial<
  Pick<
    Diagnostic,
    | 'scores'
    | 'summary'
    | 'recommendedConstellation'
    | 'intellectType'
    | 'personalityBehavior'
    | 'careerArchetypes'
    | 'parentAdvice'
    | 'topStrengths'
    | 'developmentAreas'
  >
>;

export type SwipeRenderArgs = {
  isLeaving: boolean;
  swipe: (liked: boolean) => void;
};
