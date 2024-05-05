import type { TrieSearchReplaceRegex } from './types.js';

export const DEFAULT_REPLACE_PATTERNS: TrieSearchReplaceRegex[] = [
  {
    regex: /[åäàáâã]/gi,
    alternate: 'a',
  },
  {
    regex: /[èéêë]/gi,
    alternate: 'e',
  },
  {
    regex: /[ìíîï]/gi,
    alternate: 'i',
  },
  {
    regex: /[òóôõö]/gi,
    alternate: 'o',
  },
  {
    regex: /[ùúûü]/gi,
    alternate: 'u',
  },
  {
    regex: /[æ]/gi,
    alternate: 'ae',
  },
];

export function defaultMatchWords(input: string) {
  return input.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
}

export function applyReplacePatterns(
  input: string,
  patterns: TrieSearchReplaceRegex[],
) {
  let output = input;
  patterns.forEach(({ regex, alternate }) => {
    output = output.replace(regex, alternate);
  });
  return output;
}

export function applyCaseSensitivity(input: string, caseSensitive: boolean) {
  return !caseSensitive ? input.toLocaleLowerCase() : input;
}

export function intersect<V>(sets: Set<V>[]): V[] {
  const output: V[] = [];
  let minSet!: Set<V>;
  sets.forEach(set => {
    if (!minSet || set.size < minSet.size) {
      minSet = set;
    }
  });
  if (!minSet?.size) return output;

  for (const value of minSet.values()) {
    if (sets.every(set => set.has(value))) {
      output.push(value);
    }
  }
  return output;
}
