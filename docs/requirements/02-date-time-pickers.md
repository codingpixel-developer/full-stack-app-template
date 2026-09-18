# Shared date and time pickers

1. Provide one DatePicker and one TimePicker with identical APIs in the Next.js and React templates, using react-datepicker only inside shared wrappers.
2. Always use these wrappers for date/time entry. For combined date and time, compose them. Never use native date, time or datetime-local inputs or import the picker package directly from pages. Add explicit instructions and lint enforcement.
3. Controlled values are strings or null: dates use YYYY-MM-DD, times use HH:mm. Preserve date/time values without UTC conversion. Report null when cleared.
4. Include labels, form names, blur callbacks, required indicators, descriptions, associated errors, disabled/read-only states and clearing controls.
5. Support independent date bounds and same-day time bounds. Time suggestion intervals default to 15 minutes and may be any integer from 1 to 60. Keyboard and pointer selection must respect bounds.
6. Use custom calendar/time-list popups, keyboard interaction, existing light/dark theme tokens and responsive positioning.
7. Add working examples to both showcases. Verify interaction tests, type checks, lint restrictions, production builds and browser behavior.
