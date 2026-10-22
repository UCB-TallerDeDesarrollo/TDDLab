import { useState } from "react";

export function isSafari(userAgent: string): boolean {
  return (
    /AppleWebKit/i.test(userAgent) &&
    /Version\/.*Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|OPiOS|Android/i.test(userAgent)
  );
}

// These probes check this origin, not Safari preferences or third-party cookies.
export function hasBlockedSafariStorage(): boolean {
  if (typeof window === "undefined" || !isSafari(navigator.userAgent))
    return false;

  const randomSuffix = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  const key = `tddlab_storage_probe_${Date.now()}_${randomSuffix}`;
  let cookiesAvailable = false;
  let storageAvailable = false;
  try {
    document.cookie = `${key}=1; Path=/; SameSite=Lax`;
    cookiesAvailable = document.cookie
      .split(";")
      .some((cookie) => cookie.trim() === `${key}=1`);
  } catch {
    cookiesAvailable = false;
  } finally {
    try {
      document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
    } catch {
      /* Storage denied. */
    }
  }
  try {
    window.localStorage.setItem(key, "1");
    storageAvailable = window.localStorage.getItem(key) === "1";
  } catch {
    storageAvailable = false;
  } finally {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* Storage denied. */
    }
  }
  return !cookiesAvailable || !storageAvailable;
}

export function useSafariStorage() {
  const [open, setOpen] = useState(hasBlockedSafariStorage);
  const [retryFailed, setRetryFailed] = useState(false);

  const retry = () => {
    if (hasBlockedSafariStorage()) {
      setRetryFailed(true);
      return;
    }
    window.location.reload();
  };

  return { open, retryFailed, retry, close: () => setOpen(false) };
}
