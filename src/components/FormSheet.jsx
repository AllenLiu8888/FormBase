import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Generic form modal (supports schema rendering). Falls back to name/description mode if no schema.
export default function FormSheet({ visible, mode, initialValues, submitting, onSubmit, onClose, title: titleOverride, showDescription = true, nameLabel = 'Name', descriptionLabel = 'Description', submitLabel, schema }) {
  // Centered modal reused for create/edit flows
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [values, setValues] = useState({}); // Form values in schema-driven mode
  const [openSelectKey, setOpenSelectKey] = useState(null); // Currently open select key
  const { width, height } = useWindowDimensions();
  // Wider layout; height auto with a max cap to avoid overflow
  const modalWidth = Math.min(Math.round(width * 0.92), 720);
  const maxHeight = Math.round(height * 0.8);

  // Prefill/reset when modal opens
  useEffect(() => {
    if (visible) {
      setName(initialValues?.name || '');
      setDescription(initialValues?.description || '');
      setValues(initialValues || {});
      setOpenSelectKey(null);
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (schema && Array.isArray(schema) && schema.length > 0) {
      // Minimal validation: require non-empty name when present
      const v = { ...values };
      if (typeof v.name === 'string' && !v.name.trim()) return;
      if (typeof v.name === 'string') v.name = v.name.trim();
      onSubmit?.(v);
      return;
    }
    // Backward-compatible legacy mode
    if (!name.trim()) return;
    onSubmit?.({ name: name.trim(), description: description.trim() });
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      {/* Center overlay (tap outside to close) */}
      <View className="flex-1 items-center justify-center">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })}>
          <View style={{ width: modalWidth, maxHeight }} className="mx-4 bg-white rounded-3xl px-6 pt-6 pb-6 border border-gray-100 shadow-xl">
            <Text className="text-2xl font-semibold mb-6">{titleOverride || (mode === 'edit' ? 'Edit' : 'Create')}</Text>

            {/* Schema-driven rendering first */}
            {Array.isArray(schema) && schema.length > 0 ? (
              <View className="gap-4">
                {(schema.filter((f) => !f.visibleWhen || f.visibleWhen(values))).map((f, idx) => {
                  if (f.type === 'input') {
                    // Special key __pair__ inserts the Required/Is Number row
                    if (f.key === '__pair__') {
                      // Dynamic import to avoid circular dependencies
                      const Pair = require('./inputs/CheckboxPairRow').default;
                      return (
                        <View key="__pair__-wrap" className="pt-2">
                          <Text className="text-gray-700 mb-2">Field Settings</Text>
                          <Pair
                            leftLabel="Required"
                            leftValue={Boolean(values.required)}
                            onChangeLeft={(v) => setValues((prev) => ({ ...prev, required: v }))}
                            rightLabel="Stores Num"
                            rightValue={Boolean(values.is_num)}
                            onChangeRight={(v) => setValues((prev) => ({ ...prev, is_num: v }))}
                          />
                        </View>
                      );
                    }
                    return (
                      <View key={`${f.key}-${idx}`}>
                        <Text className="text-gray-700 mb-2">{f.label || f.key}</Text>
                        <TextInput
                          value={String(values[f.key] ?? '')}
                          onChangeText={(t) => setValues((prev) => ({ ...prev, [f.key]: t }))}
                          placeholder={f.placeholder || ''}
                          keyboardType={f.keyboardType || 'default'}
                          className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
                        />
                      </View>
                    );
                  }
                  if (f.type === 'multiline') {
                    return (
                      <View key={`${f.key}-${idx}`}>
                        <Text className="text-gray-700 mb-2">{f.label || f.key}</Text>
                        <TextInput
                          value={String(values[f.key] ?? '')}
                          onChangeText={(t) => setValues((prev) => ({ ...prev, [f.key]: t }))}
                          placeholder={f.placeholder || ''}
                          multiline
                          numberOfLines={f.numberOfLines || 4}
                          textAlignVertical="top"
                          className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
                        />
                      </View>
                    );
                  }
                  if (f.type === 'select') {
                    const display = values[f.key] ?? '';
                    const isOpen = openSelectKey === f.key;
                    const opts = typeof f.options === 'function' ? f.options(values) : (Array.isArray(f.options) ? f.options : []);
                    return (
                      <View key={f.key}>
                        <Text className="text-gray-700 mb-2">{f.label || f.key}</Text>
                        <Pressable
                          className="border border-gray-300 rounded-2xl px-4 py-3"
                          onPress={() => setOpenSelectKey(isOpen ? null : f.key)}
                        >
                          <Text className={display ? 'text-gray-900' : 'text-gray-400'}>
                            {display || (f.placeholder || 'Select')}
                          </Text>
                        </Pressable>
                        {isOpen && (
                          <View className="mt-2 rounded-2xl border border-gray-200 bg-white overflow-hidden">
                            {opts.map((opt) => (
                              <Pressable
                                key={String(opt)}
                                onPress={() => {
                                  setValues((prev) => ({ ...prev, [f.key]: opt }));
                                  setOpenSelectKey(null);
                                }}
                                className="px-4 py-3 border-b border-gray-100"
                              >
                                <Text className="text-gray-900">{String(opt)}</Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  }
                  if (f.type === 'location') {
                    const LocationField = require('./inputs/LocationField').default;
                    return (
                      <LocationField
                        key={`${f.key}-${idx}`}
                        label={f.label || f.key}
                        value={values[f.key]}
                        onPick={async () => {
                          try {
                            if (typeof f.onPick === 'function') {
                              const loc = await f.onPick();
                              if (loc && typeof loc.lon === 'number' && typeof loc.lat === 'number') {
                                setValues((prev) => ({ ...prev, [f.key]: loc }));
                              }
                            }
                          } catch {}
                        }}
                      />
                    );
                  }
                  if (f.type === 'image') {
                    const ImageField = require('./inputs/ImageField').default;
                    return (
                      <ImageField
                        key={`${f.key}-${idx}`}
                        label={f.label || f.key}
                        value={values[f.key]}
                        onPick={(uri) => setValues((prev) => ({ ...prev, [f.key]: uri }))}
                      />
                    );
                  }
                  if (f.type === 'checkbox') {
                    const checked = Boolean(values[f.key]);
                    return (
                      <Pressable
                        key={f.key}
                        onPress={() => setValues((prev) => ({ ...prev, [f.key]: !checked }))}
                        className="flex-row items-center justify-between border border-gray-300 rounded-2xl px-4 py-3"
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                      >
                        <Text className="text-gray-700">{f.label || f.key}</Text>
                        <Ionicons
                          name={checked ? 'checkbox-outline' : 'square-outline'}
                          size={22}
                          color={checked ? '#111827' : '#6B7280'}
                        />
                      </Pressable>
                    );
                  }
                  return null;
                })}
              </View>
            ) : (
              <View className="gap-4">
                <View>
                  <Text className="text-gray-700 mb-2">{nameLabel}</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter form name"
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
                  />
                </View>
                {showDescription && (
                  <View>
                    <Text className="text-gray-700 mb-2">{descriptionLabel}</Text>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Optional description"
                      className="border border-gray-300 rounded-2xl px-4 py-3 text-base"
                    />
                  </View>
                )}
              </View>
            )}

            {/* Modal footer pill buttons */}
            <View className="flex-row gap-3 mt-6 pt-4">
              <Pressable disabled={submitting} onPress={onClose} className="flex-1 rounded-full border border-gray-300 py-3.5 items-center">
                <Text className="text-gray-800 text-base">Cancel</Text>
              </Pressable>
              <Pressable
                disabled={submitting || (Array.isArray(schema) && schema.length > 0 ? false : !name.trim())}
                onPress={handleSubmit}
                className="flex-1 rounded-full bg-black py-3.5 items-center"
              >
                <Text className="text-white text-base font-semibold">{submitLabel || (submitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save' : 'Create'))}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}


