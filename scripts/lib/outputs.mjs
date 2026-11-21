import { renderCss, renderJson, tokensJson } from './tokens.mjs';

export function outputs() {
  const T = tokensJson();
  return {
    'dist/tokens.json': renderJson(T),
    'dist/tokens.css': renderCss(T),
  };
}
