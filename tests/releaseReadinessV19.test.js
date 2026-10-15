const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { POWERS, getPower } = require('../src/powerCatalog');
const root = path.resolve(__dirname, '..');

test('v19 adds twelve uniquely named powers', () => {
  const names = ['Aegis Counter','Rift Scythe','Magma Treads','Prism Swarm','Thunderhoof','Pocket Tornado','Jelly Armor','Laser Pointer','Haunted Cape','Confetti Minefield','Echo Parry','Starforge Spear'];
  for (const name of names) assert.ok(getPower(name).name === name, `missing ${name}`);
  assert.equal(new Set(POWERS.map(p => p.name)).size, POWERS.length);
});

test('Android navigation bar is explicitly visible and uses app background', () => {
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
  assert.equal(app.android.edgeToEdgeEnabled, false);
  assert.equal(app.androidNavigationBar.visible, 'visible');
  assert.equal(app.androidNavigationBar.backgroundColor, app.backgroundColor);
});

test('new equipment SVG assets are bundled and valid XML roots', () => {
  const dir = path.join(root, 'assets', 'character-parts-v19');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  assert.ok(files.length >= 6);
  for (const file of files) assert.match(fs.readFileSync(path.join(dir,file),'utf8'), /^<svg\s/);
});
