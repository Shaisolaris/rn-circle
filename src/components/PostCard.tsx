import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { ImageBlock } from './ImageBlock';
import { RichText } from './RichText';
import { formatRelativeTime } from '../core/text';
import type { Post, User } from '../core/types';
import { useTheme } from '../theme/ThemeContext';

interface PostCardProps {
  post: Post;
  author: User | undefined;
  commentCount: number;
  onPress: () => void;
  onToggleLike: () => void;
}

export function PostCard({ post, author, commentCount, onPress, onToggleLike }: PostCardProps) {
  const theme = useTheme();
  const displayName = author?.displayName ?? 'Unknown member';
  const username = author?.username ?? 'unknown';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <View style={styles.header}>
        <Avatar name={displayName} paletteKey={author?.id ?? username} size={44} />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]} numberOfLines={1}>
            @{username} · {formatRelativeTime(post.createdAt)}
          </Text>
        </View>
      </View>

      <RichText text={post.text} style={styles.body} />

      {post.image ? <ImageBlock image={post.image} /> : null}

      <View style={styles.footer}>
        <Pressable onPress={onToggleLike} hitSlop={8} style={styles.footerButton} accessibilityRole="button">
          <Ionicons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={19}
            color={post.likedByMe ? theme.colors.likeActive : theme.colors.textMuted}
          />
          <Text
            style={[
              styles.footerText,
              { color: post.likedByMe ? theme.colors.likeActive : theme.colors.textMuted },
            ]}
          >
            {post.likeCount}
          </Text>
        </Pressable>
        <View style={styles.footerButton}>
          <Ionicons name="chatbubble-outline" size={17} color={theme.colors.textMuted} />
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>{commentCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerText: { marginLeft: 10, flexShrink: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12.5, marginTop: 1 },
  body: { marginBottom: 4 },
  footer: { flexDirection: 'row', marginTop: 10 },
  footerButton: { flexDirection: 'row', alignItems: 'center', marginRight: 22 },
  footerText: { marginLeft: 5, fontSize: 13, fontWeight: '500' },
});
