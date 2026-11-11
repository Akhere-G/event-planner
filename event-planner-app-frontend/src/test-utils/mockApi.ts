import { vi } from "vitest";

type Handler = unknown | ((request: Request) => unknown | Promise<unknown>);

export interface RecordedRequest {
  method: string;
  path: string;
  body: unknown;
}

/**
 * Stubs global fetch with handlers keyed by "METHOD /path" (the path after
 * /api, without the query string). A function handler receives the request.
 * Anything unmatched answers 404 so a missing route fails loudly.
 */
export function mockApi(routes: Record<string, Handler>) {
  const requests: RecordedRequest[] = [];

  const fetchMock = vi.fn(async (input: Request) => {
    const url = new URL(input.url);
    const path = url.pathname.replace(/^\/api/, "");
    const key = `${input.method} ${path}`;
    const text = input.method === "GET" ? "" : await input.clone().text();
    requests.push({
      method: input.method,
      path,
      body: text ? JSON.parse(text) : undefined,
    });

    const handler = routes[key];
    const respond = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    if (handler === undefined) {
      return respond({ success: false, message: `No mock for ${key}` }, 404);
    }
    const body = typeof handler === "function" ? await handler(input) : handler;
    return body instanceof Response ? body : respond(body);
  });

  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, requests };
}
