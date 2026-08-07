import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { initialsForName } from '../core/text';
import { gradientForKey } from '../theme/tokens';

interface AvatarProps {
  name: string;
  paletteKey: string;
  size?: number;
}

export function Avatar({ name, paletteKey, size = 44 }: AvatarProps) {
  const [from, to] = gradientForKey(paletteKey);
  const fontSize = Math.round(size * 0.42);

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initialsForName(name)}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
