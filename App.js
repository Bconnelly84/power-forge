import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, StatusBar, Alert, PanResponder
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@power_forge_characters_v1";
const COLORS = ["#6C63FF", "#E4485D", "#20B8A5", "#F2B544", "#E8EAF2", "#242733", "#62A8FF", "#9B5DE5"];
const CATEGORIES = [
  { key: "head", label: "Head", parts: ["Pilot Visor", "Hero Mask", "Open Face", "Skull Helm"] },
  { key: "torso", label: "Torso", parts: ["Core Suit", "Heavy Armor", "Stealth Suit", "Tech Jacket"] },
  { key: "arms", label: "Arms", parts: ["Power Gauntlets", "Armored Sleeves", "Energy Bracers", "Bare Arms"] },
  { key: "legs", label: "Legs", parts: ["Speed Pants", "Combat Armor", "Flex Suit", "Reinforced Legs"] },
  { key: "boots", label: "Boots", parts: ["Thruster Boots", "Heavy Boots", "Runner Boots", "Mag Boots"] },
  { key: "back", label: "Back", parts: ["Cape", "Jet Pack", "Shield Rig", "No Attachment"] },
];
const DEFAULT_CHARACTER = {
  name: "Nova Sentinel",
  alignment: "Hero",
  view: "Front",
  color: "#6C63FF",
  parts: { head: "Hero Mask", torso: "Core Suit", arms: "Power Gauntlets", legs: "Flex Suit", boots: "Runner Boots", back: "Cape" },
  abilities: ["Energy Blast", "Enhanced Agility"],
  notes: "",
  drawing: [],
};

function Button({ label, onPress, active, small }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, active && styles.buttonActive, small && styles.buttonSmall]}>
      <Text style={[styles.buttonText, active && styles.buttonTextActive, small && styles.buttonTextSmall]}>{label}</Text>
    </Pressable>
  );
}

function SectionTitle({ children, right }) {
  return <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>{children}</Text>{right}</View>;
}

function CharacterPreview({ character }) {
  const isBack = character.view === "Back";
  const c = character.color;
  return (
    <View style={styles.previewStage}>
      <View style={styles.previewTopRow}>
        <Text style={styles.previewCaption}>{isBack ? "REAR VIEW" : "FRONT VIEW"}</Text>
        <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>{character.alignment.toUpperCase()}</Text></View>
      </View>
      <View style={styles.figure}>
        {character.parts.back !== "No Attachment" && (
          <View style={[styles.cape, { backgroundColor: c, opacity: 0.72 }, isBack && styles.capeBack]} />
        )}
        <View style={[styles.head, { backgroundColor: c }]}>
          {!isBack && <View style={styles.visor}><View style={styles.visorEye} /><View style={styles.visorEye} /></View>}
          {isBack && <View style={styles.headSeam} />}
        </View>
        <View style={styles.neck} />
        <View style={styles.bodyRow}>
          <View style={[styles.arm, { backgroundColor: c }]} />
          <View style={[styles.torso, { backgroundColor: c }]}>
            <View style={styles.chestPanel} />
            <View style={styles.core}><View style={styles.coreInner} /></View>
            {isBack && <View style={styles.backPanel} />}
          </View>
          <View style={[styles.arm, { backgroundColor: c }]} />
        </View>
        <View style={styles.waist} />
        <View style={styles.legsRow}>
          <View style={[styles.leg, { backgroundColor: c }]}><View style={styles.knee} /></View>
          <View style={[styles.leg, { backgroundColor: c }]}><View style={styles.knee} /></View>
        </View>
        <View style={styles.bootsRow}><View style={styles.boot} /><View style={styles.boot} /></View>
        {character.drawing.slice(-18).map((p, i) => (
          <View key={p.id || i} pointerEvents="none" style={[styles.drawDot, { left: p.x, top: p.y, backgroundColor: p.color || "#FFFFFF" }]} />
        ))}
      </View>
      <Text style={styles.previewName}>{character.name || "Unnamed Character"}</Text>
      <Text style={styles.previewSub}>{character.parts.torso} · {character.parts.head}</Text>
    </View>
  );
}

function DrawingPad({ color, points, onAddPoint, onClear }) {
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => onAddPoint(e.nativeEvent.locationX, e.nativeEvent.locationY, color),
    onPanResponderMove: (e) => onAddPoint(e.nativeEvent.locationX, e.nativeEvent.locationY, color),
  }), [color, onAddPoint]);
  return (
    <View style={styles.drawingWrap}>
      <View style={styles.drawingHeader}>
        <Text style={styles.cardTitle}>Custom mark-up</Text>
        <Pressable onPress={onClear}><Text style={styles.clearText}>Clear drawing</Text></Pressable>
      </View>
      <View style={styles.drawingPad} {...responder.panHandlers}>
        <Text pointerEvents="none" style={styles.drawingHint}>Draw here with your finger</Text>
        {points.map((p, i) => <View key={p.id || i} pointerEvents="none" style={[styles.drawMark, { left: p.x - 5, top: p.y - 5, backgroundColor: p.color }]} />)}
      </View>
      <Text style={styles.helperText}>Starter drawing tool: freehand marks are saved locally with this character. Later we can add erase, brush size, undo, and part-specific drawing boundaries.</Text>
    </View>
  );
}

export default function App() {
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState("Build");
  const [activeCategory, setActiveCategory] = useState("head");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSaved(JSON.parse(raw));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const update = (patch) => setCharacter((prev) => ({ ...prev, ...patch }));
  const updatePart = (key, value) => setCharacter((prev) => ({ ...prev, parts: { ...prev.parts, [key]: value } }));
  const toggleAbility = (ability) => update({
    abilities: character.abilities.includes(ability)
      ? character.abilities.filter((a) => a !== ability)
      : [...character.abilities, ability]
  });

  const saveCharacter = async () => {
    const item = { ...character, id: character.id || String(Date.now()), updatedAt: new Date().toISOString() };
    const next = [item, ...saved.filter((x) => x.id !== item.id)];
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next);
      update({ id: item.id });
      Alert.alert("Saved", `${item.name || "Character"} was saved on this device.`);
    } catch (e) {
      Alert.alert("Couldn't save", "Please try again.");
    }
  };

  const loadCharacter = (item) => {
    setCharacter(item);
    setTab("Build");
  };

  const newCharacter = () => {
    Alert.alert("Start a new character?", "Your current design stays saved only if you save it first.", [
      { text: "Cancel", style: "cancel" },
      { text: "New character", onPress: () => { setCharacter({ ...DEFAULT_CHARACTER, name: "New Character", id: undefined, drawing: [] }); setTab("Build"); } }
    ]);
  };

  const currentCategory = CATEGORIES.find((x) => x.key === activeCategory) || CATEGORIES[0];
  const abilities = ["Energy Blast", "Super Strength", "Enhanced Agility", "Flight", "Force Field", "Regeneration", "Invisibility", "Telepathy", "Elemental Control", "Gadget Master"];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#101116" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>POWER <Text style={styles.brandAccent}>FORGE</Text></Text>
          <Text style={styles.tagline}>MAKE YOUR LEGEND.</Text>
        </View>
        <Pressable style={styles.newButton} onPress={newCharacter}><Text style={styles.newButtonText}>＋ NEW</Text></Pressable>
      </View>

      <View style={styles.tabs}>
        {["Build", "Abilities", "Custom", "Collection"].map((t) => <Button key={t} label={t} active={tab === t} onPress={() => setTab(t)} small />)}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {tab === "Build" && <>
          <SectionTitle right={<Text style={styles.miniLabel}>DESIGN BAY 01</Text>}>Character Builder</SectionTitle>
          <TextInput value={character.name} onChangeText={(name) => update({ name })} placeholder="Character name" placeholderTextColor="#777B8B" style={styles.nameInput} />
          <View style={styles.alignmentRow}>
            {["Hero", "Villain", "Antihero", "Original"].map((x) => <Button key={x} label={x} active={character.alignment === x} onPress={() => update({ alignment: x })} small />)}
          </View>
          <CharacterPreview character={character} />
          <View style={styles.viewToggle}>
            <Button label="◉ Front" active={character.view === "Front"} onPress={() => update({ view: "Front" })} />
            <Button label="◉ Back" active={character.view === "Back"} onPress={() => update({ view: "Back" })} />
          </View>
          <SectionTitle right={<Text style={styles.miniLabel}>COLOR</Text>}>Suit palette</SectionTitle>
          <View style={styles.colorRow}>{COLORS.map((color) => <Pressable key={color} onPress={() => update({ color })} style={[styles.colorSwatch, { backgroundColor: color }, character.color === color && styles.colorSelected]} />)}</View>
          <SectionTitle right={<Text style={styles.miniLabel}>PARTS</Text>}>Build from parts</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.map((cat) => <Button key={cat.key} label={cat.label} active={activeCategory === cat.key} onPress={() => setActiveCategory(cat.key)} small />)}
          </ScrollView>
          <View style={styles.partsGrid}>
            {currentCategory.parts.map((part) => <Pressable key={part} onPress={() => updatePart(activeCategory, part)} style={[styles.partTile, character.parts[activeCategory] === part && styles.partTileActive]}>
              <View style={[styles.partIcon, { backgroundColor: character.color }]}><Text style={styles.partIconText}>{part.split(" ").map(w => w[0]).join("").slice(0, 2)}</Text></View>
              <Text style={styles.partName}>{part}</Text>
              {character.parts[activeCategory] === part && <Text style={styles.equipped}>EQUIPPED</Text>}
            </Pressable>)}
          </View>
          <Pressable onPress={saveCharacter} style={styles.saveButton}><Text style={styles.saveButtonText}>SAVE CHARACTER</Text></Pressable>
        </>}

        {tab === "Abilities" && <>
          <SectionTitle>Power loadout</SectionTitle>
          <Text style={styles.helperText}>Choose the abilities that define this character. These are saved locally with the character.</Text>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>POWER PROFILE</Text>
            <View style={styles.statLine}><Text style={styles.statLabel}>Selected abilities</Text><Text style={styles.statValue}>{character.abilities.length}</Text></View>
            <View style={styles.statLine}><Text style={styles.statLabel}>Alignment</Text><Text style={styles.statValue}>{character.alignment}</Text></View>
            <View style={styles.statLine}><Text style={styles.statLabel}>Equipped parts</Text><Text style={styles.statValue}>{Object.keys(character.parts).length}</Text></View>
          </View>
          <View style={styles.abilityGrid}>{abilities.map((a, i) => <Pressable key={a} onPress={() => toggleAbility(a)} style={[styles.abilityTile, character.abilities.includes(a) && styles.abilityTileActive]}>
            <Text style={styles.abilityGlyph}>{["✦","✊","➤","↟","⬡","✚","◌","◎","❖","⚙"][i]}</Text>
            <Text style={styles.abilityName}>{a}</Text>
            <Text style={styles.abilityState}>{character.abilities.includes(a) ? "SELECTED" : "TAP TO ADD"}</Text>
          </Pressable>)}</View>
          <Text style={styles.helperText}>Next upgrade: link abilities to compatible parts and calculate strengths, weaknesses, and stats.</Text>
          <Pressable onPress={saveCharacter} style={styles.saveButton}><Text style={styles.saveButtonText}>SAVE CHARACTER</Text></Pressable>
        </>}

        {tab === "Custom" && <>
          <SectionTitle>Custom part lab</SectionTitle>
          <Text style={styles.helperText}>Start by recoloring a preset part and drawing custom marks. The next iteration will add part-specific templates, attachment limits, brush controls, and undo.</Text>
          <Text style={styles.fieldLabel}>PART TO CUSTOMIZE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.map((cat) => <Button key={cat.key} label={cat.label} active={activeCategory === cat.key} onPress={() => setActiveCategory(cat.key)} small />)}
          </ScrollView>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>{currentCategory.label.toUpperCase()} CUSTOMIZATION</Text>
            <Text style={styles.customCurrent}>{character.parts[activeCategory]}</Text>
            <Text style={styles.helperText}>Allowed in this starter: choose one of the library parts, change the main suit color, and add freehand marks to the design.</Text>
            {currentCategory.parts.map((part) => <Pressable key={part} onPress={() => updatePart(activeCategory, part)} style={styles.optionRow}>
              <Text style={styles.optionText}>{part}</Text><Text style={styles.optionAction}>{character.parts[activeCategory] === part ? "✓ SELECTED" : "SELECT"}</Text>
            </Pressable>)}
          </View>
          <Text style={styles.fieldLabel}>DRAWING COLOR</Text>
          <View style={styles.colorRow}>{COLORS.map((color) => <Pressable key={color} onPress={() => update({ drawColor: color })} style={[styles.colorSwatch, { backgroundColor: color }, (character.drawColor || character.color) === color && styles.colorSelected]} />)}</View>
          <DrawingPad color={character.drawColor || character.color} points={character.drawing || []} onAddPoint={(x, y, color) => setCharacter(prev => ({ ...prev, drawing: [...(prev.drawing || []).slice(-249), { x, y, color, id: `${Date.now()}-${Math.random()}` }] }))} onClear={() => update({ drawing: [] })} />
          <Pressable onPress={saveCharacter} style={styles.saveButton}><Text style={styles.saveButtonText}>SAVE CUSTOM CHARACTER</Text></Pressable>
        </>}

        {tab === "Collection" && <>
          <SectionTitle right={<Text style={styles.miniLabel}>{saved.length} SAVED</Text>}>Your collection</SectionTitle>
          <Text style={styles.helperText}>Characters are stored on this device. No account or internet connection is required to use the collection.</Text>
          {saved.length === 0 ? <View style={styles.emptyState}><Text style={styles.emptyGlyph}>◇</Text><Text style={styles.emptyTitle}>Your forge is quiet.</Text><Text style={styles.helperText}>Build a character and tap Save Character to start your collection.</Text></View> : saved.map((item) => <View key={item.id} style={styles.savedCard}>
            <View style={[styles.savedSwatch, { backgroundColor: item.color || "#6C63FF" }]} />
            <View style={styles.savedInfo}><Text style={styles.savedName}>{item.name || "Unnamed Character"}</Text><Text style={styles.savedMeta}>{item.alignment} · {item.abilities?.length || 0} abilities</Text></View>
            <Button label="EDIT" small onPress={() => loadCharacter(item)} />
            <Button label="×" small onPress={() => Alert.alert("Delete character?", `Delete ${item.name}?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { const next = saved.filter(x => x.id !== item.id); setSaved(next); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } }])} />
          </View>)}
          <Pressable onPress={newCharacter} style={styles.saveButton}><Text style={styles.saveButtonText}>CREATE NEW CHARACTER</Text></Pressable>
        </>}
        <View style={styles.footer}><Text style={styles.footerText}>POWER FORGE · BUILD YOUR OWN LEGEND</Text><Text style={styles.footerSub}>{loaded ? "OFFLINE-READY STARTER BUILD" : "LOADING LOCAL COLLECTION…"}</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101116" },
  header: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: "#F4F4FA", fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  brandAccent: { color: "#8B82FF" },
  tagline: { color: "#777B8B", fontSize: 9, fontWeight: "800", letterSpacing: 2.3, marginTop: 3 },
  newButton: { backgroundColor: "#242538", borderColor: "#454568", borderWidth: 1, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10 },
  newButtonText: { color: "#C5C0FF", fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  tabs: { flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingBottom: 12 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 12 },
  sectionTitle: { color: "#F4F4FA", fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  miniLabel: { color: "#777B8B", fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  nameInput: { backgroundColor: "#1A1B24", borderColor: "#303240", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: "#F4F4FA", fontSize: 16, fontWeight: "700", marginBottom: 10 },
  alignmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  button: { borderWidth: 1, borderColor: "#303240", backgroundColor: "#191A22", paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  buttonActive: { backgroundColor: "#292744", borderColor: "#8178FF" },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: 10, flex: 1 },
  buttonText: { color: "#A9ACBB", fontSize: 12, fontWeight: "700" },
  buttonTextActive: { color: "#D8D5FF" },
  buttonTextSmall: { fontSize: 10 },
  previewStage: { backgroundColor: "#171821", borderWidth: 1, borderColor: "#303240", borderRadius: 18, padding: 14, alignItems: "center", overflow: "hidden", marginBottom: 12 },
  previewTopRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewCaption: { color: "#777B8B", fontSize: 9, fontWeight: "900", letterSpacing: 1.7 },
  previewBadge: { backgroundColor: "#25243B", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  previewBadgeText: { color: "#B8B2FF", fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  figure: { height: 285, width: 230, alignItems: "center", justifyContent: "flex-start", paddingTop: 14, position: "relative" },
  cape: { position: "absolute", top: 62, width: 126, height: 156, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, transform: [{ perspective: 300 }, { rotate: "1deg" }] },
  capeBack: { width: 142, height: 174, top: 54, opacity: 0.9 },
  head: { width: 52, height: 58, borderRadius: 18, borderWidth: 3, borderColor: "#0F1015", zIndex: 2, alignItems: "center", justifyContent: "center" },
  visor: { width: 42, height: 17, backgroundColor: "#151722", borderRadius: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", borderWidth: 1, borderColor: "#8DDAFF" },
  visorEye: { width: 10, height: 4, backgroundColor: "#9FE8FF", borderRadius: 4 },
  headSeam: { width: 2, height: 35, backgroundColor: "#151722" },
  neck: { width: 22, height: 13, backgroundColor: "#B8A6A0", marginTop: -2 },
  bodyRow: { flexDirection: "row", alignItems: "flex-start", marginTop: -1, zIndex: 2 },
  arm: { width: 30, height: 94, borderRadius: 14, borderWidth: 3, borderColor: "#0F1015", marginTop: 7 },
  torso: { width: 76, height: 102, borderRadius: 20, borderWidth: 3, borderColor: "#0F1015", alignItems: "center", paddingTop: 13, overflow: "hidden" },
  chestPanel: { position: "absolute", top: 8, width: 58, height: 30, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.13)" },
  core: { marginTop: 13, width: 25, height: 25, borderRadius: 13, backgroundColor: "#B8F1FF", borderWidth: 3, borderColor: "#242538", alignItems: "center", justifyContent: "center" },
  coreInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#FFFFFF" },
  backPanel: { position: "absolute", top: 10, width: 42, height: 65, borderRadius: 8, borderWidth: 2, borderColor: "rgba(255,255,255,0.25)" },
  waist: { width: 67, height: 17, backgroundColor: "#252733", borderWidth: 3, borderColor: "#0F1015", borderRadius: 7, marginTop: -2, zIndex: 3 },
  legsRow: { flexDirection: "row", gap: 7, marginTop: -1, zIndex: 2 },
  leg: { width: 31, height: 73, borderRadius: 12, borderWidth: 3, borderColor: "#0F1015", alignItems: "center", paddingTop: 22 },
  knee: { width: 20, height: 17, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.18)" },
  bootsRow: { flexDirection: "row", gap: 7, marginTop: -2, zIndex: 3 },
  boot: { width: 35, height: 20, backgroundColor: "#252733", borderWidth: 3, borderColor: "#0F1015", borderRadius: 7 },
  drawDot: { position: "absolute", width: 6, height: 6, borderRadius: 3, zIndex: 5 },
  previewName: { color: "#F4F4FA", fontSize: 18, fontWeight: "900", marginTop: 1 },
  previewSub: { color: "#777B8B", fontSize: 11, marginTop: 4 },
  viewToggle: { flexDirection: "row", gap: 8, marginBottom: 14 },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 18, marginTop: 8 },
  colorSwatch: { width: 30, height: 30, borderRadius: 10, borderWidth: 2, borderColor: "transparent" },
  colorSelected: { borderColor: "#FFFFFF", transform: [{ scale: 1.08 }] },
  categoryRow: { flexDirection: "row", gap: 7, paddingBottom: 8 },
  partsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 16 },
  partTile: { width: "48%", minHeight: 88, backgroundColor: "#191A22", borderWidth: 1, borderColor: "#303240", borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  partTileActive: { borderColor: "#8178FF", backgroundColor: "#242238" },
  partIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  partIconText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  partName: { flex: 1, color: "#D8DAE5", fontSize: 11, fontWeight: "700" },
  equipped: { position: "absolute", left: 10, bottom: 5, color: "#A9A2FF", fontSize: 7, fontWeight: "900", letterSpacing: 0.6 },
  saveButton: { backgroundColor: "#8178FF", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 8 },
  saveButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  helperText: { color: "#898D9D", fontSize: 12, lineHeight: 18, marginBottom: 12 },
  statCard: { backgroundColor: "#191A22", borderWidth: 1, borderColor: "#303240", borderRadius: 14, padding: 14, marginVertical: 12 },
  statTitle: { color: "#A9A2FF", fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginBottom: 12 },
  statLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderTopWidth: 1, borderTopColor: "#2B2D38" },
  statLabel: { color: "#898D9D", fontSize: 12 },
  statValue: { color: "#F4F4FA", fontSize: 12, fontWeight: "800" },
  abilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  abilityTile: { width: "48%", minHeight: 105, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#303240", backgroundColor: "#191A22" },
  abilityTileActive: { backgroundColor: "#242238", borderColor: "#8178FF" },
  abilityGlyph: { color: "#B8B2FF", fontSize: 20, marginBottom: 9 },
  abilityName: { color: "#F4F4FA", fontSize: 12, fontWeight: "800" },
  abilityState: { color: "#777B8B", fontSize: 8, fontWeight: "900", letterSpacing: 1, marginTop: 7 },
  fieldLabel: { color: "#777B8B", fontSize: 9, fontWeight: "900", letterSpacing: 1.5, marginTop: 14, marginBottom: 8 },
  customCurrent: { color: "#F4F4FA", fontSize: 17, fontWeight: "800", marginBottom: 8 },
  optionRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#2B2D38" },
  optionText: { color: "#D8DAE5", fontSize: 12 },
  optionAction: { color: "#A9A2FF", fontSize: 9, fontWeight: "900" },
  drawingWrap: { backgroundColor: "#191A22", borderWidth: 1, borderColor: "#303240", borderRadius: 14, padding: 12, marginVertical: 12 },
  drawingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { color: "#F4F4FA", fontSize: 13, fontWeight: "800" },
  clearText: { color: "#B8B2FF", fontSize: 11, fontWeight: "700" },
  drawingPad: { height: 190, borderRadius: 10, backgroundColor: "#111219", borderWidth: 1, borderColor: "#343647", overflow: "hidden" },
  drawingHint: { position: "absolute", top: 12, alignSelf: "center", color: "#565A6C", fontSize: 10 },
  drawMark: { position: "absolute", width: 10, height: 10, borderRadius: 5 },
  emptyState: { backgroundColor: "#191A22", borderRadius: 14, padding: 24, alignItems: "center", marginVertical: 14 },
  emptyGlyph: { color: "#8178FF", fontSize: 40, marginBottom: 8 },
  emptyTitle: { color: "#F4F4FA", fontSize: 17, fontWeight: "900", marginBottom: 8 },
  savedCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#191A22", borderWidth: 1, borderColor: "#303240", borderRadius: 12, padding: 10, marginBottom: 9 },
  savedSwatch: { width: 34, height: 42, borderRadius: 8 },
  savedInfo: { flex: 1 },
  savedName: { color: "#F4F4FA", fontSize: 13, fontWeight: "800" },
  savedMeta: { color: "#898D9D", fontSize: 10, marginTop: 4 },
  footer: { alignItems: "center", paddingTop: 26, paddingBottom: 12 },
  footerText: { color: "#666A7A", fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  footerSub: { color: "#4D5060", fontSize: 8, marginTop: 6, letterSpacing: 1 },
});
