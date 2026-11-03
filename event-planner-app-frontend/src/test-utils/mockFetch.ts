import { vi } from "vitest";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Stubs global fetch to resolve once with the given JSON body. */
export function mockFetchOnce(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(body, status));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Stubs global fetch to resolve with each JSON body in order, one per call. */
export function mockFetchSequence(
  responses: Array<{ body: unknown; status?: number }>,
) {
  const fetchMock = vi.fn();
  responses.forEach(({ body, status = 200 }) => {
    fetchMock.mockResolvedValueOnce(jsonResponse(body, status));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Stubs global fetch to resolve once with the backend's error envelope. */
export function mockFetchError(
  message: string,
  status = 400,
  error?: unknown,
) {
  return mockFetchOnce({ success: false, message, error }, status);
}

/**
 * Stubs global fetch with a response that only resolves once `resolve` is
 * called, so a test can assert loading UI before letting the request finish.
 */
export function deferredFetch() {
  let resolve!: (response: { body: unknown; status?: number }) => void;
  const promise = new Promise<{ body: unknown; status?: number }>((res) => {
    resolve = res;
  });
  const fetchMock = vi
    .fn()
    .mockImplementation(() =>
      promise.then(({ body, status = 200 }) => jsonResponse(body, status)),
    );
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, resolve };
}
