# SemVer policy

This project follows Semantic Versioning 2.0.0: MAJOR.MINOR.PATCH.

## What increments what

### PATCH (x.y.Z)
Backward-compatible bug fixes and small internal changes that do not change the public API.

Examples:
- Fix incorrect viewport detection
- Performance improvements without API changes
- Documentation-only changes (may result in no release)

### MINOR (x.Y.z)
Backward-compatible feature additions.

Examples:
- New option with a safe default
- New exported helper (does not change existing behavior)
- Additional events/callbacks that are optional

### MAJOR (X.y.z)
Any breaking change for consumers.

A change is considered BREAKING if it:
- Changes or removes an exported function/type/constant
- Changes default behavior in a way that can break existing apps
- Tightens validation (previously accepted input now throws/errors)
- Changes runtime requirements (Node/browser support)
- Requires code changes for typical usage

## Deprecations
- Deprecations should be introduced in a MINOR release.
- Deprecations must be documented with a migration note.
- Removal of deprecated APIs is a MAJOR release.

## Pre-1.0.0 rule
If the project is < 1.0.0:
- Breaking changes MAY still require a MAJOR bump (0.x -> 1.0 or 0.y -> 0.(y+1)) depending on impact.
- In general: treat MINOR as potentially breaking and communicate clearly in CHANGELOG.
