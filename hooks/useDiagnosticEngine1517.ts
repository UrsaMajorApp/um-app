/**
 * useDiagnosticEngine1517.ts
 *
 * Engine for 15-17 module ("Архитекторы").
 * BASIC: 24 swipe cards (Career Anchors)
 * PRO: 30 OS tasks (Mail, Slack, Trello) with Stealth Analytics
 */

import { useCallback, useRef, useState } from "react";
import {
  ANCHOR_MAP,
  CAREER_CARDS,
  PRO_TASKS_1517,
  type AnchorType,
  type StealthEvent1517
} from "$data/diagnosticData1517";
import { generateGeminiDiagnosticJson } from "$lib/geminiDiagnostics";
import type { Diagnostic } from "$models/types";

export type Phase1517 = "intro" | "basic" | "pro" | "processing" | "done";

export function useDiagnosticEngine1517(opts: {
  childId: string;
  userId: string;
  isPro: boolean;
  onComplete: (diagnostic: Diagnostic) => Promise<void>;
}) {
  const { childId, isPro, onComplete } = opts;

  const [phase, setPhase] = useState<Phase1517>("intro");
  const [basicIndex, setBasicIndex] = useState(0);
  const [proIndex, setProIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Diagnostic | null>(null);

  // Collected data
  const basicVotes = useRef<
    { cardId: string; anchor: AnchorType; liked: boolean; latency: number }[]
  >([]);
  const stealthEvents = useRef<StealthEvent1517[]>([]);
  const taskEnteredAt = useRef<number>(Date.now());

  // ── Progress ──
  const totalSteps = CAREER_CARDS.length + (isPro ? PRO_TASKS_1517.length : 0);
  const currentStep =
    phase === "basic"
      ? basicIndex
      : phase === "pro"
        ? CAREER_CARDS.length + proIndex
        : phase === "processing" || phase === "done"
          ? totalSteps
          : 0;
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  // ── Transitions ──
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

  // ── BASIC: Swipe ──
  const handleCareerSwipe = useCallback(
    async (liked: boolean) => {
      const card = CAREER_CARDS[basicIndex];
      if (!card) return;

      const latency = Date.now() - taskEnteredAt.current;
      basicVotes.current.push({
        cardId: card.id,
        anchor: card.anchor,
        liked,
        latency,
      });

      const nextIndex = basicIndex + 1;
      if (nextIndex < CAREER_CARDS.length) {
        setBasicIndex(nextIndex);
        taskEnteredAt.current = Date.now();
      } else {
        await advanceToPro();
      }
    },
    [basicIndex, advanceToPro],
  );

  // ── PRO: Answer ──
  const handleProAnswer = useCallback(
    async (optionId: number, erasedOrFrantic: boolean = false) => {
      const task = PRO_TASKS_1517[proIndex];
      if (!task) return;

      const opt = task.options.find((o) => o.id === optionId);
      const event: StealthEvent1517 = {
        taskId: task.id,
        enteredAt: taskEnteredAt.current,
        answeredAt: Date.now(),
        selectedOptionId: optionId,
        scoreMap: opt?.scoreMap || {},
        erasedOrFrantic,
      };
      stealthEvents.current.push(event);

      const nextIndex = proIndex + 1;
      if (nextIndex < PRO_TASKS_1517.length) {
        setProIndex(nextIndex);
        taskEnteredAt.current = Date.now();
      } else {
        await finishDiagnostic();
      }
    },
    [proIndex],
  );

  // ── Scoring ──
  const computeResults = useCallback(() => {
    // 1. Career Anchors from basic (with Stealth Analytics: Latency Math)
    const anchorCounts: Record<AnchorType, number> = {
      Autonomy: 0,
      Stability: 0,
      Mastery: 0,
      Management: 0,
      Entrepreneurship: 0,
      Service: 0,
      Challenge: 0,
      Lifestyle: 0,
    };
    basicVotes.current.forEach((v) => {
      if (v.liked) {
        let weight = 1.0;
        if (v.latency < 2000) weight = 1.2; // Быстро и уверенно (K_latency)
        if (v.latency > 8000) weight = 0.8; // Долго сомневался (K_latency)
        anchorCounts[v.anchor] += weight;
      }
    });

    const sortedAnchors = (
      Object.entries(anchorCounts) as [AnchorType, number][]
    ).sort((a, b) => b[1] - a[1]);
    const top3Anchors = sortedAnchors.slice(0, 3);
    const weakestAnchor = sortedAnchors.slice(-1)[0];

    // 2. PRO scores
    const proScores: Record<string, number> = {};
    let fastClicks = 0; // Decision Latency < 1s
    let erasedCount = 0; // Self-Correction
    let franticCount = 0; // Stress Response in UI (simulated)

    stealthEvents.current.forEach((ev) => {
      for (const [k, v] of Object.entries(ev.scoreMap)) {
        proScores[k] = (proScores[k] || 0) + (v || 0);
      }
      const latency = ev.answeredAt - ev.enteredAt;
      if (latency < 1000) {
        fastClicks++;
        proScores.ONET_Attention = (proScores.ONET_Attention || 0) - 5;
      }
      if (ev.erasedOrFrantic) {
        // If it was a Slack task, it's a self-correction. If Trello, it's frantic clicks.
        if (ev.taskId.startsWith("P1") || ev.taskId.startsWith("P20")) {
          erasedCount++;
        } else {
          franticCount++;
        }
      }
    });

    const stealthProfile =
      franticCount > 1
        ? "Склонен к панике при жестких дедлайнах (Высокий риск выгорания)"
        : erasedCount > 1
          ? "Высокий EQ (Обдумывает резкие ответы перед отправкой)"
          : fastClicks > 4
            ? "Низкое внимание к деталям (Игнорирует длинные тексты)"
            : "Ответственный Исполнитель (Стрессоустойчив, сбалансирован)";

    const scores: Record<string, number> = { ...anchorCounts, ...proScores };

    return {
      scores,
      top3Anchors,
      weakestAnchor,
      proScores,
      stealthProfile,
      fastClicks,
      franticCount,
    };
  }, []);

  const processWithAI = useCallback(
    async (computed: ReturnType<typeof computeResults>) => {
      const topSkillsStr = computed.top3Anchors
        .map((t) => ANCHOR_MAP[t[0]])
        .join(", ");
      const weakSkillStr = ANCHOR_MAP[computed.weakestAnchor[0]];

      const prompt = `Analyze diagnostic data for a 15-17 year old teenager ("Architects" group).
BASIC (Career Anchors): Top drivers: ${topSkillsStr}. Weak area: ${weakSkillStr}.
${isPro ? `PRO (Office Simulation): Scores: ${JSON.stringify(computed.proScores)}. Stealth Analytics: ${computed.stealthProfile}` : ""}

Generate RAW JSON only. ${isPro ? "Include ALL fields. Write pragmatically for 11th graders." : "Include only base fields."}:
{
  "summary": "One short, plain Russian sentence, max 110 characters. No long clauses.",
  "recommendedConstellation": "Professional 2-word talent title in Russian (e.g. 'Data Scientist')"
  ${
    isPro
      ? `,
  "topStrengths": ["Top 3 Hard/Soft skills in Russian"],
  "developmentAreas": ["1-2 growth areas (e.g., Attention to routine)"],
  "intellectType": "Type of intelligence & recommended UNT (ЕНТ) profile in Russian",
  "personalityBehavior": "Personality pattern and Burnout Risk based on stealth data: ${computed.stealthProfile}. In Russian.",
  "careerArchetypes": ["3 future career vectors based on Shain anchors and UNT"],
  "parentAdvice": "Pragmatic advice for parents in Russian regarding university prep and burnout prevention"`
      : ""
  }
}`;

      return generateGeminiDiagnosticJson(prompt);
    },
    [isPro],
  );

  const finishDiagnostic = useCallback(async () => {
    setPhase("processing");
    setIsProcessing(true);
    const computed = computeResults();

    let aiData: any = {};
    try {
      aiData = await processWithAI(computed);
    } catch (e) {
      aiData = {
        summary: "Сильная сторона подростка — самоорганизация и лидерство.",
        recommendedConstellation: "Менеджер Проектов",
        ...(isPro
          ? {
              topStrengths: [
                "Стрессоустойчивость",
                "Командная работа",
                "Аналитическое мышление",
              ],
              developmentAreas: ["Внимание к рутинным документам"],
              intellectType:
                "Аналитико-Математический (ЕНТ: Физмат / Информатика)",
              personalityBehavior: computed.stealthProfile,
              careerArchetypes: [
                "Data Scientist",
                "Backend-разработчик",
                "Продакт-менеджер",
              ],
              parentAdvice:
                "Поддерживайте фокус на технических навыках. Риск выгорания низкий, подросток хорошо справляется со стрессом.",
            }
          : {}),
      };
    }

    const diagnostic: Diagnostic = {
      childId,
      scores: computed.scores,
      summary: aiData.summary || "Сильный профиль",
      recommendedConstellation: aiData.recommendedConstellation || "Аналитик",
      timestamp: new Date().toISOString(),
      tier: isPro ? "pro" : "basic",
      ageGroup: "15-17",
      rawMetadata: {
        fastClicks: computed.fastClicks,
        franticCount: computed.franticCount,
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
    } catch (e) {}
    setIsProcessing(false);
    setPhase("done");
  }, [childId, isPro, computeResults, processWithAI, onComplete]);

  return {
    phase,
    currentIndex: phase === "basic" ? basicIndex : proIndex,
    progress,
    currentCard: phase === "basic" ? CAREER_CARDS[basicIndex] : null,
    currentTask: phase === "pro" ? PRO_TASKS_1517[proIndex] : null,
    results,
    isProcessing,
    totalBasicCards: CAREER_CARDS.length,
    totalProTasks: PRO_TASKS_1517.length,

    startBasic,
    handleCareerSwipe,
    handleProAnswer,
    markTaskEntry: () => {
      taskEnteredAt.current = Date.now();
    },
    finishDiagnostic,
  };
}
