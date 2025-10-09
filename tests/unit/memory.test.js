//require('../../src/model/data/memory/index');

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
  listFragments,
} = require('../../src/model/data/memory/index');

describe('In-Memory Fragment DB', () => {
  const ownerId = 'user1';
  const fragmentId = 'frag1';
  const fragment = { id: fragmentId, ownerId, type: 'text/plain', size: 5 };
  const buffer = Buffer.from('hello');

  test('writeFragment and readFragment', async () => {
    await writeFragment(fragment);
    const result = await readFragment(ownerId, fragmentId);
    expect(result).toEqual(fragment);
  });

  test('writeFragmentData and readFragmentData', async () => {
    await writeFragmentData(ownerId, fragmentId, buffer);
    const result = await readFragmentData(ownerId, fragmentId);
    expect(result).toEqual(buffer);
  });

  test('listFragments returns something', async () => {
    const ownerId = 'user1';
    const fragmentId = 'frag1';
    const fragment = { id: fragmentId, ownerId, type: 'text/plain', size: 5 };

    await writeFragment(fragment);
    await writeFragmentData(ownerId, fragmentId, Buffer.from(''));

    const result = await listFragments(ownerId);

    expect(Array.isArray(result)).toBe(true);
  });

  test('listFragments returns expanded objects', async () => {
    await writeFragment(fragment);
    const expanded = await listFragments(ownerId, true);

    const parsed = expanded.map((f) => (typeof f === 'string' ? JSON.parse(f) : f));
    expect(parsed).toEqual(expect.arrayContaining([fragment]));
  });

  test('deleteFragment removes metadata and data', async () => {
    await writeFragment(fragment);
    await writeFragmentData(ownerId, fragmentId, buffer);

    await deleteFragment(ownerId, fragmentId);

    const meta = await readFragment(ownerId, fragmentId);
    const data = await readFragmentData(ownerId, fragmentId);

    expect(meta).toBeUndefined();
    expect(data).toBeUndefined();
  });

  test('readFragment for non-existent fragment returns undefined', async () => {
    const result = await readFragment(ownerId, 'nonexistent');
    expect(result).toBeUndefined();
  });

  test('readFragmentData for non-existent fragment returns undefined', async () => {
    const result = await readFragmentData(ownerId, 'nonexistent');
    expect(result).toBeUndefined();
  });

  test('writeFragmentData with empty buffer works', async () => {
    const emptyBuffer = Buffer.from('');
    await writeFragmentData(ownerId, fragmentId, emptyBuffer);
    const result = await readFragmentData(ownerId, fragmentId);
    expect(result).toEqual(emptyBuffer);
  });

  test('writeFragment with missing fields still serializes/deserializes', async () => {
    const partialFragment = { id: 'frag2', ownerId };
    await writeFragment(partialFragment);
    const result = await readFragment(ownerId, 'frag2');
    expect(result).toEqual(partialFragment);
  });

  test('listFragments for user with no fragments returns empty array', async () => {
    const result = await listFragments('newUser');
    expect(result).toEqual([]);
  });
});
