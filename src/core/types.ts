/**
 * Shared domain model for Circle. Kept dependency-free (no React Native,
 * no React) so it can be imported from pure logic, tests, and UI alike.
 */

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  followingCount: number;
  followerCount: number;
}

export interface PostImage {
  /** Deterministic seed used to pick a gradient from the theme palette. */
  paletteKey: string;
  /** Short caption shown on the image placeholder block. */
  label: string;
}

export interface Post {
  id: string;
  authorId: string;
  /** Null when the post was shared to the general feed, not a group. */
  groupId: string | null;
  text: string;
  image: PostImage | null;
  likeCount: number;
  likedByMe: boolean;
  /** Epoch milliseconds. */
  createdAt: number;
}

export interface CommentNode {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  /** Epoch milliseconds. */
  createdAt: number;
  replies: CommentNode[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  joined: boolean;
  /** Deterministic seed used to pick a gradient from the theme palette. */
  paletteKey: string;
}
