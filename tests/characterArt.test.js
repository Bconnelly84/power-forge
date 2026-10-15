const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const art = path.join(root, 'assets', 'character-art');

test('expanded character art library contains PNG and SVG source for every new part', () => {
  const names = [
    'head_cyber','head_demon','head_ice','head_skull','head_visor',
    'torso_tech','torso_bio','torso_royal','torso_stealth',
    'arms_energy','arms_tentacle','arms_gauntlets','legs_tech','legs_organic',
    'boots_thruster','boots_clawed','back_mech_wings','back_halo','back_tail',
    'back_organic','back_drones','back_spines','accessory_horns',
    'accessory_shoulder','accessory_orb'
  ];
  for (const name of names) {
    assert.ok(fs.existsSync(path.join(art, `${name}.png`)), `missing PNG ${name}`);
    assert.ok(fs.existsSync(path.join(art, `${name}.svg`)), `missing SVG source ${name}`);
  }
});

test('character creator categories include expanded parts and accessory slot', () => {
  const app = fs.readFileSync(path.join(root, 'App.js'), 'utf8');
  for (const part of ['Cyber Visor','Demon Crown','Ice Sentinel Helm','Techno Knight Armor','Living Bio-Shell','Energy Conduits','Mechanical Wings','Halo Harness','Void Tail','Horned Shoulder Plates']) {
    assert.ok(app.includes(part), `missing part option ${part}`);
  }
  assert.ok(app.includes('key: "accessory"'));
});
