import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../../src/store/useAppStore';
import FormSheet from '../../../src/components/FormSheet';

export default function FieldsScreen() {
  // CN: 字段列表与新增（先支持 text 字段）
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

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>
        <Text className="text-base font-semibold">Fields</Text>
        {loading && <Text className="text-gray-600 mt-2">Loading...</Text>}
        {!!error && <Text className="text-red-500 mt-2">Error: {String(error?.message || error)}</Text>}

        <View className="mt-4 gap-2">
          {fields.map((f) => (
            <View key={f.id} className="rounded-xl border border-gray-200 p-3">
              <Text className="text-gray-900">{f.name}</Text>
              <Text className="text-gray-500 text-xs mt-1">type: {f.field_type}</Text>
            </View>
          ))}

          {fields.length === 0 && (
            <View className="rounded-xl border border-dashed border-gray-300 p-3 items-center">
              <Text className="text-gray-500">No fields yet.</Text>
            </View>
          )}
        </View>

        {/* CN: 保持内容区域清爽，新增入口用底部固定按钮 */}
      </ScrollView>

      {/* CN: 底部固定“Add Field”按钮（与 My Forms 的按钮一致风格） */}
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
          { key: 'field_type', type: 'select', label: 'Type', options: ['text', 'multiline', 'dropdown', 'location'], placeholder: 'Select type' },
          { key: 'required', type: 'checkbox', label: 'Required' },
          { key: 'is_num', type: 'checkbox', label: 'Is Number' },
          { key: 'options', type: 'input', label: 'Dropdown Options (comma separated)', placeholder: 'e.g. option1, option2' },
        ]}
      />
    </View>
  );
}


