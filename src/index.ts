import { Trie } from '@gigwork/ds';

import type {
  JSONValue,
  TrieSearchOptions,
  TrieSearchReplaceRegex,
} from './types.js';
import {
  applyCaseSensitivity,
  applyReplacePatterns,
  DEFAULT_REPLACE_PATTERNS,
  defaultMatchWords,
  intersect,
} from './utils.js';

export class TrieSearch<V extends JSONValue> {
  private trie = new Trie<V>();

  private caseSensitive: boolean;

  private excludePartial: boolean;

  private stringify: (input: V) => string;

  private replacePatterns: TrieSearchReplaceRegex[];

  private matchWords: (input: string) => string[];

  constructor(options?: TrieSearchOptions<V>) {
    this.caseSensitive = options?.caseSensitive ?? false;
    this.excludePartial = options?.excludePartial ?? false;
    this.stringify = options?.stringify ?? JSON.stringify;
    this.replacePatterns =
      options?.replacePatterns?.map(rp => ({
        regex: new RegExp(rp.pattern, 'gi'),
        alternate: rp.alternate,
      })) ?? DEFAULT_REPLACE_PATTERNS;
    this.matchWords = options?.matchWords ?? defaultMatchWords;
  }

  add(value: V) {
    const index = applyCaseSensitivity(
      applyReplacePatterns(this.stringify(value), this.replacePatterns),
      this.caseSensitive,
    );
    this.trie.addMany(this.matchWords(index), value);
    return this;
  }

  addMany(values: V[]) {
    values.forEach(value => {
      this.add(value);
    });
  }

  clear() {
    this.trie.clear();
  }

  search(input: string) {
    const index = applyCaseSensitivity(
      applyReplacePatterns(input, this.replacePatterns),
      this.caseSensitive,
    );
    const sets: Set<V>[] = [];
    for (const word of this.matchWords(index)) {
      const trieNodeValues = this.trie.getValues(word);
      if (trieNodeValues) {
        const set = new Set<V>();
        if (trieNodeValues.complete !== undefined) {
          set.add(trieNodeValues.complete);
        }
        if (!this.excludePartial && trieNodeValues.partial.length) {
          trieNodeValues.partial.forEach(partialValue => {
            set.add(partialValue);
          });
        }
        if (!set.size) return [];
        sets.push(set);
      }
    }
    return intersect(sets);
  }
}
