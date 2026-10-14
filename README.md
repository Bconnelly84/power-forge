# Power Forge

Power Forge is a free, offline-first Android character creator for heroes, villains, antiheroes, and original powered characters.

## Current starter features

- Stylized front and back character preview
- Hero, Villain, Antihero, and Original alignments
- Modular part categories and starter part choices
- Suit color palette
- Ability selection
- Basic finger-drawing pad for custom marks
- Local character save/load using AsyncStorage
- GitHub Actions workflow to compile an Android APK

## Build an APK

1. Upload the project files to the root of your `power-forge` GitHub repository, preserving the `.github/workflows/` folder.
2. Open the **Actions** tab and enable workflows if GitHub asks.
3. Run **Build Power Forge APK** from the Actions tab, or push a commit to `main`.
4. When the workflow completes, open the run and download the `power-forge-apk` artifact.
5. Extract that artifact ZIP to find `app-release.apk`.

The workflow uses GitHub-hosted runners and open-source build tools. Public repositories have standard free GitHub Actions minutes, subject to GitHub's current limits and policies.

## Important notes

- The first build needs an internet connection to download packages and Android build tools. The installed app's character builder and local collection are designed to work offline.
- This starter uses original placeholder vector-style shapes for the character preview. It does not yet include a large illustrated art library.
- The custom drawing pad currently stores freehand marks. Part-specific drawing masks, undo, brush-size controls, image export, more body types, and ability/part compatibility are planned follow-up features.
- No paid API, account, or hosted database is required for the core app.
- The name “Power Forge” is a working project name; app-store and trademark availability should be checked before public release.
