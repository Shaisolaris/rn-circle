import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { RichText } from './RichText';
import { formatRelativeTime } from '../core/text';
import type { CommentNode, User } from '../core/types';
import { useTheme } from '../theme/ThemeContext';

interface CommentItemProps {
  comment: CommentNode;
  users: Record<string, User>;
  depth?: number;
}

/** Renders a comment and, recursively, every reply beneath it. */
export function CommentItem({ comment, users, depth = 0 }: CommentItemProps) {
  const theme = useTheme();
  const author = users[comment.authorId];
  const displayName = author?.displayName ?? 'Unknown member';

  return (
    <View
      style={[
        styles.wrap,
        depth > 0 ? { marginLeft: 24, borderLeftColor: theme.colors.border, borderLeftWidth: 1, paddingLeft: 12 } : null,
      ]}
    >
      <View style={styles.row}>
        <Avatar name={displayName} paletteKey={author?.id ?? comment.authorId} size={32} />
        <View style={styles.content}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {displayName}
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              {'  ·  '}
              {formatRelativeTime(comment.createdAt)}
            </Text>
          </Text>
          <RichText text={comment.text} style={styles.body} />
        </View>
      </View>
      {comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} users={users} depth={depth + 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  row: { flexDirection: 'row' },
  content: { marginLeft: 10, flex: 1 },
  name: { fontSize: 13.5, fontWeight: '600' },
  meta: { fontWeight: '400', fontSize: 12 },
  body: { marginTop: 2, fontSize: 14, lineHeight: 19 },
});
