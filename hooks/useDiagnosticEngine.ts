/**
 * useDiagnosticEngine.ts
 *
 * Encapsulates all business logic for the 6–8 "Explorers" diagnostic:
 *  • Phase management (intro → basic → pro → processing → done)
 *  • Stealth analytics collection
 *  • Score computation
 *  • AI report generation via Gemini
 *
 * ────────────────────────────────────────────────────────────────────────
 * FOR BACKEND DEVS: The scoring formulas and AI prompt live here.
 * When you build the server-side scoring endpoint, replicate the logic
 * from `computeResults()` and the Gemini prompt in `processWithAI()`.
 * ────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useRef, useState } from 'react';
import {
  BASIC_CARDS,
  PRO_TASKS,
  SKILL_VECTORS,
  STEALTH_PATTERNS,
  type BasicCard,
  type ProTask,
  type SkillCategory,
  type StealthEvent,
} from '$data/diagnosticData';
import { generateGeminiDiagnosticJson } from '$lib/geminiDiagnostics';
import type { Diagnostic, DiagnosticAiResponse } from '$types/diagnostic';

// ─── Types ──────────────────────────────────────────────────────────────

export type DiagnosticPhase = 'intro' | 'basic' | 'pro' | 'processing' | 'done';

export interface EngineState {
  phase: DiagnosticPhase;
  /** Index of the current card (BASIC) or task (PRO). */
  currentIndex: number;
  /** 0..1 progress within the current phase. */
  progress: number;
  /** Current BASIC card (null when not in basic phase). */
  currentCard: BasicCard | null;
  /** Current PRO task (null when not in pro phase). */
  currentTask: ProTask | null;
  /** Completed diagnostic (null until processing finishes). */
  results: Diagnostic | null;
  isProcessing: boolean;
}

interface SwipeRecord {
  cardId: string;
  liked: boolean;
  timestamp: number;
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useDiagnosticEngine(opts: {
  childId: string;
  userId: string;
  isPro: boolean;
  onComplete: (diagnostic: Diagnostic) => Promise<void>;
}) {
  const { childId, isPro, onComplete } = opts;

  const [phase, setPhase] = useState<DiagnosticPhase>('intro');
  const [basicIndex, setBasicIndex] = useState(0);
  const [proIndex, setProIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Diagnostic | null>(null);

  // Collected data
  const swipes = useRef<SwipeRecord[]>([]);
  const stealthEvents = useRef<StealthEvent[]>([]);
  const taskEnteredAt = useRef<number>(Date.now());
  const taskAttempts = useRef<number>(0);
  const finishDiagnosticRef = useRef<() => Promise<void> | void>(() => {});

  // ── Progress ─────────────────────────────────────────────────────────

  const totalSteps = BASIC_CARDS.length + (isPro ? PRO_TASKS.length : 0);
  const currentStep =
    phase === 'basic'
      ? basicIndex
      : phase === 'pro'
        ? BASIC_CARDS.length + proIndex
        : phase === 'processing' || phase === 'done'
          ? totalSteps
          : 0;
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  // ── Phase helpers ────────────────────────────────────────────────────

  const startBasic = useCallback(() => {
    setPhase('basic');
    setBasicIndex(0);
    taskEnteredAt.current = Date.now();
  }, []);

  const advanceToPro = useCallback(() => {
    if (isPro) {
      setPhase('pro');
      setProIndex(0);
      taskEnteredAt.current = Date.now();
      taskAttempts.current = 0;
    } else {
      finishDiagnosticRef.current();
    }
  }, [isPro]);

  // ── BASIC: swipe handler ─────────────────────────────────────────────

  const handleSwipe = useCallback(
    (liked: boolean) => {
      const card = BASIC_CARDS[basicIndex];
      if (!card) return;

      swipes.current.push({
        cardId: card.id,
        liked,
        timestamp: Date.now(),
      });

      const nextIndex = basicIndex + 1;
      if (nextIndex < BASIC_CARDS.length) {
        setBasicIndex(nextIndex);
        taskEnteredAt.current = Date.now();
      } else {
        advanceToPro();
      }
    },
    [basicIndex, advanceToPro],
  );

  // ── PRO: answer handler ──────────────────────────────────────────────

  const handleProAnswer = useCallback(
    (optionId: number) => {
      const task = PRO_TASKS[proIndex];
      if (!task) return;

      taskAttempts.current += 1;
      const isCorrect =
        task.correctIndex === -1
          ? true // no single correct answer (personality-type)
          : optionId === task.correctIndex;

      const event: StealthEvent = {
        taskId: task.id,
        enteredAt: taskEnteredAt.current,
        answeredAt: Date.now(),
        attempts: taskAttempts.current,
        selectedOptionId: optionId,
        correct: isCorrect,
      };

      stealthEvents.current.push(event);

      const nextIndex = proIndex + 1;
      if (nextIndex < PRO_TASKS.length) {
        setProIndex(nextIndex);
        taskEnteredAt.current = Date.now();
        taskAttempts.current = 0;
      } else {
        finishDiagnosticRef.current();
      }
    },
    [proIndex],
  );

  // ── Scoring ──────────────────────────────────────────────────────────

  const computeResults = useCallback((): {
    scores: Diagnostic['scores'];
    topCategories: { category: SkillCategory; count: number }[];
    stealthProfile: string;
    rawScoreMap: Record<string, number>;
  } => {
    // 1) Count BASIC likes per category
    const categoryCounts: Record<SkillCategory, number> = {
      tech: 0,
      art: 0,
      nature: 0,
      sport: 0,
    };

    for (const s of swipes.current) {
      if (!s.liked) continue;
      const card = BASIC_CARDS.find((c) => c.id === s.cardId);
      if (card) categoryCounts[card.category]++;
    }

    const topCategories = (Object.entries(categoryCounts) as [SkillCategory, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    // 2) Sum PRO task scores
    const rawScoreMap: Record<string, number> = {};
    for (const ev of stealthEvents.current) {
      const task = PRO_TASKS.find((t) => t.id === ev.taskId);
      if (!task) continue;
      const opt = task.options.find((o) => o.id === ev.selectedOptionId);
      if (!opt) continue;
      for (const [skill, pts] of Object.entries(opt.scoreMap)) {
        rawScoreMap[skill] = (rawScoreMap[skill] || 0) + pts;
      }
    }

    // 3) Map to Diagnostic scores (0-100 scale)
    const scores: Record<string, number> = {
      ...categoryCounts,
      ...rawScoreMap,
    };

    // 4) Stealth personality profile
    const patternCounts: Record<string, number> = {};
    for (const ev of stealthEvents.current) {
      for (const p of STEALTH_PATTERNS) {
        if (p.match(ev)) {
          patternCounts[p.id] = (patternCounts[p.id] || 0) + 1;
        }
      }
    }
    const dominantPattern =
      Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'balanced';
    const stealthLabel =
      STEALTH_PATTERNS.find((p) => p.id === dominantPattern)?.label || 'Сбалансированный';

    return {
      scores,
      topCategories,
      stealthProfile: stealthLabel,
      rawScoreMap,
    };
  }, []);

  // ── AI report generation ─────────────────────────────────────────────

  const processWithAI = useCallback(
    async (computed: ReturnType<typeof computeResults>) => {
      const topCatsStr = computed.topCategories
        .slice(0, 3)
        .map((c) => {
          const vec = SKILL_VECTORS[c.category];
          return `${vec.primary} (${c.count} likes)`;
        })
        .join(', ');

      const prompt = `You are an expert child psychologist. Analyze this diagnostic data for a 6-8 year old child.

BASIC test (interest swipes): Top categories — ${topCatsStr}.
${
  isPro
    ? `PRO test scores: ${JSON.stringify(computed.rawScoreMap)}.
Stealth personality profile: ${computed.stealthProfile}.`
    : ''
}

Generate a JSON object (RAW JSON, no markdown). ${isPro ? 'Include ALL fields' : 'Include only base fields'}:
{
  "summary": "One short, plain Russian sentence, max 110 characters. No long clauses.",
  "recommendedConstellation": "Creative 1-2 word title for talent type in Russian (e.g. 'Техно-энтузиаст')"
  ${
    isPro
      ? `,
  "intellectType": "Type of intelligence in Russian (e.g. 'Логико-пространственный')",
  "personalityBehavior": "Personality behavior pattern in Russian based on stealth data: ${computed.stealthProfile}",
  "careerArchetypes": ["3 potential future career directions in Russian"],
  "parentAdvice": "1-2 sentences of personalized advice for parents in Russian",
  "topStrengths": ["top 2-3 strengths in Russian"],
  "developmentAreas": ["1-2 areas for development in Russian"]`
      : ''
  }
}`;

      return generateGeminiDiagnosticJson<DiagnosticAiResponse>(prompt);
    },
    [isPro],
  );

  // ── Finish ───────────────────────────────────────────────────────────

  const finishDiagnostic = useCallback(async () => {
    setPhase('processing');
    setIsProcessing(true);

    const computed = computeResults();

    let aiData: DiagnosticAiResponse = {};
    try {
      aiData = await processWithAI(computed);
    } catch (e) {
      console.error('AI report error:', e);
      // Fallback
      aiData = {
        summary: 'Сильная сторона ребёнка — любопытство и творческий подход.',
        recommendedConstellation: 'Творческий исследователь',
        ...(isPro
          ? {
              intellectType: 'Многогранный (смешанный тип)',
              personalityBehavior: computed.stealthProfile,
              careerArchetypes: ['Инженер-изобретатель', 'Исследователь', 'Дизайнер'],
              parentAdvice:
                'Поддерживайте интересы ребёнка и предоставляйте разнообразные активности.',
              topStrengths: computed.topCategories
                .slice(0, 2)
                .map((c) => SKILL_VECTORS[c.category].primary),
              developmentAreas: ['Скорость принятия решений'],
            }
          : {}),
      };
    }

    const diagnostic: Diagnostic = {
      childId,
      scores: computed.scores,
      summary: aiData.summary || 'Отличный потенциал!',
      recommendedConstellation: aiData.recommendedConstellation || 'Исследователь',
      timestamp: new Date().toISOString(),
      tier: isPro ? 'pro' : 'basic',
      ageGroup: '6-8',
      rawMetadata: {
        stealthProfile: computed.stealthProfile,
      },
      ...(isPro
        ? {
            intellectType: aiData.intellectType,
            personalityBehavior: aiData.personalityBehavior,
            careerArchetypes: aiData.careerArchetypes,
            parentAdvice: aiData.parentAdvice,
            topStrengths: aiData.topStrengths,
            developmentAreas: aiData.developmentAreas,
          }
        : {}),
    };

    setResults(diagnostic);

    try {
      await onComplete(diagnostic);
    } catch (e) {
      console.error('Failed to save diagnostic:', e);
    }

    setIsProcessing(false);
    setPhase('done');
  }, [childId, isPro, computeResults, processWithAI, onComplete]);
  finishDiagnosticRef.current = finishDiagnostic;

  // ── Public API ───────────────────────────────────────────────────────

  const currentCard = phase === 'basic' ? (BASIC_CARDS[basicIndex] ?? null) : null;
  const currentTask = phase === 'pro' ? (PRO_TASKS[proIndex] ?? null) : null;

  return {
    // State
    phase,
    currentIndex: phase === 'basic' ? basicIndex : proIndex,
    progress,
    currentCard,
    currentTask,
    results,
    isProcessing,
    totalBasicCards: BASIC_CARDS.length,
    totalProTasks: PRO_TASKS.length,

    // Actions
    startBasic,
    handleSwipe,
    handleProAnswer,

    /** Mark the task entry timestamp (call when PRO task screen appears). */
    markTaskEntry: () => {
      taskEnteredAt.current = Date.now();
      taskAttempts.current = 0;
    },
  };
}
