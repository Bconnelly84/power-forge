const DEFAULT_PART_STYLE = Object.freeze({ color: "#6C63FF", accent: "#75E7FF", pattern: "Solid", detail: "None", emblem: "", scale: 1, rotation: 0, opacity: 1, brushSize: 10 });
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const ALLOWED_PATTERNS = new Set(["Solid", "Stripes", "Dots", "Circuit", "Camo", "Stars"]);
const ALLOWED_DETAILS = new Set(["None", "Spikes", "Armor Plates", "Runes", "Energy Nodes", "Chevron"]);
const ALLOWED_CATEGORIES = new Set(["head", "hair", "face", "mask", "helmet", "torso", "arms", "legs", "boots", "back", "accessory"]);

function isValidHexColor(value) {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

function clamp(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function normalizePartStyle(style = {}) {
  const input = style && typeof style === "object" && !Array.isArray(style) ? style : {};
  return {
    color: isValidHexColor(input.color) ? input.color.toUpperCase() : DEFAULT_PART_STYLE.color,
    accent: isValidHexColor(input.accent) ? input.accent.toUpperCase() : DEFAULT_PART_STYLE.accent,
    pattern: ALLOWED_PATTERNS.has(input.pattern) ? input.pattern : DEFAULT_PART_STYLE.pattern,
    detail: ALLOWED_DETAILS.has(input.detail) ? input.detail : DEFAULT_PART_STYLE.detail,
    emblem: typeof input.emblem === "string" ? input.emblem.slice(0, 8) : "",
    scale: clamp(input.scale, 0.5, 1.5, 1),
    rotation: clamp(input.rotation, -180, 180, 0),
    opacity: clamp(input.opacity, 0.1, 1, 1),
    brushSize: clamp(input.brushSize, 2, 36, 10),
  };
}

function normalizeCanvasPoint(x, y, width, height) {
  return {
    x: Math.min(1, Math.max(0, Number(x) / Math.max(1, Number(width) || 1))),
    y: Math.min(1, Math.max(0, Number(y) / Math.max(1, Number(height) || 1))),
  };
}

function projectDrawingPoint(point, width = 240, height = 330, legacyWidth = 350, legacyHeight = 190) {
  const x = Number(point?.x) || 0;
  const y = Number(point?.y) || 0;
  const legacy = x > 1 || y > 1;
  const category = ALLOWED_CATEGORIES.has(point?.category) ? point.category : "torso";
  const zones = {
    head: [0.27, 0.02, 0.46, 0.24], hair: [0.25, 0.00, 0.50, 0.16], face: [0.30, 0.10, 0.40, 0.18],
    mask: [0.29, 0.10, 0.42, 0.17], helmet: [0.22, 0.00, 0.56, 0.25], torso: [0.22, 0.28, 0.56, 0.38],
    arms: [0.03, 0.28, 0.94, 0.42], legs: [0.27, 0.62, 0.46, 0.25], boots: [0.25, 0.84, 0.50, 0.15],
    back: [0.00, 0.18, 0.34, 0.62], accessory: [0.56, 0.28, 0.42, 0.40],
  };
  const [left, top, zoneWidth, zoneHeight] = zones[category];
  const localX = Math.min(1, Math.max(0, legacy ? x / legacyWidth : x));
  const localY = Math.min(1, Math.max(0, legacy ? y / legacyHeight : y));
  return {
    x: Math.min(width - 6, Math.max(0, (left + localX * zoneWidth) * width)),
    y: Math.min(height - 6, Math.max(0, (top + localY * zoneHeight) * height)),
    legacy,
    category,
  };
}

function createCustomPartPreset({ id, name, category, basePart, style, drawing = [] }) {
  if (!ALLOWED_CATEGORIES.has(category)) throw new Error("Choose a valid part category.");
  const safeName = String(name || "").trim().slice(0, 36);
  if (!safeName) throw new Error("Name your custom part before saving it.");
  if (!String(basePart || "").trim()) throw new Error("Choose a base part before saving it.");
  return {
    id: String(id || Date.now()),
    name: safeName,
    category,
    basePart: String(basePart).slice(0, 80),
    style: normalizePartStyle(style),
    drawing: (Array.isArray(drawing) ? drawing : []).filter((p) => p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y))).slice(-500).map((p) => ({ ...p, category })),
    schemaVersion: 1,
  };
}

function applyCustomPartPreset(currentCharacter, preset, defaultStyle = DEFAULT_PART_STYLE) {
  if (!preset || !ALLOWED_CATEGORIES.has(preset.category)) throw new Error("This custom part is invalid or uses an unsupported category.");
  const category = preset.category;
  return {
    ...currentCharacter,
    editorCategory: category,
    parts: { ...(currentCharacter.parts || {}), [category]: preset.basePart },
    partStyles: { ...(currentCharacter.partStyles || {}), [category]: { ...defaultStyle, ...normalizePartStyle(preset.style) } },
    drawing: [
      ...(currentCharacter.drawing || []).filter((p) => p.category !== category),
      ...(Array.isArray(preset.drawing) ? preset.drawing.slice(-500).map((p) => ({ ...p, category })) : []),
    ].slice(-2500),
  };
}

module.exports = { DEFAULT_PART_STYLE, ALLOWED_CATEGORIES, ALLOWED_DETAILS, isValidHexColor, normalizePartStyle, normalizeCanvasPoint, projectDrawingPoint, createCustomPartPreset, applyCustomPartPreset };
