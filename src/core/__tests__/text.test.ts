import {
  formatRelativeTime,
  hashString,
  initialsForName,
  paletteIndexForKey,
  parseRichText,
} from '../text';

describe('formatRelativeTime', () => {
  // Fixed reference instant: Jan 31 2026, 12:00:00 UTC. Using noon (rather
  // than a time near midnight) keeps the calendar-fallback assertions
  // below stable regardless of the host machine's timezone.
  const NOW = Date.UTC(2026, 0, 31, 12, 0, 0);
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it('shows "now" for anything under a minute old, including exactly 0', () => {
    expect(formatRelativeTime(NOW, NOW)).toBe('now');
    expect(formatRelativeTime(NOW - 30 * 1000, NOW)).toBe('now');
  });

  it('floors to whole minutes under an hour', () => {
    // 5 * 60_000 = 300_000ms -> 300_000 / 60_000 = 5 exactly.
    expect(formatRelativeTime(NOW - 5 * MINUTE, NOW)).toBe('5m');
    // 59 minutes stays in the minutes bucket (< HOUR_MS).
    expect(formatRelativeTime(NOW - 59 * MINUTE, NOW)).toBe('59m');
  });

  it('floors to whole hours under a day', () => {
    expect(formatRelativeTime(NOW - 3 * HOUR, NOW)).toBe('3h');
    expect(formatRelativeTime(NOW - 23 * HOUR, NOW)).toBe('23h');
  });

  it('floors to whole days under a week', () => {
    expect(formatRelativeTime(NOW - 2 * DAY, NOW)).toBe('2d');
    expect(formatRelativeTime(NOW - 6 * DAY, NOW)).toBe('6d');
  });

  it('floors to whole weeks under ~4 weeks', () => {
    // 10 days / 7 = 1.43 -> floors to 1 week.
    expect(formatRelativeTime(NOW - 10 * DAY, NOW)).toBe('1w');
    // 20 days / 7 = 2.86 -> floors to 2 weeks.
    expect(formatRelativeTime(NOW - 20 * DAY, NOW)).toBe('2w');
  });

  it('falls back to a short date once ~4 weeks (28 days) have passed', () => {
    // 29 days ago is Jan 2 2026 - same calendar year as NOW, so the year
    // is omitted from the formatted string.
    const jan2 = Date.UTC(2026, 0, 2, 12, 0, 0);
    expect(formatRelativeTime(jan2, NOW)).toBe('Jan 2');
  });

  it('includes the year once the date falls in a different calendar year', () => {
    const dec1LastYear = Date.UTC(2025, 11, 1, 12, 0, 0);
    expect(formatRelativeTime(dec1LastYear, NOW)).toBe('Dec 1, 2025');
  });

  it('treats a timestamp in the future the same as "now" rather than going negative', () => {
    expect(formatRelativeTime(NOW + HOUR, NOW)).toBe('now');
  });
});

describe('parseRichText', () => {
  it('returns a single text span when there are no tokens', () => {
    expect(parseRichText('no tokens here')).toEqual([{ type: 'text', value: 'no tokens here' }]);
  });

  it('returns a single empty text span for an empty string', () => {
    expect(parseRichText('')).toEqual([{ type: 'text', value: '' }]);
  });

  it('splits a leading mention from trailing text', () => {
    expect(parseRichText('hello @nora how are you')).toEqual([
      { type: 'text', value: 'hello ' },
      { type: 'mention', value: '@nora' },
      { type: 'text', value: ' how are you' },
    ]);
  });

  it('parses a hashtag, a mention, and trailing punctuation that is not part of either token', () => {
    // Hand trace: "#launchday" (10 chars, index 0-10) -> " is here " (9
    // chars, index 10-19) -> "@team" (5 chars, index 19-24) -> "!!" is
    // left over because "!" is outside [A-Za-z0-9_] and stops the token.
    expect(parseRichText('#launchday is here @team!!')).toEqual([
      { type: 'hashtag', value: '#launchday' },
      { type: 'text', value: ' is here ' },
      { type: 'mention', value: '@team' },
      { type: 'text', value: '!!' },
    ]);
  });

  it('emits back-to-back tokens with no text span between them', () => {
    expect(parseRichText('@a#b')).toEqual([
      { type: 'mention', value: '@a' },
      { type: 'hashtag', value: '#b' },
    ]);
  });

  it('does not emit an empty leading or trailing text span around a lone token', () => {
    expect(parseRichText('@solo')).toEqual([{ type: 'mention', value: '@solo' }]);
  });

  it('every span value concatenates back to the original input', () => {
    const input = "team standup @norakade, don't forget #retro notes @theobram!";
    const spans = parseRichText(input);
    expect(spans.map((span) => span.value).join('')).toBe(input);
  });
});

describe('hashString / paletteIndexForKey', () => {
  it('hashes a single character as its char code (hand-traced)', () => {
    // hash = 0 * 31 + charCodeAt('a') = 97
    expect(hashString('a')).toBe(97);
  });

  it('hashes two characters using the running hash * 31 + code formula (hand-traced)', () => {
    // step1: hash = 0 * 31 + 97 ('a') = 97
    // step2: hash = 97 * 31 + 98 ('b') = 3007 + 98 = 3105
    expect(hashString('ab')).toBe(3105);
  });

  it('is a pure function: same input always maps to the same hash', () => {
    expect(hashString('norakade')).toBe(hashString('norakade'));
  });

  it('maps a key into range using modulo (hand-traced)', () => {
    // hashString('a') = 97, 97 % 6 = 1 (16 * 6 = 96, remainder 1)
    expect(paletteIndexForKey('a', 6)).toBe(1);
    // hashString('ab') = 3105, 3105 % 6 = 3 (517 * 6 = 3102, remainder 3)
    expect(paletteIndexForKey('ab', 6)).toBe(3);
  });

  it('always returns an index within [0, paletteLength)', () => {
    const keys = ['norakade', 'theobram', 'priyacodes', 'callumrhee', 'wrenito', 'trail-runners'];
    for (const key of keys) {
      const index = paletteIndexForKey(key, 8);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(8);
    }
  });

  it('returns 0 for a non-positive palette length instead of dividing by zero', () => {
    expect(paletteIndexForKey('anything', 0)).toBe(0);
  });
});

describe('initialsForName', () => {
  it('returns the uppercased first character', () => {
    expect(initialsForName('Mira')).toBe('M');
    expect(initialsForName('nora')).toBe('N');
  });

  it('trims surrounding whitespace before taking the first character', () => {
    expect(initialsForName('  nora')).toBe('N');
  });

  it('returns "?" for an empty or whitespace-only name', () => {
    expect(initialsForName('')).toBe('?');
    expect(initialsForName('   ')).toBe('?');
  });
});
