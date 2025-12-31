# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router (React 19, TypeScript)
- **Firebase** - Auth (email/Google) + Firestore
- **UI**: Tailwind CSS 4 + Radix UI components (shadcn/ui pattern)
- **State**: Zustand for global state, React Context for auth/theme

### Data Model

**Card structure** (vocabulary flashcards):
```typescript
{
  vocab: string;          // Source language word
  pronunciation: string;  // Phonetic/reading (display only)
  meaning: string;        // Target language translation
  example: string;        // Example sentence
  // SRS fields: nextReview, interval, easeFactor, repetitions
}
```

**Deck** has `sourceLang` and `targetLang` (Language type) to configure TTS voices.

### Key Layers

1. **`services/`** - Firebase CRUD operations
   - `card.ts` - Includes SM-2 spaced repetition algorithm in `reviewCard()`
   - `importExport.ts` - JSON/CSV import/export with PapaParse

2. **`models/`** - Firestore document types and converters (`toCard`, `toCardDocument`)

3. **`hooks/`**
   - `useStudy` - Study session state machine (start, flip, answer, end)
   - `useTTS` - Text-to-speech with multi-language support (auto-detects Thai/English segments)
   - `useCards`, `useDecks` - CRUD hooks

4. **`contexts/`**
   - `AuthContext` - Firebase auth state, provides `firebaseUser` and `user`
   - `ThemeContext` - Dark/light/system theme

### Import/Export Format (v2.0)
```json
{
  "version": "2.0",
  "deck": { "name", "description", "category", "sourceLang", "targetLang" },
  "cards": [{ "vocab", "pronunciation", "meaning", "example" }]
}
```
Legacy format (`front`/`back`) is auto-converted on import.

## Firebase Setup

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firestore Collections
- `users` - User profiles and settings
- `decks` - Flashcard decks (per user)
- `cards` - Individual cards with SRS metadata
- `studySessions` - Session history for progress tracking

### Firestore Indexes Required
Cards collection needs composite indexes for:
- `userId` + `deckId` + `nextReview` (for review queries)
- `userId` + `nextReview` (for cross-deck review)

## Conventions

- All page components use `'use client'` directive
- Protected routes wrap content with `<ProtectedRoute>`
- Toast notifications via `sonner` (`toast.success()`, `toast.error()`)
- UI components in `components/ui/` follow shadcn/ui patterns


## App running port 3005