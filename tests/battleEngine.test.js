const test = require('node:test');
const assert = require('node:assert/strict');
const { DEMO_RIVAL, getSynergy, makeFighter, startBattle, nextRound } = require('../src/battleEngine');

test('battle starts with two fighters at full health', () => {
  const battle = startBattle({ name: 'Nova', abilities: ['Energy Blast'] }, DEMO_RIVAL);
  assert.equal(battle.player.hp, 100);
  assert.equal(battle.rival.hp, 100);
  assert.equal(battle.finished, false);
});

test('synergy is detected when all required powers are equipped', () => {
  assert.equal(getSynergy(['Super Speed', 'Fart Cannon']).name, 'Mach Toot');
  assert.equal(getSynergy(['Super Speed']), null);
});

test('fighter has safe defaults for missing fields', () => {
  const fighter = makeFighter({}, 'right');
  assert.equal(fighter.name, 'Unnamed Rival');
  assert.equal(fighter.hp, 100);
  assert.deepEqual(fighter.abilities, []);
});

test('a round reduces health and adds combat log entries', () => {
  const battle = startBattle({ name: 'Nova', abilities: ['Energy Blast'] }, { name: 'Rival', abilities: ['Super Strength'] });
  const next = nextRound(battle, () => 0.5);
  assert.equal(next.round, 1);
  assert.ok(next.player.hp < 100);
  assert.ok(next.rival.hp < 100);
  assert.ok(next.log.length > battle.log.length);
});

test('battle does not advance after completion', () => {
  const finished = { ...startBattle({ name: 'A' }, { name: 'B' }), finished: true, winner: 'A' };
  assert.equal(nextRound(finished), finished);
});

test('battle ends with a winner after enough rounds', () => {
  let battle = startBattle({ name: 'Nova', abilities: ['Super Strength', 'Fart Cannon', 'Super Speed'] }, { name: 'Rival', abilities: ['Itch Ray'] });
  for (let i = 0; i < 12 && !battle.finished; i++) battle = nextRound(battle, () => 0.5);
  assert.equal(battle.finished, true);
  assert.ok(battle.winner);
});


test('status effects apply and tick down without mutating the original battle', () => {
  const battle = startBattle({ name: 'Frost Nova', abilities: ['Glacier Bind'] }, { name: 'Rival', abilities: ['Super Strength'] });
  const next = nextRound(battle, () => 0.1);
  assert.ok(Array.isArray(next.player.statusEffects));
  assert.ok(Array.isArray(next.rival.statusEffects));
  assert.deepEqual(battle.player.statusEffects, []);
  assert.ok(next.log.some((line) => /frozen|slowed|damage|uses/i.test(line)));
});

test('shield absorbs incoming damage', () => {
  const battle = startBattle({ name: 'Shield', abilities: ['Prism Guard'] }, { name: 'Rival', abilities: ['Super Strength'] });
  battle.player.shield = 10;
  const next = nextRound(battle, () => 0.5);
  assert.ok(next.log.some((line) => /shield absorbs/i.test(line)));
});
