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
  // My Forms list screen (card layout, Apple HIG + Tailwind)
  // Read global state from the store
  const forms = useAppStore((s) => s.forms);
  const loading = useAppStore((s) => s.loading);
  const submitting = useAppStore((s) => s.submitting);
  const deletingId = useAppStore((s) => s.deletingId);
  const error = useAppStore((s) => s.error);
  // Actions
  const fetchForms = useAppStore((s) => s.fetchForms);
  const createForm = useAppStore((s) => s.createForm);
  const updateForm = useAppStore((s) => s.updateForm);
  const deleteForm = useAppStore((s) => s.deleteForm);

  // Bottom modal (create/edit form) using a shared component and state
  const [showSheet, setShowSheet] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null); // non-null => edit mode
  const sheetHeight = useMemo(() => Math.round(Dimensions.get('window').height * 0.5), []);

  // Simple drag-to-dismiss gesture for the modal
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
    // Open create mode
    setEditingId(null);
    setName('');
    setDescription('');
    setShowSheet(true);
  }

  function openEditSheet(form) {
    // Open edit mode with prefilled values
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
        // Edit (via store action)
        await updateForm(editingId, { name: nextName, description: nextDesc });
      } else {
        // Create (via store action)
        await createForm({ name: nextName, description: nextDesc });
      }
      setShowSheet(false);
      setName('');
      setDescription('');
      setEditingId(null);
    } catch (e) {}
  }

  function confirmDelete(formId) {
    // Delete confirmation
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

      {/* Bottom-only action button (no bar). Safe area + extra spacing, large radius. */}
      <View className="absolute left-0 right-0 bottom-24 px-10 pb-5">
        <Pressable onPress={openCreateSheet} className="w-full rounded-full bg-black py-3.5 items-center flex-row justify-center gap-2 shadow">
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text className="text-white text-base font-semibold">Add Form</Text>
        </Pressable>
      </View>

      {/* Reusable create/edit modal (centered fade-in, not a bottom sheet) */}
      <FormSheet
        visible={showSheet}
        mode={editingId ? 'edit' : 'create'}
        initialValues={{ name, description }}
        submitting={submitting}
        onSubmit={onSubmitPayload}
        onClose={() => setShowSheet(false)}
        title={editingId ? 'Edit Form' : 'Create New Form'}
      />
    </View>
  );
}
