const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const art = path.join(root, "assets", "character-art");
const app = fs.readFileSync(path.join(root, "App.js"), "utf8");
const groups = {
  back: ["back_crimson_cape","back_shadow_mantle","back_royal_cloak","back_ice_cape","back_tattered_cape","back_raven_wings","back_solar_wings","back_crystal_wings","back_void_wings","back_dragon_wings","back_serpent_tail","back_dragon_tail","back_cyber_tail","back_spiked_tail","back_plasma_tail"],
  accessory: ["accessory_onyx_horns","accessory_solar_horns","accessory_crystal_pauldron","accessory_spiked_pauldron","accessory_orbit_rings"]
};
test("v15 includes paired PNG and SVG assets for all 20 new variants", () => {
  assert.equal(Object.values(groups).flat().length, 20);
  for (const name of Object.values(groups).flat()) { assert.ok(fs.existsSync(path.join(art, name + ".png")), name + " PNG"); assert.ok(fs.existsSync(path.join(art, name + ".svg")), name + " SVG"); assert.ok(app.includes(name + ": require(\"./assets/character-art/" + name + ".png\")"), name + " integrated"); }
});
test("v15 new back and accessory options are selectable and mapped", () => {
  for (const label of ["Crimson Battle Cape","Shadow Mantle","Royal Star Cloak","Glacier Cape","Tattered Wraith Cape","Raven Wings","Solar Wings","Crystal Wings","Void Wings","Dragon Wings","Serpent Tail","Dragon Tail","Cyber Tail","Spiked Tail","Plasma Tail","Onyx Horns","Solar Horns","Crystal Pauldrons","Spiked Pauldrons","Orbit Rings"]) assert.ok(app.includes(label), label + " option");
});
