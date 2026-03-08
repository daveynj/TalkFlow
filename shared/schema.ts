import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json, serial, date, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  cefrLevel: text("cefr_level").notNull().default("A1"),
  xp: integer("xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  placementCompleted: boolean("placement_completed").notNull().default(false),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cefrLevel: text("cefr_level").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(15),
  sortOrder: integer("sort_order").notNull().default(0),
  content: json("content").notNull(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  status: text("status").notNull().default("not_started"),
  score: integer("score"),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at"),
});

export const vocabularyWords = pgTable("vocabulary_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  exampleSentence: text("example_sentence").notNull(),
  cefrLevel: text("cefr_level").notNull(),
  lessonId: integer("lesson_id"),
});

export const userVocabulary = pgTable("user_vocabulary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wordId: integer("word_id").notNull(),
  nextReviewDate: date("next_review_date").notNull(),
  interval: integer("interval").notNull().default(1),
  easeFactor: real("ease_factor").notNull().default(2.5),
  repetitions: integer("repetitions").notNull().default(0),
  correct: boolean("correct").notNull().default(false),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({ id: true });
export const insertVocabularyWordSchema = createInsertSchema(vocabularyWords).omit({ id: true });
export const insertUserVocabularySchema = createInsertSchema(userVocabulary).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type VocabularyWord = typeof vocabularyWords.$inferSelect;
export type InsertVocabularyWord = z.infer<typeof insertVocabularyWordSchema>;
export type UserVocabulary = typeof userVocabulary.$inferSelect;
export type InsertUserVocabulary = z.infer<typeof insertUserVocabularySchema>;

// Lesson content types
export type LessonStep = {
  type: "intro" | "vocabulary" | "fill-blank" | "unscramble" | "multiple-choice" | "reading";
  aiMessage: string;
  targetSentence?: string;
  words?: { word: string; meaning: string; example?: string }[];
  question?: string;
  options?: string[];
  answer?: string;
  text?: string;
  highlightedWords?: string[];
  scrambledWords?: string[];
  correctOrder?: string[];
};

export type LessonContent = {
  steps: LessonStep[];
};

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  displayName: z.string().min(1),
});
