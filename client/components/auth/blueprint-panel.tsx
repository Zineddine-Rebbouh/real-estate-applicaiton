"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function BlueprintPanel({ className }: { className?: string }) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const frame = window.requestAnimationFrame(() => setIsAnimating(true));
    return () => window.cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-12",
        className,
      )}
    >
      {/* Architectural line-art illustration */}
      <svg
        viewBox="0 0 800 1000"
        className="w-full h-full max-w-lg opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <style>
            {`
              .blueprint-line {
                fill: none;
                stroke: white;
                stroke-width: 1.5;
                stroke-linecap: round;
                stroke-linejoin: round;
              }
              ${
                !prefersReducedMotion
                  ? `
              .blueprint-line {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: draw 2s ease-out forwards;
              }
              .blueprint-line:nth-child(1) { animation-delay: 0s; }
              .blueprint-line:nth-child(2) { animation-delay: 0.1s; }
              .blueprint-line:nth-child(3) { animation-delay: 0.2s; }
              .blueprint-line:nth-child(4) { animation-delay: 0.3s; }
              .blueprint-line:nth-child(5) { animation-delay: 0.4s; }
              .blueprint-line:nth-child(6) { animation-delay: 0.5s; }
              .blueprint-line:nth-child(7) { animation-delay: 0.6s; }
              .blueprint-line:nth-child(8) { animation-delay: 0.7s; }
              .blueprint-line:nth-child(9) { animation-delay: 0.8s; }
              .blueprint-line:nth-child(10) { animation-delay: 0.9s; }
              .blueprint-line:nth-child(n+11) { animation-delay: 1s; }

              @keyframes draw {
                to {
                  stroke-dashoffset: 0;
                }
              }
              `
                  : ""
              }
            `}
          </style>
        </defs>

        {/* Building elevation - front facade */}
        <g className="building-front">
          {/* Ground floor outline */}
          <path
            className="blueprint-line"
            d="M 150 850 L 150 650 L 650 650 L 650 850"
          />

          {/* Second floor */}
          <path
            className="blueprint-line"
            d="M 150 650 L 150 500 L 650 500 L 650 650"
          />

          {/* Third floor */}
          <path
            className="blueprint-line"
            d="M 150 500 L 150 350 L 650 350 L 650 500"
          />

          {/* Roof line */}
          <path className="blueprint-line" d="M 100 350 L 400 200 L 700 350" />

          {/* Windows - ground floor */}
          <path
            className="blueprint-line"
            d="M 200 700 L 200 800 L 280 800 L 280 700 Z"
          />
          <path
            className="blueprint-line"
            d="M 360 700 L 360 800 L 440 800 L 440 700 Z"
          />
          <path
            className="blueprint-line"
            d="M 520 700 L 520 800 L 600 800 L 600 700 Z"
          />

          {/* Windows - second floor */}
          <path
            className="blueprint-line"
            d="M 200 550 L 200 630 L 280 630 L 280 550 Z"
          />
          <path
            className="blueprint-line"
            d="M 360 550 L 360 630 L 440 630 L 440 550 Z"
          />
          <path
            className="blueprint-line"
            d="M 520 550 L 520 630 L 600 630 L 600 550 Z"
          />

          {/* Windows - third floor */}
          <path
            className="blueprint-line"
            d="M 200 400 L 200 480 L 280 480 L 280 400 Z"
          />
          <path
            className="blueprint-line"
            d="M 360 400 L 360 480 L 440 480 L 440 400 Z"
          />
          <path
            className="blueprint-line"
            d="M 520 400 L 520 480 L 600 480 L 600 400 Z"
          />

          {/* Vertical divisions */}
          <path className="blueprint-line" d="M 320 850 L 320 650" />
          <path className="blueprint-line" d="M 480 850 L 480 650" />
          <path className="blueprint-line" d="M 320 650 L 320 350" />
          <path className="blueprint-line" d="M 480 650 L 480 350" />

          {/* Door */}
          <path
            className="blueprint-line"
            d="M 370 850 L 370 730 L 430 730 L 430 850"
          />

          {/* Roof details */}
          <path className="blueprint-line" d="M 150 350 L 400 220" />
          <path className="blueprint-line" d="M 650 350 L 400 220" />

          {/* Dimension lines */}
          <path
            className="blueprint-line"
            d="M 100 870 L 700 870 M 100 860 L 100 880 M 700 860 L 700 880"
            style={{ opacity: 0.5 }}
          />
        </g>
      </svg>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
