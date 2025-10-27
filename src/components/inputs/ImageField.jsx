import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImageField({ label, value, onPick }) {
  // CN: 选择图片（相册/拍照），仅保存 URI
  async function pickFromLibrary() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!res.canceled && res.assets?.[0]?.uri) onPick?.(res.assets[0].uri);
    } catch {}
  }
  async function takePhoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!res.canceled && res.assets?.[0]?.uri) onPick?.(res.assets[0].uri);
    } catch {}
  }

  return (
    <View>
      {!!label && <Text className="text-gray-700 mb-2">{label}</Text>}
      {value ? (
        <Image source={{ uri: String(value) }} style={{ width: 120, height: 120, borderRadius: 12, marginBottom: 8 }} />
      ) : (
        <View className="border border-gray-300 rounded-2xl px-4 py-6 items-center mb-2">
          <Text className="text-gray-400">No image selected</Text>
        </View>
      )}
      <View className="flex-row gap-2">
        <Pressable onPress={pickFromLibrary} className="px-3 py-2 rounded-full border border-gray-300">
          <Text className="text-gray-800 text-sm">Pick Photo</Text>
        </Pressable>
        <Pressable onPress={takePhoto} className="px-3 py-2 rounded-full border border-gray-300">
          <Text className="text-gray-800 text-sm">Take Photo</Text>
        </Pressable>
      </View>
    </View>
  );
}


