const fs = require("node:fs");
const path = require("node:path");

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "catalog.json"), "utf8")
);

function getPart(categoryId, partId) {
  const category = catalog.categories.find((item) => item.id === categoryId);
  if (!category) return null;
  return category.parts.find((part) => part.id === partId) || null;
}

function isPartCompatible(categoryId, partId) {
  const category = catalog.categories.find((item) => item.id === categoryId);
  const part = getPart(categoryId, partId);
  return Boolean(category && part && part.slots.includes(category.slot));
}

function getAllowedCustomization(categoryId, partId) {
  const part = getPart(categoryId, partId);
  return part ? [...part.allowedCustomization] : [];
}

function getGrantedAbilities(equippedParts) {
  const granted = new Set();
  for (const [categoryId, partId] of Object.entries(equippedParts || {})) {
    const part = getPart(categoryId, partId);
    if (part) for (const ability of part.abilities || []) granted.add(ability);
  }
  return [...granted].sort();
}

function validateCharacter(character) {
  const errors = [];
  if (!character || typeof character !== "object") return ["Character must be an object."];
  if (!String(character.name || "").trim()) errors.push("Character name is required.");
  if (!["Hero", "Villain", "Antihero", "Original"].includes(character.alignment)) {
    errors.push("Alignment must be Hero, Villain, Antihero, or Original.");
  }
  for (const [categoryId, partId] of Object.entries(character.parts || {})) {
    if (!isPartCompatible(categoryId, partId)) errors.push(`Invalid part '${partId}' for slot '${categoryId}'.`);
  }
  return errors;
}

module.exports = { catalog, getPart, isPartCompatible, getAllowedCustomization, getGrantedAbilities, validateCharacter };
