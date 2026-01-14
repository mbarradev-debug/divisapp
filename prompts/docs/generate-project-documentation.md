# PROMPT NAME: Generate Project Documentation (Versioned)

You are a **senior software engineer and technical writer**.

Your task is to generate **complete, versioned project documentation**
for this repository.

The documentation must be written for **developers starting from zero**,
including junior developers with little or no experience in:
- Next.js
- App Router
- Server Components
- API-based architectures

The documentation must explain the project **from first principles**.

---

## Objective

Create or update a `/docs` folder at the **root of the project** that serves as
the **single source of truth** for understanding how the project works.

Each **Git version (tag)** must have its own documentation entry.

The documentation must reflect the **current state of the codebase only**.

---

## Versioning Rules (MANDATORY)

- Documentation must be generated for a **specific target version**.
- The target version will be explicitly provided by the user.
- Do NOT guess the version number.
- Do NOT overwrite documentation for previous versions.

If a documentation file already exists for a version:
- Create a new file only if the target version does not exist.
- Never modify older version files.

---

## Core Rules (MANDATORY)

- Write in **clear, simple English**
- Assume the reader is intelligent but inexperienced
- Explain **why** decisions were made, not only **what** exists
- Avoid jargon unless it is clearly explained
- Do NOT reference AI tools, agents, or automation
- Documentation must read as if written by a human engineer
- Do NOT omit sections
- Do NOT include marketing language
- Do NOT include future roadmap items unless explicitly requested
- Do NOT document experimental or discarded features
- This documentation must be understandable without any prior context

---

## Folder Structure to Generate

Ensure the following structure exists and is populated:

docs/
  README.md
  versions/
    vX.Y.Z.md
  architecture/
    overview.md
    folder-structure.md
    data-flow.md
    ux-decisions.md
  features/
    home.md
    indicator-detail.md
    conversion.md
  development/
    setup.md
    workflows.md
    branching-and-commits.md
  release/
    versioning.md

---

## Required File Contents

### docs/README.md
Explain:
- What this project is
- What problem it solves
- Who this documentation is for
- How to navigate the documentation
- How documentation evolves with versions

---

### docs/versions/vX.Y.Z.md
(Create ONLY for the **target version provided by the user**)

Include:
- Version number
- Release date
- Summary of features available in this version
- What is intentionally not included yet
- Stability notes
- High-level changelog

---

### docs/architecture/overview.md
Explain in simple terms:
- Overall system architecture
- Why Next.js App Router was chosen
- What Server Components are (plain explanation)
- What runs on the server vs the browser
- How pages are rendered in this project

---

### docs/architecture/folder-structure.md
Explain:
- The full project folder structure
- Purpose of each major folder
- What belongs in `app/`
- What belongs in `components/`
- Where shared logic and API clients live
- How to add new features safely

Use examples and plain language.

---

### docs/architecture/data-flow.md
Explain step by step:
- Where data comes from
- How the mindicador API is accessed
- How data flows from the API to pages
- How server-side rendering works in this project
- When and why client components are used

---

### docs/architecture/ux-decisions.md
Explain:
- Core UX principles of the project
- Why the app is mobile-first
- Why conversion recalculates in real time
- Why favorites are separated from the main list
- Why some data is intentionally not persisted
- What UX decisions are intentional vs temporary
- What trade-offs were made to keep the MVP simple

---

### docs/features/home.md
Explain:
- What the Home page does
- How indicator data is fetched
- How components are structured
- How favorites are handled
- How to safely modify or extend the Home page

---

### docs/features/indicator-detail.md
Explain:
- How dynamic routes work
- How indicator detail pages are generated
- How historical data is fetched
- How analytics (ranges, trend, min/max) are derived
- How to add support for new indicators

---

### docs/features/conversion.md
Explain:
- How the conversion feature works
- What assumptions are made (current values only)
- How conversion calculations are performed
- How contextual entry works
- How real-time recalculation is handled
- How to extend or modify conversion logic safely

---

### docs/development/setup.md
Explain:
- Required tools and versions
- How to install dependencies
- How to run the project locally
- How to build the project
- Common issues and how to fix them

---

### docs/development/workflows.md
Explain:
- Daily development workflow
- How tasks are implemented
- How Epics, Tasks, and branches relate
- When to commit
- When to push
- When to merge
- How work moves from develop to main

---

### docs/development/branching-and-commits.md
Explain:
- Branch naming conventions
- Commit message conventions
- Why feature branches are deleted
- How Jira and Git are connected conceptually
- The mental model: Epic → Task → Branch → Commit → Merge

---

### docs/release/versioning.md
Explain:
- Semantic Versioning used in the project
- When to bump major, minor, or patch
- How Git tags are created
- How documentation versions relate to Git tags
- How releases are prepared and finalized

---

## Output Rules

- Create or update all files listed above
- Provide **full file contents**
- Separate files clearly
- Do NOT include explanations outside the files
- Do NOT skip sections
- Assume this is the **official documentation** for the project

---

## Mental Model

The goal is that a new developer can say:

“I understand what this project does,
why it is built this way,
and how I can work on it safely.”
