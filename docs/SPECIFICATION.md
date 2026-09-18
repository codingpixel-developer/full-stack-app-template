# Shared dropdown specification

## Purpose

The React and Next.js templates will use one consistent dropdown component wherever a person chooses a value or opens a list of actions. Examples include choosing an assignee, selecting a role, opening settings, or choosing a delete action.

## Searching and choosing

A dropdown can show a small list already available on the page or load a larger list from a server. Search is available by default and can be turned off for short menus. Small lists filter immediately. Server searches briefly wait while the person types, then start a fresh list of matching results. An older search must never replace a newer result.

Selecting an option tells the containing page which complete item was chosen. The page controls the saved selection. Opening an action menu and choosing an action calls the page's action handler; the dropdown itself does not delete records or perform other business operations.

## Keeping the current selection visible

An edit screen may already know the selected person even though that person is not included in the first set of choices. The screen can provide this selected item separately. The dropdown places it at the top when it is missing from the first page. If later results contain the same item, it appears only once and remains at the top.

If the selected item already appears in the first page, its normal position is retained. The current selection remains visible while searching, including when its name does not match the search. Changing or removing the supplied selection immediately updates the dropdown.

## Loading more choices

Scrolling near the end of the list loads more choices automatically. The dropdown does not request the same next page repeatedly while that request is pending, and it stops when there are no more pages. A Load more button also supports keyboard access.

Whenever the server provides choices in pages, the dropdown must load those pages as the person scrolls. It must not request an unusually large batch, such as 100 or 200 choices, as a shortcut for loading further pages, or download every page before it is needed. An existing selection is supplied separately so it remains visible without increasing the batch size.

The dropdown shows loading feedback while waiting, a clear message when there are no results, and a Retry button when loading fails. A failure while loading another page does not remove the choices already shown.

## Interaction and appearance

The dropdown uses the existing template colors, borders, typography and dark mode. Its list scrolls within a bounded area. People can search, navigate using the keyboard, select with Enter, and close with Escape. Disabled choices cannot be activated. Escape does not change the current selection. Choosing an item closes the list and returns focus to its button.

Both templates include examples of a searchable role list, a paginated team-member list with an existing selection, and an action menu. The same component and usage rules apply across generated projects.

## Scope

This change updates the two frontend templates and their documentation. It does not add backend endpoints, change business permissions, or automatically update projects previously generated from these templates.

## Shared date and time pickers

Both frontend templates provide the same reusable date and time controls. Dates can be chosen from a calendar or typed as year-month-day. Times can be chosen from a list or typed in 24-hour hours-and-minutes format. A page that needs both uses the two controls together.

The controls support an existing selection, clearing, disabled or read-only states, required labels, helpful descriptions and error messages. Pages can limit allowed dates and times. Time-list suggestions appear every 15 minutes by default, with a configurable interval. The time range is within one day; overnight scheduling needs application-specific rules.

These controls use the templates' existing light and dark themes and custom popups. All date and time entry must use these shared controls. Browser-default date/time controls and separate page-specific picker implementations are not allowed. Automated lint checks reject native date/time input declarations and direct imports of the underlying picker package outside the wrappers.

Dates and times are kept as entered, without automatic timezone conversion. Applications remain responsible for assigning a timezone when creating a scheduled event.
