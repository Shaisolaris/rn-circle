import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, compact }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = Boolean(disabled) || Boolean(loading);

  const backgroundColor =
    variant === 'primary' ? theme.colors.accent : variant === 'secondary' ? theme.colors.accentMuted : 'transparent';
  const textColor = variant === 'primary' ? theme.colors.onAccent : theme.colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : null,
        { backgroundColor, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, compact ? styles.labelCompact : null, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { paddingVertical: 7, paddingHorizontal: 14 },
  label: { fontSize: 15, fontWeight: '600' },
  labelCompact: { fontSize: 13 },
});
