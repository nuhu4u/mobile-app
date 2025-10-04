/**
 * Elections Components Index
 * Export all elections-related components
 */

// Elections list components
export { 
  ElectionListItem, 
  ElectionsList 
} from './elections-list';

// Elections filter components
export { 
  FilterChip,
  FilterDropdown,
  DateRangeFilter,
  FilterStats,
  ElectionsFilters
} from './elections-filters';

// Elections filter bar components
export { 
  FilterQuickAction,
  FilterChips,
  ElectionsFilterBar
} from './elections-filter-bar';

// Elections search components
export { 
  SearchInput,
  SearchSuggestions,
  SearchHistory,
  SearchFilters,
  SearchResults,
  ElectionsSearch
} from './elections-search';

// Elections search bar components
export { 
  SearchBarStats,
  SearchBarActions,
  ElectionsSearchBar
} from './elections-search-bar';

// Election card components
export { 
  ElectionCard,
  ElectionCardGrid,
  ElectionCardList
} from './election-cards';

// Elections pagination components
export { 
  PaginationButton,
  PaginationInfo,
  ItemsPerPageSelector,
  PaginationControls,
  ElectionsPagination
} from './elections-pagination';

// Elections paginated list components
export { 
  PaginationSummary,
  PaginationControls as PaginationControlsList,
  ElectionsPaginatedList
} from './elections-paginated-list';

// Elections real-time components
export { 
  RealtimeIndicator,
  RealtimeNotification,
  RealtimeUpdatesList,
  RealtimeSettings
} from './elections-realtime';

// Elections real-time dashboard components
export { 
  RealtimeOverlay,
  RealtimeFloatingButton,
  ElectionsRealtimeDashboard
} from './elections-realtime-dashboard';

// Re-export types
export type { 
  Election, 
  ElectionsListProps, 
  ElectionListItemProps 
} from './elections-list';

export type {
  FilterOption,
  FilterGroup,
  ElectionsFiltersProps,
  FilterChipProps,
  FilterDropdownProps,
  DateRangeFilterProps,
  FilterStatsProps
} from './elections-filters';

export type {
  ElectionsFilterBarProps,
  FilterQuickActionProps,
  FilterChipsProps
} from './elections-filter-bar';

export type {
  SearchSuggestion,
  SearchHistory as SearchHistoryType,
  SearchFilters as SearchFiltersType,
  ElectionsSearchProps,
  SearchInputProps,
  SearchSuggestionsProps,
  SearchHistoryProps,
  SearchFiltersProps,
  SearchResultsProps
} from './elections-search';

export type {
  ElectionsSearchBarProps,
  SearchBarStatsProps,
  SearchBarActionsProps
} from './elections-search-bar';

export type {
  ElectionCardData,
  ElectionCardProps,
  ElectionCardGridProps,
  ElectionCardListProps
} from './election-cards';

export type {
  PaginationInfo as PaginationInfoType,
  PaginationProps,
  PaginationInfoProps,
  PaginationControlsProps,
  ItemsPerPageSelectorProps,
  PaginationButtonProps
} from './elections-pagination';

export type {
  ElectionsPaginatedListProps,
  PaginationSummaryProps,
  PaginationControlsProps as PaginationControlsListProps
} from './elections-paginated-list';

export type {
  RealtimeStatus,
  RealtimeUpdate,
  RealtimeIndicatorProps,
  RealtimeNotificationProps,
  RealtimeUpdatesListProps,
  RealtimeSettingsProps
} from './elections-realtime';

export type {
  ElectionsRealtimeDashboardProps,
  RealtimeOverlayProps,
  RealtimeFloatingButtonProps
} from './elections-realtime-dashboard';