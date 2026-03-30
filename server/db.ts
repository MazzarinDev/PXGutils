import { eq, and, desc, asc, like, inArray, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  guilds,
  guildMembers,
  tasks,
  taskCategories,
  alarms,
  notifications,
  tags,
  taskHistory,
  guildStats,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ GUILD QUERIES ============

export async function createGuild(data: {
  name: string;
  description?: string;
  ownerId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(guilds).values({
    name: data.name,
    description: data.description,
    ownerId: data.ownerId,
  });

  const guildId = result[0].insertId;

  // Create default categories
  const defaultCategories = [
    { name: "quests", displayName: "Quests", color: "#8b5cf6", icon: "scroll" },
    { name: "catch", displayName: "Catch", color: "#06b6d4", icon: "target" },
    {
      name: "professions",
      displayName: "Profissões",
      color: "#f59e0b",
      icon: "hammer",
    },
    {
      name: "daily_tasks",
      displayName: "Tasks Diárias",
      color: "#10b981",
      icon: "calendar",
    },
  ];

  for (let i = 0; i < defaultCategories.length; i++) {
    await db.insert(taskCategories).values({
      guildId: Number(guildId),
      name: defaultCategories[i].name,
      displayName: defaultCategories[i].displayName,
      color: defaultCategories[i].color,
      icon: defaultCategories[i].icon,
      position: i,
      isDefault: true,
    });
  }

  // Create guild stats
  await db.insert(guildStats).values({
    guildId: Number(guildId),
  });

  // Add owner as member
  await db.insert(guildMembers).values({
    guildId: Number(guildId),
    userId: data.ownerId,
    memberRole: "leader",
    canEditTasks: true,
    canDeleteTasks: true,
    canManageMembers: true,
    canCreateAlarms: true,
  });

  return guildId;
}

export async function getGuildById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(guilds).where(eq(guilds.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserGuilds(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.userId, userId))
    .innerJoin(guilds, eq(guildMembers.guildId, guilds.id));
}

export async function getGuildMembers(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.guildId, guildId))
    .innerJoin(users, eq(guildMembers.userId, users.id));
}

export async function addGuildMember(guildId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(guildMembers).values({
    guildId,
    userId,
    memberRole: "member",
  });
}

// ============ TASK QUERIES ============

export async function createTask(data: {
  guildId: number;
  categoryId: number;
  createdById: number;
  title: string;
  description?: string;
  taskType: string;
  priority: string;
  dueDate?: Date;
  dueTime?: string;
  assignedToId?: number;
  tags?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tasks).values({
    guildId: data.guildId,
    categoryId: data.categoryId,
    createdById: data.createdById,
    title: data.title,
    description: data.description,
    taskType: data.taskType as any,
    priority: data.priority as any,
    dueDate: data.dueDate,
    dueTime: data.dueTime,
    assignedToId: data.assignedToId,
    tags: data.tags || [],
  });

  // Log task creation
  await db.insert(taskHistory).values({
    taskId: Number(result[0].insertId),
    guildId: data.guildId,
    action: "created",
    changedById: data.createdById,
    newStatus: "todo",
  });

  return result[0].insertId;
}

export async function getTasksByGuild(
  guildId: number,
  filters?: {
    status?: string;
    categoryId?: number;
    priority?: string;
    assignedToId?: number;
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(tasks.guildId, guildId)];

  if (filters) {
    if (filters.status) conditions.push(eq(tasks.status, filters.status as any));
    if (filters.categoryId)
      conditions.push(eq(tasks.categoryId, filters.categoryId));
    if (filters.priority)
      conditions.push(eq(tasks.priority, filters.priority as any));
    if (filters.assignedToId)
      conditions.push(eq(tasks.assignedToId, filters.assignedToId));
  }

  return await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTask(
  id: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: Date;
    dueTime?: string;
    assignedToId?: number;
    tags?: string[];
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.dueTime !== undefined) updateData.dueTime = data.dueTime;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.tags !== undefined) updateData.tags = data.tags;

  await db.update(tasks).set(updateData).where(eq(tasks.id, id));
}

export async function completeTask(
  id: number,
  completedById: number,
  guildId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tasks)
    .set({
      status: "completed",
      completedAt: new Date(),
      completedById,
    })
    .where(eq(tasks.id, id));

  // Log completion
  await db.insert(taskHistory).values({
    taskId: id,
    guildId,
    action: "completed",
    changedById: completedById,
    previousStatus: "in_progress",
    newStatus: "completed",
  });
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related history
  await db.delete(taskHistory).where(eq(taskHistory.taskId, id));

  // Delete task
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ============ CATEGORY QUERIES ============

export async function getCategoriesByGuild(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(taskCategories)
    .where(eq(taskCategories.guildId, guildId))
    .orderBy(asc(taskCategories.position));
}

// ============ ALARM QUERIES ============

export async function createAlarm(data: {
  guildId: number;
  createdById: number;
  title: string;
  description?: string;
  alarmType: string;
  triggerDateTime: Date;
  notifyBefore?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(alarms).values({
    guildId: data.guildId,
    createdById: data.createdById,
    title: data.title,
    description: data.description,
    alarmType: data.alarmType as any,
    triggerDateTime: data.triggerDateTime,
    notifyBefore: data.notifyBefore || 300,
    isRecurring: data.isRecurring || false,
    recurringPattern: data.recurringPattern,
  });

  return result[0].insertId;
}

export async function getAlarmsByGuild(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alarms)
    .where(and(eq(alarms.guildId, guildId), eq(alarms.isActive, true)))
    .orderBy(asc(alarms.triggerDateTime));
}

export async function getUpcomingAlarms(minutesAhead: number = 60) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const future = new Date(now.getTime() + minutesAhead * 60 * 1000);

  return await db
    .select()
    .from(alarms)
    .where(
      and(
        eq(alarms.isActive, true),
        gte(alarms.triggerDateTime, now),
        lte(alarms.triggerDateTime, future)
      )
    )
    .orderBy(asc(alarms.triggerDateTime));
}

// ============ NOTIFICATION QUERIES ============

export async function createNotification(data: {
  userId: number;
  guildId?: number;
  title: string;
  message?: string;
  notificationType: string;
  relatedTaskId?: number;
  relatedAlarmId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values({
    userId: data.userId,
    guildId: data.guildId,
    title: data.title,
    message: data.message,
    notificationType: data.notificationType as any,
    relatedTaskId: data.relatedTaskId,
    relatedAlarmId: data.relatedAlarmId,
  });
}

export async function getUserNotifications(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(notifications.userId, userId)];

  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  return await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, id));
}

// ============ TAG QUERIES ============

export async function getTagsByGuild(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tags)
    .where(eq(tags.guildId, guildId))
    .orderBy(asc(tags.name));
}

// ============ STATS QUERIES ============

export async function getGuildStats(guildId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(guildStats)
    .where(eq(guildStats.guildId, guildId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateGuildStats(guildId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(guildStats)
    .set(data)
    .where(eq(guildStats.guildId, guildId));
}

// ============ TASK HISTORY QUERIES ============

export async function getTaskHistory(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(taskHistory)
    .where(eq(taskHistory.taskId, taskId))
    .orderBy(desc(taskHistory.createdAt));
}

export async function getGuildTaskHistory(guildId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(taskHistory)
    .where(eq(taskHistory.guildId, guildId))
    .orderBy(desc(taskHistory.createdAt))
    .limit(limit);
}
