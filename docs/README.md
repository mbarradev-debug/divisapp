# DivisApp Documentation

## What is DivisApp?

DivisApp is a web application that displays Chilean economic indicators and provides currency conversion functionality. It fetches real-time data from the [mindicador.cl](https://mindicador.cl) API, which is a free public API that provides current and historical values for various Chilean economic indicators.

The application allows users to:

- View a list of current economic indicators (Dollar, Euro, UF, UTM, Bitcoin, etc.)
- See detailed historical data for any indicator
- Convert amounts between different indicators and Chilean Pesos (CLP)

## What Problem Does It Solve?

Accessing economic indicators in Chile typically requires visiting multiple government websites or using complex financial tools. DivisApp provides a simple, user-friendly interface to:

1. **Quick Reference**: See all major indicators at a glance on the home page
2. **Historical Trends**: View the last 10 values for any indicator to understand recent trends
3. **Currency Conversion**: Convert between different currencies and indicators without manual calculations

## Who Is This Documentation For?

This documentation is written for developers who:

- Are new to the project and need to understand how it works
- Have limited or no experience with Next.js, React Server Components, or the App Router
- Want to contribute to the project or extend its functionality
- Need to maintain or debug the application

The documentation assumes you are intelligent but may not be familiar with modern web development concepts. All technical terms are explained in plain language.

## How to Navigate This Documentation

The documentation is organized into the following sections:

### Architecture (`/architecture`)

Start here if you want to understand **how the application is built**:

- [Overview](./architecture/overview.md) - High-level architecture and technology choices
- [Folder Structure](./architecture/folder-structure.md) - What each folder and file does
- [Data Flow](./architecture/data-flow.md) - How data moves through the application

### Features (`/features`)

Read these to understand **what the application does**:

- [Home Page](./features/home.md) - The main indicators list
- [Indicator Detail](./features/indicator-detail.md) - Individual indicator pages
- [Conversion](./features/conversion.md) - The currency conversion tool

### Development (`/development`)

Use these when you need to **work on the code**:

- [Setup](./development/setup.md) - How to run the project locally
- [Workflows](./development/workflows.md) - Daily development practices
- [Branching and Commits](./development/branching-and-commits.md) - Git conventions

### Release (`/release`)

Reference these for **versioning and releases**:

- [Versioning](./release/versioning.md) - How versions are managed

### Versions (`/versions`)

Each major release has its own documentation:

- [v1.0.0](./versions/v1.0.0.md) - Initial release

## How Documentation Evolves

This documentation follows the same versioning as the application code:

1. When a new Git tag is created (e.g., `v1.1.0`), a new version file is added to `/versions`
2. The version file documents what features are available in that release
3. Architecture and feature documentation is updated to reflect the current state
4. Previous version documentation remains available for reference

This approach ensures that developers working with older versions can still find accurate documentation for their version.

## Quick Links

| I want to... | Go to... |
|--------------|----------|
| Run the project locally | [Development Setup](./development/setup.md) |
| Understand the architecture | [Architecture Overview](./architecture/overview.md) |
| Add a new feature | [Folder Structure](./architecture/folder-structure.md) |
| Fix a bug | [Data Flow](./architecture/data-flow.md) |
| Create a release | [Versioning](./release/versioning.md) |
