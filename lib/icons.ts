import { Feather } from '@expo/vector-icons';
import type { FeatherIconName } from '$types/icons';

export function featherIconName(
  value: string | null | undefined,
  fallback: FeatherIconName,
): FeatherIconName {
  return value && value in Feather.glyphMap ? (value as FeatherIconName) : fallback;
}
