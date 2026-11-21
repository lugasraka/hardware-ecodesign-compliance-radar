# Regulatory update runbook

## Cadence

- Weekly: the `Regulatory watch` GitHub Action checks the official sources and opens a pull request when a source changes.
- Quarterly: review every instrument and clause, even when no source hash changed.
- Ad hoc: update immediately when a delegated act, implementing act, or court decision changes a date, threshold, or scope.

## What the action does

The action runs `scripts/watch-regulations.ts`. It fetches each automated source listed in `src/data/regulatory-sources.ts`, strips markup and scripts, hashes the remaining text, and compares it with `data/source-state.json`. A changed hash is fetched a second time before it is reported, so a transient response does not create noise.

If the confirmed hash changes, the script writes a candidate to `data/regulatory-watch.generated.json` and the action opens a pull request. The pull request changes only `data/`. It never changes the clause library.

Some official portals block automated requests. Those sources are marked `check: "manual"` and stay on the quarterly review list. The current manual sources are the California Legislature portal and the CPCB e-waste site.

A changed page is a signal, not a legal conclusion.

## Review checklist

1. Open the pull request and the official source for each candidate.
2. Classify the change: no substantive change, clarification, amendment, new instrument, or repeal.
3. If the clause library needs a change, update `src/data/clauses.ts`:
   - `summary`, `legalText`, and `interpretation`
   - `applicability` and `conformity` predicates
   - `exemptions` and `evidence`
   - `sourceUrl` and `lastVerified`
4. Update the instrument in `src/data/instruments.ts` if the application date, status, or source changed.
5. Add a release entry to `src/data/changelog.ts` with the version, date, changes, and reviewer.
6. Add or update a curated item in `src/data/regulatory-watch.ts` so the app shows the review status.
7. Run `npm run check`. All tests and the data validation must pass.
8. Merge the pull request. Vercel rebuilds the static app.
9. Close or dismiss the generated candidate in the pull request.

## Data fields

- `lastVerified`: the date the official source was last checked.
- `nextReviewDue`: computed as three months after `lastVerified`.
- `sourceUrl`: the official text, not a secondary summary.
- `interpretationStatus`: settled, guidance, contested, or pending.
- `reviewedBy`: the person who signed off the release.
- `dataReleases`: the changelog record for the app.
- `regulatoryWatch`: the curated queue shown in the app.

## What not to automate

- Do not let an LLM rewrite an applicability predicate, a threshold, or a legal date without review.
- Do not publish a scraped page change as a legal change.
- Do not merge a generated candidate without opening the official text.
- Do not treat a source error as a regulatory change. Verify the URL first.
- Do not claim the app is always current. Say it is monitored and reviewed, with a visible date.

## First run

The repository includes a baseline in `data/source-state.json`. If the state file is missing or its version changes, the next run rebuilds the baseline and opens a baseline pull request. Merge the baseline. Later runs create candidates only when a confirmed hash changes.

## Related files

- `src/data/regulatory-sources.ts`: the sources that are checked, and whether each is automated or manual.
- `src/lib/fingerprint.ts`: normalizes HTML and JSON before hashing.
- `scripts/watch-regulations.ts`: the source checker.
- `data/source-state.json`: the last hash, check time, and status for each automated source.
- `data/regulatory-watch.generated.json`: the generated triage file.
- `src/data/regulatory-watch.ts`: the curated queue shown in the app.
- `src/data/changelog.ts`: the reviewed data releases.
- `docs/sources.md`: the official source list and scope corrections.
