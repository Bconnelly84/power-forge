const test = require('node:test');
const assert = require('node:assert/strict');
const { getShowcaseMotion } = require('../src/showcaseMotion');

test('projectile powers use a strike-style motion profile', () => {
  const motion = getShowcaseMotion('Energy Blast', 'Combat');
  assert.equal(motion.move, 'dash');
  assert.ok(motion.particles >= 3);
});

test('teleport powers use a blink-style motion profile', () => {
  assert.equal(getShowcaseMotion('Teleportation', 'Movement').move, 'blink');
});

test('silly powers receive a chaotic motion profile', () => {
  assert.equal(getShowcaseMotion('Uncontrollable Dance', 'Mind').move, 'shake');
  assert.match(getShowcaseMotion('Fart Cannon', 'Gross-Out').label, /STRIKE/);
});

test('unknown powers still receive a safe default profile', () => {
  const motion = getShowcaseMotion('Mystery Power', 'Unknown');
  assert.ok(['rise', 'blink', 'dash', 'pulse', 'shake', 'surge'].includes(motion.move));
  assert.ok(motion.particles >= 1);
});
