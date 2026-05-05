import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { GameId } from "../components/games/gameCatalog";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type GameIqResult = {
  game_id: GameId;
  iq_points: number;
  game_score: number | null;
  completed_at: string;
};

type RecordGameResultParams = {
  gameId: GameId;
  iqPoints: number;
  gameScore?: number | null;
};

const localResultsKey = (userId: string) => `um_youth_game_results:${userId}`;

async function loadLocalResults(userId: string): Promise<GameIqResult[]> {
  const raw = await AsyncStorage.getItem(localResultsKey(userId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveLocalResults(userId: string, results: GameIqResult[]) {
  await AsyncStorage.setItem(localResultsKey(userId), JSON.stringify(results));
}

async function hasSupabaseSession() {
  if (!supabase || !isSupabaseConfigured) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

function sumIq(results: Pick<GameIqResult, "iq_points">[]) {
  return results.reduce((sum, result) => sum + Number(result.iq_points || 0), 0);
}

export function useYouthGameIq() {
  const { user } = useAuth();
  const [totalIq, setTotalIq] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setTotalIq(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (await hasSupabaseSession()) {
      const { data, error } = await supabase!
        .from("youth_game_results")
        .select("iq_points")
        .eq("user_id", user.id);

      setTotalIq(error || !data ? 0 : sumIq(data));
      setLoading(false);
      return;
    }

    const localResults = await loadLocalResults(user.id);
    setTotalIq(sumIq(localResults));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordGameResult = useCallback(
    async ({ gameId, iqPoints, gameScore = null }: RecordGameResultParams) => {
      if (!user?.id || iqPoints <= 0) return { success: false };

      const completedAt = new Date().toISOString();

      if (await hasSupabaseSession()) {
        const { error } = await supabase!.from("youth_game_results").insert({
          user_id: user.id,
          game_id: gameId,
          iq_points: iqPoints,
          game_score: gameScore,
          completed_at: completedAt,
        });

        if (error) {
          console.warn("Failed to save youth game IQ result", error);
          return { success: false, error };
        }
      } else {
        const localResults = await loadLocalResults(user.id);
        await saveLocalResults(user.id, [
          ...localResults,
          {
            game_id: gameId,
            iq_points: iqPoints,
            game_score: gameScore,
            completed_at: completedAt,
          },
        ]);
      }

      await refresh();
      return { success: true };
    },
    [refresh, user?.id],
  );

  return { totalIq, loading, refresh, recordGameResult };
}
