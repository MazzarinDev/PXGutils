import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users, guilds, guildMembers, tasks, taskCategories, alarms, notifications } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Character-based authentication router
 * Login is based on character name only (e.g., "Kooxh")
 */
export const authRouter = router({
  // Login or create user by character name
  login: publicProcedure
    .input(z.object({
      characterName: z.string().min(1).max(64),
      level: z.number().int().min(1).optional(),
      class: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.characterName, input.characterName))
          .limit(1);

        if (existing.length > 0) {
          // Update last signed in
          await db
            .update(users)
            .set({ lastSignedIn: new Date() })
            .where(eq(users.id, existing[0].id));
          return existing[0];
        }

        // Create new user - insert and return
        const result = await db.insert(users).values({
          characterName: input.characterName,
          level: input.level || 1,
          class: input.class,
          experience: 0,
        });

        const newUser = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(result.insertId)))
          .limit(1);

        return newUser[0];
      } catch (error) {
        console.error("Login error:", error);
        throw new Error("Failed to login");
      }
    }),

  // Get current user by character name
  me: publicProcedure
    .input(z.object({ characterName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(users)
        .where(eq(users.characterName, input.characterName))
        .limit(1);

      return result[0] || null;
    }),

  // Update user profile
  updateProfile: publicProcedure
    .input(z.object({
      characterName: z.string(),
      level: z.number().int().optional(),
      class: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
      experience: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.characterName, input.characterName))
        .limit(1);

      if (!user.length) throw new Error("User not found");

      await db
        .update(users)
        .set({
          level: input.level,
          class: input.class,
          bio: input.bio,
          avatar: input.avatar,
          experience: input.experience,
        })
        .where(eq(users.id, user[0].id));

      return user[0];
    }),
});

/**
 * Guilds router
 */
export const guildsRouter = router({
  // Create guild
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      description: z.string().optional(),
      leaderCharacterName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const leader = await db
        .select()
        .from(users)
        .where(eq(users.characterName, input.leaderCharacterName))
        .limit(1);

      if (!leader.length) throw new Error("Leader not found");

      const result = await db.insert(guilds).values({
        name: input.name,
        description: input.description,
        leaderId: leader[0].id,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      });

      // Add leader as member
      await db.insert(guildMembers).values({
        guildId: Number(result.insertId),
        userId: leader[0].id,
        role: "leader",
      });

      return { id: result.insertId, ...input };
    }),

  // List user's guilds
  listByUser: publicProcedure
    .input(z.object({ characterName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const user = await db
        .select()
        .from(users)
        .where(eq(users.characterName, input.characterName))
        .limit(1);

      if (!user.length) return [];

      const userGuilds = await db
        .select()
        .from(guildMembers)
        .where(eq(guildMembers.userId, user[0].id));

      if (userGuilds.length === 0) return [];

      return await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, userGuilds[0].guildId));
    }),

  // Get guild details
  getById: publicProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      return await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, input.guildId))
        .limit(1)
        .then(r => r[0]);
    }),

  // Get guild members
  getMembers: publicProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(guildMembers)
        .where(eq(guildMembers.guildId, input.guildId));
    }),
});

/**
 * Tasks router
 */
export const tasksRouter = router({
  // Create task
  create: publicProcedure
    .input(z.object({
      guildId: z.number(),
      categoryId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]),
      createdByCharacterName: z.string(),
      dueDate: z.string().optional(),
      dueTime: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const creator = await db
        .select()
        .from(users)
        .where(eq(users.characterName, input.createdByCharacterName))
        .limit(1);

      if (!creator.length) throw new Error("Creator not found");

      const result = await db.insert(tasks).values({
        guildId: input.guildId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        createdBy: creator[0].id,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        dueTime: input.dueTime,
      });

      return { id: result.insertId, ...input };
    }),

  // List tasks by guild
  listByGuild: publicProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.guildId, input.guildId))
        .orderBy(desc(tasks.createdAt));
    }),

  // Update task status
  updateStatus: publicProcedure
    .input(z.object({
      taskId: z.number(),
      status: z.enum(["todo", "in_progress", "completed", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(tasks)
        .set({ status: input.status })
        .where(eq(tasks.id, input.taskId));

      return { success: true };
    }),
});

/**
 * Alarms router
 */
export const alarmsRouter = router({
  // Create alarm
  create: publicProcedure
    .input(z.object({
      guildId: z.number(),
      type: z.enum(["boss_respawn", "invasion", "cooldown", "event", "custom"]),
      title: z.string(),
      description: z.string().optional(),
      triggerTime: z.string(),
      createdByCharacterName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const creator = await db
        .select()
        .from(users)
        .where(eq(users.characterName, input.createdByCharacterName))
        .limit(1);

      if (!creator.length) throw new Error("Creator not found");

      const result = await db.insert(alarms).values({
        guildId: input.guildId,
        type: input.type,
        title: input.title,
        description: input.description,
        triggerTime: new Date(input.triggerTime),
        createdBy: creator[0].id,
      });

      return { id: result.insertId, ...input };
    }),

  // List active alarms
  listActive: publicProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(alarms)
        .where(and(
          eq(alarms.guildId, input.guildId),
          eq(alarms.isActive, true)
        ))
        .orderBy(desc(alarms.triggerTime));
    }),
});

/**
 * Dashboard router
 */
export const dashboardRouter = router({
  // Get guild statistics
  getStats: publicProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const allTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.guildId, input.guildId));

      const completed = allTasks.filter(t => t.status === "completed").length;
      const inProgress = allTasks.filter(t => t.status === "in_progress").length;
      const todo = allTasks.filter(t => t.status === "todo").length;

      return {
        totalTasks: allTasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        todoTasks: todo,
        completionRate: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0,
      };
    }),

  // Get user statistics
  getUserStats: publicProcedure
    .input(z.object({ characterName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.characterName, input.characterName))
        .limit(1);

      if (!user.length) return null;

      const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.assignedTo, user[0].id));

      const completed = userTasks.filter(t => t.status === "completed").length;

      return {
        characterName: user[0].characterName,
        level: user[0].level,
        experience: user[0].experience,
        totalTasksAssigned: userTasks.length,
        completedTasks: completed,
        class: user[0].class,
      };
    }),
});

/**
 * Main app router
 */
export const appRouter = router({
  auth: authRouter,
  guilds: guildsRouter,
  tasks: tasksRouter,
  alarms: alarmsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
