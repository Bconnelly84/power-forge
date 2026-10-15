const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const art = path.join(root, "assets", "character-art");
const app = fs.readFileSync(path.join(root, "App.js"), "utf8");
const groups = {
  "head": [
    {
      "label": "Quantum Sentinel",
      "stem": "head_quantum"
    },
    {
      "label": "Solar Knight",
      "stem": "head_solar"
    },
    {
      "label": "Abyss Stalker",
      "stem": "head_abyss"
    },
    {
      "label": "Chrome Ronin",
      "stem": "head_ronin"
    },
    {
      "label": "Magma Brute",
      "stem": "head_magma"
    },
    {
      "label": "Prism Oracle",
      "stem": "head_prism"
    },
    {
      "label": "Deep-Sea Raider",
      "stem": "head_deepsea"
    },
    {
      "label": "Wasteland Reaver",
      "stem": "head_waste"
    },
    {
      "label": "Starborn Pilot",
      "stem": "head_starborn"
    },
    {
      "label": "Clockwork Visage",
      "stem": "head_clockwork"
    }
  ],
  "hair": [
    {
      "label": "Storm Spikes",
      "stem": "hair_storm"
    },
    {
      "label": "Crimson Mane",
      "stem": "hair_crimson"
    },
    {
      "label": "Violet Dreads",
      "stem": "hair_dreads"
    },
    {
      "label": "Arctic Braid",
      "stem": "hair_braid"
    },
    {
      "label": "Solar Mohawk",
      "stem": "hair_mohawk"
    },
    {
      "label": "Emerald Waves",
      "stem": "hair_emerald"
    },
    {
      "label": "Shadow Fringe",
      "stem": "hair_fringe"
    },
    {
      "label": "Copper Curls",
      "stem": "hair_copper"
    },
    {
      "label": "Cosmic Flow",
      "stem": "hair_cosmic"
    },
    {
      "label": "Crystal Crest",
      "stem": "hair_crystal"
    }
  ],
  "face": [
    {
      "label": "Battle-Scarred",
      "stem": "face_scarred"
    },
    {
      "label": "Celestial Markings",
      "stem": "face_celestial"
    },
    {
      "label": "Stoneborn Features",
      "stem": "face_stone"
    },
    {
      "label": "Infernal Features",
      "stem": "face_infernal"
    },
    {
      "label": "Synthwave Face",
      "stem": "face_synth"
    },
    {
      "label": "Frost Rune Face",
      "stem": "face_frost"
    },
    {
      "label": "Wildling Features",
      "stem": "face_wild"
    }
  ],
  "mask": [
    {
      "label": "Specter Mask",
      "stem": "mask_specter"
    },
    {
      "label": "Solar Guard Mask",
      "stem": "mask_solar"
    },
    {
      "label": "Viper Mask",
      "stem": "mask_viper"
    },
    {
      "label": "Rift Mask",
      "stem": "mask_rift"
    },
    {
      "label": "Pulse Mask",
      "stem": "mask_pulse"
    },
    {
      "label": "Ashen Mask",
      "stem": "mask_ashen"
    },
    {
      "label": "Crimson Ronin Mask",
      "stem": "mask_ronin"
    },
    {
      "label": "Prism Mask",
      "stem": "mask_prism"
    }
  ],
  "helmet": [
    {
      "label": "Aegis Command Helm",
      "stem": "helmet_aegis"
    },
    {
      "label": "Magma Siege Helm",
      "stem": "helmet_magma"
    },
    {
      "label": "Star Corsair Helm",
      "stem": "helmet_corsair"
    },
    {
      "label": "Frost Warden Helm",
      "stem": "helmet_frost"
    },
    {
      "label": "Dread Monarch Helm",
      "stem": "helmet_dread"
    },
    {
      "label": "Wild Hunt Helm",
      "stem": "helmet_hunt"
    },
    {
      "label": "Quantum Pilot Helm",
      "stem": "helmet_quantum"
    },
    {
      "label": "Solar Paladin Helm",
      "stem": "helmet_paladin"
    }
  ],
  "torso": [
    {
      "label": "Aegis Command Armor",
      "stem": "torso_aegis"
    },
    {
      "label": "Magma Siege Plate",
      "stem": "torso_magma"
    },
    {
      "label": "Star Corsair Suit",
      "stem": "torso_corsair"
    },
    {
      "label": "Frost Warden Armor",
      "stem": "torso_frost"
    },
    {
      "label": "Dread Monarch Plate",
      "stem": "torso_dread"
    },
    {
      "label": "Wild Hunt Leathers",
      "stem": "torso_hunt"
    },
    {
      "label": "Quantum Pilot Suit",
      "stem": "torso_quantum"
    },
    {
      "label": "Solar Paladin Armor",
      "stem": "torso_paladin"
    },
    {
      "label": "Street Phantom Jacket",
      "stem": "torso_phantom"
    },
    {
      "label": "Deep-Sea Exosuit",
      "stem": "torso_deepsea"
    }
  ],
  "arms": [
    {
      "label": "Aegis Impact Bracers",
      "stem": "arms_aegis"
    },
    {
      "label": "Magma Fists",
      "stem": "arms_magma"
    },
    {
      "label": "Corsair Hook Arm",
      "stem": "arms_corsair"
    },
    {
      "label": "Frost Grip Gauntlets",
      "stem": "arms_frost"
    },
    {
      "label": "Dread Claw Arms",
      "stem": "arms_dread"
    },
    {
      "label": "Wild Hunt Talons",
      "stem": "arms_hunt"
    },
    {
      "label": "Quantum Pulse Arms",
      "stem": "arms_quantum"
    },
    {
      "label": "Solar Hammer Gauntlets",
      "stem": "arms_paladin"
    },
    {
      "label": "Deep-Sea Tentacle Arm",
      "stem": "arms_deepsea"
    }
  ],
  "legs": [
    {
      "label": "Aegis Strider Legs",
      "stem": "legs_aegis"
    },
    {
      "label": "Magma Breaker Legs",
      "stem": "legs_magma"
    },
    {
      "label": "Corsair Raider Legs",
      "stem": "legs_corsair"
    },
    {
      "label": "Frost Runner Legs",
      "stem": "legs_frost"
    },
    {
      "label": "Dread Stalker Legs",
      "stem": "legs_dread"
    },
    {
      "label": "Wild Hunt Digitigrade Legs",
      "stem": "legs_hunt"
    },
    {
      "label": "Quantum Pilot Legs",
      "stem": "legs_quantum"
    },
    {
      "label": "Solar Paladin Greaves",
      "stem": "legs_paladin"
    },
    {
      "label": "Deep-Sea Diver Legs",
      "stem": "legs_deepsea"
    }
  ],
  "boots": [
    {
      "label": "Aegis Magnetic Boots",
      "stem": "boots_aegis"
    },
    {
      "label": "Magma Tread Boots",
      "stem": "boots_magma"
    },
    {
      "label": "Corsair Deck Boots",
      "stem": "boots_corsair"
    },
    {
      "label": "Frost Glide Boots",
      "stem": "boots_frost"
    },
    {
      "label": "Dread Stalker Treads",
      "stem": "boots_dread"
    },
    {
      "label": "Wild Hunt Hooves",
      "stem": "boots_hunt"
    },
    {
      "label": "Quantum Hover Boots",
      "stem": "boots_quantum"
    },
    {
      "label": "Solar Impact Boots",
      "stem": "boots_paladin"
    },
    {
      "label": "Deep-Sea Pressure Boots",
      "stem": "boots_deepsea"
    }
  ],
  "back": [
    {
      "label": "Aegis Hardlight Wings",
      "stem": "back_aegis_wings"
    },
    {
      "label": "Magma Phoenix Wings",
      "stem": "back_magma_wings"
    },
    {
      "label": "Star Corsair Mantle",
      "stem": "back_corsair_mantle"
    },
    {
      "label": "Frost Crystal Wings",
      "stem": "back_frost_wings"
    },
    {
      "label": "Dread Monarch Shroud",
      "stem": "back_dread_shroud"
    },
    {
      "label": "Wild Hunt Antler Rig",
      "stem": "back_hunt_rig"
    },
    {
      "label": "Quantum Portal Frame",
      "stem": "back_quantum_portal"
    },
    {
      "label": "Solar Halo Array",
      "stem": "back_solar_halo"
    },
    {
      "label": "Deep-Sea Fin Array",
      "stem": "back_deepsea_fins"
    },
    {
      "label": "Comet Trail Sails",
      "stem": "back_comet_sails"
    },
    {
      "label": "Gravity Anchor Rig",
      "stem": "back_gravity_rig"
    },
    {
      "label": "Jester Chaos Streamers",
      "stem": "back_jester_streamers"
    }
  ],
  "accessory": [
    {
      "label": "Aegis Shoulder Guards",
      "stem": "accessory_aegis_shoulders"
    },
    {
      "label": "Magma Horn Crown",
      "stem": "accessory_magma_horns"
    },
    {
      "label": "Corsair Bandolier",
      "stem": "accessory_corsair_bandolier"
    },
    {
      "label": "Frost Rune Orbs",
      "stem": "accessory_frost_orbs"
    },
    {
      "label": "Dread Monarch Spikes",
      "stem": "accessory_dread_spikes"
    },
    {
      "label": "Wild Hunt Antlers",
      "stem": "accessory_hunt_antlers"
    },
    {
      "label": "Quantum Wrist Drones",
      "stem": "accessory_quantum_drones"
    },
    {
      "label": "Solar Sigil Ring",
      "stem": "accessory_solar_ring"
    }
  ]
};
test("v16 contains 100 new paired PNG and SVG assets", () => {
 const all = Object.values(groups).flat(); assert.equal(all.length, 100);
 for (const part of all) { assert.ok(fs.existsSync(path.join(art, part.stem + ".png")), part.stem + " PNG"); assert.ok(fs.existsSync(path.join(art, part.stem + ".svg")), part.stem + " SVG"); assert.ok(app.includes(JSON.stringify(part.label) + ": require(\"./assets/character-art/" + part.stem + ".png\")"), part.label + " app mapping"); }
});
test("v16 art labels are present in the creator and exact-match renderer", () => {
 for (const part of Object.values(groups).flat()) { assert.ok(app.includes(JSON.stringify(part.label)), part.label + " selectable and mapped"); }
 assert.ok(app.includes('artFor("back", backPart)'));
});
