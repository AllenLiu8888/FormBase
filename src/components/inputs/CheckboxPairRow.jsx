import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CheckboxPairRow({
  // Two side-by-side checkboxes for paired boolean settings
  leftLabel,
  leftValue,
  onChangeLeft,
  rightLabel,
  rightValue,
  onChangeRight,
}) {
  const leftChecked = Boolean(leftValue);
  const rightChecked = Boolean(rightValue);
  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={() => onChangeLeft?.(!leftChecked)}
        className="flex-1 flex-row items-center justify-between border border-gray-300 rounded-2xl px-4 py-3"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: leftChecked }}
      >
        <Text className="text-gray-700">{leftLabel}</Text>
        <Ionicons name={leftChecked ? 'checkbox-outline' : 'square-outline'} size={22} color={leftChecked ? '#111827' : '#6B7280'} />
      </Pressable>
      <Pressable
        onPress={() => onChangeRight?.(!rightChecked)}
        className="flex-1 flex-row items-center justify-between border border-gray-300 rounded-2xl px-4 py-3"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: rightChecked }}
      >
        <Text className="text-gray-700">{rightLabel}</Text>
        <Ionicons name={rightChecked ? 'checkbox-outline' : 'square-outline'} size={22} color={rightChecked ? '#111827' : '#6B7280'} />
      </Pressable>
    </View>
  );
}


