# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.9] - 2026-10-05

### Added
- Neovim: the explorer now hides unchanged files by default, showing only git-changed
  files and the directories containing them. Configurable via `show_unchanged` in
  `setup()` and toggleable at runtime with `H` (`toggle_unchanged` keymap).

### Fixed
- Merge-conflict states (`DD`, `AU`, `UD`, `UA`, `DU`, `AA`) are now badged as `C`
  instead of being misclassified as added/deleted. Fix applied to both the VS Code
  extension and the Neovim module.

### Changed
- Rewrote README with marketplace badges, install instructions, and a clear split
  between VS Code and Neovim usage.

## [0.0.8] - 2026-05-12

### Added
- Hide/show unchanged files in the Git Scope sidebar. Focus a changed directory to
  collapse it down to only the files with git changes, then restore the full tree.

## [0.0.7] - 2026-05-12

### Fixed
- Lowered the required VS Code engine to `^1.85.0` for Cursor compatibility.

## [0.0.6] - 2026-05-12

### Added
- CI: publish to Open VSX so the extension is installable from the Cursor marketplace.

## [0.0.5] - 2026-04-10

### Added
- `CODE_OF_CONDUCT.md`.

### Changed
- Updated name references across the project.

## [0.0.4] - 2026-04-10

### Changed
- Renamed the extension to a unique marketplace id and updated the display name.
- Added marketplace categories.

### Fixed
- Activity bar icon styling.

## [0.0.3] - 2026-04-09

### Added
- Marketplace icon (512x512 PNG)
- CI: publish to VS Code Marketplace on merge to main
- CI: run tests on pull requests

## [0.0.2] - 2026-03-16

### Changed
- Added publisher field (`Kandeel4411`)
- Renamed extension to **Git Scope Explorer**
- Replaced activity bar icon with custom SVG (folder + git branch)

## [0.0.1] - 2026-03-16

### Added
- Initial release
- Tree view filtered to git-changed top-level directories
- Full filesystem browsing inside changed directories
- New File / New Folder / Rename / Delete via context menu
- Git status badges (M/A/D/U/R) with native theme colors
- Auto-refresh on git index and file system changes
