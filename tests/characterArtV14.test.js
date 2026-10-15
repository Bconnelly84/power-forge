const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = fs.readFileSync(path.join(__dirname, "..", "App.js"), "utf8");
const root = path.join(__dirname, "..", "assets", "character-art");
const added = [
"torso_vanguard","torso_inferno","torso_warden","torso_arc","torso_abyss",
"arms_shockwave","arms_inferno","arms_talons","arms_void","arms_siege",
"legs_vanguard","legs_inferno","legs_runner","legs_stalker","legs_siege",
"boots_storm","boots_inferno","boots_grip","boots_void","boots_siege"
];
test("v14 adds 20 paired PNG/SVG illustrated assets", () => {
  assert.equal(added.length, 20);
  for (const name of added) {
    assert.ok(fs.existsSync(path.join(root, name + ".png")), name + " PNG exists");
    assert.ok(fs.existsSync(path.join(root, name + ".svg")), name + " SVG exists");
    assert.ok(app.includes(name + ": require(\"./assets/character-art/" + name + ".png\")"), name + " wired into app");
  }
});
test("v14 parts are selectable in torso, arms, legs and boots categories", () => {
  for (const name of ["Titanium Vanguard","Inferno Plate","Emerald Warden","Arc Reactor Suit","Abyssal Carapace","Shockwave Bracers","Inferno Gauntlets","Emerald Talons","Void Tendrils","Siege Gauntlets","Vanguard Greaves","Inferno Leg Armor","Emerald Runner Legs","Void Stalker Legs","Heavy Siege Legs","Stormstep Boots","Inferno Thrusters","Emerald Grip Boots","Void Hover Boots","Siegebreaker Boots"]) assert.ok(app.includes(name), name + " selectable");
});
