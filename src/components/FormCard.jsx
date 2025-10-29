import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FormCard({ id, name, description, onPress, onEdit, onDelete, deleting }) {
  // Single form card: icon + title/description + edit/delete actions
  const handlePress = onPress || (() => router.push(`/forms/${id}/fields`));
  return (
    <View className="w-full rounded-2xl bg-white border border-gray-200 shadow-sm px-4 py-3 flex-row items-center">
      <Pressable onPress={handlePress} className="flex-1 flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
          <Ionicons name="document-text-outline" size={20} color="#111827" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-medium" numberOfLines={1}>{name || 'Untitled Form'}</Text>
          <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>{description || 'No description'}</Text>
        </View>
      </Pressable>

      <Pressable onPress={onEdit} className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center ml-2">
        <Ionicons name="pencil" size={16} color="#111827" />
      </Pressable>
      <Pressable disabled={deleting} onPress={onDelete} className="w-9 h-9 rounded-full bg-red-600 items-center justify-center ml-2">
        <Ionicons name={deleting ? 'hourglass' : 'trash'} size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}


