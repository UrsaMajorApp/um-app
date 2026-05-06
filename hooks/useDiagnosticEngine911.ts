/**
 * useDiagnosticEngine911.ts
 *
 * Business logic for the 9–11 "Creators" diagnostic.
 *
 * Phases: intro → basic → pro → processing → done
 *
 * BASIC  — 12 WYR choices, 10-second timer per question
 * PRO    — 30 RPG quest tasks (visual-novel messenger UI)
 */

import { useCallback, useRef, useState } from "react";
import {
  WYR_CARDS,
  PRO_TASKS_911,
  STEALTH_PATTERNS_911,
  SKILL_LABELS_911,
  type BasicSkill911,
  type ProSkill911,
  type StealthEvent911,
  type WYRCard,
  type ProTask911,
} from "../data/diagnosticData911";
import { generateGeminiDiagnosticJson } from "../lib/geminiDiagnostics";
import type { Diagnostic } from "../models/types";

// ─── Phase & state types ──────────────────────────────────────────────────────

export type DiagnosticPhase911 = "intro" | "basic" | "pro" | "processing" | "done";

export interface Engine911State {
  phase: DiagnosticPhase911;
  currentIndex: number;
  progress: number;
  currentCard: WYRCard | null;
  currentTask: ProTask911 | null;
  results: Diagnostic | null;
  isProcessing: boolean;
  totalBasicCards: number;
  totalProTasks: number;
}

interface WYRRecord {
  cardId: string;
  chosenSkill: BasicSkill911;
  timestamp: number;
  latency: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDiagnosticEngine911(opts: {
  childId: string;
  userId: string;
  isPro: boolean;
  onComplete: (diagnostic: Diagnostic) => Promise<void>;
}) {
  const { childId, isPro, onComplete } = opts;

  const [phase, setPhase] = useState<DiagnosticPhase911>("intro");
  const [basicIndex, setBasicIndex] = useState(0);
  const [proIndex, setProIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Diagnostic | null>(null);

  const wyrChoices = useRef<WYRRecord[]>([]);
  const stealthEvents = useRef<StealthEvent911[]>([]);
  const taskEnteredAt = useRef<number>(Date.now());

  // ── Progress ────────────────────────────────────────────────────────────────

  const totalSteps = WYR_CARDS.length + (isPro ? PRO_TASKS_911.length : 0);
  const currentStep =
    phase === "basic"
      ? basicIndex
      : phase === "pro"
        ? WYR_CARDS.length + proIndex
        : phase === "processing" || phase === "done"
          ? totalSteps
          : 0;
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  // ── Phase helpers ────────────────────────────────────────────────────────────

  const startBasic = useCallback(() => {
    setPhase("basic");
    setBasicIndex(0);
    taskEnteredAt.current = Date.now();
  }, []);

  const advanceToPro = useCallback(async () => {
    if (isPro) {
      setPhase("pro");
      setProIndex(0);
      taskEnteredAt.current = Date.now();
    } else {
      await finishDiagnostic();
    }
  }, [isPro]);

  // ── BASIC: WYR choice ────────────────────────────────────────────────────────

  const handleWYRChoice = useCallback(
    async (chosenSkill: BasicSkill911) => {
      const card = WYR_CARDS[basicIndex];
      if (!card) return;

      const latency = Date.now() - taskEnteredAt.current;

      wyrChoices.current.push({
        cardId: card.id,
        chosenSkill,
        timestamp: Date.now(),
        latency,
      });

      const nextIndex = basicIndex + 1;
      if (nextIndex < WYR_CARDS.length) {
        setBasicIndex(nextIndex);
        taskEnteredAt.current = Date.now();
      } else {
        await advanceToPro();
      }
    },
    [basicIndex, advanceToPro],
  );

  // ── PRO: answer ──────────────────────────────────────────────────────────────

  const handleProAnswer = useCallback(
    async (optionId: number) => {
      const task = PRO_TASKS_911[proIndex];
      if (!task) return;

      const opt = task.options.find((o) => o.id === optionId);
      const scoreMap = opt?.scoreMap ?? {};

      const event: StealthEvent911 = {
        taskId: task.id,
        enteredAt: taskEnteredAt.current,
        answeredAt: Date.now(),
        selectedOptionId: optionId,
        scoreMap,
      };
      stealthEvents.current.push(event);

      const nextIndex = proIndex + 1;
      if (nextIndex < PRO_TASKS_911.length) {
        setProIndex(nextIndex);
        taskEnteredAt.current = Date.now();
      } else {
        await finishDiagnostic();
      }
    },
    [proIndex],
  );

  // ── Scoring ──────────────────────────────────────────────────────────────────

  const computeResults = useCallback(() => {
    // 1) Count BASIC skill votes (with Stealth Analytics: Latency Math)
    const skillCounts: Record<BasicSkill911, number> = {
      creativity: 0,
      logic: 0,
      empathy: 0,
      leadership: 0,
      communication: 0,
      adaptability: 0,
      analytics: 0,
      teamwork: 0,
    };
    for (const r of wyrChoices.current) {
      let weight = 1.0;
      if (r.latency < 2500) weight = 1.2; // Fast intuitive choice
      if (r.latency > 8500) weight = 0.8; // Hesitation
      skillCounts[r.chosenSkill] += weight;
    }

    // Top 3 skills
    const top3 = (Object.entries(skillCounts) as [BasicSkill911, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill, count]) => ({ skill, count, label: SKILL_LABELS_911[skill] }));

    const weakest = (Object.entries(skillCounts) as [BasicSkill911, number][])
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([skill]) => SKILL_LABELS_911[skill]);

    // 2) PRO score map
    const rawScores: Record<string, number> = {};
    for (const ev of stealthEvents.current) {
      for (const [k, v] of Object.entries(ev.scoreMap)) {
        rawScores[k] = (rawScores[k] || 0) + (v ?? 0);
      }
    }

    const scores: Record<string, number> = { ...skillCounts, ...rawScores };

    // 4) Stealth personality
    const patternCounts: Record<string, number> = {};
    for (const ev of stealthEvents.current) {
      for (const p of STEALTH_PATTERNS_911) {
        if (p.match(ev)) {
          patternCounts[p.id] = (patternCounts[p.id] || 0) + 1;
        }
      }
    }
    const dominantPattern =
      Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "balanced";
    const stealthLabel =
      STEALTH_PATTERNS_911.find((p) => p.id === dominantPattern)?.label || "Сбалансированный";

    return {
      scores,
      top3,
      weakest,
      rawScores,
      stealthProfile: stealthLabel,
      skillCounts,
    };
  }, []);

  // ── AI report ────────────────────────────────────────────────────────────────

  const processWithAI = useCallback(
    async (computed: ReturnType<typeof computeResults>) => {
      const top3str = computed.top3.map((x) => x.label).join(", ");
      const weakStr = computed.weakest.join(", ");

      const prompt = `You are an expert child psychologist. Analyze diagnostic data for a 9–11 year old child ("Creators" group).

BASIC test (Would You Rather — 12 questions):
Top skills: ${top3str}.
Weaker areas: ${weakStr}.
${
  isPro
    ? `PRO RPG quest scores: ${JSON.stringify(computed.rawScores)}.
Stealth behavior profile: ${computed.stealthProfile}.`
    : ""
}

Generate RAW JSON only (no markdown). ${isPro ? "Include ALL fields" : "Include only base fields"}:
{
  "summary": "One short, plain Russian sentence, max 110 characters. No long clauses.",
  "recommendedConstellation": "Creative 1-2 word talent type in Russian (e.g. 'Творец-лидер')"
  ${
    isPro
      ? `,
  "topStrengths": ["Top 3 skills in Russian, with brief explanation"],
  "developmentAreas": ["1-2 growth areas in Russian"],
  "intellectType": "Intelligence type in Russian",
  "personalityBehavior": "Personality/behavior pattern in Russian based on stealth profile: ${computed.stealthProfile}",
  "careerArchetypes": ["3 future career vectors in Russian appropriate for 9-11 age"],
  "parentAdvice": "1-2 sentences of advice for parents in Russian"`
      : ""
  }
}`;

      return generateGeminiDiagnosticJson(prompt);
    },
    [isPro],
  );

  // ── Finish ───────────────────────────────────────────────────────────────────

  const finishDiagnostic = useCallback(async () => {
    setPhase("processing");
    setIsProcessing(true);

    const computed = computeResults();

    let aiData: Record<string, any> = {};
    try {
      aiData = await processWithAI(computed);
    } catch (e) {
      console.error("AI report error:", e);
      aiData = {
        summary: "Сильная сторона ребёнка — инициативность и творческое мышление.",
        recommendedConstellation: computed.top3[0]?.label ?? "Творец",
        ...(isPro
          ? {
              topStrengths: computed.top3.map((x) => x.label),
              developmentAreas: computed.weakest,
              intellectType: "Социально-творческий интеллект",
              personalityBehavior: computed.stealthProfile,
              careerArchetypes: ["Проектный менеджер", "UX-дизайнер", "Педагог-новатор"],
              parentAdvice: "Поощряйте командные проекты и творческие инициативы ребёнка.",
            }
          : {}),
      };
    }

    const diagnostic: Diagnostic = {
      childId,
      scores: computed.scores,
      summary: aiData.summary || "Отличный потенциал!",
      recommendedConstellation: aiData.recommendedConstellation || "Творец",
      timestamp: new Date().toISOString(),
      tier: isPro ? "pro" : "basic",
      ageGroup: "9-11",
      rawMetadata: {
        stealthProfile: computed.stealthProfile,
      },
      ...(isPro
        ? {
            topStrengths: aiData.topStrengths,
            developmentAreas: aiData.developmentAreas,
            intellectType: aiData.intellectType,
            personalityBehavior: aiData.personalityBehavior,
            careerArchetypes: aiData.careerArchetypes,
            parentAdvice: aiData.parentAdvice,
          }
        : {}),
    };

    setResults(diagnostic);
    try {
      await onComplete(diagnostic);
    } catch (e) {
      console.error("Failed to save diagnostic:", e);
    }

    setIsProcessing(false);
    setPhase("done");
  }, [childId, isPro, computeResults, processWithAI, onComplete]);

  // ── Public API ────────────────────────────────────────────────────────────────

  const currentCard = phase === "basic" ? WYR_CARDS[basicIndex] ?? null : null;
  const currentTask = phase === "pro" ? PRO_TASKS_911[proIndex] ?? null : null;

  return {
    phase,
    currentIndex: phase === "basic" ? basicIndex : proIndex,
    progress,
    currentCard,
    currentTask,
    results,
    isProcessing,
    totalBasicCards: WYR_CARDS.length,
    totalProTasks: PRO_TASKS_911.length,

    startBasic,
    handleWYRChoice,
    handleProAnswer,
    markTaskEntry: () => {
      taskEnteredAt.current = Date.now();
    },

    // For skip
    finishDiagnostic,
  };
}
