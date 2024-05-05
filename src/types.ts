export interface TrieSearchReplacePattern {
  pattern: string;
  alternate: string;
}

export interface TrieSearchReplaceRegex {
  regex: RegExp;
  alternate: string;
}

export interface TrieSearchOptions<V> {
  caseSensitive?: boolean;
  stringify?: (input: V) => string;
  replacePatterns?: TrieSearchReplacePattern[];
  matchWords?: (input: string) => string[];
  excludePartial?: boolean;
}

export type JSONValue =
  | string
  | number
  | null
  | boolean
  | JSONObject
  | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue | undefined;
}

export type JSONArray = Array<JSONValue | undefined>;
