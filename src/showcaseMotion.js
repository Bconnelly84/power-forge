const MOTION_RULES = [
  { match: /Prism Lance|Energy Blast|Heat Vision|Solar Flare|Confetti Comet|Neon Trail/i, move: 'dash', label: 'BEAM / PROJECTILE', effect: 'beam', particles: 5, effectName: 'Prismatic beam' },
  { match: /Thunder Cage|Storm Herald|Weather Calling|Lightning|Thunder/i, move: 'pulse', label: 'LIGHTNING BURST', effect: 'lightning', particles: 5, effectName: 'Crackling arcs' },
  { match: /Meteor Fist|Comet Dive|Lava Ribbon|Molten Armor|Magma|Inferno|Burp Shockwave/i, move: 'dash', label: 'IMPACT / FLARE', effect: 'flame', particles: 5, effectName: 'Flare burst' },
  { match: /Ice Breath|Frost Halo|Crystal Garden|Crystal|Glacier|Frost/i, move: 'surge', label: 'CRYSTAL / FROST', effect: 'frost', particles: 5, effectName: 'Crystal shards' },
  { match: /Portal|Phase Shift|Time Echo|Time Stop|Tiny Planet|Pocket Dimension|Teleport|Shadow Travel|Glitch Step/i, move: 'blink', label: 'SPACE / TIME SHIFT', effect: 'portal', particles: 5, effectName: 'Warping ring' },
  { match: /Duck|Goose|Paper Golem|Sock Golem|Pocket Orchestra|Rubber Chicken|Pocket Medics|Nanite Swarm|Hologram Parade|Summon/i, move: 'rise', label: 'SUMMON / SWARM', effect: 'swarm', particles: 5, effectName: 'Summoned swarm' },
  { match: /Bubble|Bubblegum|Soap|Prank Shield|Force Field|Shield|Mirror Clone|Kinetic Storage|Damage Reflection/i, move: 'pulse', label: 'SHIELD / BARRIER', effect: 'bubble', particles: 5, effectName: 'Protective field' },
  { match: /Confetti|Glitter|Dance|Hiccups|Squeaky|Mild Inconvenience|Applause|Compliment|Goose|Queue|Gravity Prank|Dramatic Wind|Snack Portal|Sock Teleportation|Mustache|Floor Is Lava/i, move: 'shake', label: 'CHAOS EFFECT', effect: 'comic', particles: 5, effectName: 'Chaotic burst' },
  { match: /Sonic|Sound Vacuum|Sonic Bubble|Sound|Thunder/i, move: 'pulse', label: 'SONIC WAVE', effect: 'sonic', particles: 4, effectName: 'Resonance rings' },
  { match: /Mist Form|Invisibility|Echo Decoy|Reverse Shadow|Shadow|Stealth/i, move: 'blink', label: 'STEALTH / AFTERIMAGE', effect: 'aura', particles: 4, effectName: 'Afterimage haze' },
  { match: /Aurora Dash|Wall Running|Super Speed|Enhanced Agility|Flight|Portal Feint|Teleportation|Neon Trail/i, move: 'dash', label: 'MOVEMENT TRAIL', effect: 'trail', particles: 4, effectName: 'Motion streaks' },
  { match: /Mood Ring|Empathy Link|Focus Fizzle|Memory Fog|Telepathy|Dream Walking|Uncontrollable Dance/i, move: 'surge', label: 'MIND / EMOTION', effect: 'aura', particles: 4, effectName: 'Mind-wave aura' },
  { match: /Regeneration|Healing Pulse|Pocket Medics|Empathy Link/i, move: 'surge', label: 'RESTORATIVE SURGE', effect: 'healing', particles: 4, effectName: 'Healing sparks' },
  { match: /Atomic Halitosis|Itch Ray|Burp Shockwave|Infinite Hiccups/i, move: 'shake', label: 'GROSS-OUT SPECIAL', effect: 'comic', particles: 5, effectName: 'Ridiculous stink cloud' },
  { match: /Flight|Weather Calling|Duck Summoning|Rubber Duck Barrage|Confetti|Summon Folding Chair/i, move: 'rise', label: 'SUMMON / ASCEND', effect: 'swarm', particles: 4, effectName: 'Rising particles' },
  { match: /Teleport|Shadow Travel|Glitch Step|Sock Teleportation|Portal/i, move: 'blink', label: 'BLINK / REPOSITION', effect: 'portal', particles: 3, effectName: 'Warping ring' },
  { match: /Super Speed|Enhanced Agility|Force Punch|Energy Blast|Heat Vision|Ice Breath|Sonic Scream|Fart Cannon|Burp Shockwave|Itch Ray/i, move: 'dash', label: 'PROJECT / STRIKE', effect: 'beam', particles: 3, effectName: 'Impact burst' },
  { match: /Force Field|Soap Bubble Shield|Damage Reflection|Invisibility|Plot Armor|Time Stop/i, move: 'pulse', label: 'ACTIVATE FIELD', effect: 'bubble', particles: 4, effectName: 'Defensive field' },
  { match: /Dance|Hiccups|Squeaky Footsteps|Mild Inconvenience|Applause|Compliment|Existential|Confusion/i, move: 'shake', label: 'CHAOS EFFECT', effect: 'comic', particles: 5, effectName: 'Chaotic burst' },
  { match: /Regeneration|Healing Pulse|Plant Control|Elemental Control|Gravity Control|Duplication|Shape-Shifting/i, move: 'surge', label: 'POWER SURGE', effect: 'aura', particles: 4, effectName: 'Energy aura' },
];

function getShowcaseMotion(powerName, category = 'Unknown') {
  const rule = MOTION_RULES.find((item) => item.match.test(powerName || ''));
  if (rule) return { ...rule };
  if (/Silly|Gross-Out|Chaos/i.test(category)) return { move: 'shake', label: 'UNPREDICTABLE EFFECT', effect: 'comic', effectName: 'Chaotic burst', particles: 4 };
  if (/Movement/i.test(category)) return { move: 'dash', label: 'MOVE', effect: 'trail', effectName: 'Motion streaks', particles: 3 };
  if (/Defense/i.test(category)) return { move: 'pulse', label: 'DEFENSIVE EFFECT', effect: 'bubble', effectName: 'Protective field', particles: 4 };
  if (/Elemental/i.test(category)) return { move: 'surge', label: 'ELEMENTAL EFFECT', effect: 'flame', effectName: 'Elemental burst', particles: 4 };
  return { move: 'surge', label: 'POWER SURGE', effect: 'aura', effectName: 'Energy aura', particles: 3 };
}

module.exports = { getShowcaseMotion, MOTION_RULES };
