// Pin the timezone so date-based assertions (relative time formatting,
// calendar-fallback formatting) are deterministic no matter where the
// test suite runs.
process.env.TZ = 'UTC';
