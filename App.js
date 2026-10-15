import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput, Image,
  StyleSheet, StatusBar, Alert, PanResponder, Animated, Easing
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { POWERS, getPower, summarizeAbilities } from "./src/powerCatalog";
import { DEMO_RIVAL, getSynergy, startBattle, nextRound } from "./src/battleEngine";
const { getShowcaseMotion } = require("./src/showcaseMotion");
const { normalizeBackup } = require("./src/backupTools");
const { isValidHexColor, normalizePartStyle, normalizeCanvasPoint, projectDrawingPoint, createCustomPartPreset, applyCustomPartPreset } = require("./src/partWorkshop");

const STORAGE_KEY = "@power_forge_characters_v1";
const CUSTOM_PARTS_KEY = "@power_forge_custom_parts_v1";
const PATTERNS = ["Solid", "Stripes", "Dots", "Circuit", "Camo", "Stars"];
const ALLOWED_CATEGORIES_FOR_DRAWING = new Set(["head", "hair", "face", "mask", "helmet", "torso", "arms", "legs", "boots", "back", "accessory"]);
const DEFAULT_PART_STYLE = { color: "#6C63FF", accent: "#75E7FF", pattern: "Solid", detail: "None", emblem: "", scale: 1, rotation: 0, opacity: 1, brushSize: 10 };
const COLORS = ["#6C63FF", "#E4485D", "#20B8A5", "#F2B544", "#E8EAF2", "#242733", "#62A8FF", "#9B5DE5", "#FF7A00", "#8BD450", "#FF6FCF", "#8B98A7"];
const CATEGORIES = [
  { key: "head", label: "Head", parts: ["Pilot Visor", "Hero Mask", "Open Face", "Skull Helm", "Horned Crown", "Cat-Ear Cowl", "Antenna Helm", "Hooded Mask", "Cyber Visor", "Demon Crown", "Ice Sentinel Helm", "Bone Reaper Mask", "Quantum Sentinel", "Solar Knight", "Abyss Stalker", "Chrome Ronin", "Magma Brute", "Prism Oracle", "Deep-Sea Raider", "Wasteland Reaver", "Starborn Pilot", "Clockwork Visage"] },
  { key: "hair", label: "Hair", parts: ["Spiked Hair", "Silver Sweep", "Flame Crest", "Curly Volume", "Neon Undercut", "Storm Spikes", "Crimson Mane", "Violet Dreads", "Arctic Braid", "Solar Mohawk", "Emerald Waves", "Shadow Fringe", "Copper Curls", "Cosmic Flow", "Crystal Crest"] },
  { key: "face", label: "Face", parts: ["Rugged Face", "Cyber Faceplate", "Alien Features", "Iceborn Features", "Shadow Features", "Battle-Scarred", "Celestial Markings", "Stoneborn Features", "Infernal Features", "Synthwave Face", "Frost Rune Face", "Wildling Features"] },
  { key: "mask", label: "Masks", parts: ["No Mask", "Crimson Mask", "Night Ops Mask", "Gold Visor Mask", "Skull Mask", "Arc-Tech Mask", "Specter Mask", "Solar Guard Mask", "Viper Mask", "Rift Mask", "Pulse Mask", "Ashen Mask", "Crimson Ronin Mask", "Prism Mask"] },
  { key: "helmet", label: "Helmets", parts: ["No Helmet", "Sentinel Helmet", "Horned War Helm", "Royal Crest Helm", "Recon Helmet", "Full Visor Helmet", "Aegis Command Helm", "Magma Siege Helm", "Star Corsair Helm", "Frost Warden Helm", "Dread Monarch Helm", "Wild Hunt Helm", "Quantum Pilot Helm", "Solar Paladin Helm"] },
  { key: "torso", label: "Torso", parts: ["Core Suit", "Heavy Armor", "Stealth Suit", "Tech Jacket", "Bio Armor", "Cosmic Robe", "Exo Frame", "Streetwear Suit", "Techno Knight Armor", "Living Bio-Shell", "Royal Void Armor", "Titanium Vanguard", "Inferno Plate", "Emerald Warden", "Arc Reactor Suit", "Abyssal Carapace", "Aegis Command Armor", "Magma Siege Plate", "Star Corsair Suit", "Frost Warden Armor", "Dread Monarch Plate", "Wild Hunt Leathers", "Quantum Pilot Suit", "Solar Paladin Armor", "Street Phantom Jacket", "Deep-Sea Exosuit"] },
  { key: "arms", label: "Arms", parts: ["Power Gauntlets", "Armored Sleeves", "Energy Bracers", "Bare Arms", "Razor Claws", "Tentacle Arms", "Titan Bracers", "Web Shooters", "Energy Conduits", "Titanium Gauntlets", "Shockwave Bracers", "Inferno Gauntlets", "Emerald Talons", "Void Tendrils", "Siege Gauntlets", "Aegis Impact Bracers", "Magma Fists", "Corsair Hook Arm", "Frost Grip Gauntlets", "Dread Claw Arms", "Wild Hunt Talons", "Quantum Pulse Arms", "Solar Hammer Gauntlets", "Deep-Sea Tentacle Arm"] },
  { key: "legs", label: "Legs", parts: ["Speed Pants", "Combat Armor", "Flex Suit", "Reinforced Legs", "Digitigrade Legs", "Rocket Greaves", "Stealth Leggings", "Spring Legs", "Techno Knight Greaves", "Living Tendon Legs", "Vanguard Greaves", "Inferno Leg Armor", "Emerald Runner Legs", "Void Stalker Legs", "Heavy Siege Legs", "Aegis Strider Legs", "Magma Breaker Legs", "Corsair Raider Legs", "Frost Runner Legs", "Dread Stalker Legs", "Wild Hunt Digitigrade Legs", "Quantum Pilot Legs", "Solar Paladin Greaves", "Deep-Sea Diver Legs"] },
  { key: "boots", label: "Boots", parts: ["Thruster Boots", "Heavy Boots", "Runner Boots", "Mag Boots", "Hover Boots", "Clawed Feet", "Armored Greaves", "Barefoot", "Rocket Thrusters", "Demon Claw Boots", "Stormstep Boots", "Inferno Thrusters", "Emerald Grip Boots", "Void Hover Boots", "Siegebreaker Boots", "Aegis Magnetic Boots", "Magma Tread Boots", "Corsair Deck Boots", "Frost Glide Boots", "Dread Stalker Treads", "Wild Hunt Hooves", "Quantum Hover Boots", "Solar Impact Boots", "Deep-Sea Pressure Boots"] },
  { key: "back", label: "Back", parts: ["Cape", "Jet Pack", "Shield Rig", "No Attachment", "Energy Wings", "Feathered Wings", "Mechanical Wings", "Drone Swarm", "Halo Harness", "Void Tail", "Organic Spines", "Crimson Battle Cape", "Shadow Mantle", "Royal Star Cloak", "Glacier Cape", "Tattered Wraith Cape", "Raven Wings", "Solar Wings", "Crystal Wings", "Void Wings", "Dragon Wings", "Serpent Tail", "Dragon Tail", "Cyber Tail", "Spiked Tail", "Plasma Tail", "Aegis Hardlight Wings", "Magma Phoenix Wings", "Star Corsair Mantle", "Frost Crystal Wings", "Dread Monarch Shroud", "Wild Hunt Antler Rig", "Quantum Portal Frame", "Solar Halo Array", "Deep-Sea Fin Array", "Comet Trail Sails", "Gravity Anchor Rig", "Jester Chaos Streamers"] },
  { key: "accessory", label: "Extras", parts: ["Horned Shoulder Plates", "Arc Reactor", "Royal Pauldrons", "No Extra", "Onyx Horns", "Solar Horns", "Crystal Pauldrons", "Spiked Pauldrons", "Orbit Rings", "Aegis Shoulder Guards", "Magma Horn Crown", "Corsair Bandolier", "Frost Rune Orbs", "Dread Monarch Spikes", "Wild Hunt Antlers", "Quantum Wrist Drones", "Solar Sigil Ring", "Starforge Spear", "Rift Scythe", "Aegis Shield", "Twin Plasma Daggers", "Thunder Maul", "Void Chakram", "Arc Bow", "Magma Chain", "Frost Sabre", "Photon Whip", "Gravity Hammer", "Prism Staff"] },
];
const DEFAULT_CHARACTER = {
  name: "Nova Sentinel",
  alignment: "Hero",
  view: "Front",
  color: "#6C63FF",
  parts: { head: "Hero Mask", hair: "Spiked Hair", face: "Rugged Face", mask: "No Mask", helmet: "No Helmet", torso: "Core Suit", arms: "Power Gauntlets", legs: "Flex Suit", boots: "Runner Boots", back: "Cape", accessory: "No Extra" },
  abilities: ["Energy Blast", "Enhanced Agility"],
  notes: "",
  drawing: [],
  partStyles: {},
  customParts: [],
  editorCategory: "head",
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

const ILLUSTRATED_PARTS = {
  head: require("./assets/character-art/head-hero.png"),
  helmet: require("./assets/character-art/head-helm.png"),
  torso: require("./assets/character-art/torso-armor.png"),
  robe: require("./assets/character-art/torso-robe.png"),
  arms: require("./assets/character-art/arms-armor.png"),
  claws: require("./assets/character-art/arms-claws.png"),
  legs: require("./assets/character-art/legs-armor.png"),
  speedLegs: require("./assets/character-art/legs-speed.png"),
  boots: require("./assets/character-art/boots-armor.png"),
  hoverBoots: require("./assets/character-art/boots-hover.png"),
  cape: require("./assets/character-art/back-cape.png"),
  wings: require("./assets/character-art/back-wings.png"),
  jetpack: require("./assets/character-art/back-jetpack.png"),
  cyberHead: require("./assets/character-art/head_cyber.png"),
  demonHead: require("./assets/character-art/head_demon.png"),
  iceHead: require("./assets/character-art/head_ice.png"),
  skullHead: require("./assets/character-art/head_skull.png"),
  visorHead: require("./assets/character-art/head_visor.png"),
  techTorso: require("./assets/character-art/torso_tech.png"),
  bioTorso: require("./assets/character-art/torso_bio.png"),
  royalTorso: require("./assets/character-art/torso_royal.png"),
  stealthTorso: require("./assets/character-art/torso_stealth.png"),
  energyArms: require("./assets/character-art/arms_energy.png"),
  tentacleArms: require("./assets/character-art/arms_tentacle.png"),
  titanArms: require("./assets/character-art/arms_gauntlets.png"),
  techLegs: require("./assets/character-art/legs_tech.png"),
  organicLegs: require("./assets/character-art/legs_organic.png"),
  thrusterBoots: require("./assets/character-art/boots_thruster.png"),
  clawBoots: require("./assets/character-art/boots_clawed.png"),
  mechWings: require("./assets/character-art/back_mech_wings.png"),
  halo: require("./assets/character-art/back_halo.png"),
  tail: require("./assets/character-art/back_tail.png"),
  organicBack: require("./assets/character-art/back_organic.png"),
  droneBack: require("./assets/character-art/back_drones.png"),
  spines: require("./assets/character-art/back_spines.png"),
  horns: require("./assets/character-art/accessory_horns.png"),
  shoulders: require("./assets/character-art/accessory_shoulder.png"),
  orb: require("./assets/character-art/accessory_orb.png"),
  hair_spiky: require("./assets/character-art/hair_spiky.png"),
  hair_silver: require("./assets/character-art/hair_silver.png"),
  hair_flame: require("./assets/character-art/hair_flame.png"),
  hair_curls: require("./assets/character-art/hair_curls.png"),
  hair_neon: require("./assets/character-art/hair_neon.png"),
  face_stubble: require("./assets/character-art/face_stubble.png"),
  face_cyber: require("./assets/character-art/face_cyber.png"),
  face_alien: require("./assets/character-art/face_alien.png"),
  face_ice: require("./assets/character-art/face_ice.png"),
  face_shadow: require("./assets/character-art/face_shadow.png"),
  mask_crimson: require("./assets/character-art/mask_crimson.png"),
  mask_night: require("./assets/character-art/mask_night.png"),
  mask_gold: require("./assets/character-art/mask_gold.png"),
  mask_skull: require("./assets/character-art/mask_skull.png"),
  mask_arc: require("./assets/character-art/mask_arc.png"),
  helmet_sentinel: require("./assets/character-art/helmet_sentinel.png"),
  helmet_horned: require("./assets/character-art/helmet_horned.png"),
  helmet_royal: require("./assets/character-art/helmet_royal.png"),
  helmet_recon: require("./assets/character-art/helmet_recon.png"),
  helmet_visor: require("./assets/character-art/helmet_visor.png"),
  torso_vanguard: require("./assets/character-art/torso_vanguard.png"),
  torso_inferno: require("./assets/character-art/torso_inferno.png"),
  torso_warden: require("./assets/character-art/torso_warden.png"),
  torso_arc: require("./assets/character-art/torso_arc.png"),
  torso_abyss: require("./assets/character-art/torso_abyss.png"),
  arms_shockwave: require("./assets/character-art/arms_shockwave.png"),
  arms_inferno: require("./assets/character-art/arms_inferno.png"),
  arms_talons: require("./assets/character-art/arms_talons.png"),
  arms_void: require("./assets/character-art/arms_void.png"),
  arms_siege: require("./assets/character-art/arms_siege.png"),
  legs_vanguard: require("./assets/character-art/legs_vanguard.png"),
  legs_inferno: require("./assets/character-art/legs_inferno.png"),
  legs_runner: require("./assets/character-art/legs_runner.png"),
  legs_stalker: require("./assets/character-art/legs_stalker.png"),
  legs_siege: require("./assets/character-art/legs_siege.png"),
  boots_storm: require("./assets/character-art/boots_storm.png"),
  boots_inferno: require("./assets/character-art/boots_inferno.png"),
  boots_grip: require("./assets/character-art/boots_grip.png"),
  boots_void: require("./assets/character-art/boots_void.png"),
  boots_siege: require("./assets/character-art/boots_siege.png"),
  back_crimson_cape: require("./assets/character-art/back_crimson_cape.png"),
  back_shadow_mantle: require("./assets/character-art/back_shadow_mantle.png"),
  back_royal_cloak: require("./assets/character-art/back_royal_cloak.png"),
  back_ice_cape: require("./assets/character-art/back_ice_cape.png"),
  back_tattered_cape: require("./assets/character-art/back_tattered_cape.png"),
  back_raven_wings: require("./assets/character-art/back_raven_wings.png"),
  back_solar_wings: require("./assets/character-art/back_solar_wings.png"),
  back_crystal_wings: require("./assets/character-art/back_crystal_wings.png"),
  back_void_wings: require("./assets/character-art/back_void_wings.png"),
  back_dragon_wings: require("./assets/character-art/back_dragon_wings.png"),
  back_serpent_tail: require("./assets/character-art/back_serpent_tail.png"),
  back_dragon_tail: require("./assets/character-art/back_dragon_tail.png"),
  back_cyber_tail: require("./assets/character-art/back_cyber_tail.png"),
  back_spiked_tail: require("./assets/character-art/back_spiked_tail.png"),
  back_plasma_tail: require("./assets/character-art/back_plasma_tail.png"),
  accessory_onyx_horns: require("./assets/character-art/accessory_onyx_horns.png"),
  accessory_solar_horns: require("./assets/character-art/accessory_solar_horns.png"),
  accessory_crystal_pauldron: require("./assets/character-art/accessory_crystal_pauldron.png"),
  accessory_spiked_pauldron: require("./assets/character-art/accessory_spiked_pauldron.png"),
  accessory_orbit_rings: require("./assets/character-art/accessory_orbit_rings.png"),

  // v16: 100 additional locally bundled illustrated parts
  "Quantum Sentinel": require("./assets/character-art/head_quantum.png"),
  "Solar Knight": require("./assets/character-art/head_solar.png"),
  "Abyss Stalker": require("./assets/character-art/head_abyss.png"),
  "Chrome Ronin": require("./assets/character-art/head_ronin.png"),
  "Magma Brute": require("./assets/character-art/head_magma.png"),
  "Prism Oracle": require("./assets/character-art/head_prism.png"),
  "Deep-Sea Raider": require("./assets/character-art/head_deepsea.png"),
  "Wasteland Reaver": require("./assets/character-art/head_waste.png"),
  "Starborn Pilot": require("./assets/character-art/head_starborn.png"),
  "Clockwork Visage": require("./assets/character-art/head_clockwork.png"),
  "Storm Spikes": require("./assets/character-art/hair_storm.png"),
  "Crimson Mane": require("./assets/character-art/hair_crimson.png"),
  "Violet Dreads": require("./assets/character-art/hair_dreads.png"),
  "Arctic Braid": require("./assets/character-art/hair_braid.png"),
  "Solar Mohawk": require("./assets/character-art/hair_mohawk.png"),
  "Emerald Waves": require("./assets/character-art/hair_emerald.png"),
  "Shadow Fringe": require("./assets/character-art/hair_fringe.png"),
  "Copper Curls": require("./assets/character-art/hair_copper.png"),
  "Cosmic Flow": require("./assets/character-art/hair_cosmic.png"),
  "Crystal Crest": require("./assets/character-art/hair_crystal.png"),
  "Battle-Scarred": require("./assets/character-art/face_scarred.png"),
  "Celestial Markings": require("./assets/character-art/face_celestial.png"),
  "Stoneborn Features": require("./assets/character-art/face_stone.png"),
  "Infernal Features": require("./assets/character-art/face_infernal.png"),
  "Synthwave Face": require("./assets/character-art/face_synth.png"),
  "Frost Rune Face": require("./assets/character-art/face_frost.png"),
  "Wildling Features": require("./assets/character-art/face_wild.png"),
  "Specter Mask": require("./assets/character-art/mask_specter.png"),
  "Solar Guard Mask": require("./assets/character-art/mask_solar.png"),
  "Viper Mask": require("./assets/character-art/mask_viper.png"),
  "Rift Mask": require("./assets/character-art/mask_rift.png"),
  "Pulse Mask": require("./assets/character-art/mask_pulse.png"),
  "Ashen Mask": require("./assets/character-art/mask_ashen.png"),
  "Crimson Ronin Mask": require("./assets/character-art/mask_ronin.png"),
  "Prism Mask": require("./assets/character-art/mask_prism.png"),
  "Aegis Command Helm": require("./assets/character-art/helmet_aegis.png"),
  "Magma Siege Helm": require("./assets/character-art/helmet_magma.png"),
  "Star Corsair Helm": require("./assets/character-art/helmet_corsair.png"),
  "Frost Warden Helm": require("./assets/character-art/helmet_frost.png"),
  "Dread Monarch Helm": require("./assets/character-art/helmet_dread.png"),
  "Wild Hunt Helm": require("./assets/character-art/helmet_hunt.png"),
  "Quantum Pilot Helm": require("./assets/character-art/helmet_quantum.png"),
  "Solar Paladin Helm": require("./assets/character-art/helmet_paladin.png"),
  "Aegis Command Armor": require("./assets/character-art/torso_aegis.png"),
  "Magma Siege Plate": require("./assets/character-art/torso_magma.png"),
  "Star Corsair Suit": require("./assets/character-art/torso_corsair.png"),
  "Frost Warden Armor": require("./assets/character-art/torso_frost.png"),
  "Dread Monarch Plate": require("./assets/character-art/torso_dread.png"),
  "Wild Hunt Leathers": require("./assets/character-art/torso_hunt.png"),
  "Quantum Pilot Suit": require("./assets/character-art/torso_quantum.png"),
  "Solar Paladin Armor": require("./assets/character-art/torso_paladin.png"),
  "Street Phantom Jacket": require("./assets/character-art/torso_phantom.png"),
  "Deep-Sea Exosuit": require("./assets/character-art/torso_deepsea.png"),
  "Aegis Impact Bracers": require("./assets/character-art/arms_aegis.png"),
  "Magma Fists": require("./assets/character-art/arms_magma.png"),
  "Corsair Hook Arm": require("./assets/character-art/arms_corsair.png"),
  "Frost Grip Gauntlets": require("./assets/character-art/arms_frost.png"),
  "Dread Claw Arms": require("./assets/character-art/arms_dread.png"),
  "Wild Hunt Talons": require("./assets/character-art/arms_hunt.png"),
  "Quantum Pulse Arms": require("./assets/character-art/arms_quantum.png"),
  "Solar Hammer Gauntlets": require("./assets/character-art/arms_paladin.png"),
  "Deep-Sea Tentacle Arm": require("./assets/character-art/arms_deepsea.png"),
  "Aegis Strider Legs": require("./assets/character-art/legs_aegis.png"),
  "Magma Breaker Legs": require("./assets/character-art/legs_magma.png"),
  "Corsair Raider Legs": require("./assets/character-art/legs_corsair.png"),
  "Frost Runner Legs": require("./assets/character-art/legs_frost.png"),
  "Dread Stalker Legs": require("./assets/character-art/legs_dread.png"),
  "Wild Hunt Digitigrade Legs": require("./assets/character-art/legs_hunt.png"),
  "Quantum Pilot Legs": require("./assets/character-art/legs_quantum.png"),
  "Solar Paladin Greaves": require("./assets/character-art/legs_paladin.png"),
  "Deep-Sea Diver Legs": require("./assets/character-art/legs_deepsea.png"),
  "Aegis Magnetic Boots": require("./assets/character-art/boots_aegis.png"),
  "Magma Tread Boots": require("./assets/character-art/boots_magma.png"),
  "Corsair Deck Boots": require("./assets/character-art/boots_corsair.png"),
  "Frost Glide Boots": require("./assets/character-art/boots_frost.png"),
  "Dread Stalker Treads": require("./assets/character-art/boots_dread.png"),
  "Wild Hunt Hooves": require("./assets/character-art/boots_hunt.png"),
  "Quantum Hover Boots": require("./assets/character-art/boots_quantum.png"),
  "Solar Impact Boots": require("./assets/character-art/boots_paladin.png"),
  "Deep-Sea Pressure Boots": require("./assets/character-art/boots_deepsea.png"),
  "Aegis Hardlight Wings": require("./assets/character-art/back_aegis_wings.png"),
  "Magma Phoenix Wings": require("./assets/character-art/back_magma_wings.png"),
  "Star Corsair Mantle": require("./assets/character-art/back_corsair_mantle.png"),
  "Frost Crystal Wings": require("./assets/character-art/back_frost_wings.png"),
  "Dread Monarch Shroud": require("./assets/character-art/back_dread_shroud.png"),
  "Wild Hunt Antler Rig": require("./assets/character-art/back_hunt_rig.png"),
  "Quantum Portal Frame": require("./assets/character-art/back_quantum_portal.png"),
  "Solar Halo Array": require("./assets/character-art/back_solar_halo.png"),
  "Deep-Sea Fin Array": require("./assets/character-art/back_deepsea_fins.png"),
  "Comet Trail Sails": require("./assets/character-art/back_comet_sails.png"),
  "Gravity Anchor Rig": require("./assets/character-art/back_gravity_rig.png"),
  "Jester Chaos Streamers": require("./assets/character-art/back_jester_streamers.png"),
  "Aegis Shoulder Guards": require("./assets/character-art/accessory_aegis_shoulders.png"),
  "Magma Horn Crown": require("./assets/character-art/accessory_magma_horns.png"),
  "Corsair Bandolier": require("./assets/character-art/accessory_corsair_bandolier.png"),
  "Frost Rune Orbs": require("./assets/character-art/accessory_frost_orbs.png"),
  "Dread Monarch Spikes": require("./assets/character-art/accessory_dread_spikes.png"),
  "Wild Hunt Antlers": require("./assets/character-art/accessory_hunt_antlers.png"),
  "Quantum Wrist Drones": require("./assets/character-art/accessory_quantum_drones.png"),
  "Solar Sigil Ring": require("./assets/character-art/accessory_solar_ring.png"),
};


const artFor = (category, label) => {
  if (!label) return null;
  const categoryLabels = {
    head: new Set(["Quantum Sentinel", "Solar Knight", "Abyss Stalker", "Chrome Ronin", "Magma Brute", "Prism Oracle", "Deep-Sea Raider", "Wasteland Reaver", "Starborn Pilot", "Clockwork Visage"]),
    hair: new Set(["Storm Spikes", "Crimson Mane", "Violet Dreads", "Arctic Braid", "Solar Mohawk", "Emerald Waves", "Shadow Fringe", "Copper Curls", "Cosmic Flow", "Crystal Crest"]),
    face: new Set(["Battle-Scarred", "Celestial Markings", "Stoneborn Features", "Infernal Features", "Synthwave Face", "Frost Rune Face", "Wildling Features"]),
    mask: new Set(["Specter Mask", "Solar Guard Mask", "Viper Mask", "Rift Mask", "Pulse Mask", "Ashen Mask", "Crimson Ronin Mask", "Prism Mask"]),
    helmet: new Set(["Aegis Command Helm", "Magma Siege Helm", "Star Corsair Helm", "Frost Warden Helm", "Dread Monarch Helm", "Wild Hunt Helm", "Quantum Pilot Helm", "Solar Paladin Helm"]),
    torso: new Set(["Aegis Command Armor", "Magma Siege Plate", "Star Corsair Suit", "Frost Warden Armor", "Dread Monarch Plate", "Wild Hunt Leathers", "Quantum Pilot Suit", "Solar Paladin Armor", "Street Phantom Jacket", "Deep-Sea Exosuit"]),
    arms: new Set(["Aegis Impact Bracers", "Magma Fists", "Corsair Hook Arm", "Frost Grip Gauntlets", "Dread Claw Arms", "Wild Hunt Talons", "Quantum Pulse Arms", "Solar Hammer Gauntlets", "Deep-Sea Tentacle Arm"]),
    legs: new Set(["Aegis Strider Legs", "Magma Breaker Legs", "Corsair Raider Legs", "Frost Runner Legs", "Dread Stalker Legs", "Wild Hunt Digitigrade Legs", "Quantum Pilot Legs", "Solar Paladin Greaves", "Deep-Sea Diver Legs"]),
    boots: new Set(["Aegis Magnetic Boots", "Magma Tread Boots", "Corsair Deck Boots", "Frost Glide Boots", "Dread Stalker Treads", "Wild Hunt Hooves", "Quantum Hover Boots", "Solar Impact Boots", "Deep-Sea Pressure Boots"]),
    back: new Set(["Aegis Hardlight Wings", "Magma Phoenix Wings", "Star Corsair Mantle", "Frost Crystal Wings", "Dread Monarch Shroud", "Wild Hunt Antler Rig", "Quantum Portal Frame", "Solar Halo Array", "Deep-Sea Fin Array", "Comet Trail Sails", "Gravity Anchor Rig", "Jester Chaos Streamers"]),
    accessory: new Set(["Aegis Shoulder Guards", "Magma Horn Crown", "Corsair Bandolier", "Frost Rune Orbs", "Dread Monarch Spikes", "Wild Hunt Antlers", "Quantum Wrist Drones", "Solar Sigil Ring"]),
  };
  return categoryLabels[category]?.has(label) ? ILLUSTRATED_PARTS[label] || null : null;
};

function CharacterPreview({ character }) {
  const isBack = character.view === "Back";
  const backPart = character.parts?.back || "Cape";
  const hasWings = /Wings/i.test(backPart) && !/Mechanical/i.test(backPart);
  const hasCape = /Cape/i.test(backPart);
  const hasJetpack = /Jet Pack/i.test(backPart);
  const hasBackArt = hasCape || hasWings || hasJetpack || /Mechanical Wings|Drone|Halo|Tail|Spines|Shield Rig/i.test(backPart);
  const headName = character.parts?.head || "";
  const headAsset = artFor("head", headName) || ( /Cyber/i.test(headName) ? ILLUSTRATED_PARTS.cyberHead : /Demon|Horned/i.test(headName) ? ILLUSTRATED_PARTS.demonHead : /Ice/i.test(headName) ? ILLUSTRATED_PARTS.iceHead : /Skull|Bone/i.test(headName) ? ILLUSTRATED_PARTS.skullHead : /Visor|Pilot/i.test(headName) ? ILLUSTRATED_PARTS.visorHead : /Helm|Cowl|Crown|Hood/i.test(headName) ? ILLUSTRATED_PARTS.helmet : ILLUSTRATED_PARTS.head);
  const hairName = character.parts?.hair || "";
  const hairAsset = artFor("hair", hairName) || (/Silver/i.test(hairName) ? ILLUSTRATED_PARTS.hair_silver : /Flame/i.test(hairName) ? ILLUSTRATED_PARTS.hair_flame : /Curly/i.test(hairName) ? ILLUSTRATED_PARTS.hair_curls : /Neon/i.test(hairName) ? ILLUSTRATED_PARTS.hair_neon : hairName ? ILLUSTRATED_PARTS.hair_spiky : null);
  const faceName = character.parts?.face || "";
  const faceAsset = artFor("face", faceName) || (/Cyber/i.test(faceName) ? ILLUSTRATED_PARTS.face_cyber : /Alien/i.test(faceName) ? ILLUSTRATED_PARTS.face_alien : /Ice/i.test(faceName) ? ILLUSTRATED_PARTS.face_ice : /Shadow/i.test(faceName) ? ILLUSTRATED_PARTS.face_shadow : faceName ? ILLUSTRATED_PARTS.face_stubble : null);
  const maskName = /No Mask/i.test(character.parts?.mask || "") ? "" : (character.parts?.mask || "");
  const maskAsset = artFor("mask", maskName) || (/Night/i.test(maskName) ? ILLUSTRATED_PARTS.mask_night : /Gold/i.test(maskName) ? ILLUSTRATED_PARTS.mask_gold : /Skull/i.test(maskName) ? ILLUSTRATED_PARTS.mask_skull : /Arc/i.test(maskName) ? ILLUSTRATED_PARTS.mask_arc : maskName ? ILLUSTRATED_PARTS.mask_crimson : null);
  const helmetName = /No Helmet/i.test(character.parts?.helmet || "") ? "" : (character.parts?.helmet || "");
  const helmetAsset = artFor("helmet", helmetName) || (/Horned/i.test(helmetName) ? ILLUSTRATED_PARTS.helmet_horned : /Royal/i.test(helmetName) ? ILLUSTRATED_PARTS.helmet_royal : /Recon/i.test(helmetName) ? ILLUSTRATED_PARTS.helmet_recon : /Full Visor/i.test(helmetName) ? ILLUSTRATED_PARTS.helmet_visor : helmetName ? ILLUSTRATED_PARTS.helmet_sentinel : null);
  const torsoName = character.parts?.torso || "";
  const torsoAsset = artFor("torso", torsoName) || (/Titanium Vanguard/i.test(torsoName) ? ILLUSTRATED_PARTS.torso_vanguard : /Inferno Plate/i.test(torsoName) ? ILLUSTRATED_PARTS.torso_inferno : /Emerald Warden/i.test(torsoName) ? ILLUSTRATED_PARTS.torso_warden : /Arc Reactor Suit/i.test(torsoName) ? ILLUSTRATED_PARTS.torso_arc : /Abyssal Carapace/i.test(torsoName) ? ILLUSTRATED_PARTS.torso_abyss : /Robe/i.test(torsoName) ? ILLUSTRATED_PARTS.robe : /Bio|Living/i.test(torsoName) ? ILLUSTRATED_PARTS.bioTorso : /Royal|Void/i.test(torsoName) ? ILLUSTRATED_PARTS.royalTorso : /Stealth/i.test(torsoName) ? ILLUSTRATED_PARTS.stealthTorso : /Tech|Exo/i.test(torsoName) ? ILLUSTRATED_PARTS.techTorso : ILLUSTRATED_PARTS.torso);
  const armsName = character.parts?.arms || "";
  const armsAsset = artFor("arms", armsName) || (/Shockwave/i.test(armsName) ? ILLUSTRATED_PARTS.arms_shockwave : /Inferno Gauntlets/i.test(armsName) ? ILLUSTRATED_PARTS.arms_inferno : /Emerald Talons/i.test(armsName) ? ILLUSTRATED_PARTS.arms_talons : /Void Tendrils/i.test(armsName) ? ILLUSTRATED_PARTS.arms_void : /Siege Gauntlets/i.test(armsName) ? ILLUSTRATED_PARTS.arms_siege : /Tentacle/i.test(armsName) ? ILLUSTRATED_PARTS.tentacleArms : /Energy/i.test(armsName) ? ILLUSTRATED_PARTS.energyArms : /Titanium|Titan/i.test(armsName) ? ILLUSTRATED_PARTS.titanArms : /Claw|Razor/i.test(armsName) ? ILLUSTRATED_PARTS.claws : ILLUSTRATED_PARTS.arms);
  const legsName = character.parts?.legs || "";
  const legsAsset = artFor("legs", legsName) || (/Vanguard Greaves/i.test(legsName) ? ILLUSTRATED_PARTS.legs_vanguard : /Inferno Leg Armor/i.test(legsName) ? ILLUSTRATED_PARTS.legs_inferno : /Emerald Runner/i.test(legsName) ? ILLUSTRATED_PARTS.legs_runner : /Void Stalker/i.test(legsName) ? ILLUSTRATED_PARTS.legs_stalker : /Heavy Siege/i.test(legsName) ? ILLUSTRATED_PARTS.legs_siege : /Living|Organic/i.test(legsName) ? ILLUSTRATED_PARTS.organicLegs : /Techno|Rocket|Reinforced/i.test(legsName) ? ILLUSTRATED_PARTS.techLegs : /Speed|Digitigrade|Spring/i.test(legsName) ? ILLUSTRATED_PARTS.speedLegs : ILLUSTRATED_PARTS.legs);
  const bootsName = character.parts?.boots || "";
  const bootsAsset = artFor("boots", bootsName) || (/Stormstep/i.test(bootsName) ? ILLUSTRATED_PARTS.boots_storm : /Inferno Thrusters/i.test(bootsName) ? ILLUSTRATED_PARTS.boots_inferno : /Emerald Grip/i.test(bootsName) ? ILLUSTRATED_PARTS.boots_grip : /Void Hover/i.test(bootsName) ? ILLUSTRATED_PARTS.boots_void : /Siegebreaker/i.test(bootsName) ? ILLUSTRATED_PARTS.boots_siege : /Claw|Demon/i.test(bootsName) ? ILLUSTRATED_PARTS.clawBoots : /Thruster|Rocket/i.test(bootsName) ? ILLUSTRATED_PARTS.thrusterBoots : /Hover/i.test(bootsName) ? ILLUSTRATED_PARTS.hoverBoots : ILLUSTRATED_PARTS.boots);
  const accessoryName = character.parts?.accessory || "";
  const accessoryAsset = artFor("accessory", accessoryName) || (/Crystal Pauldrons/i.test(accessoryName) ? ILLUSTRATED_PARTS.accessory_crystal_pauldron : /Spiked Pauldrons/i.test(accessoryName) ? ILLUSTRATED_PARTS.accessory_spiked_pauldron : /Onyx Horns/i.test(accessoryName) ? ILLUSTRATED_PARTS.accessory_onyx_horns : /Solar Horns/i.test(accessoryName) ? ILLUSTRATED_PARTS.accessory_solar_horns : /Orbit Rings/i.test(accessoryName) ? ILLUSTRATED_PARTS.accessory_orbit_rings : /Shoulder|Pauldrons/i.test(accessoryName) ? ILLUSTRATED_PARTS.shoulders : /Reactor/i.test(accessoryName) ? ILLUSTRATED_PARTS.orb : /Horn/i.test(accessoryName) ? ILLUSTRATED_PARTS.horns : null);
  const weaponGlyph = /Spear/i.test(accessoryName) ? "⚔" : /Scythe/i.test(accessoryName) ? "⚒" : /Shield/i.test(accessoryName) ? "🛡" : /Daggers/i.test(accessoryName) ? "🗡" : /Maul|Hammer/i.test(accessoryName) ? "🔨" : /Chakram/i.test(accessoryName) ? "◉" : /Bow/i.test(accessoryName) ? "➶" : /Chain/i.test(accessoryName) ? "⛓" : /Sabre/i.test(accessoryName) ? "⚔" : /Whip/i.test(accessoryName) ? "〰" : /Staff/i.test(accessoryName) ? "ϟ" : null;
  const accent = character.accentColor || "#75E7FF";
  const layer = (source, key, extra = {}) => {
    const custom = character.partStyles?.[key] || {};
    const transforms = [{ scale: Number(custom.scale || 1) }, { rotate: `${Number(custom.rotation || 0)}deg` }];
    return <Image key={key} source={source} resizeMode="stretch" style={[styles.illustratedLayer, { opacity: custom.opacity == null ? 1 : custom.opacity, transform: transforms, ...(custom.color ? { tintColor: custom.color } : {}) }, extra]} />;
  };
  return (
    <View style={styles.previewStage}>
      <View style={styles.previewTopRow}>
        <Text style={styles.previewCaption}>{isBack ? "REAR VIEW · ILLUSTRATED" : "FRONT VIEW · ILLUSTRATED"}</Text>
        <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>{(character.alignment || "Hero").toUpperCase()}</Text></View>
      </View>
      <View style={styles.illustratedStage}>
        <View pointerEvents="none" style={styles.artGlow} />
        {hasBackArt && layer((artFor("back", backPart) || (/Crimson Battle Cape/i.test(backPart) ? ILLUSTRATED_PARTS.back_crimson_cape : /Shadow Mantle/i.test(backPart) ? ILLUSTRATED_PARTS.back_shadow_mantle : /Royal Star Cloak/i.test(backPart) ? ILLUSTRATED_PARTS.back_royal_cloak : /Glacier Cape/i.test(backPart) ? ILLUSTRATED_PARTS.back_ice_cape : /Tattered Wraith/i.test(backPart) ? ILLUSTRATED_PARTS.back_tattered_cape : /Raven Wings/i.test(backPart) ? ILLUSTRATED_PARTS.back_raven_wings : /Solar Wings/i.test(backPart) ? ILLUSTRATED_PARTS.back_solar_wings : /Crystal Wings/i.test(backPart) ? ILLUSTRATED_PARTS.back_crystal_wings : /Void Wings/i.test(backPart) ? ILLUSTRATED_PARTS.back_void_wings : /Dragon Wings/i.test(backPart) ? ILLUSTRATED_PARTS.back_dragon_wings : /Serpent Tail/i.test(backPart) ? ILLUSTRATED_PARTS.back_serpent_tail : /Dragon Tail/i.test(backPart) ? ILLUSTRATED_PARTS.back_dragon_tail : /Cyber Tail/i.test(backPart) ? ILLUSTRATED_PARTS.back_cyber_tail : /Spiked Tail/i.test(backPart) ? ILLUSTRATED_PARTS.back_spiked_tail : /Plasma Tail/i.test(backPart) ? ILLUSTRATED_PARTS.back_plasma_tail : /Mechanical/i.test(backPart) ? ILLUSTRATED_PARTS.mechWings : /Drone|Shield/i.test(backPart) ? ILLUSTRATED_PARTS.droneBack : /Halo/i.test(backPart) ? ILLUSTRATED_PARTS.halo : /Tail/i.test(backPart) ? ILLUSTRATED_PARTS.tail : /Spines/i.test(backPart) ? ILLUSTRATED_PARTS.spines : hasCape ? ILLUSTRATED_PARTS.cape : hasWings ? ILLUSTRATED_PARTS.wings : ILLUSTRATED_PARTS.jetpack)), "back", { opacity: hasCape ? 0.96 : 0.9 })}
        {layer(legsAsset, "legs")}
        {layer(bootsAsset, "boots")}
        {layer(armsAsset, "arms")}
        {layer(torsoAsset, "torso")}
        {layer(headAsset, "head")}
        {faceAsset && layer(faceAsset, "face", { opacity: 0.88 })}
        {hairAsset && layer(hairAsset, "hair", { opacity: 0.98 })}
        {maskAsset && layer(maskAsset, "mask", { opacity: 0.98 })}
        {helmetAsset && layer(helmetAsset, "helmet", { opacity: 0.98 })}
        {accessoryAsset && layer(accessoryAsset, "accessory")}
        {weaponGlyph && <Text pointerEvents="none" style={[styles.weaponOverlay, { color: character.partStyles?.accessory?.color || accent, opacity: character.partStyles?.accessory?.opacity ?? 1, transform: [{ scale: character.partStyles?.accessory?.scale || 1 }, { rotate: `${character.partStyles?.accessory?.rotation || 0}deg` }] }]}>{weaponGlyph}</Text>}
        {!isBack && <View pointerEvents="none" style={[styles.artCoreGlow, { backgroundColor: accent, shadowColor: accent }]} />}
        {Object.entries(character.partStyles || {}).map(([category, style]) => {
          const pattern = style?.pattern || "Solid";
          if (pattern === "Solid") return null;
          const glyph = pattern === "Stripes" ? "╱" : pattern === "Dots" ? "•" : pattern === "Circuit" ? "⌁" : pattern === "Camo" ? "◆" : "✦";
          const zones = { head: [78, 28], hair: [78, 12], face: [78, 58], mask: [78, 60], helmet: [78, 22], torso: [78, 135], arms: [28, 146], legs: [78, 232], boots: [78, 286], back: [18, 140], accessory: [150, 120] };
          const [left, top] = zones[category] || [78, 135];
          return <View key={`pattern-${category}`} pointerEvents="none" style={[styles.patternZone, { left, top, transform: [{ scale: Number(style.scale || 1) }, { rotate: `${Number(style.rotation || 0)}deg` }], opacity: Number(style.opacity ?? 1) }]}>{Array.from({ length: 6 }, (_, i) => <Text key={`${category}-${pattern}-${i}`} style={{ color: style.accent || accent, opacity: 0.9, fontSize: pattern === "Stripes" ? 19 : 14, marginRight: 3 }}>{glyph}</Text>)}</View>;
        })}
        {Object.entries(character.partStyles || {}).map(([category, style]) => {
          const zones = { head: [78, 30], hair: [78, 8], face: [78, 58], mask: [78, 60], helmet: [78, 22], torso: [78, 145], arms: [24, 150], legs: [78, 235], boots: [78, 290], back: [16, 155], accessory: [150, 128] };
          const [left, top] = zones[category] || [78, 145];
          const featureGlyph = ({ Spikes: "▲", "Armor Plates": "⬟", Runes: "ᚱ", "Energy Nodes": "✦", Chevron: "⌄" })[style?.detail];
          if (!featureGlyph && !style?.emblem) return null;
          return <View key={`detail-${category}`} pointerEvents="none" style={{ position: "absolute", left, top, flexDirection: "row", alignItems: "center", gap: 3, opacity: Number(style?.opacity ?? 1), transform: [{ scale: Number(style?.scale || 1) }, { rotate: `${Number(style?.rotation || 0)}deg` }] }}>
            {featureGlyph && <Text style={{ color: style?.accent || accent, fontSize: 18, fontWeight: "900", textShadowColor: style?.color || accent, textShadowRadius: 5 }}>{featureGlyph}{featureGlyph}{featureGlyph}</Text>}
            {!!style?.emblem && <Text style={{ color: style?.accent || accent, fontSize: 12, fontWeight: "900", textShadowColor: style?.color || accent, textShadowRadius: 4 }}>{style.emblem}</Text>}
          </View>;
        })}
        {(character.drawing || []).filter(point => !point.category || point.category === "all" || ALLOWED_CATEGORIES_FOR_DRAWING.has(point.category)).slice(-500).map((point, index) => {
          const projected = projectDrawingPoint(point);
          const left = projected.x;
          const top = projected.y;
          const size = Math.max(2, Math.min(24, Number(point.size || 6) * (projected.legacy ? 1 : 1.5)));
          return <View key={point.id || index} pointerEvents="none" style={[styles.drawDot, { left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: point.color || "#FFFFFF" }]} />;
        })}
      </View>
      <Text style={styles.previewName}>{character.name || "Unnamed Character"}</Text>
      <Text style={styles.previewSub}>{character.parts?.torso || "Armor"} · {character.parts?.head || "Hero Mask"}</Text>
      <Text style={styles.artNote}>Illustrated modular preview · first asset set</Text>
    </View>
  );
}

function DrawingPad({ color, points, onAddPoint, onClear, onUndo, brushSize = 10 }) {
  const [padSize, setPadSize] = useState({ width: 1, height: 1 });
  const addNormalizedPoint = (event) => {
    const { x, y } = normalizeCanvasPoint(event.nativeEvent.locationX, event.nativeEvent.locationY, padSize.width, padSize.height);
    onAddPoint(x, y, color);
  };
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: addNormalizedPoint,
    onPanResponderMove: addNormalizedPoint,
  }), [color, onAddPoint, padSize.width, padSize.height]);
  return (
    <View style={styles.drawingWrap}>
      <View style={styles.drawingHeader}>
        <Text style={styles.cardTitle}>Custom mark-up</Text>
        <View style={{ flexDirection: "row", gap: 12 }}><Pressable onPress={onUndo}><Text style={styles.clearText}>Undo</Text></Pressable><Pressable onPress={onClear}><Text style={styles.clearText}>Clear part</Text></Pressable></View>
      </View>
      <View style={styles.drawingPad} onLayout={(event) => setPadSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })} {...responder.panHandlers}>
        <Text pointerEvents="none" style={styles.drawingHint}>Draw here with your finger</Text>
        {points.map((p, i) => <View key={p.id || i} pointerEvents="none" style={[styles.drawMark, { left: (p.x <= 1 ? p.x * padSize.width : p.x) - (p.size || brushSize) / 2, top: (p.y <= 1 ? p.y * padSize.height : p.y) - (p.size || brushSize) / 2, width: p.size || brushSize, height: p.size || brushSize, borderRadius: (p.size || brushSize) / 2, backgroundColor: p.color }]} />)}
      </View>
      <Text style={styles.helperText}>Freehand marks are saved locally and tagged to the selected part category.</Text>
    </View>
  );
}

export default function App() {
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [saved, setSaved] = useState([]);
  const [customParts, setCustomParts] = useState([]);
  const [customPartName, setCustomPartName] = useState("");
  const [customHex, setCustomHex] = useState("#6C63FF");
  const [editingCustomPartId, setEditingCustomPartId] = useState(null);
  const [customEmblem, setCustomEmblem] = useState("");
  const [tab, setTab] = useState("Build");
  const [activeCategory, setActiveCategory] = useState("head");
  const [loaded, setLoaded] = useState(false);
  const [showcaseAbility, setShowcaseAbility] = useState("Energy Blast");
  const [renameId, setRenameId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [abilitySearch, setAbilitySearch] = useState("");
  const [powerFilter, setPowerFilter] = useState("All");
  const [backupMode, setBackupMode] = useState(null);
  const [backupText, setBackupText] = useState("");
  const [effectKey, setEffectKey] = useState(0);
  const [battle, setBattle] = useState(null);
  const [rivalId, setRivalId] = useState("demo");
  const effectProgress = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSaved(JSON.parse(raw));
        const customRaw = await AsyncStorage.getItem(CUSTOM_PARTS_KEY);
        if (customRaw) setCustomParts(JSON.parse(customRaw));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const update = (patch) => setCharacter((prev) => ({ ...prev, ...patch }));
  const updatePart = (key, value) => setCharacter((prev) => ({ ...prev, parts: { ...prev.parts, [key]: value } }));
  const activePartStyle = normalizePartStyle({ ...DEFAULT_PART_STYLE, ...(character.partStyles?.[activeCategory] || {}) });
  const updatePartStyle = (patch) => setCharacter(prev => ({ ...prev, editorCategory: activeCategory, partStyles: { ...(prev.partStyles || {}), [activeCategory]: normalizePartStyle({ ...DEFAULT_PART_STYLE, ...(prev.partStyles?.[activeCategory] || {}), ...patch }) } }));
  const applyCustomHex = (target) => {
    const value = customHex.trim();
    if (!isValidHexColor(value)) {
      Alert.alert("Invalid color", "Enter a hex color such as #7A4CFF or #ABC.");
      return;
    }
    updatePartStyle(target === "accent" ? { accent: value.toUpperCase() } : { color: value.toUpperCase() });
  };
  const saveCustomPart = async () => {
    const name = customPartName.trim();
    if (!name) { Alert.alert("Name your part", "Enter a name for this reusable custom part."); return; }
    let item;
    try {
      item = createCustomPartPreset({ id: `${Date.now()}`, name, category: activeCategory, basePart: character.parts?.[activeCategory], style: normalizePartStyle(activePartStyle), drawing: (character.drawing || []).filter(p => p.category === activeCategory) });
    } catch (error) { Alert.alert("Couldn't save part", error.message || "Choose a name and base part first."); return; }
    const hasEditingTarget = editingCustomPartId && customParts.some(existing => existing.id === editingCustomPartId);
    const next = hasEditingTarget
      ? customParts.map(existing => existing.id === editingCustomPartId ? { ...item, id: editingCustomPartId, updatedAt: new Date().toISOString() } : existing)
      : [item, ...customParts].slice(0, 500);
    try { await AsyncStorage.setItem(CUSTOM_PARTS_KEY, JSON.stringify(next)); setCustomParts(next); setCustomPartName(""); setEditingCustomPartId(null); Alert.alert(editingCustomPartId ? "Part updated" : "Part saved", `${name} is in your local Part Workshop library.`); }
    catch (e) { Alert.alert("Couldn't save part", "Try again after freeing some device storage."); }
  };
  const applyCustomPart = (item) => {
    setActiveCategory(item.category);
    setCustomEmblem(item.style?.emblem || "");
    try { setCharacter(prev => applyCustomPartPreset(prev, item, DEFAULT_PART_STYLE)); }
    catch (error) { Alert.alert("Couldn't apply part", error.message || "This saved part is invalid."); return; }
    Alert.alert("Custom part applied", `${item.name} was applied to ${item.category}.`);
  };
  const editCustomPart = (item) => {
    try {
      setActiveCategory(item.category);
      setEditingCustomPartId(item.id);
      setCustomPartName(item.name);
      setCustomHex(item.style?.color || "#6C63FF");
      setCustomEmblem(item.style?.emblem || "");
      setCharacter(prev => applyCustomPartPreset(prev, item, DEFAULT_PART_STYLE));
      setTab("Custom");
    } catch (error) { Alert.alert("Couldn't edit part", error.message || "This saved part is invalid."); }
  };
  const deleteCustomPart = async (id) => { const next = customParts.filter(p => p.id !== id); try { await AsyncStorage.setItem(CUSTOM_PARTS_KEY, JSON.stringify(next)); setCustomParts(next); if (editingCustomPartId === id) { setEditingCustomPartId(null); setCustomPartName(""); } } catch (e) { Alert.alert("Couldn't delete", "Please try again."); } };
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
    setCharacter({ ...DEFAULT_CHARACTER, ...item, parts: { ...DEFAULT_CHARACTER.parts, ...(item.parts || {}) }, abilities: item.abilities || [], drawing: item.drawing || [] });
    setTab("Build");
  };

  const persistCharacters = async (next) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next);
      return true;
    } catch (e) {
      Alert.alert("Couldn't save", "Your changes could not be stored. Please try again.");
      return false;
    }
  };

  const duplicateCharacter = async (item) => {
    const copy = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: `${item.name || "Character"} Copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (await persistCharacters([copy, ...saved])) Alert.alert("Duplicated", `Created ${copy.name}.`);
  };

  const beginRename = (item) => { setRenameId(item.id); setRenameDraft(item.name || "Unnamed Character"); };
  const commitRename = async (item) => {
    const name = renameDraft.trim();
    if (!name) { Alert.alert("Name required", "Enter a name before saving."); return; }
    const next = saved.map(x => x.id === item.id ? { ...x, name, updatedAt: new Date().toISOString() } : x);
    if (await persistCharacters(next)) setRenameId(null);
  };

  const showcaseInfo = getPower(showcaseAbility);
  const showcaseMotion = getShowcaseMotion(showcaseAbility, showcaseInfo.category);

  const playShowcase = () => {
    setEffectKey(k => k + 1);
    effectProgress.stopAnimation();
    effectProgress.setValue(0);
    Animated.sequence([
      Animated.timing(effectProgress, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(effectProgress, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true })
    ]).start();
  };

  const newCharacter = () => {
    Alert.alert("Start a new character?", "Your current design stays saved only if you save it first.", [
      { text: "Cancel", style: "cancel" },
      { text: "New character", onPress: () => { setCharacter({ ...DEFAULT_CHARACTER, name: "New Character", id: undefined, drawing: [] }); setTab("Build"); } }
    ]);
  };

  const randomizeCharacter = () => {
    const pick = (items) => items[Math.floor(Math.random() * items.length)];
    const randomParts = Object.fromEntries(CATEGORIES.map((cat) => [cat.key, pick(cat.parts)]));
    const chosenPowers = [...POWERS].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3)).map((power) => power.name);
    const randomColor = pick(COLORS);
    setCharacter((prev) => ({
      ...DEFAULT_CHARACTER,
      ...prev,
      id: undefined,
      name: `${pick(["Captain", "Doctor", "Baron", "Professor", "The", "Mega"])} ${pick(["Mayhem", "Thunderpants", "Oddity", "Nightfall", "Wobble", "Overdrive", "Quackstorm", "Static"])}`,
      alignment: pick(["Hero", "Villain", "Antihero", "Original"]),
      color: randomColor,
      accentColor: pick(COLORS),
      parts: randomParts,
      abilities: chosenPowers,
      drawing: [],
      createdAt: undefined,
      updatedAt: undefined,
    }));
    setTab("Build");
    Alert.alert("Character generated", "Your randomized character is ready. Tweak anything you like, then save it.");
  };

  const currentCategory = CATEGORIES.find((x) => x.key === activeCategory) || CATEGORIES[0];
  const abilities = POWERS.map((power) => power.name);
  const filteredAbilities = POWERS.filter((power) =>
    power.name.toLowerCase().includes(abilitySearch.trim().toLowerCase()) &&
    (powerFilter === "All" || power.category === powerFilter)
  ).map((power) => power.name);
  const powerCategories = ["All", ...new Set(POWERS.map((power) => power.category))];
  const selectedStats = summarizeAbilities(character.abilities || []);
  const characterSynergy = getSynergy(character.abilities || []);
  const selectedRival = rivalId === "demo" ? DEMO_RIVAL : (saved.find((item) => String(item.id) === String(rivalId)) || DEMO_RIVAL);
  const beginBattle = () => setBattle(startBattle({ ...character, abilities: [...(character.abilities || [])] }, selectedRival));
  const fightRound = () => setBattle((current) => nextRound(current));
  const filteredSaved = saved.filter((item) => `${item.name || ""} ${item.alignment || ""} ${(item.abilities || []).join(" ")}`.toLowerCase().includes(collectionSearch.trim().toLowerCase()));

  const openBackupExport = () => {
    setBackupText(JSON.stringify({ format: "power-forge-backup", version: 2, exportedAt: new Date().toISOString(), characters: saved, customParts }, null, 2));
    setBackupMode("export");
  };
  const importBackup = async () => {
    try {
      const parsedBackup = typeof backupText === "string" ? JSON.parse(backupText) : backupText;
      const normalized = normalizeBackup(parsedBackup, DEFAULT_CHARACTER, `import-${Date.now()}`);
      const byId = new Map(saved.map((item) => [String(item.id), item]));
      normalized.forEach((item) => byId.set(String(item.id), item));
      const next = [...byId.values()].slice(0, 500);
      const incomingParts = Array.isArray(parsedBackup?.customParts) ? parsedBackup.customParts : [];
      const partById = new Map(customParts.map((part) => [String(part.id), part]));
      let acceptedParts = 0;
      incomingParts.slice(0, 500).forEach((part, index) => {
        try {
          const clean = createCustomPartPreset({ id: String(part.id || `import-part-${Date.now()}-${index}`), name: part.name, category: part.category, basePart: part.basePart, style: part.style, drawing: part.drawing });
          partById.set(clean.id, clean);
          acceptedParts += 1;
        } catch (_) { /* Ignore malformed custom-part entries without rejecting valid characters. */ }
      });
      const nextCustomParts = [...partById.values()].slice(0, 500);
      if (await persistCharacters(next)) {
        try {
          await AsyncStorage.setItem(CUSTOM_PARTS_KEY, JSON.stringify(nextCustomParts));
          setCustomParts(nextCustomParts);
        } catch (_) {
          Alert.alert("Characters restored", "Your characters were restored, but the custom-parts library could not be saved. Check device storage.");
          return;
        }
        setBackupMode(null);
        setBackupText("");
        Alert.alert("Backup imported", `${normalized.length} character(s) and ${acceptedParts} custom part(s) imported. Matching IDs were updated.`);
      }
    } catch (e) {
      Alert.alert("Could not import backup", e.message || "Check that the complete Power Forge backup was pasted.");
    }
  };
  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#101116" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>POWER <Text style={styles.brandAccent}>FORGE</Text></Text>
          <Text style={styles.tagline}>MAKE YOUR LEGEND.</Text>
        </View>
        <Pressable style={styles.newButton} onPress={newCharacter}><Text style={styles.newButtonText}>＋ NEW</Text></Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
        {["Build", "Abilities", "Showcase", "Custom", "Collection", "Battle"].map((t) => <Button key={t} label={t} active={tab === t} onPress={() => setTab(t)} small />)}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {tab === "Build" && <>
          <SectionTitle right={<Text style={styles.miniLabel}>DESIGN BAY 01</Text>}>Character Builder</SectionTitle>
          <TextInput value={character.name} onChangeText={(name) => update({ name })} placeholder="Character name" placeholderTextColor="#777B8B" style={styles.nameInput} maxLength={40} />
          <View style={styles.backupActions}>
            <Button label="🎲 RANDOMIZE BUILD" onPress={randomizeCharacter} small />
            <Button label="✨ QUICK POWER" onPress={() => { const pick = POWERS[Math.floor(Math.random() * POWERS.length)].name; update({ abilities: [...new Set([...(character.abilities || []), pick])] }); Alert.alert("Power added", `${pick} added to the loadout.`); }} small />
          </View>
          <View style={styles.alignmentRow}>
            {["Hero", "Villain", "Antihero", "Original"].map((x) => <Button key={x} label={x} active={character.alignment === x} onPress={() => update({ alignment: x })} small />)}
          </View>
          <CharacterPreview character={character} />
          <View style={styles.viewToggle}>
            <Button label="◉ Front" active={character.view === "Front"} onPress={() => update({ view: "Front" })} />
            <Button label="◉ Back" active={character.view === "Back"} onPress={() => update({ view: "Back" })} />
          </View>
          <SectionTitle right={<Text style={styles.miniLabel}>COLOR</Text>}>Suit palette</SectionTitle>
          <View style={styles.colorRow}>{COLORS.map((color) => <Pressable key={color} accessibilityLabel={`Suit color ${color}`} onPress={() => update({ color })} style={[styles.colorSwatch, { backgroundColor: color }, character.color === color && styles.colorSelected]} />)}</View>
          <SectionTitle right={<Text style={styles.miniLabel}>ACCENT</Text>}>Energy & detail color</SectionTitle>
          <View style={styles.colorRow}>{COLORS.map((color) => <Pressable key={`accent-${color}`} accessibilityLabel={`Accent color ${color}`} onPress={() => update({ accentColor: color })} style={[styles.colorSwatch, { backgroundColor: color }, (character.accentColor || "#A9A2FF") === color && styles.colorSelected]} />)}</View>
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
            <View style={styles.statLine}><Text style={styles.statLabel}>Power rating</Text><Text style={styles.statValue}>{selectedStats.power}/5</Text></View>
            <View style={styles.statLine}><Text style={styles.statLabel}>Speed rating</Text><Text style={styles.statValue}>{selectedStats.speed}/5</Text></View>
            <View style={styles.statLine}><Text style={styles.statLabel}>Defense rating</Text><Text style={styles.statValue}>{selectedStats.defense}/5</Text></View>
            <View style={styles.statLine}><Text style={styles.statLabel}>Chaos factor</Text><Text style={styles.statValue}>{selectedStats.chaos}/5</Text></View>
            <View style={styles.statLine}><Text style={styles.statLabel}>Alignment</Text><Text style={styles.statValue}>{character.alignment}</Text></View>
            {characterSynergy && <View style={styles.synergyBanner}><Text style={styles.synergyTitle}>⚡ SYNERGY UNLOCKED: {characterSynergy.name}</Text><Text style={styles.helperText}>Your equipped powers combine into a special move in the battle arena.</Text></View>}
          </View>
          <TextInput value={abilitySearch} onChangeText={setAbilitySearch} placeholder="Search powers…" placeholderTextColor="#777B8B" style={styles.nameInput} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {powerCategories.map((category) => <Button key={category} label={category} active={powerFilter === category} onPress={() => setPowerFilter(category)} small />)}
          </ScrollView>
          <View style={styles.abilityGrid}>{filteredAbilities.map((a) => { const info = getPower(a); return <Pressable key={a} onPress={() => toggleAbility(a)} style={[styles.abilityTile, character.abilities.includes(a) && styles.abilityTileActive]}>
            <Text style={[styles.abilityGlyph, { color: info.color }]}>{info.glyph}</Text>
            <Text style={styles.abilityName}>{a}</Text>
            <Text style={styles.powerCategory}>{info.category.toUpperCase()}</Text>
            <Text style={styles.abilityState}>{character.abilities.includes(a) ? "SELECTED · TAP TO REMOVE" : "TAP TO ADD"}</Text>
          </Pressable>; })}</View>
          <Text style={styles.helperText}>Next upgrade: link abilities to compatible parts and calculate strengths, weaknesses, and stats.</Text>
          <Pressable onPress={saveCharacter} style={styles.saveButton}><Text style={styles.saveButtonText}>SAVE CHARACTER</Text></Pressable>
        </>}

        {tab === "Showcase" && <>
          <SectionTitle right={<Text style={styles.miniLabel}>POWER DEMO</Text>}>Ability Showcase</SectionTitle>
          <Text style={styles.helperText}>Choose one of your character's powers—or preview any catalog power—and watch a lightweight animated demonstration. These are visual previews, not full combat simulations yet.</Text>
          <Animated.View style={{ transform: [
            { translateX: effectProgress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, showcaseMotion.move === "dash" ? 22 : showcaseMotion.move === "blink" ? 32 : showcaseMotion.move === "shake" ? -6 : 0, showcaseMotion.move === "blink" ? -24 : showcaseMotion.move === "shake" ? 6 : 0] }) },
            { translateY: effectProgress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, showcaseMotion.move === "rise" ? -18 : showcaseMotion.move === "surge" ? -6 : 3, 0] }) },
            { scale: effectProgress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, showcaseMotion.move === "surge" ? 1.1 : 1.03, 1] }) }
          ] }}><CharacterPreview character={character} /></Animated.View>
          <Text style={styles.fieldLabel}>SELECT A POWER</Text>
          <TextInput value={abilitySearch} onChangeText={setAbilitySearch} placeholder="Search powers to preview…" placeholderTextColor="#777B8B" style={styles.nameInput} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {powerCategories.map((category) => <Button key={category} label={category} active={powerFilter === category} onPress={() => setPowerFilter(category)} small />)}
          </ScrollView>
          <View style={styles.abilityGrid}>{filteredAbilities.map((a) => { const info = getPower(a); return <Pressable key={a} onPress={() => setShowcaseAbility(a)} style={[styles.abilityTile, showcaseAbility === a && styles.abilityTileActive]}>
            <Text style={[styles.abilityGlyph, { color: info.color }]}>{info.glyph}</Text>
            <Text style={styles.abilityName}>{a}</Text>
            <Text style={styles.powerCategory}>{info.category.toUpperCase()}</Text>
            <Text style={styles.abilityState}>{showcaseAbility === a ? "SELECTED" : "PREVIEW"}</Text>
          </Pressable>; })}</View>
          <View style={styles.showcaseStage}>
            <Text style={styles.statTitle}>DEMONSTRATION</Text>
            <Text style={styles.showcasePower}>{showcaseAbility}</Text>
            <Text style={styles.powerDescription}>{getPower(showcaseAbility).description}</Text>
            <View style={styles.showcaseStats}><Text style={styles.powerCategory}>{getPower(showcaseAbility).category.toUpperCase()}</Text><Text style={styles.powerCategory}>POWER {getPower(showcaseAbility).stats.power}/5</Text><Text style={styles.powerCategory}>SPEED {getPower(showcaseAbility).stats.speed}/5</Text></View>
            <View style={styles.effectArea}>
              <Animated.View key={`burst-${effectKey}`} style={[styles.effectOrb, {
                opacity: effectProgress.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0.12, 1, 0] }),
                transform: [{ scale: effectProgress.interpolate({ inputRange: [0, 1], outputRange: [0.2, showcaseMotion.move === "pulse" ? 3.4 : 2.4] }) }, { translateY: effectProgress.interpolate({ inputRange: [0, 1], outputRange: [showcaseMotion.move === "rise" ? 38 : 8, showcaseMotion.move === "rise" ? -48 : -18] }) }],
                backgroundColor: showcaseInfo.color,
                borderWidth: showcaseMotion.effect === "lightning" || showcaseMotion.effect === "sonic" ? 3 : showcaseMotion.effect === "portal" || showcaseMotion.effect === "bubble" ? 2 : 0,
                borderColor: showcaseInfo.color,
                borderRadius: showcaseMotion.effect === "beam" || showcaseMotion.effect === "trail" ? 8 : showcaseMotion.effect === "lightning" ? 10 : 30,
                width: showcaseMotion.effect === "beam" ? 92 : showcaseMotion.effect === "trail" ? 76 : 54,
                height: showcaseMotion.effect === "beam" ? 16 : showcaseMotion.effect === "trail" ? 12 : 54,
              }]} />
              {[0, 1, 2, 3, 4].slice(0, showcaseMotion.particles).map((i) => {
                const angle = (Math.PI * 2 * i) / showcaseMotion.particles;
                const distance = showcaseMotion.move === "pulse" ? 66 : 48;
                return (
                  <Animated.View
                    key={`particle-${effectKey}-${i}`}
                    style={[
                      styles.effectParticle,
                      {
                        backgroundColor: showcaseInfo.color,
                        opacity: effectProgress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
                        transform: [
                          { translateX: effectProgress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] }) },
                          { translateY: effectProgress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance] }) },
                          { scale: effectProgress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.3, 1.2, 0.1] }) },
                        ],
                      },
                    ]}
                  />
                );
              })}
              <Text style={[styles.effectGlyph, { color: showcaseInfo.color }]}>{showcaseInfo.glyph}</Text>
            </View>
            <Text style={styles.motionLabel}>{showcaseMotion.label} · {showcaseMotion.particles} EFFECT PARTICLES</Text>
            <Text style={styles.powerDescription}>{showcaseMotion.effectName || "Energy aura"} · {getPower(showcaseAbility).counterHint || "Adapt your tactics to the situation."}</Text>
            <Text style={styles.helperText}>Each power uses a motion profile with a burst, particles, and a character reaction. Press replay to run it again; all animation runs locally.</Text>
            <Pressable onPress={playShowcase} style={styles.saveButton}><Text style={styles.saveButtonText}>▶ USE POWER</Text></Pressable>
            <Pressable onPress={() => { update({ abilities: character.abilities.includes(showcaseAbility) ? character.abilities : [...character.abilities, showcaseAbility] }); Alert.alert("Power equipped", `${showcaseAbility} was added to this character.`); }} style={styles.button}><Text style={styles.buttonText}>ADD POWER TO CHARACTER</Text></Pressable>
          </View>
        </>}

        {tab === "Battle" && <>
          <SectionTitle right={<Text style={styles.miniLabel}>SIMULATION ARENA</Text>}>Battle Arena</SectionTitle>
          <Text style={styles.helperText}>Pit your current character against a saved creation or the demo rival. Battles are turn-based simulations using your equipped powers and character stats; no internet connection is needed.</Text>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>YOUR CHAMPION</Text>
            <Text style={styles.arenaFighterName}>{character.name || "Unnamed Champion"}</Text>
            <Text style={styles.savedMeta}>{character.alignment} · {(character.abilities || []).length} equipped powers</Text>
            {characterSynergy && <Text style={styles.synergyTitle}>⚡ Special move: {characterSynergy.name}</Text>}
            <Text style={styles.fieldLabel}>CHOOSE YOUR RIVAL</Text>
            <View style={styles.alignmentRow}>
              <Button label={`DEMO: ${DEMO_RIVAL.name}`} active={rivalId === "demo"} onPress={() => { setRivalId("demo"); setBattle(null); }} small />
              {saved.filter((item) => String(item.id) !== String(character.id)).map((item) => <Button key={item.id} label={item.name || "Unnamed"} active={String(rivalId) === String(item.id)} onPress={() => { setRivalId(String(item.id)); setBattle(null); }} small />)}
            </View>
            <Pressable onPress={beginBattle} style={styles.saveButton}><Text style={styles.saveButtonText}>{battle ? "↻ RESTART BATTLE" : "⚔ START BATTLE"}</Text></Pressable>
          </View>
          {battle && <View style={styles.arenaCard}>
            <Text style={styles.statTitle}>ROUND {battle.round}{battle.finished ? " · FINISHED" : " · LIVE SIMULATION"}</Text>
            {[battle.player, battle.rival].map((fighter) => <View key={fighter.id} style={styles.hpBlock}>
              <View style={styles.hpHeading}><Text style={styles.arenaFighterName}>{fighter.name}</Text><Text style={styles.hpNumber}>{fighter.hp}/{fighter.maxHp} HP</Text></View>
              <View style={styles.hpTrack}><View style={[styles.hpFill, { width: `${Math.max(0, fighter.hp)}%`, backgroundColor: fighter.color }]} /></View>
              <Text style={styles.savedMeta}>POW {fighter.stats.power}/5 · SPD {fighter.stats.speed}/5 · DEF {fighter.stats.defense}/5</Text>
              {!!fighter.statusEffects?.length && <Text style={styles.statusEffectLine}>STATUS: {fighter.statusEffects.map((effect) => `${effect.type.toUpperCase()} (${effect.turns})`).join(" · ")}</Text>}
              {!!fighter.shield && <Text style={styles.statusEffectLine}>🛡 SHIELD: {fighter.shield}</Text>}
            </View>)}
            {battle.finished && <View style={styles.winnerBanner}><Text style={styles.winnerText}>{battle.winner === "Draw" ? "IT'S A DRAW!" : `🏆 ${battle.winner} WINS!`}</Text></View>}
            {!battle.finished && <Pressable onPress={fightRound} style={styles.saveButton}><Text style={styles.saveButtonText}>⚡ FIGHT NEXT ROUND</Text></Pressable>}
            <Text style={styles.fieldLabel}>COMBAT LOG</Text>
            {battle.log.slice(-12).reverse().map((line, index) => <Text key={`${battle.round}-${index}-${line}`} style={styles.battleLogLine}>{line}</Text>)}
            <Text style={styles.helperText}>This is an early combat simulator, not real-time animated combat yet. The battle engine is separated so richer character animation can be added later.</Text>
          </View>}
        </>}

        {tab === "Custom" && <>
          <SectionTitle>Custom part lab</SectionTitle>
          <Text style={styles.helperText}>PART WORKSHOP · Customize each category independently, recolor its artwork, transform it, draw category-tagged marks, and save reusable local part presets. Works offline.</Text>
          <Text style={styles.fieldLabel}>PART TO CUSTOMIZE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.map((cat) => <Button key={cat.key} label={cat.label} active={activeCategory === cat.key} onPress={() => { setActiveCategory(cat.key); update({ editorCategory: cat.key }); }} small />)}
          </ScrollView>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>{currentCategory.label.toUpperCase()} CUSTOMIZATION</Text>
            <Text style={styles.customCurrent}>{character.parts[activeCategory]}</Text>
            <Text style={styles.helperText}>Select a base design, then edit its tint, accent, pattern, size, rotation, opacity, and drawing details. Controls are stored per category.</Text>
            {currentCategory.parts.map((part) => <Pressable key={part} onPress={() => updatePart(activeCategory, part)} style={styles.optionRow}>
              <Text style={styles.optionText}>{part}</Text><Text style={styles.optionAction}>{character.parts[activeCategory] === part ? "✓ SELECTED" : "SELECT"}</Text>
            </Pressable>)}
          </View>
          <Text style={styles.fieldLabel}>PART COLOR / TINT</Text>
          <View style={styles.colorRow}>{COLORS.map((color) => <Pressable key={color} onPress={() => updatePartStyle({ color })} style={[styles.colorSwatch, { backgroundColor: color }, activePartStyle.color === color && styles.colorSelected]} />)}</View>
          <View style={styles.customColorRow}><TextInput value={customHex} onChangeText={setCustomHex} autoCapitalize="characters" maxLength={7} placeholder="#7A4CFF" placeholderTextColor="#777B8B" style={styles.hexInput} /><Button label="APPLY TINT" onPress={() => applyCustomHex("color")} small /></View>
          <Text style={styles.fieldLabel}>ACCENT COLOR</Text>
          <View style={styles.colorRow}>{COLORS.map((color) => <Pressable key={`part-accent-${color}`} onPress={() => updatePartStyle({ accent: color })} style={[styles.colorSwatch, { backgroundColor: color }, activePartStyle.accent === color && styles.colorSelected]} />)}</View>
          <View style={styles.customColorRow}><TextInput value={customHex} onChangeText={setCustomHex} autoCapitalize="characters" maxLength={7} placeholder="#75E7FF" placeholderTextColor="#777B8B" style={styles.hexInput} /><Button label="APPLY ACCENT" onPress={() => applyCustomHex("accent")} small /></View>
          <Text style={styles.fieldLabel}>PATTERN</Text>
          <View style={styles.categoryRow}>{PATTERNS.map(pattern => <Button key={pattern} label={pattern} active={activePartStyle.pattern === pattern} onPress={() => updatePartStyle({ pattern })} small />)}</View>
          <Text style={styles.fieldLabel}>SHAPE DETAILS / ATTACHMENTS</Text>
          <View style={styles.categoryRow}>{["None", "Spikes", "Armor Plates", "Runes", "Energy Nodes", "Chevron"].map(detail => <Button key={detail} label={detail} active={activePartStyle.detail === detail} onPress={() => updatePartStyle({ detail })} small />)}</View>
          <Text style={styles.fieldLabel}>CUSTOM EMBLEM / MARKING</Text>
          <View style={styles.customColorRow}><TextInput value={customEmblem} onChangeText={setCustomEmblem} maxLength={8} placeholder="e.g. NOVA, ★, Ω" placeholderTextColor="#777B8B" style={styles.hexInput} /><Button label="APPLY MARK" onPress={() => updatePartStyle({ emblem: customEmblem.trim().slice(0, 8) })} small /></View>
          <Text style={styles.fieldLabel}>SIZE · {Math.round(activePartStyle.scale * 100)}%</Text>
          <View style={styles.categoryRow}>{[0.7, 0.85, 1, 1.15, 1.3].map(scale => <Button key={scale} label={`${Math.round(scale * 100)}%`} active={activePartStyle.scale === scale} onPress={() => updatePartStyle({ scale })} small />)}</View>
          <Text style={styles.fieldLabel}>ROTATION · {activePartStyle.rotation}°</Text>
          <View style={styles.categoryRow}>{[-30, -15, 0, 15, 30].map(rotation => <Button key={rotation} label={`${rotation}°`} active={activePartStyle.rotation === rotation} onPress={() => updatePartStyle({ rotation })} small />)}</View>
          <Text style={styles.fieldLabel}>OPACITY</Text>
          <View style={styles.categoryRow}>{[0.35, 0.6, 0.8, 1].map(opacity => <Button key={opacity} label={`${Math.round(opacity * 100)}%`} active={activePartStyle.opacity === opacity} onPress={() => updatePartStyle({ opacity })} small />)}</View>
          <Text style={styles.fieldLabel}>DRAWING COLOR</Text>
          <View style={styles.colorRow}>{COLORS.map((color) => <Pressable key={`draw-${color}`} onPress={() => update({ drawColor: color })} style={[styles.colorSwatch, { backgroundColor: color }, (character.drawColor || character.color) === color && styles.colorSelected]} />)}</View>
          <Text style={styles.fieldLabel}>BRUSH SIZE</Text>
          <View style={styles.categoryRow}>{[4, 8, 12, 18].map(size => <Button key={size} label={`${size}px`} active={activePartStyle.brushSize === size} onPress={() => updatePartStyle({ brushSize: size })} small />)}</View>
          <DrawingPad color={character.drawColor || activePartStyle.accent || character.color} brushSize={activePartStyle.brushSize} points={(character.drawing || []).filter(p => p.category === activeCategory)} onAddPoint={(x, y, color) => setCharacter(prev => ({ ...prev, drawing: [...(prev.drawing || []).slice(-499), { x, y, color, size: activePartStyle.brushSize, category: activeCategory, id: `${Date.now()}-${Math.random()}` }] }))} onClear={() => update({ drawing: (character.drawing || []).filter(p => p.category !== activeCategory) })} onUndo={() => update({ drawing: (character.drawing || []).filter(p => p.category !== activeCategory).concat((character.drawing || []).filter(p => p.category === activeCategory).slice(0, -1)) })} />
          <Text style={styles.fieldLabel}>SAVE REUSABLE CUSTOM PART</Text>
          <TextInput value={customPartName} onChangeText={setCustomPartName} placeholder="Name this custom part" placeholderTextColor="#777B8B" style={styles.nameInput} maxLength={36} />
          <Pressable onPress={saveCustomPart} style={styles.saveButton}><Text style={styles.saveButtonText}>{editingCustomPartId ? "UPDATE SAVED CUSTOM PART" : "SAVE PART TO WORKSHOP LIBRARY"}</Text></Pressable>
          {editingCustomPartId && <Pressable onPress={() => { setEditingCustomPartId(null); setCustomPartName(""); }} style={styles.button}><Text style={styles.buttonText}>CANCEL PART EDIT</Text></Pressable>}
          <SectionTitle right={<Text style={styles.miniLabel}>{customParts.length} SAVED</Text>}>My custom parts</SectionTitle>
          {customParts.length === 0 ? <Text style={styles.helperText}>Your reusable part presets will appear here.</Text> : customParts.map(item => <View key={item.id} style={styles.savedCard}><View style={[styles.savedSwatch, { backgroundColor: item.style?.color || "#6C63FF" }]} /><View style={styles.savedInfo}><Text style={styles.savedName}>{item.name}</Text><Text style={styles.savedMeta}>{item.category.toUpperCase()} · {item.basePart}</Text></View><View style={styles.collectionActions}><Button label="APPLY" onPress={() => applyCustomPart(item)} small /><Button label="EDIT" onPress={() => editCustomPart(item)} small /><Button label="DELETE" onPress={() => deleteCustomPart(item.id)} small /></View></View>)}
          <Pressable onPress={saveCharacter} style={styles.saveButton}><Text style={styles.saveButtonText}>SAVE CUSTOM CHARACTER</Text></Pressable>
        </>}

        {tab === "Collection" && <>
          <SectionTitle right={<Text style={styles.miniLabel}>{saved.length} SAVED</Text>}>Your collection</SectionTitle>
          <Text style={styles.helperText}>Characters are stored on this device. No account or internet connection is required to use the collection.</Text>
          <TextInput value={collectionSearch} onChangeText={setCollectionSearch} placeholder="Search characters, alignment, or powers…" placeholderTextColor="#777B8B" style={styles.nameInput} />
          <View style={styles.backupActions}>
            <Button label="EXPORT BACKUP" onPress={openBackupExport} small />
            <Button label="IMPORT BACKUP" onPress={() => { setBackupText(""); setBackupMode("import"); }} small />
          </View>
          {backupMode && <View style={styles.statCard}>
            <Text style={styles.statTitle}>{backupMode === "export" ? "COPYABLE CHARACTER BACKUP" : "RESTORE CHARACTER BACKUP"}</Text>
            <Text style={styles.helperText}>{backupMode === "export" ? "Copy this JSON somewhere safe. This is a manual backup; it does not upload anything." : "Paste a previously exported Power Forge JSON backup below. Imported characters are merged by ID."}</Text>
            <TextInput value={backupText} onChangeText={setBackupText} multiline textAlignVertical="top" autoCapitalize="none" style={styles.backupInput} placeholder="Paste backup JSON here" placeholderTextColor="#777B8B" />
            <View style={styles.backupActions}>
              {backupMode === "import" && <Button label="RESTORE BACKUP" onPress={importBackup} small />}
              <Button label="CLOSE" onPress={() => setBackupMode(null)} small />
            </View>
          </View>}
          {saved.length === 0 ? <View style={styles.emptyState}><Text style={styles.emptyGlyph}>◇</Text><Text style={styles.emptyTitle}>Your forge is quiet.</Text><Text style={styles.helperText}>Build a character and tap Save Character to start your collection.</Text></View> : filteredSaved.length === 0 ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>No matches found</Text><Text style={styles.helperText}>Try another name, alignment, or power.</Text></View> : filteredSaved.map((item) => <View key={item.id} style={styles.savedCard}>
            <View style={[styles.savedSwatch, { backgroundColor: item.color || "#6C63FF" }]} />
            <View style={styles.savedInfo}>
              {renameId === item.id ? <TextInput value={renameDraft} onChangeText={setRenameDraft} placeholder="Character name" placeholderTextColor="#777B8B" style={styles.renameInput} maxLength={40} /> : <Text style={styles.savedName}>{item.name || "Unnamed Character"}</Text>}
              <Text style={styles.savedMeta}>{item.alignment} · {item.abilities?.length || 0} abilities</Text>
              {renameId === item.id && <View style={styles.inlineActions}><Button label="SAVE NAME" small onPress={() => commitRename(item)} /><Button label="CANCEL" small onPress={() => setRenameId(null)} /></View>}
            </View>
            <View style={styles.collectionActions}>
              <Button label="EDIT" small onPress={() => loadCharacter(item)} />
              <Button label="RENAME" small onPress={() => beginRename(item)} />
              <Button label="COPY" small onPress={() => duplicateCharacter(item)} />
              <Button label="DELETE" small onPress={() => Alert.alert("Delete character?", `Delete ${item.name}? This cannot be undone.`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await persistCharacters(saved.filter(x => x.id !== item.id)); } }])} />
            </View>
          </View>)}
          <Pressable onPress={newCharacter} style={styles.saveButton}><Text style={styles.saveButtonText}>CREATE NEW CHARACTER</Text></Pressable>
        </>}
        <View style={styles.footer}><Text style={styles.footerText}>POWER FORGE · BUILD YOUR OWN LEGEND</Text><Text style={styles.footerSub}>{loaded ? "OFFLINE-READY · V20 RELEASE CANDIDATE" : "LOADING LOCAL COLLECTION…"}</Text></View>
      </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
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
  tabsScroll: { flexGrow: 0, maxHeight: 48 },
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
  illustratedStage: { height: 330, width: 240, position: "relative", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 16, backgroundColor: "#0D1425", marginTop: 8, marginBottom: 8 },
  illustratedLayer: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" },
  patternZone: { position: "absolute", flexDirection: "row", maxWidth: 88, flexWrap: "wrap", zIndex: 4 },
  customColorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  hexInput: { flex: 1, backgroundColor: "#1A1B24", borderColor: "#303240", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: "#F4F4FA", fontSize: 13, fontWeight: "700" },
  weaponOverlay: { position: "absolute", right: 18, bottom: 62, fontSize: 54, fontWeight: "900", textShadowColor: "#FFFFFF66", textShadowRadius: 12 },
  artGlow: { position: "absolute", width: 160, height: 250, borderRadius: 90, backgroundColor: "#203B65", opacity: 0.32, shadowColor: "#47CFFF", shadowOpacity: 0.6, shadowRadius: 24, elevation: 4 },
  artCoreGlow: { position: "absolute", left: "49%", top: "40%", width: 8, height: 8, borderRadius: 5, opacity: 0.9, shadowOpacity: 0.95, shadowRadius: 12, elevation: 6 },
  artNote: { color: "#687D9E", fontSize: 9, marginTop: 4, letterSpacing: 0.5 },
  figure: { height: 285, width: 230, alignItems: "center", justifyContent: "flex-start", paddingTop: 14, position: "relative" },
  cape: { position: "absolute", top: 62, width: 126, height: 156, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, transform: [{ perspective: 300 }, { rotate: "1deg" }] },
  capeBack: { width: 142, height: 174, top: 54, opacity: 0.9 },
  jetPack: { position: "absolute", top: 72, width: 92, height: 64, borderRadius: 12, borderWidth: 3, borderColor: "#0F1015", zIndex: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-end", paddingBottom: 7 },
  jetPort: { width: 18, height: 24, backgroundColor: "#F2B544", borderWidth: 3, borderColor: "#0F1015", borderRadius: 7 },
  shieldRig: { position: "absolute", top: 65, width: 122, height: 132, borderWidth: 4, borderRadius: 24, backgroundColor: "rgba(105,201,255,0.12)", zIndex: 1 },
  helmetHead: { borderRadius: 12, borderWidth: 4 },
  horns: { position: "absolute", top: -13, width: 54, flexDirection: "row", justifyContent: "space-between", zIndex: 5 },
  horn: { width: 12, height: 19, backgroundColor: "#E8EAF2", borderWidth: 2, borderColor: "#0F1015", borderTopLeftRadius: 12, borderTopRightRadius: 12, transform: [{ rotate: "-18deg" }] },
  catEars: { position: "absolute", top: -9, width: 54, flexDirection: "row", justifyContent: "space-between", zIndex: 5 },
  catEar: { width: 16, height: 18, backgroundColor: "#E8EAF2", borderWidth: 2, borderColor: "#0F1015", borderTopLeftRadius: 8, transform: [{ rotate: "-20deg" }] },
  antenna: { position: "absolute", top: -22, width: 3, height: 25, backgroundColor: "#A9ACBB", alignItems: "center", zIndex: 5 },
  antennaTip: { width: 10, height: 10, borderRadius: 5, marginTop: -3 },
  wings: { position: "absolute", top: 76, width: 190, height: 100, borderRadius: 50, opacity: 0.85, zIndex: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, transform: [{ scaleY: 1.1 }] },
  featheredWings: { borderRadius: 25, height: 125, top: 68 },
  wingCut: { width: 26, height: 74, borderRadius: 16, backgroundColor: "rgba(15,16,21,0.22)", marginTop: 12 },
  droneSwarm: { position: "absolute", top: 72, width: 155, flexDirection: "row", justifyContent: "space-between", zIndex: 1 },
  drone: { width: 18, height: 18, borderRadius: 6, borderWidth: 2, borderColor: "#0F1015" },
  clawArm: { borderRadius: 8 },
  tentacleArm: { borderRadius: 18, transform: [{ rotate: "8deg" }] },
  robeTorso: { borderRadius: 7, width: 84 },
  streetTorso: { borderRadius: 12 },
  accentStripe: { position: "absolute", width: 6, height: 82, top: 10, opacity: 0.8 },
  robeMark: { color: "#FFFFFF", fontSize: 20, position: "absolute", top: 48 },
  digitigradeLeg: { borderRadius: 5, transform: [{ skewX: "-5deg" }] },
  hoverBoot: { borderRadius: 12, borderColor: "#A9A2FF", marginBottom: 5 },
  clawedBoot: { borderRadius: 4, borderColor: "#E8EAF2" },
  pilotVisor: { width: 45, height: 13, borderRadius: 3 },
  openFaceEyes: { width: 36, height: 12, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" },
  skullMark: { color: "#FFFFFF", fontSize: 16, position: "absolute", top: 22 },
  armorRidge: { position: "absolute", top: 0, width: 10, height: 84, backgroundColor: "rgba(255,255,255,0.2)" },
  stealthStripe: { position: "absolute", top: 0, bottom: 0, width: 8, backgroundColor: "rgba(0,0,0,0.22)" },
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
  powerCategory: { color: "#8D91A3", fontSize: 8, fontWeight: "900", letterSpacing: 0.8, marginTop: 5 },
  powerDescription: { color: "#B9BDCC", fontSize: 12, lineHeight: 18, textAlign: "center", marginBottom: 8 },
  showcaseStats: { flexDirection: "row", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 },
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
  collectionActions: { width: 82, gap: 5 },
  backupActions: { flexDirection: "row", gap: 8, marginBottom: 10 },
  backupInput: { minHeight: 150, maxHeight: 320, backgroundColor: "#111219", color: "#F4F4FA", borderWidth: 1, borderColor: "#343647", borderRadius: 10, padding: 10, fontSize: 11, marginBottom: 10 },
  inlineActions: { gap: 4, marginTop: 5 },
  renameInput: { backgroundColor: "#111219", color: "#FFFFFF", borderWidth: 1, borderColor: "#8178FF", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 5, fontSize: 12, marginBottom: 3 },
  synergyBanner: { borderTopWidth: 1, borderTopColor: "#454568", marginTop: 10, paddingTop: 12 },
  synergyTitle: { color: "#B8B2FF", fontSize: 11, fontWeight: "900", marginTop: 6, marginBottom: 5 },
  arenaCard: { backgroundColor: "#191A22", borderWidth: 1, borderColor: "#454568", borderRadius: 16, padding: 14, marginVertical: 12 },
  arenaFighterName: { color: "#F4F4FA", fontSize: 15, fontWeight: "900" },
  hpBlock: { marginVertical: 10 },
  hpHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  hpNumber: { color: "#B8B2FF", fontSize: 11, fontWeight: "900" },
  hpTrack: { height: 10, backgroundColor: "#303240", borderRadius: 8, overflow: "hidden" },
  hpFill: { height: "100%", borderRadius: 8 },
  winnerBanner: { backgroundColor: "#292744", borderWidth: 1, borderColor: "#8178FF", padding: 14, borderRadius: 10, marginVertical: 10, alignItems: "center" },
  winnerText: { color: "#F4F4FA", fontSize: 17, fontWeight: "900" },
  battleLogLine: { color: "#C3C6D4", fontSize: 11, lineHeight: 17, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#2B2D38" },
  showcaseStage: { backgroundColor: "#191A22", borderWidth: 1, borderColor: "#454568", borderRadius: 16, padding: 14, marginTop: 14, alignItems: "center" },
  showcasePower: { color: "#F4F4FA", fontSize: 20, fontWeight: "900", marginBottom: 8 },
  effectArea: { height: 150, width: "100%", backgroundColor: "#111219", borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 12 },
  effectOrb: { position: "absolute", width: 54, height: 54, borderRadius: 30 },
  effectGlyph: { fontSize: 48, position: "absolute", bottom: 10 },
  effectParticle: { position: "absolute", width: 12, height: 12, borderRadius: 6 },
  motionLabel: { color: "#C5C0FF", fontSize: 10, fontWeight: "900", letterSpacing: 1.2, textAlign: "center", marginBottom: 10 },
  footer: { alignItems: "center", paddingTop: 26, paddingBottom: 12 },
  footerText: { color: "#666A7A", fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  footerSub: { color: "#4D5060", fontSize: 8, marginTop: 6, letterSpacing: 1 },
  statusEffectLine: { color: "#FFCA73", fontSize: 12, fontWeight: "800", marginTop: 4 },
});
