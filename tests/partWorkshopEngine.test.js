const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidHexColor, normalizePartStyle, normalizeCanvasPoint, projectDrawingPoint,
  createCustomPartPreset, applyCustomPartPreset, ALLOWED_CATEGORIES,
} = require('../src/partWorkshop');

test('custom color validation accepts 3 and 6 digit hex only', () => {
  assert.equal(isValidHexColor('#abc'), true);
  assert.equal(isValidHexColor('#A1b2C3'), true);
  assert.equal(isValidHexColor('red'), false);
  assert.equal(isValidHexColor('#12345'), false);
});

test('part style normalization clamps values and rejects unsupported patterns', () => {
  const style = normalizePartStyle({ color: '#abc', accent: 'oops', pattern: 'Unknown', scale: 50, rotation: -999, opacity: 4, brushSize: 100 });
  assert.equal(style.color, '#ABC');
  assert.equal(style.accent, '#75E7FF');
  assert.equal(style.pattern, 'Solid');
  assert.equal(style.scale, 1.5);
  assert.equal(style.rotation, -180);
  assert.equal(style.opacity, 1);
  assert.equal(style.brushSize, 36);
});

test('canvas marks normalize to 0..1 coordinates and project to preview dimensions', () => {
  assert.deepEqual(normalizeCanvasPoint(50, 25, 100, 50), { x: 0.5, y: 0.5 });
  assert.deepEqual(normalizeCanvasPoint(500, -10, 100, 50), { x: 1, y: 0 });
  const normalized = projectDrawingPoint({ x: 0.5, y: 0.5 });
  assert.equal(normalized.x, 120);
  assert.ok(Math.abs(normalized.y - 155.1) < 0.001);
  assert.equal(normalized.legacy, false);
  const legacy = projectDrawingPoint({ x: 175, y: 95 });
  assert.equal(legacy.x, 120);
  assert.ok(Math.abs(legacy.y - 155.1) < 0.001);
  assert.equal(legacy.legacy, true);
  const headMark = projectDrawingPoint({ x: 0.5, y: 0.5, category: 'head' });
  assert.ok(headMark.y < 100, 'head marks should map into the head zone');
  assert.equal(headMark.category, 'head');
});

test('custom part preset validates its slot and stores style and normalized drawing data', () => {
  const preset = createCustomPartPreset({ id: 'p1', name: '  Solar Helm  ', category: 'helmet', basePart: 'Solar Paladin Helm', style: { color: '#abc', scale: 1.2 }, drawing: [{ x: 0.2, y: 0.3, color: '#FFFFFF' }] });
  assert.equal(preset.name, 'Solar Helm');
  assert.equal(preset.style.color, '#ABC');
  assert.equal(preset.drawing[0].category, 'helmet');
  assert.throws(() => createCustomPartPreset({ name: 'bad', category: 'unknown', basePart: 'X' }), /category/);
  assert.throws(() => createCustomPartPreset({ name: ' ', category: 'head', basePart: 'X' }), /Name/);
});

test('applying a custom part changes only its slot and replaces drawings for that slot', () => {
  const current = { parts: { head: 'Hero Mask', torso: 'Core Suit' }, partStyles: { torso: { color: '#000000' } }, drawing: [{ x: 0.1, y: 0.1, category: 'helmet' }, { x: 0.4, y: 0.4, category: 'head' }] };
  const preset = createCustomPartPreset({ id: 'p2', name: 'Custom Face', category: 'head', basePart: 'Open Face', style: { color: '#FF0000' }, drawing: [{ x: 0.8, y: 0.2 }] });
  const updated = applyCustomPartPreset(current, preset);
  assert.equal(updated.parts.head, 'Open Face');
  assert.equal(updated.parts.torso, 'Core Suit');
  assert.equal(updated.partStyles.torso.color, '#000000');
  assert.equal(updated.partStyles.head.color, '#FF0000');
  assert.equal(updated.drawing.some(p => p.category === 'helmet'), true);
  assert.equal(updated.drawing.filter(p => p.category === 'head').length, 1);
  assert.throws(() => applyCustomPartPreset(current, { category: 'unknown' }), /invalid/);
});

test('every workshop category is supported by preset validation', () => {
  for (const category of ALLOWED_CATEGORIES) {
    const preset = createCustomPartPreset({ name: `${category} test`, category, basePart: 'Test Part' });
    assert.equal(preset.category, category);
  }
});

test('shape details and emblem markings are normalized and persist in reusable presets', () => {
  const preset = createCustomPartPreset({ id: 'detail-1', name: 'Rune Crown', category: 'head', basePart: 'Horned Crown', style: { detail: 'Runes', emblem: 'ΩNOVA' } });
  assert.equal(preset.style.detail, 'Runes');
  assert.equal(preset.style.emblem, 'ΩNOVA');
  assert.equal(normalizePartStyle({ detail: 'Script Injection', emblem: '0123456789' }).detail, 'None');
  assert.equal(normalizePartStyle({ emblem: '0123456789' }).emblem, '01234567');
});
