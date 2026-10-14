const test = require("node:test");
const assert = require("node:assert/strict");
const {
  catalog, getPart, isPartCompatible, getAllowedCustomization,
  getGrantedAbilities, validateCharacter
} = require("../src/characterRules");

test("catalog contains all expected body slots", () => {
  assert.deepEqual(catalog.categories.map((c) => c.id), ["head", "torso", "arms", "legs", "boots", "back"]);
});

test("valid parts fit their intended slot", () => {
  assert.equal(isPartCompatible("head", "hero-mask"), true);
  assert.equal(isPartCompatible("back", "jet-pack"), true);
});

test("parts cannot be equipped in the wrong slot", () => {
  assert.equal(isPartCompatible("head", "jet-pack"), false);
  assert.equal(isPartCompatible("boots", "cape"), false);
});

test("unknown parts are rejected", () => {
  assert.equal(getPart("head", "invented-part"), null);
  assert.equal(isPartCompatible("head", "invented-part"), false);
});

test("customization rules are defined per part", () => {
  assert.deepEqual(getAllowedCustomization("head", "hero-mask"), ["color", "pattern", "decals"]);
  assert.deepEqual(getAllowedCustomization("arms", "bare-arms"), ["skin-tone", "decals"]);
});

test("equipped parts grant deduplicated abilities", () => {
  assert.deepEqual(getGrantedAbilities({ boots: "thruster-boots", back: "jet-pack" }), ["flight"]);
});

test("character validation catches invalid parts and alignment", () => {
  const errors = validateCharacter({
    name: "Test",
    alignment: "Wizard",
    parts: { head: "jet-pack" }
  });
  assert.equal(errors.length, 2);
});

test("valid starter character passes validation", () => {
  assert.deepEqual(validateCharacter({
    name: "Nova Sentinel",
    alignment: "Hero",
    parts: {
      head: "hero-mask",
      torso: "core-suit",
      arms: "power-gauntlets",
      legs: "flex-suit",
      boots: "runner-boots",
      back: "cape"
    }
  }), []);
});
