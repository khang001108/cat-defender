"use client";

interface AnimatedSpriteProps {
  src: string;
  frames: number;
  fps?: number;
  loop?: boolean;
  facing?: "left" | "right";
  className?: string;
  playKey?: number; // bump this to restart a one-shot (non-looping) animation
}

/**
 * Renders a horizontal frame-strip PNG (equal-width cells) as a flipbook animation
 * using a CSS steps() background-position animation. No per-frame React re-renders —
 * the browser compositor drives it, so it stays smooth even during other UI updates.
 */
export default function AnimatedSprite({
  src,
  frames,
  fps = 12,
  loop = true,
  facing = "right",
  className,
  playKey = 0,
}: AnimatedSpriteProps) {
  const duration = frames / fps;

  return (
    <div
      key={playKey}
      className={className}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${frames * 100}% 100%`,
        backgroundRepeat: "no-repeat",
        transform: facing === "left" ? "scaleX(-1)" : undefined,
        animation: `sprite-play ${duration}s steps(${frames - 1}) ${loop ? "infinite" : "forwards"}`,
      }}
    />
  );
}
