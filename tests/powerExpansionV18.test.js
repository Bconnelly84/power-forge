const test = require('node:test');
const assert = require('node:assert/strict');
const { POWERS, getPower } = require('../src/powerCatalog');

test('v18 adds twelve unique powers for status effects and counters', () => {
  const expected = ['Ember Snare','Static Lock','Glacier Bind','Gravity Pin','Prism Guard','Cleanse Pulse','Venom Bloom','Sonic Stagger','Foam Avalanche','Dramatic Freeze Frame','Overclock','Second Wind'];
  assert.ok(POWERS.length >= 124);
  assert.equal(new Set(POWERS.map((p) => p.name)).size, POWERS.length);
  for (const name of expected) {
    const power = getPower(name);
    assert.notEqual(power.category, 'Unknown');
    assert.ok(power.description);
    assert.ok(power.counterHint);
  }
});
