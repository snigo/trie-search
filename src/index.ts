import { Trie } from '@gigwork/ds';

import type { TrieSearchOptions, TrieSearchReplaceRegex } from './types.js';
import {
  applyCaseSensitivity,
  applyReplacePatterns,
  DEFAULT_REPLACE_PATTERNS,
  defaultMatchWords,
  ignoreObjectKeysStringify,
  intersect,
} from './utils.js';

export class TrieSearch<V> {
  private trie = new Trie<V>();

  private caseSensitive: boolean;

  private excludePartial: boolean;

  private ignoreObjectKeys: boolean;

  private stringify: (input: V) => string;

  private replacePatterns: TrieSearchReplaceRegex[];

  private matchWords: (input: string) => string[];

  constructor(options?: TrieSearchOptions<V>) {
    this.caseSensitive = options?.caseSensitive ?? false;
    this.excludePartial = options?.excludePartial ?? false;
    this.ignoreObjectKeys = options?.ignoreObjectKeys ?? false;
    this.stringify =
      options?.stringify ??
      (this.ignoreObjectKeys ? ignoreObjectKeysStringify : JSON.stringify);
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
        trieNodeValues.complete.forEach(completeValue => {
          set.add(completeValue);
        });
        if (!this.excludePartial) {
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
