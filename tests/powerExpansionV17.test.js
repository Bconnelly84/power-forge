const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { POWERS, getPower } = require('../src/powerCatalog');
const { getShowcaseMotion, MOTION_RULES } = require('../src/showcaseMotion');
const { SYNERGIES, getSynergy } = require('../src/battleEngine');
const effectsDir = path.join(__dirname, '..', 'assets', 'power-effects');

test('v17 expands the catalog beyond 100 unique powers', () => {
  assert.ok(POWERS.length >= 100, `expected at least 100 powers, got ${POWERS.length}`);
  assert.equal(new Set(POWERS.map((p) => p.name)).size, POWERS.length);
});

test('new v17 powers have counter hints and valid stats', () => {
  for (const name of ['Prism Lance', 'Thunder Cage', 'Pocket Orchestra', 'Existential Goose', 'Snack Portal']) {
    const power = getPower(name);
    assert.ok(power.description);
    assert.ok(power.counterHint);
    for (const stat of Object.values(power.stats)) assert.ok(stat >= 1 && stat <= 5);
  }
});

test('distinct visual effect profiles exist for the showcase', () => {
  const effectTypes = new Set(MOTION_RULES.map((rule) => rule.effect));
  for (const expected of ['beam', 'lightning', 'flame', 'frost', 'portal', 'swarm', 'bubble', 'comic', 'sonic', 'aura', 'healing', 'trail']) {
    assert.ok(effectTypes.has(expected), `missing effect profile ${expected}`);
    const file = path.join(effectsDir, `${expected}.svg`);
    assert.ok(fs.existsSync(file), `missing bundled effect art ${expected}`);
    assert.match(fs.readFileSync(file, 'utf8'), /<svg/);
  }
});

test('new power combinations are supported by battle synergies', () => {
  assert.ok(SYNERGIES.length >= 12);
  assert.equal(getSynergy(['Prism Lance', 'Mirror Clone']).name, 'Prism Rebound');
  assert.equal(getSynergy(['Snack Portal', 'Pocket Dimension']).name, 'Infinite Snack Loop');
});

test('showcase returns a descriptive visual treatment for new powers', () => {
  const prism = getShowcaseMotion('Prism Lance', 'Combat');
  assert.equal(prism.effect, 'beam');
  assert.ok(prism.effectName);
  const goose = getShowcaseMotion('Existential Goose', 'Chaos');
  assert.equal(goose.effect, 'swarm');
});
