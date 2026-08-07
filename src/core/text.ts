/**
 * Pure text helpers: relative-time formatting, @mention / #hashtag parsing,
 * and small deterministic string-hashing helpers used to pick a stable
 * avatar color and initial for a given user/group/image seed.
 */

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 4 * WEEK_MS;

/**
 * Formats a timestamp relative to `now` the way a social feed typically
 * does: "now" under a minute, then minutes/hours/days/weeks, falling back
 * to a short calendar date once it's been about a month or more.
 */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);

  if (diff < MINUTE_MS) return 'now';
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}m`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}h`;
  if (diff < WEEK_MS) return `${Math.floor(diff / DAY_MS)}d`;
  if (diff < MONTH_MS) return `${Math.floor(diff / WEEK_MS)}w`;

  const date = new Date(timestamp);
  const nowDate = new Date(now);
  const sameYear = date.getFullYear() === nowDate.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

export type TextSpanType = 'text' | 'mention' | 'hashtag';

export interface TextSpan {
  type: TextSpanType;
  /** Raw text for a plain span, or the token including its @ / # prefix. */
  value: string;
}

const TOKEN_PATTERN = /[@#][A-Za-z0-9_]+/g;

/**
 * Splits free-form post/comment text into plain-text, @mention, and
 * #hashtag spans, preserving every character of the original string
 * across the returned spans (joining span values reproduces the input).
 */
export function parseRichText(input: string): TextSpan[] {
  const spans: TextSpan[] = [];
  const pattern = new RegExp(TOKEN_PATTERN);
  let lastIndex = 0;
  let match = pattern.exec(input);

  while (match !== null) {
    const token = match[0];
    if (!token) {
      break;
    }
    const start = match.index;

    if (start > lastIndex) {
      spans.push({ type: 'text', value: input.slice(lastIndex, start) });
    }
    spans.push({ type: token.startsWith('@') ? 'mention' : 'hashtag', value: token });
    lastIndex = start + token.length;
    match = pattern.exec(input);
  }

  if (lastIndex < input.length) {
    spans.push({ type: 'text', value: input.slice(lastIndex) });
  }
  if (spans.length === 0) {
    spans.push({ type: 'text', value: input });
  }

  return spans;
}

/** Simple deterministic 32-bit string hash (djb2-ish, Java `String#hashCode` style). */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Maps a string seed to a stable index in `[0, paletteLength)`. */
export function paletteIndexForKey(key: string, paletteLength: number): number {
  if (paletteLength <= 0) return 0;
  return hashString(key) % paletteLength;
}

/** Returns the uppercase first character of a name, or "?" for an empty name. */
export function initialsForName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}
