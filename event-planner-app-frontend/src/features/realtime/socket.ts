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
export function createTripSocket(): Socket {
  const accessCode = getAnonymousAccessCode();

  return io(getSocketOrigin(), {
    transports: ["websocket"],
    withCredentials: true,
    auth: accessCode ? { access_code: accessCode } : {},
  });
}
