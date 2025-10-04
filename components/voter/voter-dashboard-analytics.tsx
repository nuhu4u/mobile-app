/**
 * Voter Dashboard Analytics Components
 * Analytics and insights for the voter dashboard
 */

import * as React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { BarChart3, TrendingUp, TrendingDown, Users, Vote, Calendar, Award, Target, Activity, PieChart, LineChart, BarChart, RefreshCw, Download, Eye, Filter } from 'lucide-react-native';

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
const Progress = ({ children, ...props }: any) => React.createElement('div', props, children);

// Mock icons
const BarChart3 = () => React.createElement('span', { className: 'text-gray-400' }, '📊');
const TrendingUp = () => React.createElement('span', { className: 'text-green-600' }, '📈');
const TrendingDown = () => React.createElement('span', { className: 'text-red-600' }, '📉');
const Users = () => React.createElement('span', { className: 'text-gray-400' }, '👥');
const Vote = () => React.createElement('span', { className: 'text-gray-400' }, '🗳️');
const Calendar = () => React.createElement('span', { className: 'text-gray-400' }, '📅');
const Award = () => React.createElement('span', { className: 'text-gray-400' }, '🏆');
const Target = () => React.createElement('span', { className: 'text-gray-400' }, '🎯');
const Activity = () => React.createElement('span', { className: 'text-gray-400' }, '⚡');
const PieChart = () => React.createElement('span', { className: 'text-gray-400' }, '🥧');
const LineChart = () => React.createElement('span', { className: 'text-gray-400' }, '📈');
const BarChart = () => React.createElement('span', { className: 'text-gray-400' }, '📊');
const RefreshCw = () => React.createElement('span', { className: 'text-gray-400' }, '🔄');
const Download = () => React.createElement('span', { className: 'text-gray-400' }, '⬇️');
const Eye = () => React.createElement('span', { className: 'text-gray-400' }, '👁️');
const Filter = () => React.createElement('span', { className: 'text-gray-400' }, '🔽');

export interface AnalyticsData {
  overview: {
    totalElections: number;
    totalVotes: number;
    participationRate: number;
    successRate: number;
    averageVoteTime: number;
    votingStreak: number;
    lastVoteDate: string;
    accountAge: number;
  };
  votingPatterns: {
    monthlyVotes: { month: string; votes: number }[];
    hourlyDistribution: { hour: number; votes: number }[];
    categoryBreakdown: { category: string; votes: number; percentage: number }[];
    partyBreakdown: { party: string; votes: number; percentage: number }[];
    methodBreakdown: { method: string; votes: number; percentage: number }[];
  };
  trends: {
    votingFrequency: number;
    participationTrend: 'increasing' | 'decreasing' | 'stable';
    favoriteCategory: string;
    mostVotedParty: string;
    peakVotingHour: number;
    averageVotesPerMonth: number;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
  }[];
  insights: {
    id: string;
    type: 'info' | 'warning' | 'success' | 'tip';
    title: string;
    message: string;
    action?: string;
  }[];
}

export interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  className?: string;
}

export interface ChartProps {
  data: { label: string; value: number; color?: string }[];
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  subtitle?: string;
  className?: string;
}

export interface AnalyticsOverviewProps {
  data: AnalyticsData;
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Analytics Card Component
 */
export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  className = '',
}: AnalyticsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600 text-blue-600';
      case 'green': return 'from-green-500 to-green-600 text-green-600';
      case 'purple': return 'from-purple-500 to-purple-600 text-purple-600';
      case 'orange': return 'from-orange-500 to-orange-600 text-orange-600';
      case 'red': return 'from-red-500 to-red-600 text-red-600';
      case 'indigo': return 'from-indigo-500 to-indigo-600 text-indigo-600';
      default: return 'from-gray-500 to-gray-600 text-gray-600';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return React.createElement(TrendingUp, null);
      case 'down': return React.createElement(TrendingDown, null);
      default: return React.createElement('span', { className: 'text-gray-400' }, '➡️');
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return React.createElement(Card, {
    className: `p-6 bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 ${className}`
  },
    React.createElement('div', { className: 'flex items-start justify-between' },
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex items-center space-x-3 mb-2' },
          React.createElement('div', { 
            className: `w-12 h-12 bg-gradient-to-r ${getColorClasses(color)} rounded-lg flex items-center justify-center text-white`
          }, icon),
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, title),
            subtitle && React.createElement('p', { className: 'text-sm text-gray-600' }, subtitle)
          )
        ),
        React.createElement('div', { className: 'mt-4' },
          React.createElement('div', { className: 'text-3xl font-bold text-gray-900 mb-1' }, value),
          trend && React.createElement('div', { 
            className: `flex items-center space-x-1 text-sm ${getTrendColor(trend.direction)}`
          },
            getTrendIcon(trend.direction),
            React.createElement('span', null, `${Math.abs(trend.value)}%`),
            React.createElement('span', { className: 'text-gray-500' }, trend.period)
          )
        )
      )
    )
  );
}

/**
 * Simple Chart Component (Mock)
 */
export function SimpleChart({
  data,
  type,
  title,
  subtitle,
  className = '',
}: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return React.createElement(Card, {
    className: `p-6 bg-white border border-gray-200 ${className}`
  },
    React.createElement('div', { className: 'mb-4' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, title),
      subtitle && React.createElement('p', { className: 'text-sm text-gray-600' }, subtitle)
    ),
    React.createElement('div', { className: 'space-y-3' },
      data.map((item, index) => 
        React.createElement('div', { key: index, className: 'space-y-2' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, item.label),
            React.createElement('span', { className: 'text-sm text-gray-600' }, item.value)
          ),
          React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2' },
            React.createElement('div', {
              className: `h-2 rounded-full ${item.color || 'bg-blue-500'}`,
              style: { width: `${(item.value / maxValue) * 100}%` }
            })
          )
        )
      )
    )
  );
}

/**
 * Achievement Card Component
 */
export function AchievementCard({
  achievement,
  className = '',
}: {
  achievement: AnalyticsData['achievements'][0];
  className?: string;
}) {
  return React.createElement(Card, {
    className: `p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow ${
      achievement.unlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'
    } ${className}`
  },
    React.createElement('div', { className: 'flex items-start space-x-3' },
      React.createElement('div', { 
        className: `w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
        }`
      }, achievement.icon),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('h4', { 
          className: `font-medium ${
            achievement.unlocked ? 'text-green-900' : 'text-gray-900'
          }`
        }, achievement.title),
        React.createElement('p', { 
          className: `text-sm ${
            achievement.unlocked ? 'text-green-700' : 'text-gray-600'
          }`
        }, achievement.description),
        achievement.progress !== undefined && !achievement.unlocked && (
          React.createElement('div', { className: 'mt-2' },
            React.createElement('div', { className: 'flex items-center justify-between text-xs text-gray-500 mb-1' },
              React.createElement('span', null, 'Progress'),
              React.createElement('span', null, `${achievement.progress}%`)
            ),
            React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-1' },
              React.createElement('div', {
                className: 'h-1 bg-blue-500 rounded-full',
                style: { width: `${achievement.progress}%` }
              })
            )
          )
        ),
        achievement.unlockedAt && (
          React.createElement('p', { className: 'text-xs text-green-600 mt-1' },
            `Unlocked ${new Date(achievement.unlockedAt).toLocaleDateString()}`
          )
        )
      )
    )
  );
}

/**
 * Insight Card Component
 */
export function InsightCard({
  insight,
  className = '',
}: {
  insight: AnalyticsData['insights'][0];
  className?: string;
}) {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'tip': return 'border-purple-200 bg-purple-50 text-purple-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'tip': return '💡';
      default: return '📝';
    }
  };

  return React.createElement(Card, {
    className: `p-4 border ${getInsightColor(insight.type)} ${className}`
  },
    React.createElement('div', { className: 'flex items-start space-x-3' },
      React.createElement('span', { className: 'text-lg' }, getInsightIcon(insight.type)),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('h4', { className: 'font-medium mb-1' }, insight.title),
        React.createElement('p', { className: 'text-sm mb-2' }, insight.message),
        insight.action && (
          React.createElement(Button, {
            className: 'text-xs px-3 py-1 bg-white border border-current rounded hover:bg-opacity-10'
          }, insight.action)
        )
      )
    )
  );
}

/**
 * Analytics Overview Component
 */
export function AnalyticsOverview({
  data,
  onRefresh,
  isLoading = false,
  className = '',
}: AnalyticsOverviewProps) {
  const overviewCards = [
    {
      title: 'Total Elections',
      value: data.overview.totalElections,
      subtitle: 'Participated in',
      icon: React.createElement(Vote, null),
      color: 'blue' as const
    },
    {
      title: 'Total Votes',
      value: data.overview.totalVotes,
      subtitle: 'Successfully cast',
      icon: React.createElement(BarChart3, null),
      color: 'green' as const
    },
    {
      title: 'Participation Rate',
      value: `${data.overview.participationRate}%`,
      subtitle: 'Overall participation',
      icon: React.createElement(Users, null),
      color: 'purple' as const
    },
    {
      title: 'Success Rate',
      value: `${data.overview.successRate}%`,
      subtitle: 'Vote success rate',
      icon: React.createElement(Award, null),
      color: 'orange' as const
    },
    {
      title: 'Voting Streak',
      value: `${data.overview.votingStreak} days`,
      subtitle: 'Current streak',
      icon: React.createElement(Target, null),
      color: 'indigo' as const
    },
    {
      title: 'Account Age',
      value: `${data.overview.accountAge} days`,
      subtitle: 'Since registration',
      icon: React.createElement(Calendar, null),
      color: 'red' as const
    }
  ];

  return React.createElement('div', { className: `space-y-6 ${className}` },
    // Header
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, 'Dashboard Analytics'),
        React.createElement('p', { className: 'text-gray-600' }, 'Your voting participation insights and statistics')
      ),
      React.createElement('div', { className: 'flex space-x-2' },
        React.createElement(Button, {
          onClick: onRefresh,
          disabled: isLoading,
          className: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
        },
          isLoading ? 
            React.createElement('div', { className: 'animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full' }) :
            React.createElement(RefreshCw, null),
          React.createElement('span', null, isLoading ? 'Refreshing...' : 'Refresh')
        ),
        React.createElement(Button, {
          className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2'
        },
          React.createElement(Download, null),
          React.createElement('span', null, 'Export')
        )
      )
    ),

    // Overview Cards
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      overviewCards.map((card, index) => 
        React.createElement(AnalyticsCard, {
          key: index,
          ...card
        })
      )
    ),

    // Charts Section
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      // Category Breakdown
      React.createElement(SimpleChart, {
        data: data.votingPatterns.categoryBreakdown.map(item => ({
          label: item.category,
          value: item.votes,
          color: '#3B82F6'
        })),
        type: 'bar',
        title: 'Votes by Category',
        subtitle: 'Distribution of votes across election categories'
      }),

      // Party Breakdown
      React.createElement(SimpleChart, {
        data: data.votingPatterns.partyBreakdown.map(item => ({
          label: item.party,
          value: item.votes,
          color: '#10B981'
        })),
        type: 'bar',
        title: 'Votes by Party',
        subtitle: 'Distribution of votes across political parties'
      }),

      // Voting Method Breakdown
      React.createElement(SimpleChart, {
        data: data.votingPatterns.methodBreakdown.map(item => ({
          label: item.method.charAt(0).toUpperCase() + item.method.slice(1),
          value: item.votes,
          color: '#8B5CF6'
        })),
        type: 'bar',
        title: 'Voting Methods',
        subtitle: 'Distribution of votes by voting method'
      }),

      // Monthly Voting Pattern
      React.createElement(SimpleChart, {
        data: data.votingPatterns.monthlyVotes.map(item => ({
          label: item.month,
          value: item.votes,
          color: '#F59E0B'
        })),
        type: 'line',
        title: 'Monthly Voting Pattern',
        subtitle: 'Voting activity over time'
      })
    ),

    // Achievements and Insights
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      // Achievements
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Achievements'),
        React.createElement('div', { className: 'space-y-3' },
          data.achievements.map((achievement) => 
            React.createElement(AchievementCard, {
              key: achievement.id,
              achievement
            })
          )
        )
      ),

      // Insights
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Insights & Tips'),
        React.createElement('div', { className: 'space-y-3' },
          data.insights.map((insight) => 
            React.createElement(InsightCard, {
              key: insight.id,
              insight
            })
          )
        )
      )
    )
  );
}

export default {
  AnalyticsCard,
  SimpleChart,
  AchievementCard,
  InsightCard,
  AnalyticsOverview
};
