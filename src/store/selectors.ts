/**
 * Small composition layer between the store and the pure `src/core` logic:
 * each hook reads the raw store slices it needs and runs them through the
 * pure ranking / counting functions, so screens never have to duplicate
 * that wiring.
 */
import { countComments } from '../core/counts';
import { postsForAuthor, postsForGroup, rankPosts } from '../core/feed';
import type { CommentNode, Post } from '../core/types';
import { useAppStore } from './useAppStore';

function commentCountsFor(posts: Post[], comments: Record<string, CommentNode[]>) {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    counts[post.id] = countComments(comments[post.id] ?? []);
  }
  return counts;
}

export function useCommentCount(postId: string): number {
  return useAppStore((state) => countComments(state.comments[postId] ?? []));
}

/** The main feed: every post, ranked by recency + engagement. */
export function useRankedFeed(): Post[] {
  return useAppStore((state) => {
    const counts = commentCountsFor(state.posts, state.comments);
    return rankPosts(state.posts, counts, Date.now());
  });
}

/** A single group's feed, ranked the same way as the main feed. */
export function useRankedGroupFeed(groupId: string): Post[] {
  return useAppStore((state) => {
    const groupPosts = postsForGroup(state.posts, groupId);
    const counts = commentCountsFor(groupPosts, state.comments);
    return rankPosts(groupPosts, counts, Date.now());
  });
}

/** The signed-in user's own posts, newest first. */
export function useProfilePosts(): Post[] {
  return useAppStore((state) => {
    const authored = postsForAuthor(state.posts, state.currentUserId);
    return [...authored].sort((a, b) => b.createdAt - a.createdAt);
  });
}
