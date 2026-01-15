# DivisApp Documentation

## What is DivisApp?

DivisApp is a web application that displays real-time economic indicators from Chile. It shows the current values of financial indicators like the UF (Unidad de Fomento), US Dollar, Euro, Bitcoin, and others, along with their historical data and trends.

The application provides:

- A home page showing all indicators with favorites at the top
- Detail pages with historical charts, trend analysis, and range selection
- A currency conversion tool with smart defaults and real-time calculation
- Local persistence for favorites and conversion state

## What Problem Does It Solve?

Chile has several unique economic indicators that people need to check regularly:

- **UF (Unidad de Fomento)**: A unit of account that adjusts daily for inflation, used in mortgages and contracts
- **UTM (Unidad Tributaria Mensual)**: A monthly tax unit used for calculating fines and fees
- **Dollar and Euro**: Exchange rates that affect imports, travel, and investments
- **IPC**: The consumer price index measuring inflation

Before DivisApp, checking these values required visiting government websites or financial portals with cluttered interfaces. DivisApp provides a clean, mobile-friendly way to:

1. See all indicators at a glance with favorites first
2. View historical trends with interactive charts
3. Analyze changes over 7, 30, or 90 day periods
4. Convert between different currencies and indicators
5. Get smart conversion defaults based on context

## Who Is This Documentation For?

This documentation is written for developers who need to understand, maintain, or extend DivisApp. It assumes you are:

- Familiar with basic programming concepts
- Learning or working with JavaScript/TypeScript
- New to Next.js, React Server Components, or modern React patterns

If you have never used Next.js before, start with the **Architecture Overview** section, which explains the core concepts from first principles.

## How to Navigate This Documentation

The documentation is organized into several sections:

### Getting Started

- **[Development Setup](development/setup.md)**: How to install and run the project locally

### Understanding the Architecture

- **[Architecture Overview](architecture/overview.md)**: The big picture of how the application works
- **[Folder Structure](architecture/folder-structure.md)**: Where files live and what each folder contains
- **[Data Flow](architecture/data-flow.md)**: How data moves from the API to the user interface
- **[UX Decisions](architecture/ux-decisions.md)**: Why the user experience is designed the way it is

### Features

- **[Home Page](features/home.md)**: How the main indicator list and favorites work
- **[Indicator Detail](features/indicator-detail.md)**: How detail pages with charts and analytics work
- **[Conversion](features/conversion.md)**: How the currency conversion feature works

### Development Workflow

- **[Daily Workflows](development/workflows.md)**: How to work on tasks day-to-day
- **[Branching and Commits](development/branching-and-commits.md)**: Git conventions and practices

### Releases

- **[Versioning](release/versioning.md)**: How versions are numbered and released

### Version History

- **[v1.4.0](versions/v1.4.0.md)**: Current version (drag and drop reordering)
- **[v1.1.0](versions/v1.1.0.md)**: Favorites, charts, smart conversion
- **[v1.0.0](versions/v1.0.0.md)**: Initial release

## How Documentation Evolves

This documentation follows the codebase. Each significant release has its own version document in the `versions/` folder that describes:

- What features are available in that version
- What changed from the previous version
- What is intentionally not yet implemented

When you update the code significantly, create a new version document. Previous version documents are never modified—they serve as historical records of what the project looked like at each release point.

## Quick Links

| I want to... | Go to... |
|--------------|----------|
| Run the project locally | [Development Setup](development/setup.md) |
| Understand how the app works | [Architecture Overview](architecture/overview.md) |
| Add a new feature | [Folder Structure](architecture/folder-structure.md) |
| Understand data flow | [Data Flow](architecture/data-flow.md) |
| See what version 1.4.0 includes | [v1.4.0](versions/v1.4.0.md) |
| Learn Git conventions | [Branching and Commits](development/branching-and-commits.md) |
| Understand UX choices | [UX Decisions](architecture/ux-decisions.md) |
