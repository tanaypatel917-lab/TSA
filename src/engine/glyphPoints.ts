export function samplePoints(alpha: Uint8ClampedArray, w: number, h: number, n: number): Float32Array {
  const count = Math.max(0, Math.floor(n));
  const points = new Float32Array(count * 3);
  if (count === 0) return points;

  const filled: number[] = [];
  const width = Math.max(0, Math.floor(w));
  const height = Math.max(0, Math.floor(h));
  for (let index = 0; index < Math.min(alpha.length, width * height); index += 1) {
    if (alpha[index] > 128) filled.push(index);
  }

  const jitter = (index: number) => {
    let hash = Math.imul((index + 1) ^ 0x9e3779b9, 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return ((hash >>> 0) / 4294967296) * 0.24 - 0.12;
  };

  if (filled.length === 0) {
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      points[index * 3] = Math.cos(angle) * 0.8;
      points[index * 3 + 1] = Math.sin(angle) * 0.8;
      points[index * 3 + 2] = jitter(index);
    }
    return points;
  }

  const stride = filled.length >= count ? filled.length / count : 1;
  const scale = 2 / Math.max(width, height, 1);
  for (let index = 0; index < count; index += 1) {
    const pixel = filled[Math.floor(index * stride) % filled.length];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    points[index * 3] = (x + 0.5 - width / 2) * scale;
    points[index * 3 + 1] = (height / 2 - y - 0.5) * scale;
    points[index * 3 + 2] = jitter(index);
  }
  return points;
}
