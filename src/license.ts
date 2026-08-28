const SLUG = 'personal-vocab-loop';
const KEY = `sb_license:${SLUG}`;
const CHECK_KEY = `${KEY}:check`;
const API = `https://api.sociobot.in/api/v1/products/${SLUG}`;

type Check = { valid: boolean; checkedAt: number; reason?: string };

export function captureLicenseFromUrl(): boolean {
  const url = new URL(location.href);
  const license = url.searchParams.get('license');
  if (!license) return false;
  localStorage.setItem(KEY, license);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function storedLicense(): string | null { return localStorage.getItem(KEY); }

export async function verifyLicense(force = false): Promise<Check> {
  const license = storedLicense();
  if (!license) return { valid: false, checkedAt: Date.now(), reason: 'none' };
  const cached = JSON.parse(localStorage.getItem(CHECK_KEY) || 'null') as Check | null;
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached;
  try {
    const response = await fetch(`${API}/verify?license=${encodeURIComponent(license)}`);
    const body = await response.json() as { valid?: boolean; reason?: string };
    const result = { valid: body.valid === true, reason: body.reason, checkedAt: Date.now() };
    localStorage.setItem(CHECK_KEY, JSON.stringify(result));
    return result;
  } catch {
    return cached || { valid: true, checkedAt: Date.now(), reason: 'offline' };
  }
}

export function restoreLicense(value: string) {
  localStorage.setItem(KEY, value.trim());
  localStorage.removeItem(CHECK_KEY);
}
