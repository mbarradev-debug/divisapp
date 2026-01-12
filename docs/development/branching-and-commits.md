# Branching and Commits

This document explains the Git conventions used in the DivisApp project.

## Branch Naming Conventions

### Main Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code, releases only |
| `develop` | Active development, integration branch |

### Feature Branches

**Format**: `feature/SCRUM-XX-short-description`

- `feature/`: Prefix indicating a new feature
- `SCRUM-XX`: Jira ticket number (e.g., SCRUM-18)
- `short-description`: Brief description in kebab-case

**Examples**:
```
feature/SCRUM-18-add-conversion-page
feature/SCRUM-20-add-back-navigation
feature/SCRUM-25-improve-error-messages
```

### Bug Fix Branches

**Format**: `fix/SCRUM-XX-short-description`

- `fix/`: Prefix indicating a bug fix
- Same pattern as feature branches

**Examples**:
```
fix/SCRUM-21-handle-404-errors
fix/SCRUM-30-fix-number-formatting
```

### Other Branch Types

| Prefix | Purpose | Example |
|--------|---------|---------|
| `refactor/` | Code restructuring | `refactor/api-client-cleanup` |
| `test/` | Adding tests | `test/SCRUM-32-add-form-tests` |
| `docs/` | Documentation | `docs/add-api-documentation` |
| `chore/` | Maintenance | `chore/update-dependencies` |

### Rules for Branch Names

1. **Always include ticket number** when there's an associated Jira ticket
2. **Use lowercase letters** only
3. **Use hyphens** to separate words (not underscores or spaces)
4. **Keep it short** but descriptive
5. **No special characters** except hyphens

**Good**:
```
feature/SCRUM-18-add-conversion
fix/SCRUM-21-404-handling
```

**Bad**:
```
Feature/SCRUM_18_Add_Conversion  # Wrong case, underscores
my-feature                        # No ticket number
feature/scrum-18-add-the-conversion-feature-to-convert-currencies  # Too long
```

## Commit Message Conventions

DivisApp follows a structured commit message format based on Conventional Commits.

### Message Format

```
type(scope): short description

Optional body explaining why the change was made.
Can be multiple lines.
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(SCRUM-18): add conversion page` |
| `fix` | Bug fix | `fix(SCRUM-21): handle 404 on detail page` |
| `refactor` | Code restructuring | `refactor(api): simplify error handling` |
| `style` | Formatting only | `style: fix indentation in components` |
| `test` | Adding/updating tests | `test(api): add network error tests` |
| `docs` | Documentation | `docs: update setup instructions` |
| `chore` | Maintenance | `chore: update dependencies` |

### Scope

The scope is optional but recommended. It indicates what part of the codebase is affected:

- Jira ticket: `(SCRUM-18)`
- Feature area: `(conversion)`, `(home)`, `(detail)`
- Technical area: `(api)`, `(components)`, `(styles)`

### Short Description

- Start with a lowercase letter
- Use imperative mood ("add" not "added" or "adds")
- No period at the end
- Maximum 50 characters ideally

**Imperative mood** means write as if you're giving a command:
- "add feature" not "added feature"
- "fix bug" not "fixes bug" or "fixed bug"

### Body (Optional)

Use when the "what" is obvious but the "why" isn't:

```
fix(SCRUM-21): handle 404 on invalid indicator page

The mindicador API returns 404 for invalid indicator codes.
Previously this caused an unhandled error. Now we catch it
and display the 404 page instead.
```

### Real Examples from This Project

```
feat(SCRUM-18): add CLP as base currency option in conversion
feat(SCRUM-20): add back navigation to convert page
fix(SCRUM-21): stabilize app for release with bug fixes and 404 handling
feat(SCRUM-15): add indicator detail page with historical series
feat(SCRUM-12): add mindicador.cl API client with types and tests
```

## Why Feature Branches Are Deleted

After a feature branch is merged into develop, it should be deleted. Here's why:

### Keeps the Repository Clean

Over time, undeleted branches accumulate. A year-old project might have hundreds of stale branches, making it hard to find active work.

### The Code Lives On

Deleting a branch doesn't delete the commits. They're merged into develop and preserved in history. You can always see what was done:

```bash
git log --oneline
```

### Branches Are Cheap to Recreate

If you need to return to a feature:

```bash
# Find the merge commit
git log --grep="SCRUM-18"

# Create a new branch from that point if needed
git checkout -b feature/SCRUM-18-continued <commit-hash>
```

### When to Delete

- **After merge**: Delete immediately after PR is merged
- **Abandoned work**: Delete branches for cancelled features
- **Stale branches**: Delete branches with no activity for weeks

### How to Delete

**After merging PR (recommended)**:
Most Git platforms offer a "Delete branch" button after merge.

**Manual deletion**:
```bash
# Delete local branch
git branch -d feature/SCRUM-18-conversion

# Delete remote branch
git push origin --delete feature/SCRUM-18-conversion
```

The `-d` flag only deletes if the branch has been merged. Use `-D` to force delete unmerged branches.

## How Jira and Git Are Connected

### The Ticket Number Links Everything

When you include `SCRUM-XX` in your branch name and commits:

1. **Jira can track commits**: Many Jira integrations show commits on the ticket
2. **Easy reference**: Anyone can find the ticket from the code or vice versa
3. **Audit trail**: You can trace why any change was made

### Workflow Connection

| Jira State | Git Action |
|------------|------------|
| To Do | No branch yet |
| In Progress | Create feature branch |
| In Progress | Commits are made |
| Code Review | PR created |
| Done | Branch merged and deleted |

### Finding Related Commits

To find all commits for a ticket:

```bash
git log --grep="SCRUM-18"
```

To find when a ticket was merged:

```bash
git log --oneline develop | grep "SCRUM-18"
```

### Best Practices

1. **One branch per ticket**: Don't mix multiple tickets in one branch
2. **Reference ticket in commits**: Include SCRUM-XX in commit messages
3. **Update Jira status**: Move ticket to "In Progress" when starting work
4. **Link PR to ticket**: Most platforms can auto-link with ticket number in PR title

## Summary Table

| Convention | Format | Example |
|------------|--------|---------|
| Feature branch | `feature/SCRUM-XX-description` | `feature/SCRUM-18-add-conversion` |
| Fix branch | `fix/SCRUM-XX-description` | `fix/SCRUM-21-404-handling` |
| Commit message | `type(scope): description` | `feat(SCRUM-18): add conversion form` |
| Main branches | `main`, `develop` | |
| Ticket reference | Include in branch and commits | `SCRUM-18` |
