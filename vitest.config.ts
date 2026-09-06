import { defineConfig } from "vitest/config";

// `npm test` (vitest) is for the unit/regression tests under src/**/*.test.ts.
// e2e/smoke.spec.ts is a Playwright spec (`import ... from "@playwright/test"`,
// a different test runner, not installed here — see docs/quality/BACKLOG.md);
// vitest's own defaults would otherwise pick it up by filename and fail the
// whole suite on a missing package that has nothing to do with unit tests.
export default defineConfig({
  test: {
    exclude: ["node_modules/**", "e2e/**"],
  },
});
