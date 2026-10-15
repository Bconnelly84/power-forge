const MAX_CHARACTERS = 500;
const MAX_ABILITIES_PER_CHARACTER = 100;
const MAX_DRAWING_POINTS = 2500;
const MAX_NAME_LENGTH = 40;
const { normalizePartStyle, ALLOWED_CATEGORIES } = require("./partWorkshop");

function normalizeBackup(input, defaultCharacter, idPrefix = "import") {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;
  const incoming = Array.isArray(parsed) ? parsed : parsed && parsed.characters;
  if (!Array.isArray(incoming)) throw new Error("Backup must contain a characters array.");
  if (incoming.length > MAX_CHARACTERS) throw new Error(`Backup cannot contain more than ${MAX_CHARACTERS} characters.`);
  if (incoming.some((item) => !item || typeof item !== "object" || Array.isArray(item) || typeof item.name !== "string" || !item.name.trim())) {
    throw new Error("Every character must have a non-empty name.");
  }

  const allowedAlignments = new Set(["Hero", "Villain", "Antihero", "Original"]);
  return incoming.map((item, index) => {
    const parts = {};
    const sourceParts = item.parts && typeof item.parts === "object" && !Array.isArray(item.parts) ? item.parts : {};
    for (const [slot, fallback] of Object.entries(defaultCharacter.parts || {})) {
      parts[slot] = typeof sourceParts[slot] === "string" && sourceParts[slot].length <= 80 ? sourceParts[slot] : fallback;
    }

    const abilities = Array.isArray(item.abilities)
      ? [...new Set(item.abilities.filter((ability) => typeof ability === "string" && ability.trim()).map((ability) => ability.trim().slice(0, 80)))].slice(0, MAX_ABILITIES_PER_CHARACTER)
      : [];
    const drawing = Array.isArray(item.drawing)
      ? item.drawing.slice(0, MAX_DRAWING_POINTS).filter((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 0 && point.y >= 0 && point.x <= 2000 && point.y <= 2000).map((point) => ({ x: point.x, y: point.y, color: typeof point.color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(point.color) ? point.color : "#FFFFFF", ...(typeof point.id === "string" ? { id: point.id.slice(0, 80) } : {}), ...(Number.isFinite(Number(point.size)) ? { size: Math.max(2, Math.min(36, Number(point.size))) } : {}), ...(ALLOWED_CATEGORIES.has(point.category) ? { category: point.category } : {}) }))
      : [];

    return {
      ...defaultCharacter,
      ...item,
      id: item.id == null || String(item.id).trim() === "" ? `${idPrefix}-${index}` : String(item.id).slice(0, 120),
      name: item.name.trim().slice(0, MAX_NAME_LENGTH),
      alignment: allowedAlignments.has(item.alignment) ? item.alignment : defaultCharacter.alignment || "Original",
      color: typeof item.color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(item.color) ? item.color : defaultCharacter.color,
      accentColor: typeof item.accentColor === "string" && /^#[0-9a-fA-F]{3,8}$/.test(item.accentColor) ? item.accentColor : defaultCharacter.accentColor,
      parts,
      abilities,
      drawing: drawing.map((point) => ({
        ...point,
        ...(Number.isFinite(Number(point.size)) ? { size: Math.max(2, Math.min(36, Number(point.size))) } : {}),
        ...(ALLOWED_CATEGORIES.has(point.category) ? { category: point.category } : {}),
      })),
      partStyles: Object.fromEntries(Object.entries(item.partStyles && typeof item.partStyles === "object" && !Array.isArray(item.partStyles) ? item.partStyles : {})
        .filter(([category]) => ALLOWED_CATEGORIES.has(category))
        .map(([category, style]) => [category, normalizePartStyle(style)])),
      notes: typeof item.notes === "string" ? item.notes.slice(0, 2000) : "",
    };
  });
}

module.exports = { normalizeBackup, MAX_CHARACTERS, MAX_ABILITIES_PER_CHARACTER, MAX_DRAWING_POINTS };
