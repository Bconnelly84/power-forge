const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'App.js'), 'utf8');
const packageJson = require('../package.json');
const appJson = require('../app.json');

test('v20 exposes independent part color, accent, pattern, transform, opacity and brush controls', () => {
  for (const token of ['PART COLOR / TINT', 'ACCENT COLOR', 'PATTERN', 'SIZE ·', 'ROTATION ·', 'OPACITY', 'BRUSH SIZE']) assert.ok(app.includes(token), `missing ${token}`);
  for (const pattern of ['Solid', 'Stripes', 'Dots', 'Circuit', 'Camo', 'Stars']) assert.ok(app.includes(`"${pattern}"`), `missing pattern ${pattern}`);
});

test('custom part presets can be saved, applied and deleted using offline local storage', () => {
  for (const token of ['CUSTOM_PARTS_KEY', 'saveCustomPart', 'applyCustomPart', 'deleteCustomPart', 'AsyncStorage.setItem(CUSTOM_PARTS_KEY']) assert.ok(app.includes(token), `missing ${token}`);
});

test('freehand drawing supports category tags, adjustable brush, undo and clear', () => {
  for (const token of ['category: activeCategory', 'brushSize={activePartStyle.brushSize}', 'onUndo=', 'Clear part']) assert.ok(app.includes(token), `missing ${token}`);
});

test('v20 app version and Android version code are advanced', () => {
  assert.equal(packageJson.version, '1.0.20');
  assert.equal(appJson.expo.version, '1.0.20');
  assert.equal(appJson.expo.android.versionCode, 16);
});
