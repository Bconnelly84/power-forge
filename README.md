# Power Forge

## FastTrack v7 upgrade

- Added an offline turn-based Battle Arena using the current character against saved characters or a demo rival.
- Added health bars, turn order based on speed, power-based attacks, battle logs, round limits, and win/draw results.
- Added seven power synergies, including Mach Toot, Duckpocalypse, Blink-and-Bonk, and Disco Dermatology.
- Added synergy detection to the ability profile and expanded automated combat-engine tests.
- Bumped app version to 1.0.7 and Android version code to 7.


A free, offline-first Android creator for heroes, villains, antiheroes, and original powered characters.

## FastTrack v6 upgrade

- Expanded the ability catalog to 60+ powers across Combat, Physical, Movement, Defense, Stealth, Mind, Tech, Elemental, Cosmic, Utility, Silly, Gross-Out, and Chaos categories.
- Added power search and category filters to loadout and showcase screens.
- Added per-power descriptions, colors, glyphs, and starter power/speed/defense ratings.
- Added a derived character profile with power, speed, defense, and chaos ratings.
- Added a random character generator and quick-random-power action.
- Improved the preview so selected head/torso/back-part choices visibly affect some shapes and attachments.
- Preserved offline character saving, editing, duplication, renaming, deletion, and JSON backup/restore.
- Added automated power-catalog and rating tests.

## Project contents

- Expo / React Native app
- Front/back stylized character preview
- Modular body-part selection, color palette, and drawing pad
- `catalog.json` for body-part slots and customization rules
- `src/characterRules.js` for character validation and part rules
- `src/powerCatalog.js` for the categorized ability library and starter ratings
- `src/battleEngine.js` for offline turn-based combat and power synergies
- `src/backupTools.js` for offline backup validation
- Automated Node.js tests
- GitHub Actions workflow that tests, checks Expo configuration, and builds a release APK

## Uploading from an iPhone

Upload the **contents** of this folder into the root of the `power-forge` GitHub repository. Preserve nested paths, especially `.github/workflows/build-apk.yml`, `assets/`, `src/`, and `tests/`. Commit to `main` to trigger the cloud build.

## Build and test

GitHub Actions runs `node --test`, installs dependencies, aligns Expo packages, runs Expo Doctor, generates the Android project, builds the release APK, and uploads the `power-forge-apk` artifact.

The JavaScript tests passed locally for this bundle. The Android/Expo cloud build still needs to be confirmed by GitHub Actions; this has not been tested on a physical Android device or emulator.

## Current limitations

The character renderer is still a stylized prototype, not a fully rigged illustration engine. Some part selections affect the preview, but not every part has a unique bespoke model. The showcase uses reusable local animated effects, not full physics-based combat. The Battle Arena currently uses turn-based text-and-health-bar combat; real-time animated battles and fully articulated animation remain future upgrades.

No paid API, hosted database, login, or paid server is required for the core offline app. GitHub Actions usage is subject to GitHub's current plan limits.


## FastTrack v8 — Character Creator Upgrade

- Expanded the modular part choices across head, torso, arms, legs, boots, and back attachments.
- Added a separate accent/energy color palette alongside the main suit color.
- Added additional visual responses in the 2D preview for horns, cat-ear cowls, antenna helmets, wings, drone swarms, claws, tentacle arms, cosmic robes, bio armor, exo frames, digitigrade legs, and hover boots.
- Random character generation now chooses an accent color too.
- Preserves the existing offline character collection, power catalog, showcase, backup, and turn-based battle simulator.

Validation performed for this bundle: `npm test` (25 tests passed). The Android APK build must still be verified by GitHub Actions.


## Version 1.0.9 / FastTrack v9

- Added a reusable ability showcase motion-profile module.
- Added distinct movement profiles for projectile/strike, teleport, rising/summoning, defensive pulse, chaos, and power-surge abilities.
- Added animated effect particles and animated character preview movement to the local power showcase.
- Added automated tests for motion-profile selection and safe defaults.
- All effects run locally; no server or paid service is required.

This is a lightweight 2D preview system, not full skeletal animation or real-time combat.


## Version 10 — polish and reliability

- Hardened character backup import with input normalization and limits.
- Validates imported names, alignments, colors, part slots, ability lists, and drawing points.
- Rejects backups with more than 500 characters and bounds per-character imported data.
- Expanded automated backup tests.
- Updated the app version to 1.0.10.

Version 10 is a polish release, not a claim of complete real-device verification. Run the GitHub Actions Android build and test on an Android device or emulator before public release.


## v11 — Illustrated character assets

The character preview now composes bundled, transparent PNG layers instead of constructing the full figure from primitive React Native shapes. The layers are kept in `assets/character-art/` with editable SVG source files alongside the PNGs. Initial modular layers include head/helmet, torso/robe, arms/claws, legs/speed legs, boots/hover boots, cape, wings, and jetpack. Selection of matching part types swaps the appropriate illustrated layer.

All assets are bundled locally; no network, server, or paid API is required. The first set establishes the illustration pipeline and a consistent comic-inspired style. It is not yet a huge art library: additional compatible assets can be added to the same slots as future polish work.


## v12 — Character art expansion

- Added 25 new full-canvas illustrated PNG overlays with editable SVG source files.
- Expanded head/helmet, torso armor, arm, leg, boot, back attachment, and accessory options.
- Connected the new variants to the modular character preview so selections change the rendered layers.
- Added a dedicated Extras slot for shoulder plates, horn overlays, and an energy-orb detail.
- All artwork is bundled locally for offline use.
- Added automated checks for the new art assets and part options.


## v13 artwork inventory

This release adds 20 new illustrated variants, each supplied as a transparent PNG used by the app and an editable SVG source.

| Part type | New variants | Count added |
|---|---|---:|
| Hair | Spiked Hair, Silver Sweep, Flame Crest, Curly Volume, Neon Undercut | 5 |
| Face | Rugged Face, Cyber Faceplate, Alien Features, Iceborn Features, Shadow Features | 5 |
| Masks | Crimson Mask, Night Ops Mask, Gold Visor Mask, Skull Mask, Arc-Tech Mask | 5 |
| Helmets | Sentinel Helmet, Horned War Helm, Royal Crest Helm, Recon Helmet, Full Visor Helmet | 5 |
| **Total** | **20 variants** | **20** |

All 20 variants are connected to the character creator and preview renderer. The face, hair, mask, and helmet overlays are designed as starter modular layers; precise fit across every existing head asset still needs visual QA on Android.


## v14 artwork expansion

This release adds 20 illustrated variants across torso armor, arms/gauntlets, legs, and boots. Each asset is bundled as a transparent PNG for React Native rendering and an editable SVG source. The new choices are wired into the character preview renderer.

New variants: 5 torso designs, 5 arm designs, 5 leg designs, and 5 boot designs.


## v15 artwork expansion

Adds 20 illustrated variants (15 back attachments and 5 accessories), each with a transparent PNG for runtime use and an editable SVG source. New choices are registered in the creator and mapped into the illustrated preview. See `assets/character-art/v15-manifest.json` for the complete list.


## v16 Massive Artwork Expansion

- Added 100 new modular illustrated part variants across 11 categories.
- Every new part includes a transparent PNG for React Native and editable SVG source.
- New choices are integrated into the character creator and exact-match layered preview renderer.
- All artwork is bundled locally for offline use.
- Run `npm test` to execute automated checks.


## v17 — Power and effects expansion

- Added 50 new powers across combat, defense, movement, stealth, elemental, tech, silly, chaos, mind, cosmic, and utility categories.
- Added 12 reusable bundled SVG effect illustrations: beam, lightning, flame, frost, portal, swarm, bubble, comic burst, sonic rings, aura, healing, and motion trail.
- Expanded showcase motion profiles so more abilities use a recognizable effect family and effect label.
- Added counter hints to power records to help players think tactically.
- Added 9 battle synergies for combinations of new powers.
- Added automated tests for catalog size, effect assets, visual profiles, and synergies.

The showcase animations are still lightweight 2D effects, not full character-specific animation clips. SVG effect assets are included as editable source artwork; the running showcase uses React Native animated shapes and power-specific profiles.

## v20 Part Workshop update

Version 1.0.20 introduces a shared offline Part Workshop for the existing part categories. You can choose a base part, adjust its tint/accent, select a pattern treatment, change scale/rotation/opacity, draw category-tagged marks with adjustable brush size, undo/clear marks, and save/apply/delete reusable local part presets. Custom part presets are stored separately from saved characters using AsyncStorage.

The six separate vertical files in `docs/v20-screen-concepts/` are visual concept references, not screenshots from a running Android build. A real Android release build still needs to pass the repository's GitHub Actions workflow before the release can be considered verified. Freehand marks and appearance settings are functional editor features; this version does not yet provide node-level vector path editing or a true polygon reshaping tool for arbitrary imported art.


## V20 Part Workshop and release checks

The Part Workshop supports all 11 part categories (head, hair, face, masks, helmets, torso, arms, legs, boots, back, and extras). Each category can use tint/accent colors (including custom hex values), a pattern, a shape-detail treatment, a short emblem, scale/rotation/opacity, and freehand category-tagged marks. Custom presets can be saved, applied, edited, updated, and deleted locally. Character backups include part styles, drawing metadata, and the reusable custom-part library.

The current builder catalog contains 242 selectable part options and 136 powers. The app bundles its artwork locally and does not require a paid API or online account.

Before release handoff, run `node --test`, confirm `npx expo-doctor`, and run the repository's GitHub Actions Android release APK workflow. Local automated tests do not replace a successful dependency check or APK build. Device interaction and visual layout checks are reserved for the user's Android testing.
