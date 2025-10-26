import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, useWindowDimensions } from 'react-native';

export default function FormSheet({ visible, mode, initialValues, submitting, onSubmit, onClose }) {
  // CN: 复用创建/编辑的“居中”模态对话框
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { width, height } = useWindowDimensions();
  // CN: 更“横向”的比例：更宽；高度随内容自适应，并限制最大高度防止溢出
  const modalWidth = Math.min(Math.round(width * 0.92), 720);
  const maxHeight = Math.round(height * 0.8);

  // CN: 打开时预填充/重置
  useEffect(() => {
    if (visible) {
      setName(initialValues?.name || '');
      setDescription(initialValues?.description || '');
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit?.({ name: name.trim(), description: description.trim() });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* CN: 居中遮罩层（点击空白处关闭） */}
      <View className="flex-1 items-center justify-center">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })}>
          <View style={{ width: modalWidth, maxHeight }} className="mx-4 bg-white rounded-3xl px-6 pt-6 pb-6 border border-gray-100 shadow-xl">
            <Text className="text-2xl font-semibold mb-6">{mode === 'edit' ? 'Edit Form' : 'Create New Form'}</Text>

            <View className="gap-4">
              <View>
                <Text className="text-gray-700 mb-2">Name</Text>
              <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter form name"
                className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
                />
              </View>
              <View>
                <Text className="text-gray-700 mb-2">Description</Text>
              <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optional description"
                className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
                />
              </View>
            </View>

            {/* CN: 居中模态底部胶囊按钮 */}
            <View className="flex-row gap-3 mt-6 pt-4">
              <Pressable disabled={submitting} onPress={onClose} className="flex-1 rounded-full border border-gray-300 py-3.5 items-center">
                <Text className="text-gray-800 text-base">Cancel</Text>
              </Pressable>
              <Pressable disabled={submitting || !name.trim()} onPress={handleSubmit} className="flex-1 rounded-full bg-black py-3.5 items-center">
                <Text className="text-white text-base font-semibold">{submitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save' : 'Create')}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}


