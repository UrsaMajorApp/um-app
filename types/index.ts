// Types index: переэкспортирует общие TypeScript-типы из папки types.
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
