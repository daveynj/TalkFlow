# TalkFlow AI: Student Tutor

## Overview
A B2C English language learning platform with an AI tutor that provides CEFR-aligned interactive lessons, speech recognition, text-to-speech, gamification (XP/streaks), and spaced repetition vocabulary review.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui, routed with `wouter`
- **Backend**: Express.js with session-based auth (passport-local)
- **Database**: PostgreSQL with Drizzle ORM
- **Voice**: Web Speech API for TTS and STT (browser-native)

## Database Schema
- `users` - Auth, CEFR level, XP, streaks, subscription tier
- `lessons` - Title, description, CEFR level, JSON content with lesson steps
- `lesson_progress` - Per-user per-lesson completion status and scores
- `vocabulary_words` - Words with meanings, examples, linked to lessons
- `user_vocabulary` - SRS (spaced repetition) tracking per user per word

## Key Files
- `shared/schema.ts` - Drizzle schema + Zod validation
- `server/routes.ts` - API routes with auth middleware
- `server/storage.ts` - Database storage interface
- `server/seed.ts` - Seeds 5 lessons with vocabulary
- `server/db.ts` - Database connection
- `client/src/hooks/use-auth.ts` - Auth hook
- `client/src/pages/home.tsx` - Landing page
- `client/src/pages/auth.tsx` - Login/Register
- `client/src/pages/dashboard.tsx` - Student dashboard with progress
- `client/src/pages/lesson.tsx` - Interactive lesson canvas

## API Routes
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `PATCH /api/user/profile` - Update CEFR level
- `POST /api/user/streak` - Update daily streak
- `GET /api/lessons` - List lessons (filter by level)
- `GET /api/lessons/:id` - Get lesson with content
- `GET /api/progress` - User's lesson progress
- `POST /api/progress` - Update lesson progress (+50 XP on completion)
- `GET /api/vocabulary` - Vocabulary words
- `GET /api/vocabulary/review` - SRS words due for review
- `GET /api/vocabulary/review/count` - Count of words due
- `POST /api/vocabulary/review` - Submit review result (SM-2 algorithm)

## Lesson Content Structure
Each lesson has a `content` JSON field with `steps` array. Step types:
- `intro` - Welcome + repeat-after-me sentence
- `vocabulary` - Flashcards with audio
- `fill-blank` - Fill in the blank exercise
- `multiple-choice` - Multiple choice quiz
- `unscramble` - Drag words into correct order
