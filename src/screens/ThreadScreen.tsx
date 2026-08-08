import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommentItem } from '../components/CommentItem';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { countComments } from '../core/counts';
import type { CommentNode } from '../core/types';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

// Stable fallback: an inline `?? []` inside the selector would hand zustand v5
// a new reference on every read, which useSyncExternalStore treats as an
// endless stream of store changes.
const NO_COMMENTS: CommentNode[] = [];

export function ThreadScreen({ route }: RootScreenProps<'Thread'>) {
  const { postId } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  const post = useAppStore((state) => state.posts.find((item) => item.id === postId));
  const users = useAppStore((state) => state.users);
  const commentTree = useAppStore((state) => state.comments[postId] ?? NO_COMMENTS);
  const toggleLike = useAppStore((state) => state.toggleLike);
  const addComment = useAppStore((state) => state.addComment);

  const commentCount = useMemo(() => countComments(commentTree), [commentTree]);

  if (!post) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <EmptyState icon="alert-circle-outline" title="Post not found" message="This post may have been removed." />
      </View>
    );
  }

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addComment(postId, trimmed);
    setDraft('');
  };

  const renderComment = ({ item }: ListRenderItemInfo<CommentNode>) => (
    <View style={styles.commentRow}>
      <CommentItem comment={item} users={users} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <FlatList
        data={commentTree}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <PostCard
              post={post}
              author={users[post.authorId]}
              commentCount={commentCount}
              onPress={() => {}}
              onToggleLike={() => toggleLike(post.id)}
            />
            <Text style={[styles.commentsLabel, { color: theme.colors.textMuted }]}>
              {commentCount === 1 ? '1 comment' : `${commentCount} comments`}
            </Text>
          </View>
        }
        renderItem={renderComment}
        ListEmptyComponent={
          <EmptyState icon="chatbubble-outline" title="No comments yet" message="Start the conversation." />
        }
        contentContainerStyle={styles.list}
      />
      <View
        style={[
          styles.composer,
          { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 10 },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Add a comment"
          placeholderTextColor={theme.colors.textFaint}
          style={[
            styles.input,
            { color: theme.colors.text, backgroundColor: theme.colors.background, borderColor: theme.colors.border },
          ]}
          multiline
        />
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send comment"
          style={[styles.sendButton, { backgroundColor: theme.colors.accent, opacity: draft.trim() ? 1 : 0.4 }]}
        >
          <Ionicons name="arrow-up" size={18} color={theme.colors.onAccent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingBottom: 16 },
  commentsLabel: { fontSize: 13, fontWeight: '600', marginLeft: 18, marginBottom: 8, marginTop: 4 },
  commentRow: { paddingHorizontal: 18 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    maxHeight: 100,
    fontSize: 14.5,
    marginRight: 8,
  },
  sendButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
