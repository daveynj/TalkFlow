import { eq, and, lte, asc } from "drizzle-orm";
import { db } from "./db";
import {
  users, lessons, lessonProgress, vocabularyWords, userVocabulary,
  type User, type InsertUser, type Lesson, type InsertLesson,
  type LessonProgress, type InsertLessonProgress,
  type VocabularyWord, type InsertVocabularyWord,
  type UserVocabulary, type InsertUserVocabulary,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  getLessons(cefrLevel?: string): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;

  getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined>;
  getUserProgress(userId: number): Promise<LessonProgress[]>;
  upsertLessonProgress(data: InsertLessonProgress): Promise<LessonProgress>;

  getVocabularyWords(lessonId?: number, cefrLevel?: string): Promise<VocabularyWord[]>;
  createVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord>;

  getUserVocabularyForReview(userId: number): Promise<(UserVocabulary & { word: VocabularyWord })[]>;
  upsertUserVocabulary(data: InsertUserVocabulary): Promise<UserVocabulary>;
  getUserVocabularyCount(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getLessons(cefrLevel?: string): Promise<Lesson[]> {
    if (cefrLevel) {
      return db.select().from(lessons).where(eq(lessons.cefrLevel, cefrLevel)).orderBy(asc(lessons.sortOrder));
    }
    return db.select().from(lessons).orderBy(asc(lessons.sortOrder));
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [created] = await db.insert(lessons).values(lesson).returning();
    return created;
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    const [progress] = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    return progress;
  }

  async getUserProgress(userId: number): Promise<LessonProgress[]> {
    return db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  }

  async upsertLessonProgress(data: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getLessonProgress(data.userId, data.lessonId);
    if (existing) {
      const [updated] = await db.update(lessonProgress).set(data).where(eq(lessonProgress.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(lessonProgress).values(data).returning();
    return created;
  }

  async getVocabularyWords(lessonId?: number, cefrLevel?: string): Promise<VocabularyWord[]> {
    if (lessonId) {
      return db.select().from(vocabularyWords).where(eq(vocabularyWords.lessonId, lessonId));
    }
    if (cefrLevel) {
      return db.select().from(vocabularyWords).where(eq(vocabularyWords.cefrLevel, cefrLevel));
    }
    return db.select().from(vocabularyWords);
  }

  async createVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord> {
    const [created] = await db.insert(vocabularyWords).values(word).returning();
    return created;
  }

  async getUserVocabularyForReview(userId: number): Promise<(UserVocabulary & { word: VocabularyWord })[]> {
    const today = new Date().toISOString().split('T')[0];
    const results = await db.select()
      .from(userVocabulary)
      .innerJoin(vocabularyWords, eq(userVocabulary.wordId, vocabularyWords.id))
      .where(and(
        eq(userVocabulary.userId, userId),
        lte(userVocabulary.nextReviewDate, today)
      ));
    return results.map(r => ({ ...r.user_vocabulary, word: r.vocabulary_words }));
  }

  async upsertUserVocabulary(data: InsertUserVocabulary): Promise<UserVocabulary> {
    const existing = await db.select().from(userVocabulary)
      .where(and(eq(userVocabulary.userId, data.userId), eq(userVocabulary.wordId, data.wordId)));
    if (existing.length > 0) {
      const [updated] = await db.update(userVocabulary).set(data).where(eq(userVocabulary.id, existing[0].id)).returning();
      return updated;
    }
    const [created] = await db.insert(userVocabulary).values(data).returning();
    return created;
  }

  async getUserVocabularyCount(userId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const results = await db.select()
      .from(userVocabulary)
      .where(and(
        eq(userVocabulary.userId, userId),
        lte(userVocabulary.nextReviewDate, today)
      ));
    return results.length;
  }
}

export const storage = new DatabaseStorage();
