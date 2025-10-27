import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function HomeScreen() {
  // CN: 首页（Welcome），提供到主要模块的入口
  return (
    <View className="flex-1 items-center justify-start pt-28 gap-6 bg-white px-8">
      <FontAwesome6 name="clipboard-list" size={200} color="#111827" />
      <Text className="text-4xl font-semibold text-gray-900">Welcome to FormBase</Text>
      <Text className="text-xl text-gray-600 text-center">Create forms, add fields, collect records, and visualize on maps.</Text>
      <Pressable onPress={() => router.replace('/forms')} className="mt-2 w-full rounded-full bg-black py-3.5 items-center">
        <Text className="text-white text-base font-semibold">Start Managing Forms</Text>
      </Pressable>
      <Link href="/about" className="text-blue-600">About</Link>
    </View>
  );
} 