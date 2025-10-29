import React from 'react';
import { View, Text } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function AboutScreen() {
  // About screen — showcases app features and course context
  return (
    <View className="flex-1 bg-white px-8 pt-28">
      <View className="items-center mb-6 px-8">
        <FontAwesome6 name="circle-info" size={48} color="#111827" />
        <Text className="text-2xl font-semibold text-gray-900 mt-3">About FormBase</Text>
      </View>

      <Text className="text-base font-medium text-gray-900 mb-3">Features</Text>
      <View className="gap-3 mb-6">
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="folder-open" size={16} color="#111827" />
          <Text className="text-gray-700">Forms: Create / Edit / Delete</Text>
        </View>
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="pen-to-square" size={16} color="#111827" />
          <Text className="text-gray-700">Fields: text / multiline / dropdown / location / image</Text>
        </View>
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="list-check" size={16} color="#111827" />
          <Text className="text-gray-700">Records: dynamic form, validation, pagination</Text>
        </View>
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="filter" size={16} color="#111827" />
          <Text className="text-gray-700">Filters: multiple criteria with AND / OR</Text>
        </View>
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="map-location-dot" size={16} color="#111827" />
          <Text className="text-gray-700">Map: render markers from location records</Text>
        </View>
      </View>

      <Text className="text-base font-medium text-gray-900 mb-3">Powered by</Text>
      <View className="gap-3">
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="react" size={16} color="#111827" />
          <Text className="text-gray-700">React Native + Expo</Text>
        </View>
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="road" size={16} color="#111827" />
          <Text className="text-gray-700">expo-router, NativeWind</Text>
        </View>
        <View className="flex-row items-center gap-3 pl-5">
          <FontAwesome6 name="database" size={16} color="#111827" />
          <Text className="text-gray-700">PostgREST API</Text>
        </View>
      </View>
    </View>
  );
}
