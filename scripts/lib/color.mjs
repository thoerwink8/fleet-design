// WCAG 2 contrast with alpha compositing, and CIE76 distances under simulated colour-vision deficiency.

const parse = (h) => {
  const s = h.replace('#', '');
  const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1;
  return { r: parseInt(s.slice(0, 2), 16), g: parseInt(s.slice(2, 4), 16), b: parseInt(s.slice(4, 6), 16), a };
};
const over = (f, b) => {
  const F = parse(f);
  const B = parse(b);
  return { r: F.r * F.a + B.r * (1 - F.a), g: F.g * F.a + B.g * (1 - F.a), b: F.b * F.a + B.b * (1 - F.a) };
};
export const hex = (c) => `#${[c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
export const flatten = (fg, bg) => hex(over(fg, bg));
const channel = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (c) => 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);

export function ratio(fg, bg) {
  const ground = over(bg, '#ffffff');
  const text = over(fg, hex(ground));
  const a = luminance(text) + 0.05;
  const b = luminance(ground) + 0.05;
  return a > b ? a / b : b / a;
}

// Machado, Oliveira and Fernandes (2009), severity 1.
export const CVD = {
  normal: null,
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};
const lin = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
function lab([r, g, b]) {
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
export function simulatedLab(h, matrix) {
  const c = parse(h);
  const l = [c.r, c.g, c.b].map(lin);
  if (!matrix) return lab(l);
  return lab(matrix.map((row) => Math.max(0, Math.min(1, row[0] * l[0] + row[1] * l[1] + row[2] * l[2]))));
}
export const deltaE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
