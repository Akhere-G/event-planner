import { io, type Socket } from "socket.io-client";
import { anonymousAccessCodeStorageKey } from "../api/apiSlice";

function getSocketOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && /^https?:\/\//.test(apiUrl)) return new URL(apiUrl).origin;
  return window.location.origin;
}

function getAnonymousAccessCode(): string | undefined {
  try {
    const stored = localStorage.getItem(anonymousAccessCodeStorageKey);
    return stored ? JSON.parse(stored).anonymousAccessCode : undefined;
  } catch {
    return undefined;
  }
}

/** Browsers can't set headers on a websocket, so the anonymous code goes in `auth`. */
function createSocket(): Socket {
  const accessCode = getAnonymousAccessCode();

  return io(getSocketOrigin(), {
    transports: ["websocket"],
    withCredentials: true,
    auth: accessCode ? { access_code: accessCode } : {},
  });
}

let shared: { socket: Socket; refs: number } | null = null;

/**
 * One connection serves the whole app: the user's own room (invites,
 * membership) and whichever trip is open. It is closed when the last user
 * releases it, so the next one reconnects with whatever credentials exist then.
 */
export function acquireSocket(): Socket {
  if (!shared) shared = { socket: createSocket(), refs: 0 };
  shared.refs += 1;
  return shared.socket;
}

export function releaseSocket(socket: Socket) {
  if (shared?.socket !== socket) return;
  shared.refs -= 1;
  if (shared.refs > 0) return;

  socket.disconnect();
  shared = null;
}
