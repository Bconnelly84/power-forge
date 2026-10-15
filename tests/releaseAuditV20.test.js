const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'App.js'), 'utf8');
const appJson = require('../app.json');
const packageJson = require('../package.json');

test('exact illustrated assets take precedence over generic fallback matching', () => {
  for (const category of ['head', 'hair', 'face', 'mask', 'helmet', 'torso', 'arms', 'legs', 'boots', 'accessory']) {
    assert.match(app, new RegExp(`artFor\\("${category}", [A-Za-z]+\\) \\|\\| \\(`), `${category} renderer must check exact artwork before fallback`);
  }
  assert.doesNotMatch(app, /artFor\("(?:head|hair|face|mask|helmet|torso|arms|legs|boots|accessory)",\s*\w+\)\s*\|\|\s*\//, 'avoid the || /regex/ ? precedence bug');
});

test('new v19 weapons and accessories have a visible preview fallback', () => {
  for (const label of ['Starforge Spear', 'Rift Scythe', 'Aegis Shield', 'Twin Plasma Daggers', 'Thunder Maul', 'Void Chakram', 'Arc Bow', 'Magma Chain', 'Frost Sabre', 'Photon Whip', 'Gravity Hammer', 'Prism Staff']) {
    assert.ok(app.includes(`"${label}"`), `${label} should be selectable`);
  }
  assert.ok(app.includes('const weaponGlyph ='), 'weapon preview mapping should exist');
  assert.ok(app.includes('styles.weaponOverlay'), 'weapon preview should render on character');
});

test('safe area provider wraps app content and release versions stay aligned', () => {
  assert.ok(app.includes('import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"'));
  assert.ok(app.indexOf('<SafeAreaProvider>') < app.indexOf('<SafeAreaView style={styles.safe}>'));
  assert.equal(packageJson.version, '1.0.20');
  assert.equal(appJson.expo.version, '1.0.20');
  assert.equal(appJson.expo.android.versionCode, 16);
});

test('no duplicate character state write remains in saveCharacter', () => {
  assert.doesNotMatch(app, /setSaved\(next\);\s*setSaved\(next\);/);
});
