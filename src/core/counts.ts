/**
 * Pure helpers for counting and flattening comment trees. Comments are
 * stored as a forest (one tree of replies per top-level comment), so a
 * post's total comment count has to walk the whole tree, not just the
 * top-level array length.
 */
import type { CommentNode } from './types';

/** Total number of comments in the tree, including every nested reply. */
export function countComments(nodes: CommentNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countComments(node.replies), 0);
}

/** Depth-first flattening of a comment tree into a single ordered list. */
export function flattenComments(nodes: CommentNode[]): CommentNode[] {
  return nodes.reduce<CommentNode[]>((acc, node) => {
    acc.push(node);
    acc.push(...flattenComments(node.replies));
    return acc;
  }, []);
}

/** Counts how many comments (at any depth) a given author has on a post. */
export function countCommentsByAuthor(nodes: CommentNode[], authorId: string): number {
  return flattenComments(nodes).filter((node) => node.authorId === authorId).length;
}

/** Depth of the deepest reply chain (a post with no comments has depth 0). */
export function maxThreadDepth(nodes: CommentNode[]): number {
  return nodes.reduce((max, node) => Math.max(max, 1 + maxThreadDepth(node.replies)), 0);
}
