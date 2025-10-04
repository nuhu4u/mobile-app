import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}: AvatarProps) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const sizeValue = sizes[size];

  return (
    <View
      className={cn(
        'rounded-full bg-gray-200 items-center justify-center overflow-hidden',
        className
      )}
      style={{ width: sizeValue, height: sizeValue }}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text
          className={cn(
            'font-semibold text-gray-600',
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-xl' : 'text-base'
          )}
        >
          {fallback || alt || '?'}
        </Text>
      )}
    </View>
  );
}

interface AvatarGroupProps {
  avatars: {
    src?: string;
    alt?: string;
    fallback?: string;
  }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <View className={cn('flex-row -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...(avatar.src && { src: avatar.src })}
          {...(avatar.alt && { alt: avatar.alt })}
          {...(avatar.fallback && { fallback: avatar.fallback })}
          size={size}
          className="border-2 border-white"
        />
      ))}
      
      {remainingCount > 0 && (
        <View
          className={cn(
            'rounded-full bg-gray-100 border-2 border-white items-center justify-center',
            size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : size === 'xl' ? 'w-16 h-16' : 'w-10 h-10'
          )}
        >
          <Text
            className={cn(
              'font-semibold text-gray-600',
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : size === 'xl' ? 'text-base' : 'text-sm'
            )}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}