import {
  computeEngagementScore,
  computePostScore,
  computeRecencyScore,
  postsForAuthor,
  postsForGroup,
  rankPosts,
  toggleLike,
} from '../feed';
import type { Post } from '../types';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = 1_700_000_000_000;

function makePost(overrides: Partial<Post> & Pick<Post, 'id'>): Post {
  return {
    authorId: 'u1',
    groupId: null,
    text: 'post text',
    image: null,
    likeCount: 0,
    likedByMe: false,
    createdAt: NOW,
    ...overrides,
  };
}

describe('toggleLike', () => {
  it('liking an unliked post increments the count and flips the flag', () => {
    const post = makePost({ id: 'p1', likeCount: 10, likedByMe: false });
    const liked = toggleLike(post);
    expect(liked.likedByMe).toBe(true);
    expect(liked.likeCount).toBe(11);
  });

  it('unliking a liked post decrements the count and flips the flag', () => {
    const post = makePost({ id: 'p1', likeCount: 11, likedByMe: true });
    const unliked = toggleLike(post);
    expect(unliked.likedByMe).toBe(false);
    expect(unliked.likeCount).toBe(10);
  });

  it('toggling twice returns to the original like count (round trip)', () => {
    const post = makePost({ id: 'p1', likeCount: 4, likedByMe: false });
    const roundTripped = toggleLike(toggleLike(post));
    expect(roundTripped).toEqual(post);
  });

  it('never lets the like count go below zero when unliking from zero', () => {
    // Defensive guard for a like count that is already 0 while likedByMe
    // is somehow true (e.g. stale/merged persisted state).
    const post = makePost({ id: 'p1', likeCount: 0, likedByMe: true });
    expect(toggleLike(post).likeCount).toBe(0);
  });

  it('does not mutate the original post object', () => {
    const post = makePost({ id: 'p1', likeCount: 5, likedByMe: false });
    const snapshot = { ...post };
    toggleLike(post);
    expect(post).toEqual(snapshot);
  });
});

describe('computeEngagementScore', () => {
  it('weighs each like as 1 point and each comment as 2 points (hand-traced)', () => {
    // 5 likes * 1 + 3 comments * 2 = 5 + 6 = 11
    expect(computeEngagementScore(5, 3)).toBe(11);
  });

  it('is zero for a post with no likes and no comments', () => {
    expect(computeEngagementScore(0, 0)).toBe(0);
  });
});

describe('computeRecencyScore', () => {
  it('is at its 48-point maximum for a post created right now', () => {
    expect(computeRecencyScore(NOW, NOW)).toBe(48);
  });

  it('decays linearly: one day old loses 24 of the 48 points (hand-traced)', () => {
    expect(computeRecencyScore(NOW - 24 * HOUR, NOW)).toBe(24);
  });

  it('bottoms out at 0 once the post is older than the 48-hour window', () => {
    // 60 hours ago: 48 - 60 = -12, clamped to 0.
    expect(computeRecencyScore(NOW - 60 * HOUR, NOW)).toBe(0);
  });

  it('treats a future timestamp as "now" rather than a bonus above 48', () => {
    expect(computeRecencyScore(NOW + HOUR, NOW)).toBe(48);
  });
});

describe('computePostScore', () => {
  it('adds engagement to half the recency score (hand-traced)', () => {
    // engagement(2, 0) = 2; recency(now, now) = 48 * 0.5 = 24; total 26.
    const post = makePost({ id: 'p1', likeCount: 2, createdAt: NOW });
    expect(computePostScore(post, 0, NOW)).toBe(26);
  });
});

describe('rankPosts', () => {
  it('lets a highly-engaged older post outrank a brand-new low-engagement one', () => {
    // Hand-traced scores (see computePostScore spec above for the formula):
    //   a: brand new, 2 likes      -> engagement 2  + recency 48*0.5=24 -> 26
    //   b: 10 days old, 50 likes   -> engagement 50 + recency 0        -> 50
    //   c: 3 days old, 2 likes     -> engagement 2  + recency 0        -> 2
    // Expected order by score desc: b (50) > a (26) > c (2).
    const a = makePost({ id: 'a', likeCount: 2, createdAt: NOW });
    const b = makePost({ id: 'b', likeCount: 50, createdAt: NOW - 10 * DAY });
    const c = makePost({ id: 'c', likeCount: 2, createdAt: NOW - 72 * HOUR });

    const ranked = rankPosts([a, b, c], {}, NOW);

    expect(ranked.map((post) => post.id)).toEqual(['b', 'a', 'c']);
  });

  it('breaks an exact score tie by newest-first', () => {
    // Both are outside the 48h recency window and have zero engagement,
    // so both score exactly 0. d is 100h old, e is 200h old -> d is newer.
    const d = makePost({ id: 'd', likeCount: 0, createdAt: NOW - 100 * HOUR });
    const e = makePost({ id: 'e', likeCount: 0, createdAt: NOW - 200 * HOUR });

    const ranked = rankPosts([e, d], {}, NOW);

    expect(ranked.map((post) => post.id)).toEqual(['d', 'e']);
  });

  it('folds in comment counts from the supplied map, defaulting missing ids to zero', () => {
    // Both posts are brand new, so both get the full 48 * 0.5 = 24 point
    // recency bonus, and the comment map is what decides the outcome.
    //   f: 1 like, 10 comments (from map) -> engagement 1 + 20 = 21, total 45
    //   g: 5 likes, missing from map -> comment count defaults to 0,
    //      engagement 5, total 29
    // f (45) should outrank g (29).
    const f = makePost({ id: 'f', likeCount: 1, createdAt: NOW });
    const g = makePost({ id: 'g', likeCount: 5, createdAt: NOW });

    const ranked = rankPosts([g, f], { f: 10 }, NOW);

    expect(ranked.map((post) => post.id)).toEqual(['f', 'g']);
  });

  it('does not mutate the input array', () => {
    const a = makePost({ id: 'a', likeCount: 1, createdAt: NOW - 10 * DAY });
    const b = makePost({ id: 'b', likeCount: 99, createdAt: NOW });
    const input = [a, b];
    rankPosts(input, {}, NOW);
    expect(input).toEqual([a, b]);
  });
});

describe('postsForGroup', () => {
  it('returns only posts matching the given group id', () => {
    const posts = [
      makePost({ id: 'a', groupId: 'g1' }),
      makePost({ id: 'b', groupId: 'g2' }),
      makePost({ id: 'c', groupId: 'g1' }),
      makePost({ id: 'd', groupId: null }),
    ];
    expect(postsForGroup(posts, 'g1').map((post) => post.id)).toEqual(['a', 'c']);
  });

  it('returns an empty array when no posts match', () => {
    const posts = [makePost({ id: 'a', groupId: 'g1' })];
    expect(postsForGroup(posts, 'missing-group')).toEqual([]);
  });
});

describe('postsForAuthor', () => {
  it('returns only posts matching the given author id', () => {
    const posts = [
      makePost({ id: 'a', authorId: 'u1' }),
      makePost({ id: 'b', authorId: 'u2' }),
      makePost({ id: 'c', authorId: 'u1' }),
    ];
    expect(postsForAuthor(posts, 'u1').map((post) => post.id)).toEqual(['a', 'c']);
  });
});
