import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { storage } from "./storage";
import { loginSchema, registerSchema, type User } from "@shared/schema";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const testHash = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, testHash);
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      displayName: string;
      cefrLevel: string;
      xp: number;
      currentStreak: number;
      lastActiveDate: string | null;
      subscriptionTier: string;
      placementCompleted: boolean;
    }
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "talkflow-secret-key-change-in-prod",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
  );

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !verifyPassword(password, user.password)) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      const { password, ...safeUser } = user;
      done(null, safeUser as Express.User);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues });
      }
      const { username, password, displayName } = parsed.data;
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "Username already taken" });
      }
      const user = await storage.createUser({
        username,
        password: hashPassword(password),
        displayName,
        cefrLevel: "A1",
        xp: 0,
        currentStreak: 0,
        lastActiveDate: null,
        subscriptionTier: "free",
        placementCompleted: false,
      });
      const { password: _, ...safeUser } = user;
      req.login(safeUser as Express.User, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        return res.status(201).json(safeUser);
      });
    } catch (err) {
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input" });
    }
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      return res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.user);
  });

  // User routes
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { cefrLevel, placementCompleted } = req.body;
      const updates: any = {};
      if (cefrLevel) updates.cefrLevel = cefrLevel;
      if (placementCompleted !== undefined) updates.placementCompleted = placementCompleted;
      const updated = await storage.updateUser(userId, updates);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password, ...safeUser } = updated;
      return res.json(safeUser);
    } catch (err) {
      return res.status(500).json({ message: "Update failed" });
    }
  });

  // Streak management
  app.post("/api/user/streak", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      let newStreak = 1;
      if (user.lastActiveDate === today) {
        return res.json({ streak: user.currentStreak, xp: user.xp });
      } else if (user.lastActiveDate === yesterday) {
        newStreak = user.currentStreak + 1;
      }

      const updated = await storage.updateUser(userId, {
        currentStreak: newStreak,
        lastActiveDate: today,
      });
      const { password, ...safeUser } = updated!;
      return res.json(safeUser);
    } catch (err) {
      return res.status(500).json({ message: "Streak update failed" });
    }
  });

  // Lesson routes
  app.get("/api/lessons", requireAuth, async (req, res) => {
    try {
      const cefrLevel = req.query.level as string | undefined;
      const allLessons = await storage.getLessons(cefrLevel);
      return res.json(allLessons);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid lesson id" });
      const lesson = await storage.getLesson(id);
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      return res.json(lesson);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Lesson progress routes
  app.get("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const progress = await storage.getUserProgress(userId);
      return res.json(progress);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { lessonId, status, score } = req.body;
      if (!lessonId || !status) {
        return res.status(400).json({ message: "lessonId and status required" });
      }

      let xpEarned = 0;
      if (status === "completed") {
        xpEarned = 50;
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUser(userId, { xp: user.xp + xpEarned });
        }
      }

      const progress = await storage.upsertLessonProgress({
        userId,
        lessonId,
        status,
        score: score || null,
        xpEarned,
        completedAt: status === "completed" ? new Date() : null,
      });
      return res.json(progress);
    } catch (err) {
      return res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Vocabulary routes
  app.get("/api/vocabulary", requireAuth, async (req, res) => {
    try {
      const lessonId = req.query.lessonId ? parseInt(req.query.lessonId as string) : undefined;
      const cefrLevel = req.query.level as string | undefined;
      const words = await storage.getVocabularyWords(lessonId, cefrLevel);
      return res.json(words);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch vocabulary" });
    }
  });

  // SRS review routes
  app.get("/api/vocabulary/review", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const reviewWords = await storage.getUserVocabularyForReview(userId);
      return res.json(reviewWords);
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch review words" });
    }
  });

  app.get("/api/vocabulary/review/count", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const count = await storage.getUserVocabularyCount(userId);
      return res.json({ count });
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch review count" });
    }
  });

  app.post("/api/vocabulary/review", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { wordId, correct } = req.body;
      if (!wordId || correct === undefined) {
        return res.status(400).json({ message: "wordId and correct required" });
      }

      const today = new Date();
      let interval = 1;
      let easeFactor = 2.5;
      let repetitions = 0;

      const existing = await storage.getUserVocabularyForReview(userId);
      const existingWord = existing.find(e => e.wordId === wordId);

      if (existingWord) {
        easeFactor = existingWord.easeFactor;
        repetitions = existingWord.repetitions;
      }

      if (correct) {
        repetitions += 1;
        if (repetitions === 1) interval = 1;
        else if (repetitions === 2) interval = 6;
        else interval = Math.round(interval * easeFactor);
        easeFactor = Math.max(1.3, easeFactor + 0.1);
      } else {
        repetitions = 0;
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
      }

      const nextReview = new Date(today);
      nextReview.setDate(nextReview.getDate() + interval);

      const result = await storage.upsertUserVocabulary({
        userId,
        wordId,
        nextReviewDate: nextReview.toISOString().split("T")[0],
        interval,
        easeFactor,
        repetitions,
        correct,
      });

      return res.json(result);
    } catch (err) {
      return res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Inworld Realtime API - status check (no secrets exposed)
  app.get("/api/inworld/status", requireAuth, async (_req, res) => {
    const apiKey = process.env.INWORLD_API_KEY;
    return res.json({ available: !!apiKey });
  });

  // Inworld WebSocket proxy for lesson-specific AI tutor
  // Authentication is enforced by parsing the session cookie on upgrade
  const WebSocketModule = await import("ws");
  const WS = WebSocketModule.default;
  const wss = new WebSocketModule.WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    if (url.pathname !== "/ws/inworld") return;

    // Parse session to authenticate the WebSocket connection
    const fakeRes: any = { setHeader: () => {}, end: () => {}, getHeader: () => {} };
    (app as any).handle(
      Object.assign(request, { method: "GET", url: "/api/auth/me" }),
      fakeRes,
      () => {
        const req = request as any;
        if (!req.isAuthenticated || !req.isAuthenticated()) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    );
  });

  wss.on("connection", (browser: any, req: any) => {
    const apiKey = process.env.INWORLD_API_KEY;
    if (!apiKey) {
      browser.close(1008, "API key not configured");
      return;
    }

    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const lessonContext = url.searchParams.get("context") || "";
    const cefrLevel = url.searchParams.get("level") || "B1";

    let setup = 0;
    const api = new WS(
      `wss://api.inworld.ai/api/v1/realtime/session?key=talkflow-${Date.now()}&protocol=realtime`,
      { headers: { Authorization: `Basic ${apiKey}` } }
    );

    const sessionConfig = JSON.stringify({
      type: "session.update",
      session: {
        instructions: `You are TalkFlow, a friendly and encouraging English language tutor. The student is at CEFR level ${cefrLevel}. ${lessonContext ? `The current lesson context: ${lessonContext}.` : ""} Speak clearly and at an appropriate pace for their level. Give pronunciation feedback when they speak. If they make grammar errors, gently correct them. Keep responses concise (2-3 sentences max). Be warm and supportive.`,
      },
    });

    const greetMsg = JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "Greet the student warmly and ask them what they would like to practice today. Keep it to one sentence." }],
      },
    });

    api.on("open", () => {
      console.log("Inworld API connection opened");
    });

    api.on("message", (raw: any) => {
      const data = raw.toString();
      if (setup < 2) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "session.created") {
            api.send(sessionConfig);
            setup = 1;
          } else if (parsed.type === "session.updated" && setup === 1) {
            api.send(greetMsg);
            api.send('{"type":"response.create"}');
            setup = 2;
          } else if (parsed.type === "error") {
            console.error("Inworld API error:", parsed);
            if (browser.readyState === WS.OPEN) {
              browser.send(JSON.stringify({ type: "error", message: parsed.error?.message || "API error" }));
              browser.close(1011, "API error");
            }
            return;
          }
        } catch {}
      }
      if (browser.readyState === WS.OPEN) {
        browser.send(data);
      }
    });

    browser.on("message", (msg: any) => {
      if (api.readyState === WS.OPEN) {
        api.send(msg.toString());
      }
    });

    browser.on("close", () => {
      if (api.readyState === WS.OPEN || api.readyState === WS.CONNECTING) {
        api.close();
      }
    });
    api.on("close", () => {
      if (browser.readyState === WS.OPEN) browser.close();
    });
    api.on("error", (e: any) => {
      console.error("Inworld API error:", e.message);
      if (browser.readyState === WS.OPEN) {
        browser.send(JSON.stringify({ type: "error", message: "Voice connection failed" }));
        browser.close(1011, "API error");
      }
    });
  });

  return httpServer;
}
