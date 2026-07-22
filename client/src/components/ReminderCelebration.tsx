/*
 * ReminderCelebration — a tiny, self-contained confetti burst shown when the
 * family ticks off the last of today's reminders on the Home plan card.
 * Pure CSS keyframes (transform + opacity only), no dependencies. The parent
 * mounts it conditionally for ~2.6s; it renders nothing for users who prefer
 * reduced motion (they still get the "All done" line from the parent).
 */

const PIECES = [
  { emoji: "🎉", left: "6%", delay: "0ms", drift: "-18px", size: "15px" },
  { emoji: "🐾", left: "16%", delay: "120ms", drift: "14px", size: "13px" },
  { emoji: "✨", left: "27%", delay: "40ms", drift: "-10px", size: "12px" },
  { emoji: "🎊", left: "38%", delay: "180ms", drift: "20px", size: "15px" },
  { emoji: "🐾", left: "49%", delay: "80ms", drift: "-22px", size: "12px" },
  { emoji: "✨", left: "58%", delay: "220ms", drift: "10px", size: "14px" },
  { emoji: "🎉", left: "68%", delay: "20ms", drift: "-14px", size: "13px" },
  { emoji: "🐾", left: "78%", delay: "160ms", drift: "18px", size: "14px" },
  { emoji: "✨", left: "88%", delay: "100ms", drift: "-8px", size: "12px" },
  { emoji: "🎊", left: "94%", delay: "260ms", drift: "-16px", size: "13px" },
];

export default function ReminderCelebration() {
  return (
    <div
      className="celebration-burst pointer-events-none absolute inset-x-0 -top-2 h-0 overflow-visible"
      aria-hidden
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="celebration-piece absolute"
          style={
            {
              left: p.left,
              fontSize: p.size,
              animationDelay: p.delay,
              "--drift": p.drift,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
