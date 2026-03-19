# Plan

## Step 1. Locate the version source and choose a single reusable metadata path

- Review `src/cli.ts:16-19` where `program` is created and `.version('0.1.0')` is hardcoded.
- Review `src/core/command-metadata.ts:1-6` to determine whether the shared CLI metadata module is the best place to expose a reusable `CLI_VERSION` constant or helper.
- Review `package.json:1-8` to confirm the current authoritative package version and how safely it can be referenced from the runtime/build flow.
- Decide the implementation shape before editing code: either import package metadata into `src/core/command-metadata.ts` or define a build-safe version export sourced from package metadata once.

## Step 2. Remove the hardcoded version string from the CLI entry

- Update `src/core/command-metadata.ts:1-10` to expose the CLI version from a single source of truth alongside `CLI_NAME` and `CLI_DESCRIPTION`.
- Update `src/cli.ts:9-19` so `program.version(...)` consumes the shared version metadata instead of the literal `'0.1.0'`.
- Keep all existing command registrations in `src/cli.ts:20-125` unchanged so this step only affects version wiring, not command behavior.

## Step 3. Add regression coverage for version output and help stability

- Add or extend a unit test near the command metadata tests to verify the exported CLI version matches `package.json` expectations.
- Add an e2e test file or extend an existing CLI smoke test to run `sduck --version` and assert it prints the current package version.
- Add or retain a help-oriented assertion so `sduck --help` or the existing CLI preview/help flow still shows the expected command structure after the version wiring change.

## Step 4. Run focused verification for runtime, tests, and build compatibility

- Run the targeted unit and e2e tests covering command metadata and CLI entry behavior.
- Run a typecheck/build verification path if the chosen implementation reads metadata in a way that could affect bundling.
- Confirm the final behavior: `sduck --version` matches `package.json`, `sduck --help` still works, and no existing command output regresses.
