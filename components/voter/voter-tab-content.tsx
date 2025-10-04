/**
 * Voter Tab Content Components
 * Content components for each tab in the voter dashboard
 */

import * as React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Search, Filter, SortAsc, SortDesc, RefreshCw, Download, Share, Eye, Vote, Clock, CheckCircle, AlertCircle, Calendar, Users, Shield } from 'lucide-react-native';

// Mock components for now
const View = ({ children, ...props }: any) => React.createElement('div', props, children);
const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
const ScrollView = ({ children, ...props }: any) => React.createElement('div', props, children);
const TouchableOpacity = ({ children, ...props }: any) => React.createElement('button', props, children);
const Image = ({ ...props }: any) => React.createElement('img', props);
const Alert = { alert: jest.fn() };

const Card = ({ children, ...props }: any) => React.createElement('div', props, children);
const Button = ({ children, ...props }: any) => React.createElement('button', props, children);
const Badge = ({ children, ...props }: any) => React.createElement('span', props, children);
const Input = ({ ...props }: any) => React.createElement('input', props);

// Mock icons
const Search = () => React.createElement('span', { className: 'text-gray-400' }, '🔍');
const Filter = () => React.createElement('span', { className: 'text-gray-400' }, '🔽');
const SortAsc = () => React.createElement('span', { className: 'text-gray-400' }, '↑');
const SortDesc = () => React.createElement('span', { className: 'text-gray-400' }, '↓');
const RefreshCw = () => React.createElement('span', { className: 'text-gray-400' }, '🔄');
const Download = () => React.createElement('span', { className: 'text-gray-400' }, '⬇️');
const Share = () => React.createElement('span', { className: 'text-gray-400' }, '📤');
const Eye = () => React.createElement('span', { className: 'text-gray-400' }, '👁️');
const Vote = () => React.createElement('span', { className: 'text-gray-400' }, '🗳️');
const Clock = () => React.createElement('span', { className: 'text-gray-400' }, '🕐');
const CheckCircle = () => React.createElement('span', { className: 'text-green-600' }, '✅');
const AlertCircle = () => React.createElement('span', { className: 'text-orange-600' }, '⚠️');
const Calendar = () => React.createElement('span', { className: 'text-gray-400' }, '📅');
const Users = () => React.createElement('span', { className: 'text-gray-400' }, '👥');
const Shield = () => React.createElement('span', { className: 'text-gray-400' }, '🛡️');

export interface TabContentProps {
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onError?: (error: string) => void;
}

export interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
  }[];
  onRowClick?: (item: T) => void;
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Search and Filter Component
 */
export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  className = '',
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return React.createElement('div', { className: `space-y-4 ${className}` },
    // Search and main controls
    React.createElement('div', { className: 'flex flex-col md:flex-row gap-4' },
      // Search input
      React.createElement('div', { className: 'flex-1 relative' },
        React.createElement(Input, {
          type: 'text',
          placeholder: 'Search...',
          value: searchQuery,
          onChange: handleSearchChange,
          className: 'pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }),
        React.createElement('div', { 
          className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' 
        },
          React.createElement(Search, null)
        )
      ),

      // Action buttons
      React.createElement('div', { className: 'flex space-x-2' },
        // Filter button
        React.createElement('button', {
          onClick: () => setIsFilterOpen(!isFilterOpen),
          className: `px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 ${
            Object.keys(filters).length > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
          }`
        },
          React.createElement(Filter, null),
          React.createElement(Text, null, 'Filters'),
          Object.keys(filters).length > 0 && React.createElement(Badge, {
            className: 'ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
          }, Object.keys(filters).length)
        ),

        // Sort button
        React.createElement('button', {
          onClick: () => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc'),
          className: 'px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
        },
          sortOrder === 'asc' ? React.createElement(SortAsc, null) : React.createElement(SortDesc, null),
          React.createElement(Text, null, 'Sort')
        ),

        // Refresh button
        React.createElement('button', {
          onClick: () => window.location.reload(),
          className: 'px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
        },
          React.createElement(RefreshCw, null),
          React.createElement(Text, null, 'Refresh')
        )
      )
    ),

    // Filter panel
    isFilterOpen && React.createElement(Card, { className: 'p-4 bg-gray-50 border border-gray-200' },
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement(Text, { className: 'font-medium text-gray-900' }, 'Filters'),
          React.createElement('button', {
            onClick: clearFilters,
            className: 'text-sm text-blue-600 hover:text-blue-700'
          }, 'Clear All')
        ),

        // Filter options
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          React.createElement('div', null,
            React.createElement(Text, { className: 'text-sm font-medium text-gray-700 mb-2' }, 'Status'),
            React.createElement('select', {
              value: filters.status || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            },
              React.createElement('option', { value: '' }, 'All Status'),
              React.createElement('option', { value: 'active' }, 'Active'),
              React.createElement('option', { value: 'upcoming' }, 'Upcoming'),
              React.createElement('option', { value: 'completed' }, 'Completed')
            )
          ),

          React.createElement('div', null,
            React.createElement(Text, { className: 'text-sm font-medium text-gray-700 mb-2' }, 'Category'),
            React.createElement('select', {
              value: filters.category || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('category', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            },
              React.createElement('option', { value: '' }, 'All Categories'),
              React.createElement('option', { value: 'presidential' }, 'Presidential'),
              React.createElement('option', { value: 'senate' }, 'Senate'),
              React.createElement('option', { value: 'house' }, 'House of Reps')
            )
          ),

          React.createElement('div', null,
            React.createElement(Text, { className: 'text-sm font-medium text-gray-700 mb-2' }, 'Date Range'),
            React.createElement('input', {
              type: 'date',
              value: filters.dateFrom || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('dateFrom', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            })
          )
        )
      )
    )
  );
}

/**
 * Data Table Component
 */
export function DataTable<T>({
  data,
  columns,
  onRowClick,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newOrder);
    onSort?.(column, newOrder);
  };

  const renderCell = (item: T, column: any) => {
    if (column.render) {
      return column.render(item);
    }
    return React.createElement(Text, null, (item as any)[column.key] || '-');
  };

  if (loading) {
    return React.createElement('div', { className: `flex items-center justify-center py-8 ${className}` },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' }),
        React.createElement(Text, { className: 'text-gray-600' }, 'Loading...')
      )
    );
  }

  if (data.length === 0) {
    return React.createElement('div', { className: `text-center py-8 ${className}` },
      React.createElement(Text, { className: 'text-gray-500' }, emptyMessage)
    );
  }

  return React.createElement('div', { className: `overflow-x-auto ${className}` },
    React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
      // Table header
      React.createElement('thead', { className: 'bg-gray-50' },
        React.createElement('tr', null,
          columns.map((column) => 
            React.createElement('th', {
              key: column.key,
              className: `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              }`,
              onClick: column.sortable ? () => handleSort(column.key) : undefined,
              style: { width: column.width }
            },
              React.createElement('div', { className: 'flex items-center space-x-1' },
                React.createElement(Text, null, column.label),
                column.sortable && React.createElement('div', { className: 'flex flex-col' },
                  React.createElement(SortAsc, null),
                  React.createElement(SortDesc, null)
                )
              )
            )
          )
        )
      ),

      // Table body
      React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
        data.map((item, index) => 
          React.createElement('tr', {
            key: index,
            className: onRowClick ? 'cursor-pointer hover:bg-gray-50' : '',
            onClick: onRowClick ? () => onRowClick(item) : undefined
          },
            columns.map((column) => 
              React.createElement('td', {
                key: column.key,
                className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
              }, renderCell(item, column))
            )
          )
        )
      )
    )
  );
}

/**
 * Tab Content Wrapper
 */
export function TabContentWrapper({
  children,
  className = '',
  isLoading = false,
  error = null,
  onRefresh,
  onError,
}: TabContentProps) {
  if (error) {
    return React.createElement('div', { className: `text-center py-8 ${className}` },
      React.createElement('div', { className: 'mb-4' },
        React.createElement(AlertCircle, null)
      ),
      React.createElement(Text, { className: 'text-red-600 mb-4' }, error),
      onRefresh && React.createElement(Button, {
        onClick: onRefresh,
        className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
      }, 'Try Again')
    );
  }

  if (isLoading) {
    return React.createElement('div', { className: `flex items-center justify-center py-8 ${className}` },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' }),
        React.createElement(Text, { className: 'text-gray-600' }, 'Loading...')
      )
    );
  }

  return React.createElement('div', { className: className }, children);
}

/**
 * Action Bar Component
 */
export function ActionBar({
  actions,
  className = '',
}: {
  actions: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  }[];
  className?: string;
}) {
  const getButtonClasses = (variant: string = 'secondary', disabled: boolean = false) => {
    const baseClasses = 'px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    };
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return [baseClasses, variantClasses[variant as keyof typeof variantClasses], disabledClasses].join(' ');
  };

  return React.createElement('div', { className: `flex flex-wrap gap-2 ${className}` },
    actions.map((action, index) => 
      React.createElement('button', {
        key: index,
        onClick: action.onClick,
        disabled: action.disabled,
        className: getButtonClasses(action.variant, action.disabled)
      },
        action.icon,
        React.createElement(Text, null, action.label)
      )
    )
  );
}

/**
 * Stats Cards Component
 */
export function StatsCards({
  stats,
  className = '',
}: {
  stats: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
    trend?: {
      value: number;
      direction: 'up' | 'down' | 'neutral';
    };
  }[];
  className?: string;
}) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  return React.createElement('div', { className: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}` },
    stats.map((stat, index) => 
      React.createElement(Card, {
        key: index,
        className: `p-4 border-l-4 ${getColorClasses(stat.color)}`
      },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement(Text, { className: 'text-2xl font-bold' }, stat.value),
            React.createElement(Text, { className: 'text-sm font-medium text-gray-600' }, stat.label),
            stat.trend && React.createElement('div', { className: 'flex items-center space-x-1 mt-1' },
              React.createElement('span', { className: 'text-xs' }, getTrendIcon(stat.trend.direction)),
              React.createElement(Text, { className: 'text-xs' }, `${stat.trend.value}%`)
            )
          ),
          React.createElement('div', { className: 'text-2xl' }, stat.icon)
        )
      )
    )
  );
}

export default {
  SearchAndFilter,
  DataTable,
  TabContentWrapper,
  ActionBar,
  StatsCards
};
