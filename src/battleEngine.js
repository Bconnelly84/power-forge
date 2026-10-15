const { getPower, summarizeAbilities } = require('./powerCatalog');

const DEMO_RIVAL = {
  id: 'power-forge-demo-rival',
  name: 'Baron Thunderpants',
  alignment: 'Villain',
  color: '#E4485D',
  parts: { head: 'Skull Helm', torso: 'Heavy Armor', arms: 'Power Gauntlets', legs: 'Combat Armor', boots: 'Heavy Boots', back: 'Jet Pack' },
  abilities: ['Super Strength', 'Fart Cannon', 'Duck Summoning'],
};

const SYNERGIES = [
  { powers: ['Super Speed', 'Fart Cannon'], name: 'Mach Toot', bonus: 8, line: 'hits at supersonic stink velocity' },
  { powers: ['Duck Summoning', 'Rubber Duck Barrage'], name: 'DUCKPOCALYPSE', bonus: 10, line: 'calls in an unreasonable number of ducks' },
  { powers: ['Teleportation', 'Force Punch'], name: 'Blink-and-Bonk', bonus: 7, line: 'teleports behind the target for a surprise hit' },
  { powers: ['Itch Ray', 'Uncontrollable Dance'], name: 'Disco Dermatology', bonus: 7, line: 'combines itching and involuntary dance moves' },
  { powers: ['Ice Breath', 'Super Strength'], name: 'Glacier Haymaker', bonus: 6, line: 'lands a freezing, superpowered punch' },
  { powers: ['Invisibility', 'Force Punch'], name: 'Now You Get Bonked', bonus: 6, line: 'strikes from nowhere' },
  { powers: ['Banana Peel Generation', 'Super Speed'], name: 'Slipstream', bonus: 5, line: 'turns banana peels into a high-speed hazard' },
  { powers: ['Prism Lance', 'Mirror Clone'], name: 'Prism Rebound', bonus: 8, line: 'splits a beam through a reflected double' },
  { powers: ['Thunder Cage', 'Storm Herald'], name: 'Storm Lockdown', bonus: 9, line: 'locks the arena inside a crackling storm' },
  { powers: ['Meteor Fist', 'Comet Dive'], name: 'Meteor Impact', bonus: 10, line: 'combines a comet dive with a meteor-powered strike' },
  { powers: ['Frost Halo', 'Crystal Garden'], name: 'Crystal Winter', bonus: 8, line: 'encases the field in a crystalline frost burst' },
  { powers: ['Hologram Parade', 'Echo Decoy'], name: 'Infinite Misdirection', bonus: 7, line: 'fills the arena with impossible afterimages' },
  { powers: ['Aggressive Glitter', 'Confetti Comet'], name: 'Party Singularity', bonus: 6, line: 'detonates an absurdly sparkly celebration' },
  { powers: ['Nanite Swarm', 'Hard-Light Constructs'], name: 'Instant Arsenal', bonus: 8, line: 'assembles a glowing weapon from a cloud of nanites' },
  { powers: ['Dramatic Wind', 'Flight'], name: 'Cape Physics', bonus: 5, line: 'uses a perfectly timed gust for a theatrical aerial strike' },
  { powers: ['Snack Portal', 'Pocket Dimension'], name: 'Infinite Snack Loop', bonus: 5, line: 'opens a pocket portal full of unpredictable snacks' },
];

function getSynergy(abilities = []) {
  const owned = new Set(abilities);
  return SYNERGIES.find((combo) => combo.powers.every((power) => owned.has(power))) || null;
}

function makeFighter(character = {}, side = 'left') {
  const abilities = Array.isArray(character.abilities) ? character.abilities : [];
  const stats = summarizeAbilities(abilities);
  return {
    id: character.id || `${side}-fighter`,
    name: character.name || (side === 'left' ? 'Unnamed Champion' : 'Unnamed Rival'),
    alignment: character.alignment || 'Original',
    color: character.color || (side === 'left' ? '#6C63FF' : '#E4485D'),
    abilities,
    hp: 100,
    maxHp: 100,
    stats,
    statusEffects: [],
    shield: 0,
  };
}

function startBattle(playerCharacter, rivalCharacter = DEMO_RIVAL) {
  return {
    round: 0,
    finished: false,
    winner: null,
    player: makeFighter(playerCharacter, 'left'),
    rival: makeFighter(rivalCharacter, 'right'),
    log: [`${playerCharacter?.name || 'Your champion'} faces ${rivalCharacter?.name || 'the rival'}!`, 'Tap FIGHT NEXT ROUND to begin.'],
  };
}

function applyStatus(defender, effect, duration, log, sourceName) {
  const existing = defender.statusEffects.find((item) => item.type === effect);
  if (existing) existing.turns = Math.max(existing.turns, duration);
  else defender.statusEffects.push({ type: effect, turns: duration, source: sourceName });
  const labels = { burning: 'burning', stunned: 'stunned', slowed: 'slowed', frozen: 'frozen', shielded: 'shielded' };
  log.push(`${defender.name} is ${labels[effect] || effect}!`);
}

function strike(attacker, defender, random = Math.random, log = []) {
  const synergy = getSynergy(attacker.abilities);
  const chosen = attacker.abilities.length
    ? getPower(attacker.abilities[Math.floor(random() * attacker.abilities.length)])
    : getPower('Super Strength');
  const variance = Math.floor(random() * 7);
  const isStunned = attacker.statusEffects.some((effect) => effect.type === 'stunned' || effect.type === 'frozen');
  if (isStunned) {
    log.push(`${attacker.name} cannot act because of a status effect.`);
    return null;
  }
  const isSlowed = attacker.statusEffects.some((effect) => effect.type === 'slowed');
  const rawDamage = 5 + chosen.stats.power * 2 + Math.floor(attacker.stats.speed / 2) + variance + (synergy ? synergy.bonus : 0);
  let damage = Math.max(3, Math.min(28, rawDamage - Math.floor(defender.stats.defense / 2)));
  if (isSlowed) damage = Math.max(2, damage - 3);
  if (defender.shield > 0) {
    const absorbed = Math.min(defender.shield, damage);
    defender.shield -= absorbed;
    damage -= absorbed;
    log.push(`${defender.name}'s shield absorbs ${absorbed} damage.`);
  }
  defender.hp = Math.max(0, defender.hp - damage);
  const abilityName = synergy ? synergy.name : chosen.name;
  const detail = synergy ? `${synergy.line}!` : chosen.description;
  log.push(`${attacker.name} uses ${abilityName} on ${defender.name} for ${damage} damage — ${detail}`);

  const effectByPower = {
    'Ice Breath': ['frozen', 1], 'Frost Halo': ['slowed', 2], 'Glacier Bind': ['frozen', 1],
    'Ice Breath': ['frozen', 1], 'Thunder Cage': ['stunned', 1], 'Static Lock': ['stunned', 1],
    'Sonic Stagger': ['stunned', 1], 'Dramatic Freeze Frame': ['stunned', 1],
    'Meteor Fist': ['burning', 2], 'Heat Vision': ['burning', 2], 'Ember Snare': ['burning', 2],
    'Venom Bloom': ['burning', 2], 'Gravity Pin': ['slowed', 2], 'Foam Avalanche': ['slowed', 1],
    'Molten Armor': ['shielded', 1], 'Prism Guard': ['shielded', 2],
  };
  const effect = effectByPower[chosen.name];
  if (effect && defender.hp > 0 && random() < 0.72) {
    if (effect[0] === 'shielded') {
      attacker.shield = Math.max(attacker.shield || 0, 10);
      log.push(`${attacker.name} gains a ${attacker.shield}-point shield!`);
    } else applyStatus(defender, effect[0], effect[1], log, chosen.name);
  }
  if (chosen.name === 'Cleanse Pulse' || chosen.name === 'Second Wind') {
    const before = attacker.statusEffects.length;
    attacker.statusEffects = attacker.statusEffects.filter((item) => !['slowed', 'burning'].includes(item.type));
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + (chosen.name === 'Second Wind' ? 8 : 3));
    log.push(`${attacker.name} recovers and clears ${before - attacker.statusEffects.length} status effect(s).`);
  }
  return log[log.length - 1];
}

function tickStatuses(fighter, log) {
  fighter.statusEffects = fighter.statusEffects.filter((effect) => {
    if (effect.type === 'burning') {
      fighter.hp = Math.max(0, fighter.hp - 4);
      log.push(`${fighter.name} takes 4 burn damage.`);
    }
    effect.turns -= 1;
    return effect.turns > 0;
  });
}

function nextRound(state, random = Math.random) {
  if (!state || state.finished) return state;
  const next = {
    ...state,
    player: { ...state.player, statusEffects: (state.player.statusEffects || []).map((item) => ({ ...item })) },
    rival: { ...state.rival, statusEffects: (state.rival.statusEffects || []).map((item) => ({ ...item })) },
    log: [...state.log],
    round: state.round + 1,
  };
  tickStatuses(next.player, next.log);
  tickStatuses(next.rival, next.log);
  const playerFirst = next.player.stats.speed >= next.rival.stats.speed;
  const order = playerFirst ? [['player', 'rival'], ['rival', 'player']] : [['rival', 'player'], ['player', 'rival']];
  for (const [attackerKey, defenderKey] of order) {
    if (next[attackerKey].hp <= 0 || next[defenderKey].hp <= 0) continue;
    strike(next[attackerKey], next[defenderKey], random, next.log);
  }
  if (next.player.hp <= 0 || next.rival.hp <= 0) {
    next.finished = true;
    next.winner = next.player.hp > next.rival.hp ? next.player.name : next.rival.hp > next.player.hp ? next.rival.name : 'Draw';
    next.log.push(next.winner === 'Draw' ? 'Both fighters are down! It is a draw.' : `${next.winner} wins the battle!`);
  } else if (next.round >= 12) {
    next.finished = true;
    next.winner = next.player.hp === next.rival.hp ? 'Draw' : next.player.hp > next.rival.hp ? next.player.name : next.rival.name;
    next.log.push(`Time limit! ${next.winner === 'Draw' ? 'The battle ends in a draw.' : `${next.winner} wins on remaining health!`}`);
  }
  return next;
}

module.exports = { DEMO_RIVAL, SYNERGIES, getSynergy, makeFighter, startBattle, nextRound, applyStatus, tickStatuses };
