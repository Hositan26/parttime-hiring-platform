// Accepts only local return paths and prevents authentication redirect loops.
export const safeReturnPath = (value: string | null): string => {
  if (!value || [...value].some(character => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127) || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')
      || /^\/(login|register|oauth2|forgot-password|reset-password)(\/|\?|$)/.test(value)) return '/jobs';
  return value;
};

// Detects screens that require a valid authenticated session.
export const requiresSession = (path: string): boolean =>
  /^\/(admin|employer|profile|applied-jobs|verify-business|change-password)(\/|$)/.test(path);

// Matches server role names while accepting the standard Spring prefix.
export const hasAnyRole = (actual: string[], required: string[]): boolean =>
  required.some(role => actual.some(value => value.replace(/^ROLE_/, '') === role));
