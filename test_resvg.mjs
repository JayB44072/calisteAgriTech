import { Resvg } from '@resvg/resvg-js';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>`;
try {
  const r = new Resvg(svg);
  const p = r.render().asPng();
  console.log('resvg ok, bytes:', p.length);
} catch(e) {
  console.error('resvg error:', e.message);
}
