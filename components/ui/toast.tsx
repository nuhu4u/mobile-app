import React, { useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide: () => void;
  className?: string;
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  className,
}: ToastProps) {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  const typeConfig = {
    success: {
      bgColor: 'bg-green-500',
      icon: 'checkmark-circle' as const,
      iconColor: '#ffffff',
    },
    error: {
      bgColor: 'bg-red-500',
      icon: 'alert-circle' as const,
      iconColor: '#ffffff',
    },
    warning: {
      bgColor: 'bg-yellow-500',
      icon: 'warning' as const,
      iconColor: '#ffffff',
    },
    info: {
      bgColor: 'bg-blue-500',
      icon: 'information-circle' as const,
      iconColor: '#ffffff',
    },
  };

  const config = typeConfig[type];

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
      className={cn(
        'absolute top-12 left-4 right-4 z-50',
        className
      )}
    >
      <View
        className={cn(
          'flex-row items-center p-4 rounded-lg shadow-lg',
          config.bgColor
        )}
      >
        <Ionicons
          name={config.icon}
          size={24}
          color={config.iconColor}
        />
        
        <Text className="flex-1 ml-3 text-white font-medium">
          {message}
        </Text>
        
        <Pressable onPress={onHide} className="ml-2">
          <Ionicons name="close" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

interface ToastContainerProps {
  toasts: {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <View className="absolute top-0 left-0 right-0 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          visible={true}
          message={toast.message}
          type={toast.type || 'info'}
          duration={toast.duration || 3000}
          onHide={() => onRemove(toast.id)}
        />
      ))}
    </View>
  );
}
