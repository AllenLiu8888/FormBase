import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// CN: 通用表单弹窗（支持 schema 渲染：input/select）。若不传 schema，则走旧的 name/description 模式以兼容调用方。
export default function FormSheet({ visible, mode, initialValues, submitting, onSubmit, onClose, title: titleOverride, showDescription = true, nameLabel = 'Name', descriptionLabel = 'Description', submitLabel, schema }) {
  // CN: 复用创建/编辑的“居中”模态对话框
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [values, setValues] = useState({}); // CN: schema 模式下的通用表单值
  const [openSelectKey, setOpenSelectKey] = useState(null); // CN: 当前展开的下拉
  const { width, height } = useWindowDimensions();
  // CN: 更“横向”的比例：更宽；高度随内容自适应，并限制最大高度防止溢出
  const modalWidth = Math.min(Math.round(width * 0.92), 720);
  const maxHeight = Math.round(height * 0.8);

  // CN: 打开时预填充/重置
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
      // CN: 校验：至少应包含 name 时才允许提交（业务可按需调整）
      const v = { ...values };
      if (typeof v.name === 'string' && !v.name.trim()) return;
      if (typeof v.name === 'string') v.name = v.name.trim();
      onSubmit?.(v);
      return;
    }
    // CN: 向后兼容旧模式
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
            <Text className="text-2xl font-semibold mb-6">{titleOverride || (mode === 'edit' ? 'Edit' : 'Create')}</Text>

            {/* CN: schema 渲染优先 */}
            {Array.isArray(schema) && schema.length > 0 ? (
              <View className="gap-4">
                {(schema.filter((f) => !f.visibleWhen || f.visibleWhen(values))).map((f, idx) => {
                  if (f.type === 'input') {
                    // CN: 特殊键 __pair__ 用于插入 Required/Is Number 横排控件
                    if (f.key === '__pair__') {
                      // 动态引入，避免循环依赖
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
                    const opts = Array.isArray(f.options) ? f.options : [];
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

            {/* CN: 居中模态底部胶囊按钮 */}
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


