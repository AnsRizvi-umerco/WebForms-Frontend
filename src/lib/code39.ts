const CODE39_MAP: Record<string, string> = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  "*": "nwnnwnwnn"
};

export function encodeCode39(value: string): string {
  const payload = `*${value.toUpperCase().replace(/[^0-9A-Z. \-$/+%]/g, "")}*`;
  return payload
    .split("")
    .map((char) => CODE39_MAP[char] ?? CODE39_MAP["-"])
    .join("n");
}

export function code39Bars(
  value: string,
  narrow = 2,
  wide = 5
): { x: number; width: number; totalWidth: number }[] {
  const pattern = encodeCode39(value);
  let x = 0;
  const bars: Array<{ x: number; width: number; totalWidth: number }> = [];

  for (let index = 0; index < pattern.length; index += 1) {
    const width = pattern[index] === "w" ? wide : narrow;
    if (index % 2 === 0) bars.push({ x, width, totalWidth: 0 });
    x += width;
  }

  return bars.map((bar) => ({ ...bar, totalWidth: x }));
}