import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={30} color={theme.colors.textFaint} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  title: { fontSize: 15, fontWeight: '600', marginTop: 10 },
  message: { fontSize: 13, marginTop: 4, textAlign: 'center', lineHeight: 18 },
});
