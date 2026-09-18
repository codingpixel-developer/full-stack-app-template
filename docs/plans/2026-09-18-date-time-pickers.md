# Shared date and time picker implementation plan

**Goal:** Provide standard DatePicker and TimePicker components in both frontend templates and require their use for all date/time entry.

**Approach:** Wrap react-datepicker with controlled string APIs, shared theme styling and validation bounds. Keep equivalent implementations in both independently scaffoldable templates. No backend changes, commits or pushes.

**Requirements:** [02 — Date and time pickers](../requirements/02-date-time-pickers.md).

1. Inspect existing form components, styling and any date/time inputs. Select a maintained package supporting custom calendar and time-list popups.
2. Add focused interaction tests for controlled values, date-only conversion, selection, clearing, bounds and disabled/error states.
3. Implement `components/ui/datePicker/datePicker.tsx` and `components/ui/timePicker/timePicker.tsx`. Keep shared props, conversion helpers and theme styles under `components/ui/dateTimePicker/`.
4. Accept YYYY-MM-DD or HH:mm strings and null. Preserve local values without UTC conversion. Expose labels, form names, blur callbacks, descriptions, errors, disabled/read-only states, clear controls and bounds.
5. Add both pickers to the template showcases. Update root/template CLAUDE.md, component usage instructions, numbered requirements, DESIGN.md and the client specification.
6. Add ESLint rules forbidding native date/time/datetime-local inputs and direct react-datepicker imports outside the shared wrappers. Verify these rules against invalid example code.
7. Review bounds and keyboard behavior; fix reproduced defects. Run both test suites, type checks, changed-file lint and production builds. Inspect mobile/light/dark popups in Chromium.
8. Stage only authorized changes. Report results and unrelated pre-existing lint findings.
