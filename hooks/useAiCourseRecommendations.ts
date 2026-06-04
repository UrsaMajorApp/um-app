import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { PublicCourse } from '$hooks/usePublicData';
import { SCORE_TO_SKILLS } from '$hooks/usePublicData';
import { generateGeminiDiagnosticJson } from '$lib/geminiDiagnostics';
import type { Child } from '$types/child';
import type { Diagnostic } from '$types/diagnostic';

export interface RecommendedCourse extends PublicCourse {
  aiReason?: string;
}

interface CachedRecs {
  cacheKey: string;
  recs: { courseId: string; aiReason: string }[];
}

export function useAiCourseRecommendations(
  activeChild: Child | null,
  publicCourses: PublicCourse[],
) {
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeChild) {
      setRecommendations([]);
      setIsLoading(false);
      return;
    }

    // If no talent profile, fall back to default courses (first 3)
    if (!activeChild.talentProfile) {
      setRecommendations(publicCourses.slice(0, 3));
      setIsLoading(false);
      return;
    }

    const childId = activeChild.id;
    const profile = activeChild.talentProfile;
    const scores = profile.scores || {};

    // Create a cache key using childId, diagnostic timestamp, and course IDs list
    const courseIdsStr = publicCourses
      .map((c) => c.id)
      .sort()
      .join(',');
    const cacheKey = `ai_rec_${childId}_${profile.timestamp || ''}_${courseIdsStr}`;

    const loadRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try loading from AsyncStorage cache first
        const cacheStoreKey = `um_ai_rec_${childId}`;
        const cachedJson = await AsyncStorage.getItem(cacheStoreKey);
        if (cachedJson) {
          try {
            const parsed = JSON.parse(cachedJson) as CachedRecs;
            if (parsed.cacheKey === cacheKey) {
              const mapped = mapCachedRecs(parsed.recs, publicCourses);
              setRecommendations(mapped);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to parse cached recommendations:', e);
          }
        }

        // Cache miss: generate recommendations using Gemini
        const isGeminiEnabled = process.env.EXPO_PUBLIC_ENABLE_GEMINI_DIAGNOSTICS === 'true';
        if (!isGeminiEnabled) {
          throw new Error('Gemini recommendations disabled');
        }

        const simplifiedCourses = publicCourses.map((c) => ({
          id: c.id,
          title: c.title,
          skills: c.skills || [],
          description: c.description || '',
        }));

        const prompt = `You are an AI educational assistant. Analyze the child's diagnostic results and recommend the best courses from the available list of courses.

Child Info:
- Name: ${activeChild.name}
- Age: ${activeChild.age}
- Talent Profile Summary: ${profile.summary}
- Talent Constellation: ${profile.recommendedConstellation}
- Scores (talents/skills): ${JSON.stringify(scores)}
${profile.topStrengths ? `- Top Strengths: ${profile.topStrengths.join(', ')}` : ''}
${profile.developmentAreas ? `- Development Areas: ${profile.developmentAreas.join(', ')}` : ''}
${profile.careerArchetypes ? `- Career Archetypes: ${profile.careerArchetypes.join(', ')}` : ''}

Available Courses:
${JSON.stringify(simplifiedCourses)}

Select the top 3 most suitable courses for this child. For each selected course, write a short, warm, personalized explanation in Russian (max 100 characters, directed to the parent, referring to the child by name) explaining why it fits their profile.

Return ONLY a JSON object with this structure (no markdown wrapper, no extra text):
{
  "recommendations": [
    {
      "courseId": "course-uuid",
      "aiReason": "Этот курс поможет развивать креативность, которая проявилась у ${activeChild.name}."
    }
  ]
}`;

        const responseJson = await generateGeminiDiagnosticJson<{
          recommendations: { courseId: string; aiReason: string }[];
        }>(prompt);

        if (responseJson && Array.isArray(responseJson.recommendations)) {
          const mapped = mapCachedRecs(responseJson.recommendations, publicCourses);
          setRecommendations(mapped);

          // Save to cache
          const cacheData: CachedRecs = {
            cacheKey,
            recs: responseJson.recommendations,
          };
          await AsyncStorage.setItem(cacheStoreKey, JSON.stringify(cacheData));
        } else {
          throw new Error('Invalid response structure from Gemini');
        }
      } catch (err) {
        console.warn('AI recommendation failed, falling back to rule-based logic:', err);
        setError(err instanceof Error ? err : new Error(String(err)));

        // Rule-based fallback
        const fallbackRecs = getRuleBasedRecommendations(profile, publicCourses, activeChild.name);
        setRecommendations(fallbackRecs);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [activeChild, publicCourses]);

  return { recommendations, isLoading, error };
}

function mapCachedRecs(
  recs: { courseId: string; aiReason: string }[],
  publicCourses: PublicCourse[],
): RecommendedCourse[] {
  const courseMap = new Map(publicCourses.map((c) => [c.id, c]));
  const result: RecommendedCourse[] = [];

  for (const item of recs) {
    const course = courseMap.get(item.courseId);
    if (course) {
      result.push({
        ...course,
        aiReason: item.aiReason,
      });
    }
  }

  if (result.length === 0) {
    return publicCourses.slice(0, 3);
  }
  return result;
}

function getRuleBasedRecommendations(
  profile: Diagnostic,
  publicCourses: PublicCourse[],
  childName: string,
): RecommendedCourse[] {
  if (publicCourses.length === 0) return [];

  const scores = (profile.scores || {}) as Record<string, number>;
  const topTraits = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t);

  const wantedSkills = new Set(
    topTraits.flatMap((t) => SCORE_TO_SKILLS[t] ?? []).map((skill) => skill.toLowerCase()),
  );
  const matched = publicCourses.filter((c) =>
    (c.skills ?? []).some((skill) => wantedSkills.has(skill.toLowerCase())),
  );
  const list = matched.length > 0 ? matched : publicCourses;

  return list.slice(0, 3).map((c) => {
    const matchedSkills = (c.skills ?? []).filter((skill) =>
      wantedSkills.has(skill.toLowerCase()),
    );
    let aiReason = `Рекомендуется на основе интересов и способностей ребенка.`;
    if (matchedSkills.length > 0) {
      aiReason = `Поможет ${childName} развить навыки: ${matchedSkills.slice(0, 2).join(', ')}.`;
    }
    return {
      ...c,
      aiReason,
    };
  });
}
