// The image type a file really is, from its first bytes, so a file is never stored or served as an
// image it is not. SVG is left out: it can carry scripts.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SIGNATURES: { type: string; matches: (bytes: Buffer) => boolean }[] = [
  {
    type: 'image/png',
    matches: (b) =>
      b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  {
    type: 'image/jpeg',
    matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    type: 'image/gif',
    matches: (b) => ['GIF87a', 'GIF89a'].includes(b.toString('latin1', 0, 6)),
  },
  {
    type: 'image/webp',
    matches: (b) =>
      b.toString('latin1', 0, 4) === 'RIFF' &&
      b.toString('latin1', 8, 12) === 'WEBP',
  },
];

export function detectImageType(bytes: Buffer): string | null {
  return SIGNATURES.find((signature) => signature.matches(bytes))?.type ?? null;
}
