/**
 * Deterministic seed data for Circle: one current user, eight other
 * members, four groups, twelve posts, and a handful of comment threads
 * (including a three-level-deep reply chain to exercise nested counting).
 *
 * Timestamps are expressed as an offset from the moment the app starts
 * ("now"), not as fixed epoch values. That keeps "3h ago" / "2d ago"
 * labels correct no matter when the app is actually run, while the
 * *shape* of the data - who posted what, in what order, with how much
 * engagement - is fully deterministic.
 */
import type { CommentNode, Group, Post, User } from '../core/types';

const NOW = Date.now();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const minutesAgo = (n: number): number => NOW - n * MINUTE;
const hoursAgo = (n: number): number => NOW - n * HOUR;
const daysAgo = (n: number): number => NOW - n * DAY;

export const currentUserId = 'u1';

export const seedUsers: Record<string, User> = {
  u1: {
    id: 'u1',
    username: 'norakade',
    displayName: 'Nora Kade',
    bio: 'Product designer. Slow mornings, fast prototypes.',
    followingCount: 186,
    followerCount: 412,
  },
  u2: {
    id: 'u2',
    username: 'theobram',
    displayName: 'Theo Bramwell',
    bio: 'Urban gardener, weekend cyclist, permanent snack enthusiast.',
    followingCount: 94,
    followerCount: 201,
  },
  u3: {
    id: 'u3',
    username: 'priyacodes',
    displayName: 'Priya Anand',
    bio: 'Building tiny developer tools. Coffee-powered.',
    followingCount: 260,
    followerCount: 1830,
  },
  u4: {
    id: 'u4',
    username: 'callumrhee',
    displayName: 'Callum Rhee',
    bio: 'Trail runner. Photographs fog for a hobby.',
    followingCount: 150,
    followerCount: 388,
  },
  u5: {
    id: 'u5',
    username: 'wrenito',
    displayName: 'Wren Ito',
    bio: 'Ceramics and code. The kiln is always warm.',
    followingCount: 76,
    followerCount: 540,
  },
  u6: {
    id: 'u6',
    username: 'sanaokafor',
    displayName: 'Sana Okafor',
    bio: 'Reads sci-fi, writes about it badly.',
    followingCount: 310,
    followerCount: 275,
  },
  u7: {
    id: 'u7',
    username: 'devmalick',
    displayName: 'Dev Malick',
    bio: 'Home cook chasing the perfect sourdough crumb.',
    followingCount: 122,
    followerCount: 890,
  },
  u8: {
    id: 'u8',
    username: 'irisvoss',
    displayName: 'Iris Voss',
    bio: 'Analog photography, digital day job.',
    followingCount: 88,
    followerCount: 640,
  },
  u9: {
    id: 'u9',
    username: 'kofibaidoo',
    displayName: 'Kofi Baidoo',
    bio: 'Board games every Friday. Always down for Catan.',
    followingCount: 143,
    followerCount: 210,
  },
};

export const seedGroups: Group[] = [
  {
    id: 'g1',
    name: 'Trail Runners Club',
    description: 'Dirt over pavement. Route drops, shoe reviews, and post-run pancakes.',
    memberCount: 482,
    joined: true,
    paletteKey: 'g1',
  },
  {
    id: 'g2',
    name: 'Home Bakers Guild',
    description: 'Sourdough starters, burnt bakes, and the wins in between.',
    memberCount: 915,
    joined: false,
    paletteKey: 'g2',
  },
  {
    id: 'g3',
    name: 'Indie Makers',
    description: 'Build in public. Ship small, ship often, celebrate the boring parts.',
    memberCount: 1240,
    joined: true,
    paletteKey: 'g3',
  },
  {
    id: 'g4',
    name: 'Ceramics & Craft',
    description: 'Wheel throwing, glaze mishaps, and mugs that lean slightly to one side.',
    memberCount: 367,
    joined: false,
    paletteKey: 'g4',
  },
];

export const seedPosts: Post[] = [
  {
    id: 'p1',
    authorId: 'u3',
    groupId: 'g3',
    text: "Shipped the smallest possible version of the export flow today. No settings screen, no options, just a button that works. #buildinpublic #shipit",
    image: null,
    likeCount: 4,
    likedByMe: false,
    createdAt: minutesAgo(6),
  },
  {
    id: 'p2',
    authorId: 'u1',
    groupId: null,
    text: "Redesigned my onboarding flow for the third time this month. Third time's the charm, right? Feedback welcome from anyone who has five minutes.",
    image: { paletteKey: 'p2-flow', label: 'Onboarding flow, v3' },
    likeCount: 12,
    likedByMe: true,
    createdAt: minutesAgo(45),
  },
  {
    id: 'p3',
    authorId: 'u7',
    groupId: 'g2',
    text: '58% hydration, 4 hour bulk ferment, cold proof overnight. Best crumb I have gotten yet. @sanaokafor you have to try this ratio. #sourdough',
    image: { paletteKey: 'p3-loaf', label: 'Sunday loaf, sliced' },
    likeCount: 37,
    likedByMe: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'p4',
    authorId: 'u4',
    groupId: 'g1',
    text: "Fog rolled in at mile 9 and the whole ridge just disappeared. Slowed way down, took some photos instead. Sometimes the run isn't about the pace. #trailrunning",
    image: { paletteKey: 'p4-ridge', label: 'Ridge line, fogged in' },
    likeCount: 64,
    likedByMe: true,
    createdAt: hoursAgo(5),
  },
  {
    id: 'p5',
    authorId: 'u6',
    groupId: null,
    text: 'Finished a novel in two sittings and now I have nothing to do with my hands. Recommendations for something equally unputdownable? @wrenito you always have good ones.',
    image: null,
    likeCount: 9,
    likedByMe: false,
    createdAt: hoursAgo(9),
  },
  {
    id: 'p6',
    authorId: 'u5',
    groupId: 'g4',
    text: "Fourth attempt at a pulled handle that doesn't look like a question mark. Progress, technically. #ceramics #wheelthrown",
    image: { paletteKey: 'p6-mug', label: 'Mug, handle attempt four' },
    likeCount: 51,
    likedByMe: false,
    createdAt: daysAgo(1),
  },
  {
    id: 'p7',
    authorId: 'u9',
    groupId: null,
    text: 'Lost a three hour game of Catan on the last roll of the game. Devastating. 10/10 would lose again. Friday game night, same time next week?',
    image: null,
    likeCount: 21,
    likedByMe: true,
    createdAt: hoursAgo(34),
  },
  {
    id: 'p8',
    authorId: 'u2',
    groupId: null,
    text: 'First tomatoes of the season came in this weekend. Balcony garden earning its keep. @devmalick these are yours if you want to turn them into something.',
    image: { paletteKey: 'p8-tomatoes', label: 'Balcony tomatoes' },
    likeCount: 28,
    likedByMe: false,
    createdAt: daysAgo(3),
  },
  {
    id: 'p9',
    authorId: 'u8',
    groupId: null,
    text: 'Got a roll of film back from a trip I took in the spring. Half the shots are blown out and I love every single one of them. #film #analog',
    image: { paletteKey: 'p9-contact', label: 'Contact sheet, spring roll' },
    likeCount: 46,
    likedByMe: false,
    createdAt: daysAgo(5),
  },
  {
    id: 'p10',
    authorId: 'u3',
    groupId: 'g3',
    text: 'One month of building in public: 340 signups, 12 paying, and a much shorter todo list than I expected. Numbers post incoming. #buildinpublic',
    image: null,
    likeCount: 88,
    likedByMe: true,
    createdAt: daysAgo(9),
  },
  {
    id: 'p11',
    authorId: 'u4',
    groupId: 'g1',
    text: 'Signed up for the fall 50k before I could talk myself out of it. Training plan starts Monday, terror starts now. #trailrunning #50k',
    image: null,
    likeCount: 73,
    likedByMe: false,
    createdAt: daysAgo(16),
  },
  {
    id: 'p12',
    authorId: 'u1',
    groupId: 'g3',
    text: "Three weeks into building Circle in public. Today's win: the like button finally feels satisfying to tap. Small things. #buildinpublic",
    image: { paletteKey: 'p12-sketch', label: 'Early UI sketch' },
    likeCount: 102,
    likedByMe: true,
    createdAt: daysAgo(30),
  },
];

function comment(
  id: string,
  postId: string,
  authorId: string,
  text: string,
  createdAt: number,
  replies: CommentNode[] = []
): CommentNode {
  return { id, postId, authorId, text, createdAt, replies };
}

export const seedComments: Record<string, CommentNode[]> = {
  p1: [comment('c-p1-1', 'p1', 'u9', 'Love this. The best feature is often the one you did not build. #buildinpublic', minutesAgo(3))],

  p2: [
    comment('c-p2-1', 'p2', 'u3', 'This feels so much cleaner than v2 already. What made you cut the tooltip step?', minutesAgo(30), [
      comment(
        'c-p2-1-1',
        'p2',
        'u1',
        'Nobody read them! Turns out a single good empty state beats four tooltips.',
        minutesAgo(22),
        [comment('c-p2-1-1-1', 'p2', 'u3', 'Ha, fair. Stealing that line for my own onboarding.', minutesAgo(15))]
      ),
    ]),
    comment('c-p2-2', 'p2', 'u6', 'The illustration on step two is really charming, who made it?', minutesAgo(10)),
  ],

  p3: [
    comment('c-p3-1', 'p3', 'u6', "Okay I'm trying this ratio this weekend, you've converted me.", hoursAgo(1), [
      comment('c-p3-1-1', 'p3', 'u7', 'Report back! Screenshot me the crumb shot @sanaokafor.', minutesAgo(40)),
    ]),
    comment('c-p3-2', 'p3', 'u2', '58% still scares me but your loaves always look incredible.', minutesAgo(25)),
  ],

  p4: [
    comment('c-p4-1', 'p4', 'u8', 'The light in that second shot is unreal. Fog is so underrated for photos.', hoursAgo(3)),
    comment('c-p4-2', 'p4', 'u1', 'This makes me want to take up trail running just for the photo ops.', hoursAgo(2)),
    comment('c-p4-3', 'p4', 'u4', 'Ha, honestly half the reason I keep going back out there.', hoursAgo(1)),
  ],

  p9: [comment('c-p9-1', 'p9', 'u5', 'Blown out or not, the third one is a genuinely great photo.', daysAgo(4))],

  p10: [
    comment(
      'c-p10-1',
      'p10',
      'u1',
      '340 signups in a month is fantastic, congrats! What channel is converting best?',
      daysAgo(8),
      [
        comment(
          'c-p10-1-1',
          'p10',
          'u3',
          'Mostly a single post that did better than expected, honestly. Still figuring out repeatability.',
          daysAgo(7)
        ),
      ]
    ),
    comment('c-p10-2', 'p10', 'u9', '12 paying users already feels like the hard part is done. Nice work.', daysAgo(6)),
  ],

  p12: [
    comment('c-p12-1', 'p12', 'u5', 'Been watching this build from the start, the avatar gradients are such a nice touch.', daysAgo(29)),
    comment('c-p12-2', 'p12', 'u7', "Following along, can't wait to actually use this instead of just admiring screenshots. #buildinpublic", daysAgo(28)),
  ],
};
