/**
 * Election Detail Layout Components
 * Layout components for election detail pages
 */

import * as React from 'react';

export interface ElectionDetailLayoutProps {
  children: React.ReactNode;
  election: any;
  onBack?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onStar?: () => void;
  className?: string;
}

export interface ElectionDetailHeaderProps {
  election: any;
  onBack?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onStar?: () => void;
  className?: string;
}

export interface ElectionDetailTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: {
    key: string;
    label: string;
    icon: string;
    count?: number;
  }[];
  className?: string;
}

export interface ElectionDetailContentProps {
  children: React.ReactNode;
  activeTab: string;
  className?: string;
}

/**
 * Election Detail Header Component
 */
export function ElectionDetailHeader({
  election,
  onBack,
  onShare,
  onBookmark,
  onStar,
  className = ''
}: ElectionDetailHeaderProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.completed;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return React.createElement('div', {
    className: `bg-gradient-to-r from-blue-600 to-blue-700 text-white ${className}`
  },
    // Header Content
    React.createElement('div', { className: 'p-6' },
      // Back Button and Actions
      React.createElement('div', {
        className: 'flex items-center justify-between mb-4'
      },
        React.createElement('div', { className: 'flex items-center space-x-4' },
          onBack && React.createElement('button', {
            onClick: onBack,
            className: 'p-2 hover:bg-white/10 rounded-lg transition-colors'
          },
            React.createElement('svg', {
              className: 'w-6 h-6',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M15 19l-7-7 7-7'
              })
            )
          ),
          React.createElement('div', {},
            React.createElement('h1', {
              className: 'text-2xl font-bold'
            }, election.title),
            React.createElement('p', {
              className: 'text-blue-100 mt-1'
            }, election.description)
          )
        ),
        React.createElement('div', { className: 'flex items-center space-x-2' },
          onBookmark && React.createElement('button', {
            onClick: onBookmark,
            className: `p-2 rounded-lg transition-colors ${
              election.isBookmarked 
                ? 'bg-white/20 text-white' 
                : 'hover:bg-white/10 text-white'
            }`
          },
            React.createElement('svg', {
              className: 'w-5 h-5',
              fill: election.isBookmarked ? 'currentColor' : 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
              })
            )
          ),
          onStar && React.createElement('button', {
            onClick: onStar,
            className: `p-2 rounded-lg transition-colors ${
              election.isStarred 
                ? 'bg-white/20 text-white' 
                : 'hover:bg-white/10 text-white'
            }`
          },
            React.createElement('svg', {
              className: 'w-5 h-5',
              fill: election.isStarred ? 'currentColor' : 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
              })
            )
          ),
          onShare && React.createElement('button', {
            onClick: onShare,
            className: 'p-2 hover:bg-white/10 rounded-lg transition-colors'
          },
            React.createElement('svg', {
              className: 'w-5 h-5',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
              })
            )
          )
        )
      ),

      // Status and Info
      React.createElement('div', {
        className: 'flex items-center justify-between'
      },
        React.createElement('div', { className: 'flex items-center space-x-6' },
          React.createElement('span', {
            className: `px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(election.status)}`
          }, election.status.charAt(0).toUpperCase() + election.status.slice(1)),
          React.createElement('div', { className: 'flex items-center space-x-2' },
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
                d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              })
            ),
            React.createElement('span', { className: 'text-sm' },
              `${formatDate(election.startDate)} - ${formatDate(election.endDate)}`
            )
          ),
          React.createElement('div', { className: 'flex items-center space-x-2' },
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
                d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              })
            ),
            React.createElement('span', { className: 'text-sm' },
              `${election.totalVotes.toLocaleString()} votes`
            )
          )
        ),
        React.createElement('div', { className: 'text-right' },
          React.createElement('div', { className: 'text-sm text-blue-100' },
            `${election.totalCandidates} candidates`
          ),
          React.createElement('div', { className: 'text-sm text-blue-100' },
            `${election.participationRate}% participation`
          )
        )
      )
    )
  );
}

/**
 * Election Detail Tabs Component
 */
export function ElectionDetailTabs({
  activeTab,
  onTabChange,
  tabs,
  className = ''
}: ElectionDetailTabsProps) {
  return React.createElement('div', {
    className: `bg-white border-b border-gray-200 ${className}`
  },
    React.createElement('div', { className: 'flex' },
      tabs.map((tab) => 
        React.createElement('button', {
          key: tab.key,
          onClick: () => onTabChange(tab.key),
          className: `flex-1 py-4 px-3 text-center border-b-2 transition-colors ${
            activeTab === tab.key
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`
        },
          React.createElement('div', { className: 'flex items-center justify-center space-x-2' },
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
                d: getTabIcon(tab.icon)
              })
            ),
            React.createElement('span', { className: 'text-sm font-medium' }, tab.label),
            tab.count !== undefined && React.createElement('span', {
              className: `ml-1 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`
            }, tab.count)
          )
        )
      )
    )
  );
}

/**
 * Election Detail Content Component
 */
export function ElectionDetailContent({
  children,
  activeTab,
  className = ''
}: ElectionDetailContentProps) {
  return React.createElement('div', {
    className: `p-6 ${className}`
  },
    React.createElement('div', {
      className: 'min-h-[400px]'
    }, children)
  );
}

/**
 * Main Election Detail Layout Component
 */
export function ElectionDetailLayout({
  children,
  election,
  onBack,
  onShare,
  onBookmark,
  onStar,
  className = ''
}: ElectionDetailLayoutProps) {
  return React.createElement('div', {
    className: `min-h-screen bg-gray-50 ${className}`
  },
    // Header
    React.createElement(ElectionDetailHeader, {
      election,
      onBack,
      onShare,
      onBookmark,
      onStar
    }),

    // Content
    React.createElement('div', { className: 'flex-1' }, children)
  );
}

// Helper function to get tab icons
function getTabIcon(iconName: string): string {
  const icons: Record<string, string> = {
    overview: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    candidates: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    results: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  };
  return icons[iconName] || icons.overview;
}

export default ElectionDetailLayout;
