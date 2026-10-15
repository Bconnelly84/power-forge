const test = require('node:test');
const assert = require('node:assert/strict');
const { POWERS, getPower, summarizeAbilities } = require('../src/powerCatalog');

test('power catalog has a broad set of uniquely named abilities', () => {
  assert.ok(POWERS.length >= 55);
  assert.equal(new Set(POWERS.map((power) => power.name)).size, POWERS.length);
});

test('every power has a category, description, visual, and bounded stats', () => {
  for (const power of POWERS) {
    assert.ok(power.category);
    assert.ok(power.description);
    assert.ok(power.glyph);
    assert.match(power.color, /^#[0-9A-F]{6}$/i);
    for (const stat of ['power', 'speed', 'defense']) {
      assert.ok(power.stats[stat] >= 1 && power.stats[stat] <= 5);
    }
  }
});

test('power lookup returns catalog data and safely handles unknown powers', () => {
  assert.equal(getPower('Fart Cannon').category, 'Gross-Out');
  assert.equal(getPower('Not Real').category, 'Unknown');
});

test('ability summary reflects serious and chaotic loadouts', () => {
  const serious = summarizeAbilities(['Energy Blast', 'Force Field']);
  const chaotic = summarizeAbilities(['Fart Cannon', 'Duck Summoning', 'Mild Inconvenience']);
  assert.ok(serious.power > 0);
  assert.equal(serious.chaos, 0);
  assert.equal(chaotic.chaos, 5);
});

test('empty ability loadout has zeroed ratings', () => {
  assert.deepEqual(summarizeAbilities([]), { power: 0, speed: 0, defense: 0, chaos: 0 });
});
