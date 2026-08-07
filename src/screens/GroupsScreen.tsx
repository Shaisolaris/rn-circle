import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { GroupCard } from '../components/GroupCard';
import type { TabScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

export function GroupsScreen({ navigation }: TabScreenProps<'Groups'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const groups = useAppStore((state) => state.groups);
  const toggleGroupMembership = useAppStore((state) => state.toggleGroupMembership);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() => navigation.navigate('GroupFeed', { groupId: item.id })}
            onToggleMembership={() => toggleGroupMembership(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No groups yet" />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', paddingHorizontal: 16, paddingBottom: 10, paddingTop: 6 },
  list: { paddingTop: 4, paddingBottom: 24 },
});
