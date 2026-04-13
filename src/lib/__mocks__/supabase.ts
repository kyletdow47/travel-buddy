/**
 * Manual mock for src/lib/supabase.ts
 * Used automatically by Jest when jest.mock('../../lib/supabase') is called.
 */

type MockResult = { data: unknown; error: unknown };

const resultsQueue: MockResult[] = [];

/** Set a single mock result (clears any queued results). */
export function __setMockResult(data: unknown, error: unknown = null): void {
  resultsQueue.length = 0;
  resultsQueue.push({ data, error });
}

/** Enqueue a result for sequential Supabase calls within a single function. */
export function __enqueueMockResult(data: unknown, error: unknown = null): void {
  resultsQueue.push({ data, error });
}

/** Reset all mocks and queued results. */
export function __resetMocks(): void {
  resultsQueue.length = 0;
  storageMockError = null;
  storagePublicUrl = 'https://example.com/storage/test.jpg';
  mockFrom.mockClear();
  mockStorageFrom.mockClear();
}

function getNextResult(): MockResult {
  if (resultsQueue.length > 0) {
    return resultsQueue.shift()!;
  }
  return { data: null, error: null };
}

/** Creates a chainable query builder that resolves as a PromiseLike. */
function createQueryBuilder(): Record<string, unknown> {
  const builder: Record<string, unknown> = {};

  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'upsert',
    'eq',
    'order',
    'single',
    'maybeSingle',
  ];

  for (const method of methods) {
    builder[method] = jest.fn(() => builder);
  }

  // PromiseLike: when the chain is awaited, resolve with the next queued result
  builder.then = (
    onfulfilled?: ((value: MockResult) => unknown) | null,
    onrejected?: ((reason: unknown) => unknown) | null,
  ) => Promise.resolve(getNextResult()).then(onfulfilled, onrejected);

  return builder;
}

const mockFrom = jest.fn(() => createQueryBuilder());

// --- Storage mock ---
let storageMockError: unknown = null;
let storagePublicUrl = 'https://example.com/storage/test.jpg';

export function __setStorageUploadError(error: unknown): void {
  storageMockError = error;
}

export function __setStoragePublicUrl(url: string): void {
  storagePublicUrl = url;
}

const mockStorageFrom = jest.fn(() => ({
  upload: jest.fn(() =>
    storageMockError
      ? Promise.resolve({ data: null, error: storageMockError })
      : Promise.resolve({ data: { path: 'test.jpg' }, error: null }),
  ),
  getPublicUrl: jest.fn(() => ({
    data: { publicUrl: storagePublicUrl },
  })),
}));

export const supabase = {
  from: mockFrom,
  storage: { from: mockStorageFrom },
};
