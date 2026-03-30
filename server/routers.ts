import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============ VALIDATION SCHEMAS ============

const createGuildSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().optional(),
});

const createTaskSchema = z.object({
  guildId: z.number(),
  categoryId: z.number(),
  title: z.string().min(1).max(256),
  description: z.string().optional(),
  taskType: z.enum(["quest", "catch", "profession", "daily", "custom"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueDate: z.date().optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  assignedToId: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed", "archived"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  assignedToId: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const createAlarmSchema = z.object({
  guildId: z.number(),
  title: z.string().min(1).max(256),
  description: z.string().optional(),
  alarmType: z.enum(["boss_respawn", "invasion", "cooldown", "event", "custom"]),
  triggerDateTime: z.date(),
  notifyBefore: z.number().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional(),
});

// ============ GUILD ROUTER ============

const guildRouter = router({
  create: protectedProcedure
    .input(createGuildSchema)
    .mutation(async ({ ctx, input }) => {
      const guildId = await db.createGuild({
        name: input.name,
        description: input.description,
        ownerId: ctx.user.id,
      });

      return { guildId, success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.getUserGuilds(ctx.user.id);
    return result.map((item: any) => item.guilds);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getGuildById(input.id);
    }),

  getMembers: protectedProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      const result = await db.getGuildMembers(input.guildId);
      return result.map((item: any) => ({
        member: item.guildMembers,
        user: item.users,
      }));
    }),

  addMember: protectedProcedure
    .input(z.object({ guildId: z.number(), userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is leader/officer
      const guild = await db.getGuildById(input.guildId);
      if (!guild || guild.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.addGuildMember(input.guildId, input.userId);
      return { success: true };
    }),

  getStats: protectedProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      return await db.getGuildStats(input.guildId);
    }),
});

// ============ TASK ROUTER ============

const taskRouter = router({
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const taskId = await db.createTask({
        guildId: input.guildId,
        categoryId: input.categoryId,
        createdById: ctx.user.id,
        title: input.title,
        description: input.description,
        taskType: input.taskType,
        priority: input.priority,
        dueDate: input.dueDate,
        dueTime: input.dueTime,
        assignedToId: input.assignedToId,
        tags: input.tags,
      });

      // Notify assigned user if applicable
      if (input.assignedToId) {
        await db.createNotification({
          userId: input.assignedToId,
          guildId: input.guildId,
          title: "Nova tarefa atribuída",
          message: `Você foi atribuído à tarefa: ${input.title}`,
          notificationType: "task_assigned",
          relatedTaskId: Number(taskId),
        });
      }

      return { taskId, success: true };
    }),

  listByGuild: protectedProcedure
    .input(
      z.object({
        guildId: z.number(),
        status: z.string().optional(),
        categoryId: z.number().optional(),
        priority: z.string().optional(),
        assignedToId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await db.getTasksByGuild(input.guildId, {
        status: input.status,
        categoryId: input.categoryId,
        priority: input.priority,
        assignedToId: input.assignedToId,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getTaskById(input.id);
    }),

  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ input }) => {
      await db.updateTask(input.id, {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
        dueTime: input.dueTime,
        assignedToId: input.assignedToId,
        tags: input.tags,
      });

      return { success: true };
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.number(), guildId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const task = await db.getTaskById(input.id);
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });

      await db.completeTask(input.id, ctx.user.id, input.guildId);

      // Notify task creator
      if (task.createdById !== ctx.user.id) {
        await db.createNotification({
          userId: task.createdById,
          guildId: input.guildId,
          title: "Tarefa concluída",
          message: `A tarefa "${task.title}" foi concluída`,
          notificationType: "task_completed",
          relatedTaskId: input.id,
        });
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteTask(input.id);
      return { success: true };
    }),

  getHistory: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      return await db.getTaskHistory(input.taskId);
    }),
});

// ============ CATEGORY ROUTER ============

const categoryRouter = router({
  listByGuild: protectedProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCategoriesByGuild(input.guildId);
    }),
});

// ============ ALARM ROUTER ============

const alarmRouter = router({
  create: protectedProcedure
    .input(createAlarmSchema)
    .mutation(async ({ ctx, input }) => {
      const alarmId = await db.createAlarm({
        guildId: input.guildId,
        createdById: ctx.user.id,
        title: input.title,
        description: input.description,
        alarmType: input.alarmType,
        triggerDateTime: input.triggerDateTime,
        notifyBefore: input.notifyBefore,
        isRecurring: input.isRecurring,
        recurringPattern: input.recurringPattern,
      });

      return { alarmId, success: true };
    }),

  listByGuild: protectedProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAlarmsByGuild(input.guildId);
    }),

  getUpcoming: protectedProcedure
    .input(z.object({ minutesAhead: z.number().optional() }))
    .query(async ({ input }) => {
      return await db.getUpcomingAlarms(input.minutesAhead);
    }),
});

// ============ NOTIFICATION ROUTER ============

const notificationRouter = router({
  list: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      return await db.getUserNotifications(ctx.user.id, input.unreadOnly);
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.id);
      return { success: true };
    }),
});

// ============ TAG ROUTER ============

const tagRouter = router({
  listByGuild: protectedProcedure
    .input(z.object({ guildId: z.number() }))
    .query(async ({ input }) => {
      return await db.getTagsByGuild(input.guildId);
    }),
});

// ============ MAIN APP ROUTER ============

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  guild: guildRouter,
  task: taskRouter,
  category: categoryRouter,
  alarm: alarmRouter,
  notification: notificationRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;
