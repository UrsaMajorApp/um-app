/**
 * useDiagnosticEngine1214.ts
 *
 * Engine for 12-14 module ("Бунтари").
 * BASIC: 24 swipe cards (RIASEC logic)
 * PRO: 30 hackathon tasks with Stealth Analytics (speed, erased, latency)
 */

import { useCallback, useRef, useState } from "react";
import {
  VIBE_CARDS,
  PRO_TASKS_1214,
  RIASEC_MAP,
  type RiasecType,
  type StealthEvent1214,
  type VibeCard,
  type ProTask1214,
} from "../data/diagnosticData1214";
import { generateGeminiDiagnosticJson } from "../lib/geminiDiagnostics";
import type { Diagnostic } from "../models/types";

export type Phase1214 = "intro" | "basic" | "pro" | "processing" | "done";

export function useDiagnosticEngine1214(opts: {
  childId: string;
  userId: string;
  isPro: boolean;
  onComplete: (diagnostic: Diagnostic) => Promise<void>;
}) {
  const { childId, isPro, onComplete } = opts;

  const [phase, setPhase] = useState<Phase1214>("intro");
  const [basicIndex, setBasicIndex] = useState(0);
  const [proIndex, setProIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Diagnostic | null>(null);

  // Collected data
  const vibes = useRef<{ cardId: string; type: RiasecType; liked: boolean }[]>([]);
  const stealthEvents = useRef<StealthEvent1214[]>([]);
  const taskEnteredAt = useRef<number>(Date.now());

  // ── Progress ──
  const totalSteps = VIBE_CARDS.length + (isPro ? PRO_TASKS_1214.length : 0);
  const currentStep =
    phase === "basic" ? basicIndex
      : phase === "pro" ? VIBE_CARDS.length + proIndex
      : phase === "processing" || phase === "done" ? totalSteps
      : 0;
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  // ── Transitions ──
  const startBasic = useCallback(() => {
    setPhase("basic");
    setBasicIndex(0);
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

  // ── BASIC: Swipe ──
  const handleVibeSwipe = useCallback(
    async (liked: boolean) => {
      const card = VIBE_CARDS[basicIndex];
      if (!card) return;

      vibes.current.push({ cardId: card.id, type: card.type, liked });

      const nextIndex = basicIndex + 1;
      if (nextIndex < VIBE_CARDS.length) {
        setBasicIndex(nextIndex);
      } else {
        await advanceToPro();
      }
    },
    [basicIndex, advanceToPro]
  );

  // ── PRO: Answer ──
  const handleProAnswer = useCallback(
    async (optionId: number, erasedAggressive: boolean = false) => {
      const task = PRO_TASKS_1214[proIndex];
      if (!task) return;

      const opt = task.options.find((o) => o.id === optionId);
      const event: StealthEvent1214 = {
        taskId: task.id,
        enteredAt: taskEnteredAt.current,
        answeredAt: Date.now(),
        selectedOptionId: optionId,
        scoreMap: opt?.scoreMap || {},
        erasedAggressive,
      };
      stealthEvents.current.push(event);

      const nextIndex = proIndex + 1;
      if (nextIndex < PRO_TASKS_1214.length) {
        setProIndex(nextIndex);
        taskEnteredAt.current = Date.now();
      } else {
        await finishDiagnostic();
      }
    },
    [proIndex]
  );

  // ── Scoring ──
  const computeResults = useCallback(() => {
    // 1. RIASEC from basic
    const riasecCounts: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    vibes.current.forEach((v) => { if (v.liked) riasecCounts[v.type]++; });
    
    const sortedRiasec = (Object.entries(riasecCounts) as [RiasecType, number][])
      .sort((a, b) => b[1] - a[1]);
    const top2Riasec = sortedRiasec.slice(0, 2);
    const weakestRiasec = sortedRiasec.slice(-1)[0];

    // 2. PRO scores
    const proScores: Record<string, number> = {};
    let fastClicks = 0;
    let erasedCount = 0;
    let delayedAnswers = 0;

    stealthEvents.current.forEach((ev) => {
      // Score map
      for (const [k, v] of Object.entries(ev.scoreMap)) {
        proScores[k] = (proScores[k] || 0) + (v || 0);
      }
      // Stealth
      const latency = ev.answeredAt - ev.enteredAt;
      if (latency < 1000) fastClicks++; // e.g. < 1 sec is too fast
      if (latency > 8000) delayedAnswers++; // slower, indicates thinking/stress
      if (ev.erasedAggressive) erasedCount++;
    });

    const stealthProfile = 
      erasedCount > 1 ? "Высокий самоконтроль (Стирает агрессивные ответы)" :
      fastClicks > 4 ? "Импульсивность (Быстрое прокликивание)" :
      delayedAnswers > 5 ? "Стратегический/Осторожный (Долгая задержка)" : "Сбалансированный";

    const scores: Record<string, number> = { ...riasecCounts, ...proScores };

    return {
      scores,
      top2Riasec,
      weakestRiasec,
      proScores,
      stealthProfile,
      fastClicks,
      erasedCount
    };
  }, []);

  const processWithAI = useCallback(async (computed: ReturnType<typeof computeResults>) => {
    const topSkillsStr = computed.top2Riasec.map(t => RIASEC_MAP[t[0]]).join(", ");
    const weakSkillStr = RIASEC_MAP[computed.weakestRiasec[0]];

    const prompt = `Analyze diagnostic data for a 12-14 year old teenager.
BASIC (Vibe check): Top skills: ${topSkillsStr}. Weak area: ${weakSkillStr}.
${isPro ? `PRO (Hackathon simulation): Scores: ${JSON.stringify(computed.proScores)}. Stealth Analytics: ${computed.stealthProfile}` : ""}

Generate RAW JSON only. ${isPro ? "Include ALL fields" : "Include only base fields"}:
{
  "summary": "One short, plain Russian sentence, max 110 characters. No long clauses.",
  "recommendedConstellation": "Creative 2-word talent title in Russian (e.g. 'Креативный Предприниматель')"
  ${isPro ? `,
  "topStrengths": ["Top 3 skills in Russian (Hard or Soft)"],
  "developmentAreas": ["1-2 growth areas"],
  "intellectType": "Type of intelligence & recommended UNT (ЕНТ) profile in Russian",
  "personalityBehavior": "Personality pattern based on stealth data: ${computed.stealthProfile}. In Russian.",
  "careerArchetypes": ["3 future career vectors in Russian"],
  "parentAdvice": "Advice for parents in Russian"` : ""}
}`;

    return generateGeminiDiagnosticJson(prompt);
  }, [isPro]);

  const finishDiagnostic = useCallback(async () => {
    setPhase("processing");
    setIsProcessing(true);
    const computed = computeResults();

    let aiData: any = {};
    try {
      aiData = await processWithAI(computed);
    } catch (e) {
      aiData = {
        summary: "Сильная сторона подростка — аналитика и креативный подход.",
        recommendedConstellation: "Творческий аналитик",
        ...(isPro ? {
          topStrengths: ["Аналитическое мышление", "Креативность", "Лидерство"],
          developmentAreas: ["Организованность"],
          intellectType: "Аналитико-технический (ЕНТ: Физмат / Информатика)",
          personalityBehavior: computed.stealthProfile,
          careerArchetypes: ["IT Product Manager", "Системный аналитик", "Предприниматель"],
          parentAdvice: "Поддерживайте его интерес к технологиям."
        } : {})
      };
    }

    const diagnostic: Diagnostic = {
      childId,
      scores: computed.scores,
      summary: aiData.summary || "Хороший результат",
      recommendedConstellation: aiData.recommendedConstellation || "Аналитик",
      timestamp: new Date().toISOString(),
      tier: isPro ? "pro" : "basic",
      ageGroup: "12-14",
      rawMetadata: {
        fastClicks: computed.fastClicks,
        erasedCount: computed.erasedCount,
        stealthProfile: computed.stealthProfile,
      },
      ...(isPro ? {
        topStrengths: aiData.topStrengths,
        developmentAreas: aiData.developmentAreas,
        intellectType: aiData.intellectType,
        personalityBehavior: aiData.personalityBehavior,
        careerArchetypes: aiData.careerArchetypes,
        parentAdvice: aiData.parentAdvice,
      } : {})
    };

    setResults(diagnostic);
    try { await onComplete(diagnostic); } catch (e) {}
    setIsProcessing(false);
    setPhase("done");
  }, [childId, isPro, computeResults, processWithAI, onComplete]);

  return {
    phase,
    currentIndex: phase === "basic" ? basicIndex : proIndex,
    progress,
    currentCard: phase === "basic" ? VIBE_CARDS[basicIndex] : null,
    currentTask: phase === "pro" ? PRO_TASKS_1214[proIndex] : null,
    results,
    isProcessing,
    totalBasicCards: VIBE_CARDS.length,
    totalProTasks: PRO_TASKS_1214.length,

    startBasic,
    handleVibeSwipe,
    handleProAnswer,
    markTaskEntry: () => { taskEnteredAt.current = Date.now(); },
    finishDiagnostic
  };
}
