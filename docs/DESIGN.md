# Template UI context

## Existing visual identity

These are product starter templates with component showcases. Preserve the existing system fonts, compact controls, rounded borders, light/dark themes and SCSS modules. This change establishes a shared dropdown behavior rather than a new visual identity.

## Runtime sources

React: `react-template/src/index.css` owns theme variables. Next.js: `next-template/app/_shared/styles/_variables.scss` and the existing global styles own theme values. Component styles consume `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*` and `--transition-*` directly; this document does not duplicate their values.

## Canonical dropdown

Each template's `components/ui/dropdown/dropdown.tsx` is the only public dropdown component. Selection and action modes share presentation and interaction machinery; their listbox and menu roles differ appropriately. Source code is mirrored because either template must work when scaffolded independently.

Search, bounded scrolling, selected/disabled/highlighted states and loading/retry messages belong to this component. The selected item remains visible during search. Dropdown search is transient and is not stored in the page URL. See `requirements/01-dropdown.md` for the full behavioral contract.

## Verification

Mirrored interaction suites are in each template's `tests/dropdown.test.tsx`. Run each template's `npm test`, lint and build commands. Browser verification covers open dropdowns, keyboard behavior, scrolling and a narrow viewport.

## Canonical date and time entry

Each template exposes `DatePicker` and `TimePicker` wrappers around react-datepicker. Both use a text field and a custom popup with existing theme variables, shared focus styles, labels, helper/error messages and disabled states. Values are date-only or time-only strings, not timestamps. Native date/time controls and direct package usage outside the wrappers are prohibited and linted. Calendar and time-list internals belong to the package; the public API and theme belong to these wrappers.
