import { countComments, countCommentsByAuthor, flattenComments, maxThreadDepth } from '../counts';
import type { CommentNode } from '../types';

function makeComment(overrides: Partial<CommentNode> & Pick<CommentNode, 'id'>): CommentNode {
  return {
    postId: 'p1',
    authorId: 'u1',
    text: 'comment text',
    createdAt: 0,
    replies: [],
    ...overrides,
  };
}

// Shared fixture, three levels deep:
//   c1 (u2)
//     └─ c2 (u3)
//          └─ c4 (u1)
//   c3 (u4)
const tree: CommentNode[] = [
  makeComment({
    id: 'c1',
    authorId: 'u2',
    createdAt: 1,
    replies: [
      makeComment({
        id: 'c2',
        authorId: 'u3',
        createdAt: 2,
        replies: [makeComment({ id: 'c4', authorId: 'u1', createdAt: 4 })],
      }),
    ],
  }),
  makeComment({ id: 'c3', authorId: 'u4', createdAt: 3 }),
];

describe('countComments', () => {
  it('counts an empty tree as zero', () => {
    expect(countComments([])).toBe(0);
  });

  it('counts a single top-level comment with no replies as one', () => {
    expect(countComments([makeComment({ id: 'solo' })])).toBe(1);
  });

  it('counts nested replies at every depth (hand-traced)', () => {
    // c1 contributes 1 (itself) + countComments([c2]).
    //   c2 contributes 1 (itself) + countComments([c4]).
    //     c4 contributes 1 (itself) + countComments([]) = 1.
    //   so c2's branch = 1 + 1 = 2, and c1's branch = 1 + 2 = 3.
    // c3 contributes 1 (itself, no replies).
    // total = 3 + 1 = 4.
    expect(countComments(tree)).toBe(4);
  });
});

describe('flattenComments', () => {
  it('returns an empty array for an empty tree', () => {
    expect(flattenComments([])).toEqual([]);
  });

  it('walks depth-first: a node is followed by all of its descendants before the next sibling', () => {
    // Depth-first from the fixture: c1, then c1's descendants (c2, c4),
    // then the next top-level sibling c3.
    expect(flattenComments(tree).map((node) => node.id)).toEqual(['c1', 'c2', 'c4', 'c3']);
  });

  it('flattened length always matches countComments for the same tree', () => {
    expect(flattenComments(tree)).toHaveLength(countComments(tree));
  });
});

describe('countCommentsByAuthor', () => {
  it('counts a nested reply from the given author (hand-traced: only c4 is authored by u1)', () => {
    expect(countCommentsByAuthor(tree, 'u1')).toBe(1);
  });

  it('counts multiple comments from the same author across different branches', () => {
    const multi: CommentNode[] = [
      makeComment({ id: 'x1', authorId: 'u5' }),
      makeComment({ id: 'x2', authorId: 'u6', replies: [makeComment({ id: 'x3', authorId: 'u5' })] }),
    ];
    expect(countCommentsByAuthor(multi, 'u5')).toBe(2);
  });

  it('returns zero for an author with no comments in the tree', () => {
    expect(countCommentsByAuthor(tree, 'nobody')).toBe(0);
  });
});

describe('maxThreadDepth', () => {
  it('is zero for an empty tree', () => {
    expect(maxThreadDepth([])).toBe(0);
  });

  it('is one for comments with no replies', () => {
    expect(maxThreadDepth([makeComment({ id: 'a' }), makeComment({ id: 'b' })])).toBe(1);
  });

  it('matches the deepest reply chain in a mixed tree (hand-traced: c1 -> c2 -> c4 is 3 deep)', () => {
    expect(maxThreadDepth(tree)).toBe(3);
  });
});
