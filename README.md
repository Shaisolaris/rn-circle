# Circle

Circle is a community feed app for small groups: post updates, react and
reply, join the groups you care about, and keep up with the people in your
circle. Built with Expo and React Native, with a plain-TypeScript core for
every rule that decides *what* the app shows, and a thin UI layer that just
renders it.

**Live preview (web export):** https://shaisolaris.github.io/rn-circle/

## Screens

| Screen | What it does |
| --- | --- |
| **Feed** | The community timeline: gradient avatars, author, post text with `@mentions` / `#hashtags` highlighted, an optional image block, like + comment counts, and relative timestamps. Posts are ranked by a mix of recency and engagement. Tapping a post opens its thread; tapping the heart toggles a like in place. |
| **Post thread** | The full post plus its comments, rendered as a tree so replies-to-replies are indented under their parent. A composer at the bottom adds a new top-level comment. |
| **Compose** | A focused screen for writing a new post, with a live character counter. Reachable from the feed (posts to the general feed) or from a group (pre-tagged with "Posting in `<group>`"). |
| **Groups** | Every community as a card: icon, name, description, member count, and a Join/Leave toggle. Tapping a card opens that group's own feed. |
| **Profile** | The signed-in member's header (avatar, bio, following/follower/post counts), the groups they've joined, and every post they've written. |

Navigation: a bottom tab bar for **Feed / Groups / Profile**, with **Thread**,
**Compose**, and **Group feed** pushed on top of it as stack screens.

## Architecture

```
App.tsx                    # composition root: SafeAreaProvider, ThemeProvider, RootNavigator
app.config.js               # Expo config; EXPO_BASE_PATH prefixes the web export for sub-path hosting
src/
  core/                      # pure logic - no React, no React Native, no store
    types.ts                 # domain model shared by logic, store, and UI
    feed.ts                  # like-toggle math + recency/engagement ranking
    text.ts                  # relative-time formatting, @mention/#hashtag parsing, avatar hashing
    counts.ts                # nested comment counting/flattening
    __tests__/                # hand-traced unit tests for the three files above
  data/
    seed.ts                  # deterministic seed data: 1 current user, 8 members, 4 groups, 12 posts, comments
  store/
    useAppStore.ts            # zustand store, persisted to AsyncStorage
    selectors.ts               # composes store state with core/ logic (ranking, counts) for screens
  theme/
    tokens.ts                  # light/dark tokens, accent blue, gradient avatar palette
    ThemeContext.tsx            # useColorScheme-driven theme provider
  navigation/
    types.ts                    # typed param lists for the tab + root stack navigators
    TabNavigator.tsx             # Feed / Groups / Profile bottom tabs
    RootNavigator.tsx             # native-stack wrapping the tabs + Thread/Compose/GroupFeed
  components/                    # presentational building blocks (Avatar, PostCard, CommentItem, ...)
  screens/                        # one file per screen, wiring store + core logic to components
```

The guiding rule is that anything that can be expressed as a plain function
of plain data lives in `src/core` and stays there - no imports from
`react`, `react-native`, or the store. `src/store` is the only place that
mutates anything, and it delegates the actual math (like toggling, ranking)
back to `src/core` rather than re-implementing it inline. Screens read from
the store through small selector hooks and pass plain props down to
presentational components.

State persists across restarts via `zustand/middleware`'s `persist`,
backed by `@react-native-async-storage/async-storage` - liking a post,
adding a comment, posting, and joining/leaving a group all survive an app
reload.

## Testing

All of `src/core` is covered by hand-traced unit tests under
`src/core/__tests__`: every non-trivial expected value in the test files is
computed inline in a comment before the assertion, rather than just copied
from a first run. Coverage includes:

- **`feed.ts`** - like-toggle math (including the "never below zero" guard
  and a round-trip check), the engagement/recency scoring formula, ranking
  order (with a worked example of an older-but-more-engaged post
  outranking a brand-new one), and the newest-first tie-break.
- **`text.ts`** - every relative-time bucket (`now`, minutes, hours, days,
  weeks, and the calendar-date fallback with/without a year), `@mention` /
  `#hashtag` span parsing (including back-to-back tokens, a lone token, and
  trailing punctuation that isn't part of a token), and the deterministic
  string-hash used to pick a stable avatar gradient.
- **`counts.ts`** - recursive comment counting and flattening on a
  three-level-deep reply tree, per-author counts, and thread depth.

Run the suite with:

```bash
npx jest
```

## Run it

Requirements: Node 20+, npm, and either a simulator/emulator, a physical
device with Expo Go, or a web browser.

```bash
npm install         # install dependencies
npm start            # start the Expo dev server (press i / a / w)
npm run ios           # run on the iOS simulator
npm run android        # run on an Android emulator
npm run web              # run in a browser

npm run typecheck         # tsc --noEmit
npx jest                    # run the unit tests
npm run export:web           # static web build to ./dist
```

To reproduce the app icon / splash / favicon (procedurally generated, no
external image assets), run:

```bash
node scripts/generate-assets.js
```

## License

MIT, see [LICENSE](./LICENSE).

---

Built by Shai.
