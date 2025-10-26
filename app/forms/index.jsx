import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/useAppStore';
import HeaderBar from '../../src/components/HeaderBar';
import FormCard from '../../src/components/FormCard';
import FormSheet from '../../src/components/FormSheet';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FormsListScreen() {
  // CN: 我的表单列表屏，使用卡片样式展示（Apple 风格 + Tailwind）
  // CN: 从 store 读取全局状态
  const forms = useAppStore((s) => s.forms);
  const loading = useAppStore((s) => s.loading);
  const submitting = useAppStore((s) => s.submitting);
  const deletingId = useAppStore((s) => s.deletingId);
  const error = useAppStore((s) => s.error);
  // CN: actions
  const fetchForms = useAppStore((s) => s.fetchForms);
  const createForm = useAppStore((s) => s.createForm);
  const updateForm = useAppStore((s) => s.updateForm);
  const deleteForm = useAppStore((s) => s.deleteForm);

  // CN: 底部“新增/编辑表单”半屏模态（复用同一个组件与状态）
  const [showSheet, setShowSheet] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null); // CN: 有值则为“编辑”模式
  const sheetHeight = useMemo(() => Math.round(Dimensions.get('window').height * 0.5), []);

  // CN: 下拉关闭手势（简易）
  const [dragStartY, setDragStartY] = useState(null);
  const onGrant = (e) => setDragStartY(e.nativeEvent.pageY);
  const onMove = (e) => {
    if (dragStartY == null) return;
    const dy = e.nativeEvent.pageY - dragStartY;
    if (dy > 80) {
      setShowSheet(false);
      setDragStartY(null);
    }
  };
  const onRelease = () => setDragStartY(null);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  function openCreateSheet() {
    // CN: 打开创建模式
    setEditingId(null);
    setName('');
    setDescription('');
    setShowSheet(true);
  }

  function openEditSheet(form) {
    // CN: 打开编辑模式，预填充
    setEditingId(form.id);
    setName(form.name || '');
    setDescription(form.description || '');
    setShowSheet(true);
  }

  async function onSubmitPayload(payload) {
    const nextName = payload?.name?.trim?.() || '';
    const nextDesc = (payload?.description ?? '').trim();
    if (!nextName) return;
    try {
      if (editingId) {
        // CN: 编辑（使用 store action）
        await updateForm(editingId, { name: nextName, description: nextDesc });
      } else {
        // CN: 创建（使用 store action）
        await createForm({ name: nextName, description: nextDesc });
      }
      setShowSheet(false);
      setName('');
      setDescription('');
      setEditingId(null);
    } catch (e) {}
  }

  function confirmDelete(formId) {
    // CN: 删除确认
    Alert.alert('Delete Form', 'Are you sure you want to delete this form?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(formId) },
    ]);
  }

  async function onDelete(formId) {
    try {
      await deleteForm(formId);
    } catch (e) {}
  }

  return (
    <View className="flex-1 bg-white">
      <HeaderBar title="My Forms" subtitle="Manage your forms" />

      {loading && (
        <View className="px-5"><Text className="text-gray-600">Loading...</Text></View>
      )}
      {!loading && error && (
        <View className="px-5"><Text className="text-red-500">Error: {String(error?.message || error)}</Text></View>
      )}

      {!loading && !error && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base text-gray-700">Total: {forms.length}</Text>
            <Link href="/" className="text-blue-600">Back to Home</Link>
          </View>

          <View className="gap-3">
            {forms.map((f) => (
              <FormCard
                key={f.id}
                id={f.id}
                name={f.name}
                description={f.description}
                onEdit={() => openEditSheet(f)}
                onDelete={() => confirmDelete(f.id)}
                deleting={deletingId === f.id}
              />
            ))}

            {forms.length === 0 && (
              <View className="rounded-2xl bg-gray-50 border border-dashed border-gray-300 p-4 items-center">
                <Text className="text-gray-600">You have no forms yet.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* CN: 底部仅按钮（无背景条），预留安全区与额外间距，圆角更大，与手机底部弧度对齐 */}
      <View className="absolute left-0 right-0 bottom-24 px-10 pb-5">
        <Pressable onPress={openCreateSheet} className="w-full rounded-full bg-black py-3.5 items-center flex-row justify-center gap-2 shadow">
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text className="text-white text-base font-semibold">Add Form</Text>
        </Pressable>
      </View>

      {/* CN: 复用的创建/编辑半屏模态组件 */}
      <FormSheet
        visible={showSheet}
        mode={editingId ? 'edit' : 'create'}
        initialValues={{ name, description }}
        submitting={submitting}
        onSubmit={onSubmitPayload}
        onClose={() => setShowSheet(false)}
      />
    </View>
  );
}
