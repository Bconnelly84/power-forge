const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const art = path.join(root, 'assets', 'character-art');
const groups = {
  hair: ['hair_spiky','hair_silver','hair_flame','hair_curls','hair_neon'],
  face: ['face_stubble','face_cyber','face_alien','face_ice','face_shadow'],
  mask: ['mask_crimson','mask_night','mask_gold','mask_skull','mask_arc'],
  helmet: ['helmet_sentinel','helmet_horned','helmet_royal','helmet_recon','helmet_visor'],
};
test('v13 includes PNG artwork and editable SVG source for all 20 new variants', () => {
  for (const names of Object.values(groups)) for (const name of names) {
    assert.ok(fs.existsSync(path.join(art, `${name}.png`)), `missing PNG ${name}`);
    assert.ok(fs.existsSync(path.join(art, `${name}.svg`)), `missing SVG ${name}`);
  }
});
test('new part options are registered in the character creator', () => {
  const app = fs.readFileSync(path.join(root, 'App.js'), 'utf8');
  for (const label of ['Spiked Hair','Silver Sweep','Rugged Face','Cyber Faceplate','Crimson Mask','Arc-Tech Mask','Sentinel Helmet','Full Visor Helmet']) assert.ok(app.includes(label), `missing option ${label}`);
  for (const name of Object.values(groups).flat()) assert.ok(app.includes(`${name}: require(`), `asset not wired: ${name}`);
});
