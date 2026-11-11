const STORAGE_KEY = "dismissed_ai_proposals";

export const readDismissedProposals = (): number[] =>
  JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as number[];

export const saveDismissedProposals = (ids: number[]) =>
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
