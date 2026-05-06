import type { Href, useRouter } from 'expo-router';

export type AppHref = Extract<Href, string>;
export type AppRouter = ReturnType<typeof useRouter>;
