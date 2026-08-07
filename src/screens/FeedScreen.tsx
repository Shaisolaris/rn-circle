import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { countComments } from '../core/counts';
import type { Post } from '../core/types';
import type { TabScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useRankedFeed } from '../store/selectors';
import { useTheme } from '../theme/ThemeContext';

export function FeedScreen({ navigation }: TabScreenProps<'Feed'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const posts = useRankedFeed();
  const users = useAppStore((state) => state.users);
  const comments = useAppStore((state) => state.comments);
  const toggleLike = useAppStore((state) => state.toggleLike);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Post>) => (
      <PostCard
        post={item}
        author={users[item.authorId]}
        commentCount={countComments(comments[item.id] ?? [])}
        onPress={() => navigation.navigate('Thread', { postId: item.id })}
        onToggleLike={() => toggleLike(item.id)}
      />
    ),
    [users, comments, toggleLike, navigation]
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Circle</Text>
        <Pressable
          onPress={() => navigation.navigate('Compose', {})}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="New post"
          style={[styles.composeButton, { backgroundColor: theme.colors.accent }]}
        >
          <Ionicons name="add" size={22} color={theme.colors.onAccent} />
        </Pressable>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="albums-outline"
            title="No posts yet"
            message="Be the first to share something with the community."
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 6,
  },
  title: { fontSize: 24, fontWeight: '700' },
  composeButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  list: { paddingTop: 4, paddingBottom: 24 },
});
