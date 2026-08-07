import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PostImage } from '../core/types';
import { gradientForKey } from '../theme/tokens';

/**
 * Stands in for a real photo attachment: a gradient block (picked the same
 * deterministic way as avatars) with a small caption badge. Keeps posts
 * with "image blocks" fully self-contained, with no network image fetch.
 */
export function ImageBlock({ image }: { image: PostImage }) {
  const [from, to] = gradientForKey(image.paletteKey);

  return (
    <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.block}>
      <View style={styles.badge}>
        <Ionicons name="image-outline" size={14} color="#FFFFFF" />
        <Text style={styles.badgeText} numberOfLines={1}>
          {image.label}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  block: {
    height: 160,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
    justifyContent: 'flex-end',
    padding: 10,
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
});
