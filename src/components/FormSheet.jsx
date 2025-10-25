import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, KeyboardAvoidingView, Platform, Dimensions, Pressable } from 'react-native';

export default function FormSheet({ visible, mode, initialValues, submitting, onSubmit, onClose }) {
  // CN: 复用创建/编辑的半屏模态
  const sheetHeight = useMemo(() => Math.round(Dimensions.get('window').height * 0.5), []);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // CN: 打开时预填充/重置
  useEffect(() => {
    if (visible) {
      setName(initialValues?.name || '');
      setDescription(initialValues?.description || '');
    }
  }, [visible, initialValues]);

  // CN: 简易下拉关闭
  const [dragStartY, setDragStartY] = useState(null);
  const onGrant = (e) => setDragStartY(e.nativeEvent.pageY);
  const onMove = (e) => {
    if (dragStartY == null) return;
    const dy = e.nativeEvent.pageY - dragStartY;
    if (dy > 80) {
      onClose?.();
      setDragStartY(null);
    }
  };
  const onRelease = () => setDragStartY(null);

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit?.({ name: name.trim(), description: description.trim() });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* CN: 遮罩层（点击空白处关闭） */}
      <Pressable className="flex-1 bg-black/50" onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <View
          style={{ height: sheetHeight }}
          className="bg-white rounded-t-3xl px-5 pt-5 pb-6"
          onStartShouldSetResponder={() => true}
          onResponderGrant={onGrant}
          onResponderMove={onMove}
          onResponderRelease={onRelease}
        >
          <View className="w-12 h-1.5 bg-gray-300 self-center rounded-full mb-4" />
          <Text className="text-2xl font-semibold mb-5">{mode === 'edit' ? 'Edit Form' : 'Create New Form'}</Text>

          <View className="gap-4">
            <View>
              <Text className="text-gray-700 mb-2">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter form name"
                className="border border-gray-300 rounded-xl px-3 py-3 text-base"
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                className="border border-gray-300 rounded-xl px-3 py-3 text-base"
              />
            </View>
          </View>

          {/* CN: 底部胶囊按钮 */}
          <View className="flex-row gap-3 absolute" style={{ left: 20, right: 20, bottom: 24 }}>
            <Pressable disabled={submitting} onPress={onClose} className="flex-1 rounded-full border border-gray-300 py-3.5 items-center">
              <Text className="text-gray-800 text-base">Cancel</Text>
            </Pressable>
            <Pressable disabled={submitting || !name.trim()} onPress={handleSubmit} className="flex-1 rounded-full bg-black py-3.5 items-center">
              <Text className="text-white text-base font-semibold">{submitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save' : 'Create')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


