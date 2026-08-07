import React from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { countComments } from '../core/counts';
import type { Post } from '../core/types';
import type { TabScreenProps } from '../navigation/types';
import { useProfilePosts } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

export function ProfileScreen({ navigation }: TabScreenProps<'Profile'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const currentUserId = useAppStore((state) => state.currentUserId);
  const users = useAppStore((state) => state.users);
  const groups = useAppStore((state) => state.groups);
  const comments = useAppStore((state) => state.comments);
  const toggleLike = useAppStore((state) => state.toggleLike);
  const posts = useProfilePosts();

  const user = users[currentUserId];
  const joinedGroups = groups.filter((group) => group.joined);

  if (!user) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <EmptyState icon="person-outline" title="Profile unavailable" />
      </View>
    );
  }

  const renderItem = ({ item }: ListRenderItemInfo<Post>) => (
    <PostCard
      post={item}
      author={user}
      commentCount={countComments(comments[item.id] ?? [])}
      onPress={() => navigation.navigate('Thread', { postId: item.id })}
      onToggleLike={() => toggleLike(item.id)}
    />
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.profileRow}>
              <Avatar name={user.displayName} paletteKey={user.id} size={64} />
              <View style={styles.profileText}>
                <Text style={[styles.name, { color: theme.colors.text }]}>{user.displayName}</Text>
                <Text style={[styles.username, { color: theme.colors.textMuted }]}>@{user.username}</Text>
              </View>
            </View>
            <Text style={[styles.bio, { color: theme.colors.text }]}>{user.bio}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>{user.followingCount}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>{user.followerCount}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>{posts.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Posts</Text>
              </View>
            </View>
            {joinedGroups.length > 0 ? (
              <View style={styles.groupsRow}>
                {joinedGroups.map((group) => (
                  <View key={group.id} style={[styles.groupChip, { backgroundColor: theme.colors.accentMuted }]}>
                    <Text style={[styles.groupChipText, { color: theme.colors.accent }]}>{group.name}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>Your posts</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="create-outline" title="No posts yet" message="Anything you share will show up here." />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileText: { marginLeft: 14 },
  name: { fontSize: 20, fontWeight: '700' },
  username: { fontSize: 13.5, marginTop: 2 },
  bio: { fontSize: 14, lineHeight: 20, marginTop: 12 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  stat: { marginRight: 24 },
  statNumber: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 1 },
  groupsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
  groupChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 8, marginBottom: 8 },
  groupChipText: { fontSize: 12, fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 2 },
  list: { paddingBottom: 24 },
});
