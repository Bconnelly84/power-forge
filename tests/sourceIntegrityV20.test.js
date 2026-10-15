const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'App.js'), 'utf8');

test('every statically required local artwork file exists', () => {
  const refs = [...app.matchAll(/require\("(\.\/assets\/[^"\n]+)"\)/g)].map(match => match[1]);
  assert.ok(refs.length > 100, `expected broad bundled artwork catalog, got ${refs.length}`);
  const missing = refs.filter(ref => !fs.existsSync(path.join(root, ref.slice(2))));
  assert.deepEqual(missing, []);
});

test('Part Workshop exposes custom hex colors, shape details, emblem, drawing and preset editing', () => {
  for (const token of ['applyCustomHex', 'SHAPE DETAILS / ATTACHMENTS', 'CUSTOM EMBLEM / MARKING', 'editCustomPart', 'UPDATE SAVED CUSTOM PART', 'projectDrawingPoint']) {
    assert.ok(app.includes(token), `missing functional integration: ${token}`);
  }
});

test('backup export includes custom parts and restore merges them into local storage', () => {
  assert.match(app, /characters: saved, customParts/);
  assert.match(app, /AsyncStorage\.setItem\(CUSTOM_PARTS_KEY, JSON\.stringify\(nextCustomParts\)\)/);
});
