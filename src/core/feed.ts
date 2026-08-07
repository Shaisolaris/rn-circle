/**
 * Pure feed logic: like-toggle math and the recency + engagement ranking
 * used to order the main feed and each group's feed. Nothing in this file
 * touches the store or React — every function takes plain data in and
 * returns plain data out, which is what makes it straightforward to test.
 */
import type { Post } from './types';

const RECENCY_WINDOW_HOURS = 48;
const RECENCY_WEIGHT = 0.5;
const COMMENT_WEIGHT = 2;

/** Returns a new post with `likedByMe` flipped and `likeCount` adjusted to match. */
export function toggleLike(post: Post): Post {
  if (post.likedByMe) {
    return { ...post, likedByMe: false, likeCount: Math.max(0, post.likeCount - 1) };
  }
  return { ...post, likedByMe: true, likeCount: post.likeCount + 1 };
}

/** Raw engagement points: every like is worth 1, every comment is worth 2. */
export function computeEngagementScore(likeCount: number, commentCount: number): number {
  return likeCount + commentCount * COMMENT_WEIGHT;
}

/**
 * A bonus that starts at 48 (points) for a brand-new post and decays
 * linearly to 0 once the post is `RECENCY_WINDOW_HOURS` hours old.
 * Timestamps in the future (clock skew, optimistic local posts) are
 * treated as "now", so they get the maximum bonus rather than a negative
 * or undefined one.
 */
export function computeRecencyScore(createdAt: number, now: number): number {
  const hoursAgo = Math.max(0, (now - createdAt) / (60 * 60 * 1000));
  return Math.max(0, RECENCY_WINDOW_HOURS - hoursAgo);
}

/** Combined ranking score for a single post. Higher sorts first. */
export function computePostScore(post: Post, commentCount: number, now: number): number {
  return (
    computeEngagementScore(post.likeCount, commentCount) +
    computeRecencyScore(post.createdAt, now) * RECENCY_WEIGHT
  );
}

/**
 * Orders posts by `computePostScore` descending. Ties fall back to
 * newest-first so the ordering is always fully deterministic.
 * `commentCounts` is keyed by post id; posts missing from the map are
 * treated as having zero comments.
 */
export function rankPosts(posts: Post[], commentCounts: Record<string, number>, now: number): Post[] {
  return [...posts].sort((a, b) => {
    const scoreA = computePostScore(a, commentCounts[a.id] ?? 0, now);
    const scoreB = computePostScore(b, commentCounts[b.id] ?? 0, now);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.createdAt - a.createdAt;
  });
}

/** Posts shared to a specific group, in their original (storage) order. */
export function postsForGroup(posts: Post[], groupId: string): Post[] {
  return posts.filter((post) => post.groupId === groupId);
}

/** Posts written by a specific author, in their original (storage) order. */
export function postsForAuthor(posts: Post[], authorId: string): Post[] {
  return posts.filter((post) => post.authorId === authorId);
}
