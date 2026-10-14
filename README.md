# Power Forge

A free, offline-first Android creator for heroes, villains, antiheroes, and original powered characters.

## What's in this package

- Expo / React Native app starter
- Front/back stylized character preview
- Starter part categories, color palette, ability selection, local save/load, and a basic drawing pad
- Data-driven `catalog.json` with per-part slots, abilities, and customization permissions
- Pure JavaScript character rules with automated tests
- GitHub Actions workflow that runs tests and Expo diagnostics before building an Android APK
- Original app icon and adaptive icon assets

## Uploading from an iPhone

Upload the **contents** of this folder into the root of the `power-forge` GitHub repository. Preserve the nested paths, especially:
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `.github/workflows/build-apk.yml`
- `src/characterRules.js`
- `tests/characterRules.test.js`

The app configuration intentionally omits splash-screen configuration until the matching splash-screen package/plugin is deliberately added.

## Build

1. Open the repository's Actions tab.
2. Run **Build Power Forge APK**, or push a commit to `main`.
3. Inspect the test, Expo diagnostics, and Gradle steps.
4. Download the `power-forge-apk` artifact after a successful run; extract it to get the APK.

## Testing without an Android device

Run `npm test` in a Node.js environment to test part-slot compatibility, customization permissions, granted abilities, and basic character validation. GitHub Actions runs these tests automatically.

## Current limitations

This is still an early prototype. The preview uses stylized UI shapes, not a large library of production character illustrations. The drawing pad is basic and isn't yet clipped to an individual body part. Ability rules and stats are only partially implemented in the UI. There is no claim of full device-tested Android readiness until a real device or emulator test is performed.

No paid API, hosted database, login, or paid server is required for the core offline app. GitHub Actions usage is subject to GitHub's current plan limits.
