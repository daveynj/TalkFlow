# TalkFlow AI: Student Tutor

## Overview
A B2C English language learning platform with an AI tutor that provides CEFR-aligned interactive lessons, speech recognition, text-to-speech, gamification (XP/streaks), and spaced repetition vocabulary review. Features Inworld AI integration for real-time speech-to-speech conversation practice.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui, routed with `wouter`
- **Backend**: Express.js with session-based auth (passport-local)
- **Database**: PostgreSQL with Drizzle ORM
- **Voice (Lessons)**: Web Speech API for TTS and STT (browser-native)
- **Voice (AI Tutor)**: Inworld AI Realtime API via WebSocket proxy for speech-to-speech

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-managed by Replit)
- `INWORLD_API_KEY` - Base64 API key for Inworld AI Realtime API

## Database Schema
- `users` - Auth, CEFR level, XP, streaks, subscription tier
- `lessons` - Title, description, CEFR level, JSON content with lesson steps
- `lesson_progress` - Per-user per-lesson completion status and scores
- `vocabulary_words` - Words with meanings, examples, linked to lessons
- `user_vocabulary` - SRS (spaced repetition) tracking per user per word

## Key Files
- `shared/schema.ts` - Drizzle schema + Zod validation
- `server/routes.ts` - API routes with auth middleware + Inworld WebSocket proxy
- `server/storage.ts` - Database storage interface
- `server/seed.ts` - Seeds 5 lessons with vocabulary
- `server/db.ts` - Database connection
- `client/src/hooks/use-auth.ts` - Auth hook
- `client/src/hooks/use-inworld-voice.ts` - Inworld AI voice hook (WebSocket audio streaming)
- `client/src/components/voice-agent.tsx` - Voice chat component with transcript
- `client/src/pages/home.tsx` - Landing page
- `client/src/pages/auth.tsx` - Login/Register
- `client/src/pages/dashboard.tsx` - Student dashboard with progress
- `client/src/pages/lesson.tsx` - Interactive lesson canvas (with floating voice agent)
- `client/src/pages/talk.tsx` - Dedicated speech-to-speech conversation page

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
- `GET /api/inworld/config` - Inworld WebRTC connection config
- `WebSocket /ws/inworld` - Inworld AI voice proxy (server proxies between browser and Inworld API)

## Inworld AI Integration
The server acts as a WebSocket proxy between the browser and Inworld's Realtime API:
1. Browser connects to `/ws/inworld` with optional `context` and `level` query params
2. Server opens a WebSocket to `wss://api.inworld.ai/api/v1/realtime/session`
3. Server configures the session with TalkFlow-specific instructions based on CEFR level
4. Audio is streamed as base64 PCM16 at 24kHz between browser and Inworld
5. The frontend hook (`use-inworld-voice.ts`) handles mic capture, audio playback, and transcript display

## Lesson Content Structure
Each lesson has a `content` JSON field with `steps` array. Step types:
- `intro` - Welcome + repeat-after-me sentence
- `vocabulary` - Flashcards with audio
- `fill-blank` - Fill in the blank exercise
- `multiple-choice` - Multiple choice quiz
- `unscramble` - Drag words into correct order
