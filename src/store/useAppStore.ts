import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toggleLike as toggleLikePure } from '../core/feed';
import type { CommentNode, Group, Post, User } from '../core/types';
import { currentUserId as seedCurrentUserId, seedComments, seedGroups, seedPosts, seedUsers } from '../data/seed';

let localCommentSequence = 0;
function nextCommentId(): string {
  localCommentSequence += 1;
  return `local-comment-${Date.now()}-${localCommentSequence}`;
}

let localPostSequence = 0;
function nextPostId(): string {
  localPostSequence += 1;
  return `local-post-${Date.now()}-${localPostSequence}`;
}

export interface AppState {
  currentUserId: string;
  users: Record<string, User>;
  posts: Post[];
  groups: Group[];
  comments: Record<string, CommentNode[]>;

  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  addPost: (text: string, groupId: string | null) => string;
  toggleGroupMembership: (groupId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: seedCurrentUserId,
      users: seedUsers,
      posts: seedPosts,
      groups: seedGroups,
      comments: seedComments,

      toggleLike: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) => (post.id === postId ? toggleLikePure(post) : post)),
        }));
      },

      addComment: (postId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const node: CommentNode = {
          id: nextCommentId(),
          postId,
          authorId: get().currentUserId,
          text: trimmed,
          createdAt: Date.now(),
          replies: [],
        };
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: [...(state.comments[postId] ?? []), node],
          },
        }));
      },

      addPost: (text, groupId) => {
        const trimmed = text.trim();
        const id = nextPostId();
        if (!trimmed) return id;
        const post: Post = {
          id,
          authorId: get().currentUserId,
          groupId,
          text: trimmed,
          image: null,
          likeCount: 0,
          likedByMe: false,
          createdAt: Date.now(),
        };
        set((state) => ({ posts: [post, ...state.posts] }));
        return id;
      },

      toggleGroupMembership: (groupId) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  joined: !group.joined,
                  memberCount: group.joined ? Math.max(0, group.memberCount - 1) : group.memberCount + 1,
                }
              : group
          ),
        }));
      },
    }),
    {
      name: 'circle-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
