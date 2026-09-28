# `GameWelcomeScreen` — Reusable Template

Two new files were created at:
- [`GameWelcomeScreen.jsx`](file:///c:/projects/Boy-game/src/components/GameWelcomeScreen/GameWelcomeScreen.jsx)
- [`GameWelcomeScreen.css`](file:///c:/projects/Boy-game/src/components/GameWelcomeScreen/GameWelcomeScreen.css)

---

## 1. Structure Breakdown

The UI is made of **3 zones**:

```
┌──────────────────────────────────────────────┐
│ [HEADER]  Stats Badge (absolute, top-left)   │
├──────────────────────────────────────────────┤
│                                              │
│ [BODY]    Hero / Description Image           │
│           (centered, auto-margins)           │
│                                              │
├──────────────────────────────────────────────┤
│ [FOOTER]  [ Exit Btn ]   [ Start Btn ]       │
└──────────────────────────────────────────────┘
```

| Zone | CSS Class | Role |
|---|---|---|
| Root container | `.gws-screen` | Full-screen fixed background, flex column |
| Header | `.gws-header` / `.gws-stats-bg` | Absolute stats badge, shows counts |
| Body | `.gws-body` / `.gws-hero-img` | Centered hero image with hover effect |
| Footer | `.gws-footer` / `.gws-footer-buttons` | Row of two action buttons |

---

## 2. Props Reference

| Prop | Type | Required | Description |
|---|---|---|---|
| `backgroundImage` | `string` | ✅ | Full-screen BG image import |
| `statsBgImage` | `string` | ✅ | Badge frame background image |
| `statLeftIcon` | `string` | ✅ | Left icon in badge (e.g. question coin) |
| `statLeftAlt` | `string` | — | Alt text for left icon |
| `statLeftValue` | `number` | ✅ | Primary count (e.g. number of questions) |
| `statRightValue` | `number` | ✅ | Derived/highlighted value (yellow) |
| `statRightIcon` | `string` | ✅ | Right icon in badge (e.g. reward coin) |
| `statRightAlt` | `string` | — | Alt text for right icon |
| `heroImage` | `string` | ✅ | Main description/how-to-play image |
| `heroAlt` | `string` | — | Alt text for hero image |
| `startButtonImage` | `string` | ✅ | Start button graphic (used as CSS bg) |
| `exitButtonImage` | `string` | ✅ | Exit button graphic (used as `<img>`) |
| `onStart` | `function` | ✅ | Called on Start click |
| `onExit` | `function` | — | Called on Exit click. Defaults to `window.history.back()` |
| `isLoading` | `boolean` | — | Disables start button while loading |
| `isReady` | `boolean` | — | Disables start button when no data is ready |

---

## 3. How to Use It

### Step 1 — Import the component

```jsx
import GameWelcomeScreen from '../components/GameWelcomeScreen/GameWelcomeScreen';
```

### Step 2 — Import your assets

```jsx
import myBG        from '../assets/my-game-bg.png';
import myBadgeBG   from '../assets/QuestionNumber.png';  // can reuse shared assets
import qCoin       from '../assets/QuestionCoin.png';
import daddCoin    from '../assets/daddcoin.webp';
import myHero      from '../assets/my-game-description.png';
import myStart     from '../assets/my-game-start.png';
import myExit      from '../assets/exit_transparent.png'; // can reuse
```

### Step 3 — Render the component

```jsx
export default function MyGameWelcome({ questionsCount, isLoading, onStart }) {
  return (
    <GameWelcomeScreen
      backgroundImage={myBG}
      statsBgImage={myBadgeBG}
      statLeftIcon={qCoin}
      statLeftAlt="Questions"
      statLeftValue={questionsCount}
      statRightValue={questionsCount * 2}   // e.g. double points for this game
      statRightIcon={daddCoin}
      statRightAlt="Dadd Points"
      heroImage={myHero}
      heroAlt="How to Play My Game"
      startButtonImage={myStart}
      exitButtonImage={myExit}
      onStart={onStart}
      isLoading={isLoading}
      isReady={questionsCount > 0}
    />
  );
}
```

---

## 4. Migrating Your Existing `WelcomeScreen`

You can now slim down the **original** `WelcomeScreen.jsx` to just be a thin wrapper:

```jsx
// src/WelcomeScreen/WelcomeScreen.jsx
import React from 'react';
import GameWelcomeScreen from '../components/GameWelcomeScreen/GameWelcomeScreen';

import bgImg       from '../BG.png';
import badgeBG     from '../assets/QuestionNumber.png';
import qCoin       from '../assets/QuestionCoin.png';
import daddCoin    from '../assets/daddcoin.webp';
import description from '../assets/description.png';
import startBtn    from '../assets/start_transparent.png';
import exitBtn     from '../assets/exit_transparent.png';

export default function WelcomeScreen({ questionsCount, isLoading, onStart }) {
  return (
    <GameWelcomeScreen
      backgroundImage={bgImg}
      statsBgImage={badgeBG}
      statLeftIcon={qCoin}
      statLeftAlt="Questions"
      statLeftValue={questionsCount}
      statRightValue={questionsCount * 1}
      statRightIcon={daddCoin}
      statRightAlt="Dadd Points"
      heroImage={description}
      heroAlt="How to Play"
      startButtonImage={startBtn}
      exitButtonImage={exitBtn}
      onStart={onStart}
      isLoading={isLoading}
      isReady={questionsCount > 0}
    />
  );
}
```

> [!TIP]
> The original `WelcomeScreen.css` can be **deleted** once you migrate the original `WelcomeScreen.jsx` to use `GameWelcomeScreen`. All the styles now live in `GameWelcomeScreen.css`.

---

## 5. CSS Class Prefix Convention

All classes use the `.gws-` prefix (**G**ame **W**elcome **S**creen) to avoid any collision with other pages' stylesheets. You never need to touch `GameWelcomeScreen.css` per-game — only swap the images/props.
