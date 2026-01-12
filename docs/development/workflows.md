# Development Workflows

This document describes the day-to-day workflow for developing features and fixing bugs in DivisApp.

## Daily Development Workflow

### Starting Your Day

1. **Pull latest changes**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open the project** in your editor

4. **Check your tasks**: Review Jira or your task board for assigned work

### Working on a Task

#### Step 1: Create a Feature Branch

```bash
git checkout develop
git checkout -b feature/SCRUM-XX-short-description
```

Replace:
- `SCRUM-XX` with the Jira ticket number
- `short-description` with a brief task description

Example:
```bash
git checkout -b feature/SCRUM-25-add-bitcoin-icon
```

#### Step 2: Implement the Feature

Make your code changes. As you work:

- Save files frequently (triggers hot reload)
- Check the browser to verify changes
- Run tests if you modify tested code:
  ```bash
  npm test
  ```

#### Step 3: Commit Your Changes

See [When to Commit](#when-to-commit) below for guidance.

```bash
git add .
git commit -m "feat(SCRUM-25): add bitcoin icon to indicator list"
```

#### Step 4: Push to Remote

```bash
git push -u origin feature/SCRUM-25-add-bitcoin-icon
```

The `-u` flag sets up tracking, so future pushes only need `git push`.

#### Step 5: Create a Pull Request

1. Go to the repository on GitHub/GitLab
2. Click "New Pull Request"
3. Select `develop` as the base branch
4. Select your feature branch as the compare branch
5. Add a description of your changes
6. Request review from team members

### Ending Your Day

1. **Commit work in progress** (if any):
   ```bash
   git add .
   git commit -m "wip: in-progress changes for SCRUM-XX"
   ```

2. **Push to remote**:
   ```bash
   git push
   ```

3. **Stop the dev server**: Press `Ctrl+C`

## How Tasks Are Implemented

### Small Tasks (Bug Fixes, Minor Changes)

1. Create branch from `develop`
2. Make changes
3. Test manually in browser
4. Commit with descriptive message
5. Push and create PR
6. Merge after approval

### Medium Tasks (New Components, Features)

1. Create branch from `develop`
2. **Plan**: Identify files to create/modify
3. **Implement**: Build the feature incrementally
4. **Test**: Run existing tests, add new tests if needed
5. Commit logical chunks (not one giant commit)
6. Push and create PR
7. Address review feedback
8. Merge after approval

### Large Tasks (Major Features, Refactoring)

1. Break down into smaller sub-tasks
2. Create a main feature branch
3. Create sub-branches for each part (optional)
4. Implement and test each part
5. Regular commits with clear messages
6. PR for the main feature
7. Thorough review
8. Merge after approval

## When to Commit

### Commit When:

- You complete a logical unit of work
- You fix a bug
- You add a new component
- You're about to make a risky change (commit first!)
- You're done for the day (even if incomplete)

### Each Commit Should:

- Be self-contained (not break the build)
- Have a clear, descriptive message
- Focus on one thing

### Commit Message Format

```
type(scope): short description

Optional longer description explaining why the change was made.
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `style`: Formatting, missing semicolons, etc.
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks

**Examples**:
```
feat(SCRUM-18): add CLP as base currency option in conversion
fix(SCRUM-21): handle 404 error on invalid indicator page
refactor(api): simplify indicator validation logic
test(api): add test for network error handling
```

## When to Push

### Push When:

- You complete a feature or fix
- You want feedback on your approach
- You're done for the day
- Before starting a different task

### Don't Push:

- Broken code that doesn't compile
- Code with obvious bugs (unless WIP branch)
- Sensitive information (API keys, passwords)

## When to Merge

### Merge Requirements:

1. **All tests pass**: CI should be green
2. **Code review approved**: At least one approval
3. **No merge conflicts**: Resolve conflicts first
4. **Documentation updated**: If applicable

### How to Merge (PR):

1. Ensure branch is up to date with `develop`:
   ```bash
   git checkout feature/your-branch
   git pull origin develop
   git push
   ```

2. Click "Merge" in the PR interface

3. Delete the feature branch after merge

## How Work Moves from Develop to Main

### The Branch Model

```
main         ────●────────────────●──────────  (releases only)
                  ↑                ↑
develop      ──●──●──●──●──●──●──●──●──●──●── (active development)
              ↑  ↑        ↑
feature/*    ──●  ●────────●                   (short-lived branches)
```

### develop Branch

- Active development happens here
- All feature branches merge into develop
- Should always be in a working state
- May have incomplete features

### main Branch

- Production-ready code only
- Only updated during releases
- Tagged with version numbers
- Must be stable

### Release Process

1. **Feature freeze**: Stop merging new features to develop
2. **Testing**: Verify develop is stable
3. **Merge**: Merge develop into main
4. **Tag**: Create a version tag
5. **Deploy**: Deploy from main

```bash
git checkout main
git pull origin main
git merge develop
git tag v1.1.0
git push origin main --tags
```

## Working with Others

### Before Starting Work

- Check if anyone else is working on related code
- Communicate in team chat/standup
- Avoid overlapping changes when possible

### Handling Merge Conflicts

1. **Don't panic**: Conflicts are normal
2. **Understand both changes**: Read the conflict markers
3. **Resolve carefully**: Keep the correct code
4. **Test after resolving**: Make sure nothing broke
5. **Commit the resolution**

```bash
# Pull latest changes
git pull origin develop

# If conflicts:
# 1. Open conflicting files
# 2. Look for <<<<<<< markers
# 3. Edit to keep correct code
# 4. Remove markers
# 5. Test
# 6. Commit

git add .
git commit -m "resolve merge conflict in conversion-form.tsx"
```

### Code Review Best Practices

**As a reviewer**:
- Be constructive and specific
- Explain why, not just what
- Approve when good enough (not perfect)

**As an author**:
- Keep PRs small and focused
- Respond to feedback promptly
- Don't take criticism personally

## Common Scenarios

### Scenario: Need to Switch Tasks Urgently

```bash
# Option 1: Commit work in progress
git add .
git commit -m "wip: incomplete conversion validation"
git checkout develop
git checkout -b feature/urgent-task

# Option 2: Stash changes (temporary)
git stash
git checkout -b feature/urgent-task
# ... do urgent work ...
git checkout original-branch
git stash pop
```

### Scenario: Made Changes on Wrong Branch

```bash
# If not committed yet:
git stash
git checkout correct-branch
git stash pop

# If already committed:
git log  # Note the commit hash
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1  # Remove the commit
```

### Scenario: Need to Undo Last Commit

```bash
# Keep changes, undo commit:
git reset --soft HEAD~1

# Discard changes and commit:
git reset --hard HEAD~1
```

### Scenario: Update Feature Branch with Latest Develop

```bash
git checkout feature/your-branch
git pull origin develop
# Resolve conflicts if any
git push
```
