/**
 * Elections Filter Bar Component
 * Integrated filter bar with chips and quick actions
 */

import * as React from 'react';
import { 
  FilterChip, 
  FilterStats,
  FilterOption 
} from './elections-filters';
import { useElectionsFilters } from '@/hooks/use-elections-filters';

export interface ElectionsFilterBarProps {
  elections: any[];
  filteredElections: any[];
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  onToggleFilters: () => void;
  isFiltersOpen: boolean;
  className?: string;
}

export interface FilterQuickActionProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  count?: number;
  className?: string;
}

export interface FilterChipsProps {
  chips: {
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
  }[];
  onClearAll: () => void;
  className?: string;
}

/**
 * Filter Quick Action Component
 */
export function FilterQuickAction({
  label,
  icon,
  onClick,
  isActive,
  count,
  className = ''
}: FilterQuickActionProps) {
  return React.createElement('button', {
    onClick,
    className: `flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    } ${className}`
  },
    icon,
    React.createElement('span', { className: 'text-sm font-medium' }, label),
    count !== undefined && React.createElement('span', {
      className: `px-2 py-0.5 text-xs rounded-full ${
        isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
      }`
    }, count)
  );
}

/**
 * Filter Chips Component
 */
export function FilterChips({
  chips,
  onClearAll,
  className = ''
}: FilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return React.createElement('div', { className: `space-y-3 ${className}` },
    React.createElement('div', {
      className: 'flex items-center justify-between'
    },
      React.createElement('h4', {
        className: 'text-sm font-medium text-gray-700'
      }, 'Active Filters'),
      React.createElement('button', {
        onClick: onClearAll,
        className: 'text-sm text-red-600 hover:text-red-800 font-medium transition-colors'
      }, 'Clear All')
    ),
    React.createElement('div', {
      className: 'flex flex-wrap gap-2'
    },
      chips.map((chip) => 
        React.createElement(FilterChip, {
          key: chip.key,
          label: chip.label,
          value: chip.value,
          onRemove: chip.onRemove,
          color: getChipColor(chip.key)
        })
      )
    )
  );
}

/**
 * Main Elections Filter Bar Component
 */
export function ElectionsFilterBar({
  elections,
  filteredElections,
  onFiltersChange,
  onClearFilters,
  onToggleFilters,
  isFiltersOpen,
  className = ''
}: ElectionsFilterBarProps) {
  const {
    filters,
    updateFilter,
    clearFilters,
    getFilterStats,
    getAvailableOptions,
    getFilterChips,
    isFilterActive
  } = useElectionsFilters();

  const stats = getFilterStats(elections);
  const availableOptions = getAvailableOptions(elections);
  const filterChips = getFilterChips();

  const quickActions = [
    {
      label: 'Active',
      icon: React.createElement('div', {
        className: 'w-2 h-2 bg-green-500 rounded-full'
      }),
      onClick: () => updateFilter('status', ['active']),
      isActive: isFilterActive('status') && filters.status.includes('active'),
      count: availableOptions.status.find(opt => opt.value === 'active')?.count
    },
    {
      label: 'Upcoming',
      icon: React.createElement('div', {
        className: 'w-2 h-2 bg-blue-500 rounded-full'
      }),
      onClick: () => updateFilter('status', ['upcoming']),
      isActive: isFilterActive('status') && filters.status.includes('upcoming'),
      count: availableOptions.status.find(opt => opt.value === 'upcoming')?.count
    },
    {
      label: 'Completed',
      icon: React.createElement('div', {
        className: 'w-2 h-2 bg-gray-500 rounded-full'
      }),
      onClick: () => updateFilter('status', ['completed']),
      isActive: isFilterActive('status') && filters.status.includes('completed'),
      count: availableOptions.status.find(opt => opt.value === 'completed')?.count
    },
    {
      label: 'Voted',
      icon: React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        })
      ),
      onClick: () => updateFilter('hasVoted', true),
      isActive: isFilterActive('hasVoted') && filters.hasVoted === true,
      count: elections.filter(e => e.hasVoted).length
    },
    {
      label: 'Bookmarked',
      icon: React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
        })
      ),
      onClick: () => updateFilter('isBookmarked', true),
      isActive: isFilterActive('isBookmarked') && filters.isBookmarked === true,
      count: elections.filter(e => e.isBookmarked).length
    },
    {
      label: 'Starred',
      icon: React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
        })
      ),
      onClick: () => updateFilter('isStarred', true),
      isActive: isFilterActive('isStarred') && filters.isStarred === true,
      count: elections.filter(e => e.isStarred).length
    }
  ];

  const handleClearAll = () => {
    clearFilters();
    onClearFilters();
  };

  return React.createElement('div', { className: `space-y-4 ${className}` },
    // Filter Stats
    React.createElement(FilterStats, {
      totalElections: stats.totalElections,
      filteredElections: stats.filteredElections,
      activeFilters: stats.activeFilters,
      onClearAll: handleClearAll
    }),

    // Quick Actions
    React.createElement('div', { className: 'space-y-3' },
      React.createElement('h4', {
        className: 'text-sm font-medium text-gray-700'
      }, 'Quick Filters'),
      React.createElement('div', {
        className: 'flex flex-wrap gap-2'
      },
        quickActions.map((action, index) => 
          React.createElement(FilterQuickAction, {
            key: index,
            label: action.label,
            icon: action.icon,
            onClick: action.onClick,
            isActive: action.isActive,
            count: action.count
          })
        )
      )
    ),

    // Filter Chips
    filterChips.length > 0 && React.createElement(FilterChips, {
      chips: filterChips,
      onClearAll: handleClearAll
    }),

    // Advanced Filters Toggle
    React.createElement('div', {
      className: 'flex items-center justify-between pt-4 border-t border-gray-200'
    },
      React.createElement('button', {
        onClick: onToggleFilters,
        className: 'flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
      },
        React.createElement('svg', {
          className: 'w-4 h-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z'
          })
        ),
        React.createElement('span', {}, 'Advanced Filters'),
        React.createElement('svg', {
          className: `w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`,
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M19 9l-7 7-7-7'
          })
        )
      ),
      stats.activeFilters > 0 && React.createElement('div', {
        className: 'flex items-center space-x-2'
      },
        React.createElement('span', {
          className: 'text-sm text-gray-500'
        }, `${stats.activeFilters} filter${stats.activeFilters > 1 ? 's' : ''} active`),
        React.createElement('button', {
          onClick: handleClearAll,
          className: 'text-sm text-red-600 hover:text-red-800 font-medium transition-colors'
        }, 'Clear All')
      )
    )
  );
}

// Helper function to get chip color based on filter key
function getChipColor(key: string): string {
  if (key.startsWith('status-')) return 'blue';
  if (key.startsWith('category-')) return 'green';
  if (key.startsWith('location-')) return 'purple';
  if (key.startsWith('method-')) return 'yellow';
  if (key.startsWith('security-')) return 'red';
  if (key.startsWith('priority-')) return 'orange';
  if (key.startsWith('tag-')) return 'gray';
  return 'blue';
}

export default ElectionsFilterBar;
