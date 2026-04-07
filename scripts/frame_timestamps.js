/**
 * GoodScore — Frame Timestamp Calculator
 *
 * Given a video duration (seconds), returns a sorted, deduplicated array
 * of timestamps (seconds) to extract frames from.
 *
 * Rules:
 *  - Anchors: always include 0s, 3s, duration-1s
 *  - If duration < 8s : [0, floor(duration/2), duration-1]  (3 frames only)
 *  - If duration  8-15s: middle frames every 3s  (start 5s, stop duration-2s)
 *  - If duration 15-30s: middle frames every 5s
 *  - If duration 30-60s: middle frames every 7s
 *  - If duration 60s+  : middle frames every 10s
 *  - Cap total frames at 12
 *  - All timestamps are integers (floored)
 */
function calculateFrameTimestamps(duration) {
  duration = Math.floor(duration); // work with integer seconds

  // Short video — 3 frames only
  if (duration < 8) {
    const mid = Math.floor(duration / 2);
    return [...new Set([0, mid, Math.max(0, duration - 1)])].sort((a, b) => a - b);
  }

  // Determine interval for middle frames
  let interval;
  if (duration <= 15)      interval = 3;
  else if (duration <= 30) interval = 5;
  else if (duration <= 60) interval = 7;
  else                     interval = 10;

  // Anchor frames
  const anchors = [0, 3, duration - 1];

  // Middle frames: start=5, stop=duration-2, step=interval
  const middle = [];
  for (let t = 5; t <= duration - 2; t += interval) {
    middle.push(t);
  }

  // Merge, deduplicate, sort
  let timestamps = [...new Set([...anchors, ...middle])].sort((a, b) => a - b);

  // Cap at 12 frames (keep first 11 + last anchor so the end is always included)
  if (timestamps.length > 12) {
    const last = timestamps[timestamps.length - 1];
    timestamps = timestamps.slice(0, 11);
    if (!timestamps.includes(last)) timestamps.push(last);
  }

  return timestamps;
}

// ---------------------------------------------------------------------------
// Quick self-test
// ---------------------------------------------------------------------------
const tests = [
  { duration: 5,   label: "5s (short)" },
  { duration: 7,   label: "7s (short boundary)" },
  { duration: 10,  label: "10s (8-15 range)" },
  { duration: 15,  label: "15s (8-15 boundary)" },
  { duration: 20,  label: "20s (15-30 range)" },
  { duration: 30,  label: "30s (15-30 boundary)" },
  { duration: 45,  label: "45s (30-60 range)" },
  { duration: 60,  label: "60s (30-60 boundary)" },
  { duration: 90,  label: "90s (60s+)" },
  { duration: 120, label: "120s (60s+ long)" },
];

console.log("=== Frame Timestamp Calculator — Self Test ===\n");
for (const { duration, label } of tests) {
  const ts = calculateFrameTimestamps(duration);
  console.log(`${label}`);
  console.log(`  frames (${ts.length}): [${ts.join(", ")}]`);
  console.log();
}

module.exports = { calculateFrameTimestamps };
