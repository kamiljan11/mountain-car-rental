# ADR-0002 — `next build --webpack`, not the Turbopack default

Date: 2026-09-05 (documenting an existing, already-shipped decision) | Status: accepted

**Context:** This Next.js version (`^16.2.12`) defaults to Turbopack for `next build`/`next dev`.
`proxy.ts` (the Next "middleware" that gates every authenticated route through the session
cookie, see ADR-0001) runs on the Edge runtime ahead of every request. During development,
Turbopack pulling `proxy.ts` into the same module graph as the rest of the app caused the kind
of proxy instability documented inline in `proxy.ts` itself. `package.json` already pins
`"build": "next build --webpack"`, and `AGENTS.md` at the repo root flags this Next.js major as
having breaking changes from what a model's training data assumes — Turbopack-specific
behaviour here is one of them.

**Decision:** Build and run with the classic webpack bundler (`--webpack` flag), and keep
`proxy.ts` deliberately free of imports from the rest of the app (no shared `src/lib/*` imports)
regardless of which bundler is active, so the file that gates every page never depends on the
app's full module graph.

**Rejected alternative:** Default to Turbopack (the framework's own recommended path,
faster builds). Rejected because the instability was observed against the proxy specifically —
the one file that must work correctly on every single request — and re-testing it on every new
Next.js minor was judged not worth the build-speed gain for an app of this size (~70 files).

**Consequences:** Slightly slower local builds than Turbopack's default. CI
(`.github/workflows/quality.yml`) and any new script must remember the `--webpack` flag — plain
`next build` would silently switch bundlers.

**Traps for a future maintainer:** If you add an import to `proxy.ts`, re-verify the login
redirect on a fresh session before shipping — that is the failure mode this ADR exists to avoid.
Re-evaluate this ADR before ever removing the `--webpack` flag or upgrading past this Next.js
major.
