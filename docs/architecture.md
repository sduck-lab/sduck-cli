# Architecture

## Purpose

`sduck` is a Node.js CLI that will enforce a Spec-Driven Development workflow.
This bootstrap focuses on a strict toolchain, predictable structure, and verifiable tests.

## Layers

- `src/cli.ts`: process entrypoint and commander wiring
- `src/commands`: thin command handlers that parse input and trigger use cases
- `src/core`: domain rules such as state transitions, file formats, and validation
- `src/services`: orchestration across multiple core modules when workflows span boundaries
- `src/utils`: side-effect free helpers

## Flow

1. The user invokes the CLI.
2. Commander resolves the command and arguments.
3. Command handlers delegate to domain-oriented modules.
4. Domain modules read or write workspace files.
5. Output is emitted to stdout or stderr.
