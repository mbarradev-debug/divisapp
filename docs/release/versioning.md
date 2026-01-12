# Versioning

This document explains how versions are managed in DivisApp, including when to bump versions and how to create releases.

## Semantic Versioning

DivisApp uses **Semantic Versioning** (SemVer), a widely-adopted versioning scheme that communicates what kind of changes are in each release.

### Version Format

```
MAJOR.MINOR.PATCH
```

Example: `1.2.3`

- **MAJOR** (1): Breaking changes
- **MINOR** (2): New features (backwards compatible)
- **PATCH** (3): Bug fixes (backwards compatible)

## When to Bump Major, Minor, or Patch

### Bump MAJOR (1.0.0 → 2.0.0)

Increment the major version when you make **breaking changes**. A breaking change is anything that could cause existing functionality to stop working for users or integrators.

**Examples of breaking changes**:
- Removing a feature that users depend on
- Changing the URL structure of pages
- Removing or renaming API endpoints
- Fundamentally changing how a feature works

**In DivisApp context**:
- Removing an indicator from the home page
- Changing `/convert` to `/converter`
- Removing the ability to convert to CLP

When bumping major: Reset minor and patch to 0 (`1.5.3 → 2.0.0`)

### Bump MINOR (1.0.0 → 1.1.0)

Increment the minor version when you add **new features** that are backwards compatible.

**Examples**:
- Adding a new page or feature
- Adding new indicators
- Adding new conversion options
- Adding dark mode support
- Adding new UI components

**In DivisApp context**:
- Adding a historical chart to indicator detail
- Adding a favorites feature
- Adding date range selection for series
- Supporting new currencies

When bumping minor: Reset patch to 0 (`1.2.5 → 1.3.0`)

### Bump PATCH (1.0.0 → 1.0.1)

Increment the patch version for **bug fixes** and minor improvements that don't add features.

**Examples**:
- Fixing a calculation error
- Fixing a display bug
- Fixing a broken link
- Improving performance
- Updating dependencies for security

**In DivisApp context**:
- Fixing number formatting issues
- Fixing 404 handling
- Fixing mobile layout issues
- Updating Next.js for security patches

### Quick Reference

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking change | MAJOR | 1.2.3 → 2.0.0 |
| New feature | MINOR | 1.2.3 → 1.3.0 |
| Bug fix | PATCH | 1.2.3 → 1.2.4 |
| Security patch | PATCH | 1.2.3 → 1.2.4 |
| Performance improvement | PATCH | 1.2.3 → 1.2.4 |
| Dependency update (no new features) | PATCH | 1.2.3 → 1.2.4 |

## How Git Tags Are Created

Git tags mark specific points in history as important, typically for releases.

### Creating a Tag

After merging release changes into main:

```bash
# Ensure you're on main with latest changes
git checkout main
git pull origin main

# Create an annotated tag
git tag -a v1.1.0 -m "Release version 1.1.0"

# Push the tag to remote
git push origin v1.1.0
```

### Tag Naming Convention

- Always prefix with `v`: `v1.0.0`, not `1.0.0`
- Use exact semantic version: `v1.2.3`
- No suffixes in production releases: `v1.2.3`, not `v1.2.3-final`

### Pre-release Tags (Optional)

For testing releases before production:

```
v1.1.0-beta.1    # First beta
v1.1.0-beta.2    # Second beta
v1.1.0-rc.1      # Release candidate
v1.1.0           # Final release
```

### Viewing Tags

```bash
# List all tags
git tag -l

# Show tag details
git show v1.0.0

# Checkout a specific version
git checkout v1.0.0
```

## How Documentation Versions Relate to Git Tags

### The Relationship

Each Git tag should have a corresponding documentation file in `/docs/versions/`:

| Git Tag | Documentation File |
|---------|-------------------|
| `v1.0.0` | `docs/versions/v1.0.0.md` |
| `v1.1.0` | `docs/versions/v1.1.0.md` |
| `v2.0.0` | `docs/versions/v2.0.0.md` |

### Version Documentation Contents

Each version file documents:

1. **Version number and release date**
2. **Summary of features** available in this version
3. **What's not included** (intentionally)
4. **Stability notes** and known issues
5. **Changelog** (what changed from previous version)
6. **Upgrade notes** (if applicable)

### Creating Version Documentation

When preparing a release:

1. **Create the version file**:
   ```
   docs/versions/v1.1.0.md
   ```

2. **Document the release** following the template in existing version files

3. **Update docs/README.md** to link to the new version

4. **Commit documentation** with the release

### Why This Matters

- Developers can understand what's in each version
- Upgrade decisions are informed by changelogs
- Historical versions remain documented
- Bug reports can reference specific versions

## Release Process Checklist

### Before Release

- [ ] All features for release are merged to develop
- [ ] All tests pass
- [ ] No known critical bugs
- [ ] Documentation is updated
- [ ] Version file created in `docs/versions/`

### Creating the Release

```bash
# 1. Update to latest develop
git checkout develop
git pull origin develop

# 2. Merge into main
git checkout main
git pull origin main
git merge develop

# 3. Create and push tag
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main
git push origin v1.1.0

# 4. Go back to develop
git checkout develop
```

### After Release

- [ ] Verify deployment (if automated)
- [ ] Announce release to team
- [ ] Close related Jira tickets
- [ ] Delete merged feature branches

## Version History

| Version | Release Date | Highlights |
|---------|--------------|------------|
| v1.0.0 | January 2025 | Initial release with home, detail, and conversion pages |

## Special Version Numbers

### v0.x.x (Pre-release)

Versions starting with 0 (like `v0.1.0`) indicate the software is in early development. The API/features may change without warning.

### v1.0.0 (First Stable Release)

The first `1.0.0` release signals the software is considered stable and ready for production use.

### After v1.0.0

Once you reach `1.0.0`, follow semantic versioning strictly. Users rely on version numbers to understand compatibility.

## Common Questions

### Should I bump version for every commit?

No. Version numbers are for releases, not individual commits. Many commits accumulate between version bumps.

### What if I'm not sure major vs minor?

Ask: "Will this break existing usage?" If yes, it's major. If it's purely additive, it's minor.

### Can I skip version numbers?

Yes, but it's unusual. Going from `1.0.0` to `1.2.0` is fine if `1.1.0` was never released.

### What about the version in package.json?

Keep `package.json` version in sync with Git tags for production releases. During development, it can stay at the last release version.
