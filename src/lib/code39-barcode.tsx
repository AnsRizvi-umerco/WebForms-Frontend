import { encodeCode39 } from "@/lib/code39";

export function Code39Barcode({ value, className }: { value: string; className?: string }) {
  const pattern = encodeCode39(value);
  const narrow = 2;
  const wide = 5;
  let x = 0;
  const bars: Array<{ x: number; width: number }> = [];

  for (let index = 0; index < pattern.length; index += 1) {
    const width = pattern[index] === "w" ? wide : narrow;
    if (index % 2 === 0) bars.push({ x, width });
    x += width;
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${x} 70`}
      role="img"
      aria-label={value}
      preserveAspectRatio="none"
    >
      {bars.map((bar, index) => (
        <rect key={`${bar.x}-${index}`} x={bar.x} y="0" width={bar.width} height="70" fill="#111827" />
      ))}
    </svg>
  );
}