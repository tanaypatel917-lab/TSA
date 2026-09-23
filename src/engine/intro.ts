export const INTRO_KEY = "wordplay:intro:v1";
export const INTRO_RETURN_KEY = "wordplay:intro:return:v1";

export function hasSeenIntro(storage?: Pick<Storage, "getItem">): boolean {
  try { return !!(storage ?? window.localStorage).getItem(INTRO_KEY); }
  catch { return true; }
}

export function markIntroSeen(storage?: Pick<Storage, "setItem">): boolean {
  try { (storage ?? window.localStorage).setItem(INTRO_KEY, new Date().toISOString()); return true; }
  catch { return false; }
}

export function rememberIntroReturn(path: string, storage?: Pick<Storage, "setItem">): void {
  try {
    if (path.startsWith("/") && !path.startsWith("/intro")) (storage ?? window.sessionStorage).setItem(INTRO_RETURN_KEY, path);
  } catch {}
}

export function introReturnPath(storage?: Pick<Storage, "getItem">): string {
  try {
    const path = (storage ?? window.sessionStorage).getItem(INTRO_RETURN_KEY);
    return path?.startsWith("/") && !path.startsWith("/intro") ? path : "/";
  } catch { return "/"; }
}

export function clearIntroReturn(storage?: Pick<Storage, "removeItem">): void {
  try { (storage ?? window.sessionStorage).removeItem(INTRO_RETURN_KEY); }
  catch {}
}
