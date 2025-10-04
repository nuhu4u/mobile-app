/**
 * Elections Paginated List Component
 * Integrated pagination with elections list
 */

import * as React from 'react';
import { useElectionsPagination } from '@/hooks/use-elections-pagination';
import { ElectionsPagination } from './elections-pagination';
import { ElectionCard, ElectionCardGrid, ElectionCardList , ElectionCardData } from './election-cards';


export interface ElectionsPaginatedListProps {
  elections: ElectionCardData[];
  variant?: 'grid' | 'list';
  cardVariant?: 'default' | 'compact' | 'detailed' | 'minimal';
  columns?: 1 | 2 | 3 | 4;
  itemsPerPage?: number;
  showPagination?: boolean;
  showPaginationInfo?: boolean;
  showItemsPerPageSelector?: boolean;
  maxVisiblePages?: number;
  onElectionSelect?: (election: ElectionCardData) => void;
  onElectionVote?: (election: ElectionCardData) => void;
  onElectionViewResults?: (election: ElectionCardData) => void;
  onElectionBookmark?: (electionId: string) => void;
  onElectionStar?: (electionId: string) => void;
  onElectionShare?: (election: ElectionCardData) => void;
  className?: string;
}

export interface PaginationSummaryProps {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
  className?: string;
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  availableItemsPerPage: number[];
  maxVisiblePages?: number;
  className?: string;
}

/**
 * Pagination Summary Component
 */
export function PaginationSummary({
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  startItem,
  endItem,
  className = ''
}: PaginationSummaryProps) {
  return React.createElement('div', {
    className: `flex items-center justify-between text-sm text-gray-700 ${className}`
  },
    React.createElement('div', { className: 'flex items-center space-x-4' },
      React.createElement('span', {},
        `Showing ${startItem} to ${endItem} of ${totalItems.toLocaleString()} results`
      ),
      totalPages > 1 && React.createElement('span', {
        className: 'text-gray-500'
      }, `(Page ${currentPage} of ${totalPages})`)
    ),
    React.createElement('div', { className: 'text-gray-500' },
      `${itemsPerPage} per page`
    )
  );
}

/**
 * Pagination Controls Component
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  availableItemsPerPage,
  maxVisiblePages = 5,
  className = ''
}: PaginationControlsProps) {
  return React.createElement('div', {
    className: `flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 ${className}`
  },
    // Items per page selector
    React.createElement('div', { className: 'flex items-center space-x-2' },
      React.createElement('label', {
        className: 'text-sm text-gray-700'
      }, 'Items per page:'),
      React.createElement('select', {
        value: itemsPerPage,
        onChange: (e: any) => onItemsPerPageChange(Number(e.target.value)),
        className: 'px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      },
        availableItemsPerPage.map(items => 
          React.createElement('option', {
            key: items,
            value: items
          }, items)
        )
      )
    ),

    // Pagination controls
    React.createElement(ElectionsPagination, {
      currentPage,
      totalPages,
      totalItems: 0, // Will be calculated by parent
      itemsPerPage,
      onPageChange,
      onItemsPerPageChange,
      showInfo: false,
      showItemsPerPage: false,
      maxVisiblePages
    })
  );
}

/**
 * Main Elections Paginated List Component
 */
export function ElectionsPaginatedList({
  elections,
  variant = 'grid',
  cardVariant = 'default',
  columns = 3,
  itemsPerPage = 10,
  showPagination = true,
  showPaginationInfo = true,
  showItemsPerPageSelector = true,
  maxVisiblePages = 5,
  onElectionSelect,
  onElectionVote,
  onElectionViewResults,
  onElectionBookmark,
  onElectionStar,
  onElectionShare,
  className = ''
}: ElectionsPaginatedListProps) {
  const {
    pagination,
    paginationInfo,
    setCurrentPage,
    setItemsPerPage,
    goToPage,
    getPageItems,
    getPaginationStats
  } = useElectionsPagination(elections.length, {
    initialItemsPerPage: itemsPerPage,
    availableItemsPerPage: [5, 10, 25, 50, 100]
  });

  // Get paginated elections
  const paginatedElections = getPageItems(elections);
  const stats = getPaginationStats();

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  }, [setItemsPerPage]);

  // Render elections list
  const renderElectionsList = () => {
    if (variant === 'list') {
      return React.createElement(ElectionCardList, {
        elections: paginatedElections,
        variant: cardVariant,
        onElectionSelect: onElectionSelect,
        onElectionVote: onElectionVote,
        onElectionViewResults: onElectionViewResults,
        onElectionBookmark: onElectionBookmark,
        onElectionStar: onElectionStar,
        onElectionShare: onElectionShare
      });
    }

    return React.createElement(ElectionCardGrid, {
      elections: paginatedElections,
      variant: cardVariant,
      columns,
      onElectionSelect: onElectionSelect,
      onElectionVote: onElectionVote,
      onElectionViewResults: onElectionViewResults,
      onElectionBookmark: onElectionBookmark,
      onElectionStar: onElectionStar,
      onElectionShare: onElectionShare
    });
  };

  return React.createElement('div', { className: `space-y-6 ${className}` },
    // Pagination Summary
    showPaginationInfo && React.createElement(PaginationSummary, {
      totalItems: stats.totalItems,
      currentPage: stats.currentPage,
      totalPages: stats.totalPages,
      itemsPerPage: stats.itemsPerPage,
      startItem: stats.startItem,
      endItem: stats.endItem
    }),

    // Elections List
    React.createElement('div', { className: 'min-h-[400px]' },
      elections.length === 0 ? React.createElement('div', {
        className: 'flex items-center justify-center py-12 text-center'
      },
        React.createElement('div', {},
          React.createElement('svg', {
            className: 'w-12 h-12 text-gray-400 mx-auto mb-4',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            })
          ),
          React.createElement('h3', {
            className: 'text-lg font-medium text-gray-900 mb-2'
          }, 'No Elections Found'),
          React.createElement('p', {
            className: 'text-gray-600'
          }, 'There are no elections available at the moment.')
        )
      ) : renderElectionsList()
    ),

    // Pagination Controls
    showPagination && elections.length > 0 && React.createElement('div', {
      className: 'border-t border-gray-200 pt-6'
    },
      React.createElement(ElectionsPagination, {
        currentPage: paginationInfo.currentPage,
        totalPages: paginationInfo.totalPages,
        totalItems: paginationInfo.totalItems,
        itemsPerPage: paginationInfo.itemsPerPage,
        onPageChange: handlePageChange,
        onItemsPerPageChange: showItemsPerPageSelector ? handleItemsPerPageChange : undefined,
        showInfo: showPaginationInfo,
        showItemsPerPage: showItemsPerPageSelector,
        maxVisiblePages
      })
    )
  );
}

export default ElectionsPaginatedList;
