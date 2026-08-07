import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

const MAX_LENGTH = 280;

export function ComposeScreen({ route, navigation }: RootScreenProps<'Compose'>) {
  const groupId = route.params?.groupId ?? null;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');

  const addPost = useAppStore((state) => state.addPost);
  const group = useAppStore((state) => (groupId ? state.groups.find((item) => item.id === groupId) : undefined));

  const trimmedLength = text.trim().length;
  const canPost = trimmedLength > 0 && text.length <= MAX_LENGTH;

  const handlePost = () => {
    if (!canPost) return;
    addPost(text, groupId);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {group ? <Text style={[styles.groupLabel, { color: theme.colors.accent }]}>Posting in {group.name}</Text> : null}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="What's happening in your circle?"
        placeholderTextColor={theme.colors.textFaint}
        style={[styles.input, { color: theme.colors.text }]}
        multiline
        autoFocus
        maxLength={MAX_LENGTH + 40}
      />
      <View style={styles.footer}>
        <Text
          style={[styles.counter, { color: text.length > MAX_LENGTH ? theme.colors.danger : theme.colors.textFaint }]}
        >
          {text.length}/{MAX_LENGTH}
        </Text>
        <Button label="Post" onPress={handlePost} disabled={!canPost} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18 },
  groupLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  input: { fontSize: 17, lineHeight: 24, flexGrow: 1, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  counter: { fontSize: 12.5, fontWeight: '500' },
});
