import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  size = 'md',
  className,
  containerClassName,
}: CheckboxProps) {
  const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const iconSize = sizes[size];

  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'flex-row items-center',
        disabled && 'opacity-50',
        containerClassName
      )}
    >
      <View
        className={cn(
          'items-center justify-center border-2 rounded',
          checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300',
          className
        )}
        style={{ width: iconSize + 8, height: iconSize + 8 }}
      >
        {checked && (
          <Ionicons 
            name="checkmark" 
            size={iconSize} 
            color="white" 
          />
        )}
      </View>
      
      {label && (
        <Text className={cn(
          'ml-3 text-gray-900',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

interface CheckboxGroupProps {
  options: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function CheckboxGroup({
  options,
  values,
  onValuesChange,
  label,
  error,
  className,
}: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onValuesChange(values.filter(v => v !== value));
    } else {
      onValuesChange([...values, value]);
    }
  };

  return (
    <View className={cn('w-full', className)}>
      {label && (
        <Text className="form-label">
          {label}
        </Text>
      )}
      
      <View className="space-y-2">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={values.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
            label={option.label}
            disabled={option.disabled || false}
          />
        ))}
      </View>
      
      {error && (
        <Text className="form-error">
          {error}
        </Text>
      )}
    </View>
  );
}
