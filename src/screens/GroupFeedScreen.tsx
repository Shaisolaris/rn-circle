import React, { useCallback, useLayoutEffect } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { countComments } from '../core/counts';
import type { Post } from '../core/types';
import type { RootScreenProps } from '../navigation/types';
import { useRankedGroupFeed } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

export function GroupFeedScreen({ route, navigation }: RootScreenProps<'GroupFeed'>) {
  const { groupId } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const group = useAppStore((state) => state.groups.find((item) => item.id === groupId));
  const users = useAppStore((state) => state.users);
  const comments = useAppStore((state) => state.comments);
  const toggleLike = useAppStore((state) => state.toggleLike);
  const toggleGroupMembership = useAppStore((state) => state.toggleGroupMembership);
  const posts = useRankedGroupFeed(groupId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: group?.name ?? 'Group' });
  }, [navigation, group?.name]);

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

  if (!group) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <EmptyState icon="alert-circle-outline" title="Group not found" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.description, { color: theme.colors.textMuted }]}>{group.description}</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.members, { color: theme.colors.textFaint }]}>
            {group.memberCount.toLocaleString()} members
          </Text>
          <View style={styles.headerButtons}>
            <Button
              label={group.joined ? 'Joined' : 'Join'}
              variant={group.joined ? 'secondary' : 'primary'}
              onPress={() => toggleGroupMembership(group.id)}
              compact
            />
            <Pressable
              onPress={() => navigation.navigate('Compose', { groupId: group.id })}
              accessibilityRole="button"
              accessibilityLabel="New post in this group"
              style={[styles.composeButton, { backgroundColor: theme.colors.accent }]}
              hitSlop={8}
            >
              <Ionicons name="add" size={18} color={theme.colors.onAccent} />
            </Pressable>
          </View>
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState icon="albums-outline" title="No posts yet" message="Posts shared in this group will show up here." />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  description: { fontSize: 13.5, lineHeight: 19 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  members: { fontSize: 12.5, fontWeight: '500' },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  composeButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  list: { paddingTop: 10 },
});
