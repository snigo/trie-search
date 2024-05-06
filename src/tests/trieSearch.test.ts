import { describe, it } from 'node:test';
import { TrieSearch } from 'src/index.js';
import { data, type TrieSearchMockData } from './mockData.js';
import assert from 'node:assert';

describe('Trie search class', () => {
  it('adds and searches through data with default setting', () => {
    const trie = new TrieSearch<TrieSearchMockData>();
    trie.addMany(data);
    const r1 = trie.search('apple');
    assert.strictEqual(r1.length, 3);
    assert.deepStrictEqual(
      r1.map(item => item.id),
      [1, 2, 6],
    );
    const r2 = trie.search('appl');
    assert.strictEqual(r2.length, 3);
    assert.deepStrictEqual(
      r2.map(item => item.id),
      [1, 2, 6],
    );
    const r3 = trie.search('aple');
    assert.strictEqual(r3.length, 0);
  });

  it('ignores added duplicates', () => {
    const trie = new TrieSearch<TrieSearchMockData>();
    trie.addMany(data);
    trie.add(data[0]!);
    const result = trie.search('549');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]?.id, 1);
  });

  it('ignores the case in default settings mode', () => {
    const trie = new TrieSearch<TrieSearchMockData>();
    trie.addMany(data);
    const r1 = trie.search('chip');
    const r2 = trie.search('cHiP');
    const r3 = trie.search('Chip');
    assert.strictEqual(r1.length, 2);
    assert.deepStrictEqual(r1, r2);
    assert.deepStrictEqual(r2, r3);
  });

  it('allows to search complete words only', () => {
    const trie = new TrieSearch<TrieSearchMockData>({
      excludePartial: true,
    });
    trie.addMany(data);
    const r1 = trie.search('apple');
    assert.strictEqual(r1.length, 3);
    assert.deepStrictEqual(
      r1.map(item => item.id),
      [1, 2, 6],
    );
    const r2 = trie.search('appl');
    assert.strictEqual(r2.length, 0);
  });

  it('allows to search in case sensitive manner', () => {
    const trie = new TrieSearch<TrieSearchMockData>({
      caseSensitive: true,
    });
    trie.addMany(data);
    const r1 = trie.search('apple');
    assert.strictEqual(r1.length, 1);
    assert.deepStrictEqual(
      r1.map(item => item.id),
      [1],
    );
    const r2 = trie.search('Apple');
    assert.strictEqual(r2.length, 3);
    assert.deepStrictEqual(
      r2.map(item => item.id),
      [1, 2, 6],
    );
  });

  it('allow to search by providing multiple words', () => {
    const trie = new TrieSearch<TrieSearchMockData>();
    trie.addMany(data);
    const r1 = trie.search('oil');
    const r2 = trie.search('perfume oil');
    const r3 = trie.search('non alcoholic perfume oil');
    assert.strictEqual(r1.length, 4);
    assert.strictEqual(r2.length, 2);
    assert.strictEqual(r3.length, 1);
  });

  it('allows custom stringify function', () => {
    const trie = new TrieSearch<TrieSearchMockData>({
      stringify: input => [input.id, input.brand].join(' '),
    });
    trie.addMany(data);
    assert.strictEqual(trie.search('oil').length, 0);
    assert.strictEqual(trie.search('apple').length, 3);
    const r3 = trie.search('1 apple');
    const r4 = trie.search('apple 2');
    assert.strictEqual(r3.length, 1);
    assert.strictEqual(r3[0]?.id, 1);
    assert.strictEqual(r4.length, 1);
    assert.strictEqual(r4[0]?.id, 2);
  });

  it('allows custom word matching function', () => {
    const trie = new TrieSearch<TrieSearchMockData>({
      // Ignore any digits
      matchWords: input => input.match(/[a-z]+/g) ?? [],
    });
    trie.addMany(data);
    const r1 = trie.search('239485238384758234765apple34598763956396534956');
    assert.strictEqual(r1.length, 3);
    const r2 = trie.search('1');
    assert.strictEqual(r2.length, 0);
  });

  it('supports international character sets by default', () => {
    const trie = new TrieSearch<TrieSearchMockData>();
    trie.addMany(data);
    const r1 = trie.search('åpple');
    const r2 = trie.search('äpplé');
    const r3 = trie.search('àpplê');
    const r4 = trie.search('ápplè');
    const r5 = trie.search('âpplë');
    const r6 = trie.search('ãpple');
    assert.strictEqual(r1.length, 3);
    assert.strictEqual(r2.length, 3);
    assert.strictEqual(r3.length, 3);
    assert.strictEqual(r4.length, 3);
    assert.strictEqual(r5.length, 3);
    assert.strictEqual(r6.length, 3);
  });

  it('allows custom replace patterns', () => {
    const trie = new TrieSearch<TrieSearchMockData>({
      replacePatterns: [
        {
          pattern: 'pp',
          alternate: 'p',
        },
      ],
    });
    trie.addMany(data);
    const r1 = trie.search('apple');
    const r2 = trie.search('aple');
    assert.strictEqual(r1.length, 3);
    assert.deepStrictEqual(r2, r1);
  });

  it('allows to ignore object keys', () => {
    const trie = new TrieSearch<TrieSearchMockData>({
      ignoreObjectKeys: true,
    });
    trie.addMany(data);
    const r1 = trie.search('price');
    assert.strictEqual(r1.length, 0);
    assert.strictEqual('price' in data[0]!, true);
  });
});
