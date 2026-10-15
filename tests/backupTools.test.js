const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeBackup, MAX_CHARACTERS } = require("../src/backupTools");

const defaults = { name: "New Character", alignment: "Original", color: "#6C63FF", parts: { head: "Mask", torso: "Suit" }, abilities: [], drawing: [] };

test("backup accepts exported wrapper format", () => {
  const result = normalizeBackup({ format: "power-forge-backup", characters: [{ id: "abc", name: "Volt", parts: { head: "Visor" }, abilities: ["Flight"] }] }, defaults);
  assert.equal(result[0].id, "abc");
  assert.equal(result[0].parts.torso, "Suit");
  assert.deepEqual(result[0].abilities, ["Flight"]);
});

test("backup accepts a raw character array", () => {
  const result = normalizeBackup([{ name: "Silly Hero" }], defaults);
  assert.equal(result[0].name, "Silly Hero");
  assert.equal(result[0].id, "import-0");
});

test("backup rejects missing character arrays", () => {
  assert.throws(() => normalizeBackup({ characters: "nope" }, defaults));
});

test("backup rejects nameless characters", () => {
  assert.throws(() => normalizeBackup([{ name: " " }], defaults));
});

test("backup rejects oversized collections", () => {
  assert.throws(() => normalizeBackup(Array.from({ length: MAX_CHARACTERS + 1 }, (_, i) => ({ name: `Hero ${i}` })), defaults), /more than/);
});

test("backup sanitizes invalid alignment, colors, parts, and drawing points", () => {
  const [hero] = normalizeBackup([{ name: "  Hero  ", alignment: "Godmode", color: "javascript:alert(1)", parts: { head: {}, torso: "Suit" }, drawing: [{ x: -1, y: 3 }, { x: 2, y: 4, color: "red" }, { x: 12, y: 18, color: "#ABCDEF" }] }], defaults);
  assert.equal(hero.name, "Hero");
  assert.equal(hero.alignment, "Original");
  assert.equal(hero.color, "#6C63FF");
  assert.equal(hero.parts.head, "Mask");
  assert.equal(hero.drawing.length, 2);
  assert.equal(hero.drawing[0].color, "#FFFFFF");
  assert.equal(hero.drawing[1].color, "#ABCDEF");
});

test("backup trims and deduplicates ability names", () => {
  const [hero] = normalizeBackup([{ name: "Hero", abilities: [" Flight ", "Flight", null, ""] }], defaults);
  assert.deepEqual(hero.abilities, ["Flight"]);
});

test('backup preserves per-category part styles and normalized drawing metadata', () => {
  const [hero] = normalizeBackup([{ name: 'Painter', parts: { head: 'Mask', torso: 'Suit' }, partStyles: { head: { color: '#ff0000', pattern: 'Stars', scale: 1.2 }, bogus: { color: '#000000' } }, drawing: [{ x: 0.25, y: 0.5, color: '#ABCDEF', size: 14, category: 'head', id: 'mark-1' }] }], defaults);
  assert.equal(hero.partStyles.head.color, '#FF0000');
  assert.equal(hero.partStyles.head.pattern, 'Stars');
  assert.equal(hero.partStyles.bogus, undefined);
  assert.deepEqual(hero.drawing[0], { x: 0.25, y: 0.5, color: '#ABCDEF', size: 14, id: 'mark-1', category: 'head' });
});
