import { CVD, deltaE, simulatedLab } from '../lib/color.mjs';
import { resolveTheme, tokensJson } from '../lib/tokens.mjs';

// Smallest CIE76 distance between any two of data-1..6 that still counts as telling them apart.
// The legend always repeats the name and number next to each colour, so this guards against regressions
// rather than standing alone as the only signal.
export const MIN_DELTA_E = 12;

export default async function cvd() {
  const T = tokensJson();
  const lines = [];
  let ok = true;
  for (const { id } of T.color.themes) {
    const v = resolveTheme(T, id);
    const data = [1, 2, 3, 4, 5, 6].map((i) => v[`data-${i}`]);
    const parts = [];
    for (const [name, matrix] of Object.entries(CVD)) {
      const L = data.map((h) => simulatedLab(h, matrix));
      let min = Infinity;
      let pair = '';
      for (let i = 0; i < 6; i++) {
        for (let j = i + 1; j < 6; j++) {
          const d = deltaE(L[i], L[j]);
          if (d < min) {
            min = d;
            pair = `${i + 1}-${j + 1}`;
          }
        }
      }
      if (min < MIN_DELTA_E) ok = false;
      parts.push(`${name} ${min.toFixed(1)} (${pair})${min < MIN_DELTA_E ? ' FAIL' : ''}`);
    }
    lines.push(`${id.padEnd(11)} ${parts.join('  ')}`);
  }
  lines.unshift(
    `minimum pairwise CIE76 distance of data-1..6, normal and simulated deutan / protan / tritan vision; required >= ${MIN_DELTA_E}`,
  );
  return { ok, lines };
}
