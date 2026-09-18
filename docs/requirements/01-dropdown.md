# Unified dropdown

1. Every selection dropdown and action menu uses the existing Dropdown component. `mode="select"` is the default; `mode="action"` invokes commands through the same `onSelect` callback.
2. Items have stable string or number IDs and text labels. Disabled states, destructive styling, icons and separators are supported. Extra application fields remain available to callers.
3. Static options filter locally. Remote options are provided by `loadOptions({ search, page, signal })`, returning `{ items, hasMore }`. Page numbering starts at 1. A caller-supplied query key identifies the dataset and relevant filters.
4. Search is enabled by default. Remote search waits 300 ms, restarts at page 1, ignores stale results and supports input composition. Clearing search takes effect immediately. Search state belongs to this transient popup, not the page URL.
5. The controlled `selectedItem` can be supplied independently of fetched options. When absent from the first page, it appears at the top. Matching IDs from subsequent pages are omitted. When present in the first page, its original position is preserved. All repeated IDs are removed while retaining page order.
6. The selection remains visible while searching. Changing or clearing the prop updates the display without retaining an old injected selection.
7. Scrolling near the bottom loads the next page. Concurrent duplicate requests are prevented. Loading stops when `hasMore` is false. A Load more button provides a keyboard fallback.
8. Initial loading, additional loading, no results, request failure and retry have explicit states. A next-page failure preserves already loaded items.
9. Keyboard navigation skips disabled options. Enter selects or activates. Escape dismisses without changing the selection. Outside interaction dismisses. Selection and Escape restore trigger focus. Disabling an open dropdown closes it.
10. Static dropdowns need no query provider. Remote dropdowns use the template's existing TanStack Query provider. Loaders should pass the supplied abort signal to the transport.
11. Both template showcases demonstrate static selection, paginated selection initially absent from page one, and an action menu. The previous children-based API is migrated to typed items.
12. Tests cover pagination, deduplication, search races, retries, controlled selection and keyboard/focus behavior. Build and lint results identify unrelated baseline issues separately.
13. Dropdowns fetching from paginated APIs must use infinite scrolling with the API's normal page size. Oversized limits such as `100` or `200` must never substitute for pagination, and callers must not eagerly fetch every page into static options. Supply an existing selection through `selectedItem` instead of increasing the limit to include it.
