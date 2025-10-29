import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
// Gesture root is provided in app/_layout.jsx; no need to wrap here
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../../src/store/useAppStore';
import FormSheet from '../../../src/components/FormSheet';
import CheckboxPairRow from '../../../src/components/inputs/CheckboxPairRow';

export default function FieldsScreen() {
  // Field list with creation (supports text/multiline/dropdown/location/image)
  const { id } = useLocalSearchParams();
  const formId = id;
  const loading = useAppStore((s) => s.loading);
  const submitting = useAppStore((s) => s.submitting);
  const error = useAppStore((s) => s.error);
  const fieldsByForm = useAppStore((s) => s.fieldsByForm);
  const fetchFields = useAppStore((s) => s.fetchFields);
  const createField = useAppStore((s) => s.createField);

  const fields = fieldsByForm[String(formId)] || [];
  const [name, setName] = useState('');
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    fetchFields(formId);
  }, [formId, fetchFields]);

  async function onSubmit(payload) {
    const nextName = payload?.name?.trim?.();
    const nextType = payload?.field_type;
    const required = Boolean(payload?.required);
    const is_num = Boolean(payload?.is_num);
    let options;
    if (nextType === 'dropdown') {
      const raw = String(payload?.options || '').trim();
      if (raw) {
        const arr = raw.split(',').map((s) => s.trim()).filter(Boolean);
        options = { dropdown: arr };
      }
    }
    if (!nextName || !nextType) return;
    await createField(formId, { name: nextName, field_type: nextType, required, is_num, options });
    setShowSheet(false);
    setName('');
  }

  const [localData, setLocalData] = useState(() => fields);
  // Sync local list only when field id order/count changes to reduce renders
  const idSig = useMemo(() => (Array.isArray(fields) ? fields.map((f) => f.id).join(',') : ''), [fields]);
  useEffect(() => {
    if (localData !== fields) {
      setLocalData(fields);
    }
  }, [idSig]);

  const renderItem = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        disabled={isActive}
        className="rounded-xl border border-gray-200 p-3 mb-2 bg-white"
      >
        <Text className="text-gray-900">{item.name}</Text>
        <Text className="text-gray-500 text-xs mt-1">type: {item.field_type}</Text>
      </Pressable>
    </ScaleDecorator>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-4 pb-40">
        {loading && <Text className="text-gray-600 mt-2">Loading...</Text>}
        {!!error && <Text className="text-red-500 mt-2">Error: {String(error?.message || error)}</Text>}

        {localData.length === 0 ? (
          <View className="rounded-xl border border-dashed border-gray-300 p-3 items-center">
            <Text className="text-gray-500">No fields yet.</Text>
          </View>
        ) : (
          <DraggableFlatList
            data={localData}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            onDragBegin={() => {
              // Trigger subtle haptic feedback when drag begins (iOS supported)
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            onDragEnd={({ data }) => {
              setLocalData(data);
              // Compute new order and persist order_index
              const orderedIds = data.map((d) => d.id);
              useAppStore.getState().reorderFields(formId, orderedIds);
            }}
            containerStyle={{ paddingBottom: 16 }}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>

      {/* Bottom fixed “Add Field” button (matches My Forms style) */}
      <View className="absolute left-0 right-0 bottom-24 px-10 pb-5">
        <Pressable onPress={() => setShowSheet(true)} className="w-full rounded-full bg-black py-3.5 items-center flex-row justify-center gap-2 shadow">
          <Text className="text-white text-base font-semibold">Add Field</Text>
        </Pressable>
      </View>

      <FormSheet
        visible={showSheet}
        mode="create"
        initialValues={{ name, field_type: 'text', required: false, is_num: false, options: '' }}
        submitting={submitting}
        onSubmit={onSubmit}
        onClose={() => setShowSheet(false)}
        title="Create Field"
        showDescription={false}
        submitLabel={submitting ? 'Creating...' : 'Create'}
        schema={[
          { key: 'name', type: 'input', label: 'Field Name', placeholder: 'Enter field name' },
          { key: 'field_type', type: 'select', label: 'Type', options: ['text', 'multiline', 'dropdown', 'location', 'image'], placeholder: 'Select type' },
          // Placeholder entry used by FormSheet to render the required/number pair row
          { key: '__pair__', type: 'input', label: '', placeholder: '', visibleWhen: () => true },
          { key: 'options', type: 'input', label: 'Dropdown Options (comma separated)', placeholder: 'e.g. option1, option2', visibleWhen: (v) => v.field_type === 'dropdown' },
        ]}
      />
    </View>
  );
}


