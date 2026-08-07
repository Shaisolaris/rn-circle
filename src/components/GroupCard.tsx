import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from './Button';
import type { Group } from '../core/types';
import { useTheme } from '../theme/ThemeContext';
import { gradientForKey } from '../theme/tokens';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onToggleMembership: () => void;
}

export function GroupCard({ group, onPress, onToggleMembership }: GroupCardProps) {
  const theme = useTheme();
  const [from, to] = gradientForKey(group.paletteKey);
  const initial = group.name.charAt(0).toUpperCase() || '?';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
        <Text style={styles.iconText}>{initial}</Text>
      </LinearGradient>
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={2}>
          {group.description}
        </Text>
        <Text style={[styles.members, { color: theme.colors.textFaint }]}>
          {group.memberCount.toLocaleString()} members
        </Text>
      </View>
      <Button
        label={group.joined ? 'Joined' : 'Join'}
        variant={group.joined ? 'secondary' : 'primary'}
        onPress={onToggleMembership}
        compact
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  body: { flex: 1, marginLeft: 12, marginRight: 10 },
  name: { fontSize: 15.5, fontWeight: '600' },
  description: { fontSize: 12.5, marginTop: 2, lineHeight: 17 },
  members: { fontSize: 11.5, marginTop: 4 },
});
