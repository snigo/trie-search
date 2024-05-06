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
  ignoreObjectKeys?: boolean;
}
