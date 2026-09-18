# Unified Dropdown Implementation Plan

**Goal:** Use the same Dropdown component for selections and action menus in both frontend templates, including searchable paginated data and an externally supplied selection.

**Architecture:** Keep each template independently scaffoldable. Mirror the public API, behavior and tests across both templates. Reuse the existing Dropdown owner and SCSS tokens; use TanStack Query for remote pagination. Static dropdowns do not require a query provider.

**Scope:** React and Next.js dropdown primitives, their showcases, component usage instructions, tests and documentation. No backend changes. No commits or pushes.

**Requirements:** `docs/requirements/01-dropdown.md`; client explanation: `docs/SPECIFICATION.md`.

## Tasks

1. Add component interaction tests and verify they fail against the existing dropdown. Cover missing selections, first-page ordering, later-page deduplication, search races, keyboard selection, action execution and retry.
2. Replace the children-based API with typed items and a shared `onSelect(item)` callback. Use `mode="select"` (default) or `mode="action"`. Options carry `id`, `label`, optional disabled/destructive flags, icons and a divider flag. Trigger content belongs inside the component-owned button.
3. Add a typed remote source: `loadOptions({ search, page, signal })` returns `{ items, hasMore }`. Start at page 1. Include caller query key and search in the cache identity. Debounce remote search, suppress IME work, and cancel superseded requests. Retry a failed next page without discarding loaded items.
4. Derive display options from the first page and subsequent pages. Prepend `selectedItem` when absent from page 1, deduplicate all IDs, preserve page order otherwise, and react to controlled selection changes. Keep the selection visible while searching.
5. Render accessible search, listbox/menu roles, keyboard navigation, disabled options, selected states, loading, empty and retry states. Close on Escape, selection and outside interaction. Restore focus when appropriate. Keep scroll bounded and load further pages near the bottom.
6. Migrate the Next.js action example and add selection/pagination examples in both templates. Update both component usage instructions and all relevant CLAUDE.md entry points. Write numbered requirements and a client-readable specification.
7. Run both component suites, changed-file lint, type checks and production builds. Compare mirrored files for parity. Review the diff and stage only task files, including explicitly requested docs despite the repository's docs ignore rule. Report pre-existing unrelated failures separately.

## Verification commands

```sh
npm test --prefix react-template
npm test --prefix next-template
npm run build --prefix react-template
npm run build --prefix next-template
npm run lint --prefix react-template
npm run lint --prefix next-template
```

## Baseline

React lint already reports `react-refresh/only-export-components` in ThemeProvider.tsx and toast.tsx. Next.js lint reports four existing warnings. Neither template previously had a frontend test runner.
